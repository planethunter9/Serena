// Lógica de notificações locais (agendadas no telemóvel).
// Funciona no Expo Go — só as notificações PUSH (remotas) é que precisam de dev build.

import * as Notifications from 'expo-notifications';
import { AFFIRMATION_NOTIF_ID, REMINDER_PREFIX, ROUTE_AFFIRMATION, ROUTE_REMINDER } from './routes';

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

// Identificadores fixos: agendar com o mesmo identificador SUBSTITUI a notificação
// anterior (não cria duplicados) e permite cancelar mesmo que o id guardado se perca.
export { AFFIRMATION_NOTIF_ID } from './routes';
export function reminderNotifId(reminderId: string) {
  return REMINDER_PREFIX + reminderId;
}

function urlFor(identifier?: string): Record<string, string> | undefined {
  if (identifier === AFFIRMATION_NOTIF_ID) return { url: ROUTE_AFFIRMATION };
  if (identifier?.startsWith(REMINDER_PREFIX)) return { url: ROUTE_REMINDER };
  return undefined;
}

// Agenda uma notificação diária à hora indicada. Devolve o id (para poder cancelar).
export async function scheduleDailyReminder(hour: number, minute: number, title: string, body: string, identifier?: string): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    ...(identifier ? { identifier } : {}),
    // "url": ecrã a abrir quando se toca na notificação (ver routes.ts).
    content: { title, body, data: urlFor(identifier) },
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

// Remove da central de notificações as que já foram entregues com este id
// (para um lembrete eliminado não ficar lá "pendurado").
export async function dismissDelivered(ids: (string | null)[]) {
  const set = new Set(ids.filter((x): x is string => !!x));
  if (!set.size) return;
  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    for (const n of presented) {
      if (set.has(n.request.identifier)) {
        try { await Notifications.dismissNotificationAsync(n.request.identifier); } catch {}
      }
    }
  } catch {
    // best-effort
  }
}

// Cancela tudo o que pertence a um lembrete: o id guardado e o id fixo.
export async function cancelReminderFully(reminderId: string, notificationId: string | null) {
  const ids = [notificationId, reminderNotifId(reminderId)];
  for (const id of ids) await cancelReminder(id);
  await dismissDelivered(ids);
}

// Lista de ids de notificações que DEVEM existir: os lembretes ativos e a
// afirmação do dia (se ativa). Tudo o resto é "fantasma" e pode ser cancelado.
export function knownNotificationIds(
  reminders: { id: string; enabled: boolean; notificationId: string | null }[],
  affirmation: { enabled: boolean; notificationId: string | null } | null,
): string[] {
  const out: string[] = [];
  for (const r of reminders) {
    if (!r.enabled) continue;
    if (r.notificationId) out.push(r.notificationId);
    out.push(reminderNotifId(r.id));
  }
  if (affirmation?.enabled) {
    if (affirmation.notificationId) out.push(affirmation.notificationId);
    out.push(AFFIRMATION_NOTIF_ID);
  }
  return out;
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
