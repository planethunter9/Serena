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
