// Notificações: para onde vai a app ao tocar, e que notificações são "fantasma".
import { describe, expect, jest, test } from '@jest/globals';

// O módulo nativo não existe nos testes — simulamos só o que é usado ao importar.
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
}));

import { knownNotificationIds, reminderNotifId } from '../notifications/notifications';
import { AFFIRMATION_NOTIF_ID, routeForNotification, ROUTE_AFFIRMATION, ROUTE_REMINDER } from '../notifications/routes';

describe('routeForNotification', () => {
  test('usa o url guardado na notificação', () => {
    expect(routeForNotification('x', { url: ROUTE_AFFIRMATION })).toBe(ROUTE_AFFIRMATION);
  });
  test('sem url, deduz pelo identificador', () => {
    expect(routeForNotification(AFFIRMATION_NOTIF_ID)).toBe(ROUTE_AFFIRMATION);
    expect(routeForNotification(reminderNotifId('r123'))).toBe(ROUTE_REMINDER);
  });
  test('ignora rotas desconhecidas ou externas', () => {
    expect(routeForNotification('outra', { url: 'https://exemplo.com' })).toBeNull();
    expect(routeForNotification('outra', { url: '/settings/../../x' })).toBeNull();
    expect(routeForNotification(null)).toBeNull();
  });
});

describe('knownNotificationIds', () => {
  const r = (id: string, enabled: boolean, notificationId: string | null = null) => ({ id, enabled, notificationId });
  test('inclui só os lembretes ativos', () => {
    const ids = knownNotificationIds([r('a', true, 'n1'), r('b', false, 'n2')], null);
    expect(ids).toEqual(expect.arrayContaining(['n1', reminderNotifId('a')]));
    expect(ids).not.toContain('n2');
    expect(ids).not.toContain(reminderNotifId('b'));
  });
  test('inclui a afirmação do dia quando está ativa (não é cancelada por engano)', () => {
    expect(knownNotificationIds([], { enabled: true, notificationId: null })).toContain(AFFIRMATION_NOTIF_ID);
    expect(knownNotificationIds([], { enabled: false, notificationId: null })).not.toContain(AFFIRMATION_NOTIF_ID);
  });
});
