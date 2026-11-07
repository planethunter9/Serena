// Sincronização com a cloud: junção chave a chave, a mais recente ganha.
import { beforeEach, expect, jest, test } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  exportUserData,
  loadGoals,
  loadReminders,
  mergeUserData,
  saveReminders,
  setOnLocalChange,
  setStorageUser,
} from '../storage/storage';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

beforeEach(async () => {
  await AsyncStorage.clear();
  setOnLocalChange(null);
  setStorageUser('u1');
});

test('um lembrete eliminado no telemóvel não volta da cloud', async () => {
  await saveReminders([{ id: 'A', hour: 9, minute: 0, label: '', enabled: true, notificationId: null }]);
  const cloudOld = await exportUserData();
  await sleep(5);
  await saveReminders([]); // eliminado depois
  const localNewer = await mergeUserData(cloudOld);
  expect(await loadReminders()).toEqual([]);
  expect(localNewer).toBe(true); // há que reenviar para a cloud
});

test('uma alteração mais recente noutro dispositivo entra', async () => {
  await saveReminders([]);
  const other = await exportUserData();
  const meta = JSON.parse(other._meta);
  other.goals = JSON.stringify([{ id: 'g', text: 'do outro telemóvel', done: false }]);
  meta.goals = Date.now() + 1000;
  other._meta = JSON.stringify(meta);
  await mergeUserData(other);
  expect(await loadGoals()).toEqual([{ id: 'g', text: 'do outro telemóvel', done: false }]);
});

test('um telemóvel novo (vazio) recebe os dados antigos da cloud, sem _meta', async () => {
  const localNewer = await mergeUserData({ reminders: JSON.stringify([{ id: 'Z' }]) });
  expect(await loadReminders()).toEqual([{ id: 'Z' }]);
  expect(localNewer).toBe(false);
});

test('os dados de cada utilizador ficam separados', async () => {
  await saveReminders([{ id: 'A', hour: 9, minute: 0, label: '', enabled: true, notificationId: null }]);
  setStorageUser('u2');
  expect(await loadReminders()).toEqual([]);
});

test('cada alteração local avisa para enviar para a cloud', async () => {
  const cb = jest.fn();
  setOnLocalChange(cb);
  await saveReminders([]);
  expect(cb).toHaveBeenCalled();
});
