// Estado da sincronização (aviso "sem ligação"): falha → offline; nova tentativa ok → ok.
import { afterEach, expect, jest, test } from '@jest/globals';

const mockUpsert = jest.fn<() => Promise<{ error: unknown }>>();
jest.mock('../lib/supabase', () => ({ supabase: { from: () => ({ upsert: mockUpsert }) } }));

import { getSyncStatus, pushProfile, resetSync, retrySyncNow, subscribeSyncStatus } from '../lib/sync';

afterEach(() => { resetSync(); mockUpsert.mockReset(); });

test('um erro do servidor marca "offline" e "Tentar agora" volta a "ok"', async () => {
  const seen: string[] = [];
  const unsub = subscribeSyncStatus((s) => seen.push(s));
  mockUpsert.mockResolvedValueOnce({ error: { message: 'paused' } });
  expect(await pushProfile('u1')).toBe(false);
  expect(getSyncStatus()).toBe('offline');
  mockUpsert.mockResolvedValueOnce({ error: null });
  expect(await retrySyncNow()).toBe(true);
  expect(getSyncStatus()).toBe('ok');
  expect(seen).toEqual(['offline', 'ok']);
  unsub();
});

test('sem rede (exceção) também conta como "offline"', async () => {
  mockUpsert.mockRejectedValueOnce(new Error('Network request failed'));
  expect(await pushProfile('u1')).toBe(false);
  expect(getSyncStatus()).toBe('offline');
});

test('terminar sessão limpa o estado', async () => {
  mockUpsert.mockResolvedValueOnce({ error: { message: 'x' } });
  await pushProfile('u1');
  resetSync();
  expect(getSyncStatus()).toBe('ok');
  expect(await retrySyncNow()).toBe(false);
});
