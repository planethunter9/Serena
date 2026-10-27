// Lógica de notificações locais (agendadas no telemóvel).
// Funciona no Expo Go — só as notificações PUSH (remotas) é que precisam de dev build.

import * as Notifications from 'expo-notifications';

// Como mostrar a notificação quando a app está aberta.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Pede permissão ao utilizador (a primeira vez). Devolve true se autorizado.
export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

// Agenda uma notificação diária à hora indicada. Devolve o id (para poder cancelar).
export async function scheduleDailyReminder(hour: number, minute: number, title: string, body: string): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

// Cancela um lembrete agendado.
export async function cancelReminder(id: string | null) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // se já não existir, ignorar
  }
}

// --- Reconciliação de lembretes "órfãos" ----------------------------------
// Versões antigas da app agendavam uma notificação (ex.: 22h) diretamente, sem
// a guardar na lista de lembretes. Essa notificação continua a disparar mas não
// aparece no ecrã de Lembretes. Estas funções encontram essas notificações
// agendadas que não estão na lista conhecida, para as podermos mostrar/gerir.

// Lê hora/minuto de um trigger agendado, lidando com os vários formatos (iOS/Android).
function readHourMinute(trigger: any): { hour: number; minute: number } | null {
  if (!trigger) return null;
  if (typeof trigger.hour === 'number' && typeof trigger.minute === 'number') {
    return { hour: trigger.hour, minute: trigger.minute };
  }
  const dc = trigger.dateComponents;
  if (dc && typeof dc.hour === 'number' && typeof dc.minute === 'number') {
    return { hour: dc.hour, minute: dc.minute };
  }
  return null;
}

// Cancela as notificações agendadas que NÃO estão na lista conhecida (knownIds).
// Usado para remover notificações "fantasma" de versões antigas (ex.: a das 22h)
// sem mexer nos lembretes que o utilizador criou. Devolve quantas cancelou.
export async function cancelUntrackedReminders(knownIds: (string | null)[]): Promise<number> {
  const known = new Set(knownIds.filter((x): x is string => !!x));
  let all: Notifications.NotificationRequest[] = [];
  try {
    all = await Notifications.getAllScheduledNotificationsAsync();
  } catch {
    return 0;
  }
  let n = 0;
  for (const req of all) {
    if (!known.has(req.identifier)) {
      try { await Notifications.cancelScheduledNotificationAsync(req.identifier); n++; } catch {}
    }
  }
  return n;
}

export type UntrackedReminder = {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
  notificationId: string;
};

// Devolve as notificações agendadas que NÃO estão na lista conhecida (knownIds),
// reconstruídas como lembretes diários para poderem aparecer no ecrã.
export async function findUntrackedReminders(knownIds: (string | null)[]): Promise<UntrackedReminder[]> {
  const known = new Set(knownIds.filter((x): x is string => !!x));
  let all: Notifications.NotificationRequest[] = [];
  try {
    all = await Notifications.getAllScheduledNotificationsAsync();
  } catch {
    return [];
  }
  const out: UntrackedReminder[] = [];
  for (const n of all) {
    if (known.has(n.identifier)) continue;
    const hm = readHourMinute(n.trigger as any);
    if (!hm) continue; // ignora triggers que não sejam diários por hora
    out.push({
      id: 'r' + n.identifier,
      hour: hm.hour,
      minute: hm.minute,
      label: typeof n.content?.body === 'string' ? n.content.body : '',
      enabled: true,
      notificationId: n.identifier,
    });
  }
  return out;
}
