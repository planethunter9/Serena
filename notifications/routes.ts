// Para onde vai a app quando se toca numa notificação. Sem dependências
// (fácil de testar). Usa o "url" guardado na notificação ou, para as antigas
// que não o têm, o identificador fixo (ver notifications.ts).

export const AFFIRMATION_NOTIF_ID = 'affirmation-daily';
export const REMINDER_PREFIX = 'reminder-';

export const ROUTE_REMINDER = '/exercises';
export const ROUTE_AFFIRMATION = '/positive';

// Só aceitamos rotas internas conhecidas (nunca links externos vindos de dados).
const ALLOWED = new Set([ROUTE_REMINDER, ROUTE_AFFIRMATION, '/reminders', '/breathing', '/unplanned']);

export function routeForNotification(identifier: string | null | undefined, data?: Record<string, unknown> | null): string | null {
  const url = typeof data?.url === 'string' ? data.url : null;
  if (url && ALLOWED.has(url)) return url;
  if (!identifier) return null;
  if (identifier === AFFIRMATION_NOTIF_ID) return ROUTE_AFFIRMATION;
  if (identifier.startsWith(REMINDER_PREFIX)) return ROUTE_REMINDER;
  return null;
}
