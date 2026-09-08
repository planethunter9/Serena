// Armazenamento local (AsyncStorage). Os dados da app são separados POR UTILIZADOR:
// cada chave leva um prefixo com o id do utilizador com sessão iniciada.

import AsyncStorage from '@react-native-async-storage/async-storage';

// Prefixo do utilizador atual. É definido pelo AuthContext ao entrar/sair.
let userPrefix = 'guest';
export function setStorageUser(id: string | null) {
  userPrefix = id ?? 'guest';
}
function k(name: string) {
  return `u:${userPrefix}:${name}`;
}

export type ProfileItem = { id: string; label: string };

export type OnboardingData = {
  phobiaId: string;
  plan: string | null;
  subtypes: ProfileItem[];
  coping: ProfileItem[];
  losses: ProfileItem[];
  recover: ProfileItem[];
  symptoms: ProfileItem[];
  completedAt: string;
};

export type SeverityEntry = { date: string; value: number }; // 0 a 5
export type AttackEntry = { ts: string; date: string; type: 'anxiety' | 'panic' | 'behavior' };

// --- Onboarding -----------------------------------------------------------

export async function saveOnboarding(data: OnboardingData) {
  await AsyncStorage.setItem(k('onboarding'), JSON.stringify(data));
}
export async function loadOnboarding(): Promise<OnboardingData | null> {
  const raw = await AsyncStorage.getItem(k('onboarding'));
  return raw ? JSON.parse(raw) : null;
}
export async function clearAll() {
  await AsyncStorage.multiRemove([k('onboarding'), k('severity'), k('lessonsDone'), k('attacks')]);
}

// --- Intensidade do medo --------------------------------------------------

export async function loadSeverity(): Promise<SeverityEntry[]> {
  const raw = await AsyncStorage.getItem(k('severity'));
  return raw ? JSON.parse(raw) : [];
}
export async function addSeverity(value: number): Promise<SeverityEntry[]> {
  const list = await loadSeverity();
  const today = new Date().toISOString().slice(0, 10);
  const filtered = list.filter((e) => e.date !== today);
  const next = [...filtered, { date: today, value }].sort((a, b) => (a.date < b.date ? -1 : 1));
  await AsyncStorage.setItem(k('severity'), JSON.stringify(next));
  return next;
}

// --- Ataques de ansiedade / pânico ---------------------------------------

export async function loadAttacks(): Promise<AttackEntry[]> {
  const raw = await AsyncStorage.getItem(k('attacks'));
  return raw ? JSON.parse(raw) : [];
}
export async function addAttack(type: 'anxiety' | 'panic' | 'behavior'): Promise<AttackEntry[]> {
  const list = await loadAttacks();
  const now = new Date();
  const next = [...list, { ts: now.toISOString(), date: now.toISOString().slice(0, 10), type }];
  await AsyncStorage.setItem(k('attacks'), JSON.stringify(next));
  return next;
}

// --- Lições concluídas ----------------------------------------------------

export async function loadLessonsDone(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('lessonsDone'));
  return raw ? JSON.parse(raw) : [];
}
export async function toggleLessonDone(id: string): Promise<string[]> {
  const done = await loadLessonsDone();
  const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
  await AsyncStorage.setItem(k('lessonsDone'), JSON.stringify(next));
  return next;
}

// --- Objetivos ------------------------------------------------------------

export type Goal = { id: string; text: string; done: boolean };

export async function loadGoals(): Promise<Goal[]> {
  const raw = await AsyncStorage.getItem(k('goals'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveGoals(goals: Goal[]) {
  await AsyncStorage.setItem(k('goals'), JSON.stringify(goals));
}

// --- Diário ---------------------------------------------------------------

export type JournalEntry = { id: string; date: string; ts: string; text: string };

export async function loadJournal(): Promise<JournalEntry[]> {
  const raw = await AsyncStorage.getItem(k('journal'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveJournal(entries: JournalEntry[]) {
  await AsyncStorage.setItem(k('journal'), JSON.stringify(entries));
}

// --- Lembretes ------------------------------------------------------------

export type ReminderConfig = { enabled: boolean; hour: number; minute: number; notificationId: string | null };

export async function loadReminder(): Promise<ReminderConfig> {
  const raw = await AsyncStorage.getItem(k('reminder'));
  return raw ? JSON.parse(raw) : { enabled: false, hour: 9, minute: 0, notificationId: null };
}
export async function saveReminder(cfg: ReminderConfig) {
  await AsyncStorage.setItem(k('reminder'), JSON.stringify(cfg));
}

// --- Contador de progresso (streak) --------------------------------------
// Guarda a data a partir da qual se contam os dias sem ataques/comportamentos.

export async function loadStreakStart(): Promise<string | null> {
  return AsyncStorage.getItem(k('streakStart'));
}
export async function saveStreakStart(iso: string) {
  await AsyncStorage.setItem(k('streakStart'), iso);
}

// --- Exportar/importar tudo (usado pela sincronização com a cloud) --------

const USER_KEY_NAMES = ['onboarding', 'severity', 'lessonsDone', 'attacks', 'goals', 'journal', 'reminder', 'streakStart', 'exposureSteps', 'exposureSessions', 'thoughtRecords', 'safetyBehaviors', 'unplannedLogs', 'profile'];

export async function exportUserData(): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const name of USER_KEY_NAMES) {
    const v = await AsyncStorage.getItem(k(name));
    if (v != null) out[name] = v;
  }
  return out;
}

export async function importUserData(data: Record<string, string>) {
  if (!data) return;
  const pairs: [string, string][] = [];
  for (const name of USER_KEY_NAMES) {
    if (data[name] != null) pairs.push([k(name), data[name]]);
  }
  if (pairs.length) await AsyncStorage.multiSet(pairs);
}

// --- Exercícios: exposição e reestruturação cognitiva --------------------

export type ExposureSession = { id: string; stepId: string; stepLabel: string; date: string; ts: string; before: number; peak: number; after: number; note: string };
export type ThoughtRecord = { id: string; date: string; ts: string; situation: string; thought: string; before: number; evidenceFor: string; evidenceAgainst: string; balanced: string; after: number };

export async function loadExposureSteps(): Promise<ProfileItem[]> {
  const raw = await AsyncStorage.getItem(k('exposureSteps'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveExposureSteps(steps: ProfileItem[]) {
  await AsyncStorage.setItem(k('exposureSteps'), JSON.stringify(steps));
}
export async function loadExposureSessions(): Promise<ExposureSession[]> {
  const raw = await AsyncStorage.getItem(k('exposureSessions'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveExposureSessions(list: ExposureSession[]) {
  await AsyncStorage.setItem(k('exposureSessions'), JSON.stringify(list));
}
export async function loadThoughtRecords(): Promise<ThoughtRecord[]> {
  const raw = await AsyncStorage.getItem(k('thoughtRecords'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveThoughtRecords(list: ThoughtRecord[]) {
  await AsyncStorage.setItem(k('thoughtRecords'), JSON.stringify(list));
}

// --- Comportamentos de segurança & exposição não planeada -----------------

export type SafetyItem = { id: string; label: string; doing: boolean; dropping: boolean };
export type UnplannedLog = { id: string; date: string; ts: string; before: number; after: number; stayed: boolean; note: string };

export async function loadSafety(): Promise<SafetyItem[]> {
  const raw = await AsyncStorage.getItem(k('safetyBehaviors'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveSafety(list: SafetyItem[]) {
  await AsyncStorage.setItem(k('safetyBehaviors'), JSON.stringify(list));
}
export async function loadUnplanned(): Promise<UnplannedLog[]> {
  const raw = await AsyncStorage.getItem(k('unplannedLogs'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveUnplanned(list: UnplannedLog[]) {
  await AsyncStorage.setItem(k('unplannedLogs'), JSON.stringify(list));
}

// --- Perfil ---------------------------------------------------------------

export type ProfileData = {
  name: string;
  username: string;
  bio: string;
  photoUri: string | null;
  showSubtypes: boolean;
  showLosses: boolean;
  showSymptoms: boolean;
  showRecover: boolean;
  showCoping: boolean;
};

export async function loadProfile(): Promise<ProfileData> {
  const raw = await AsyncStorage.getItem(k('profile'));
  const def: ProfileData = { name: '', username: '', bio: '', photoUri: null, showSubtypes: true, showLosses: true, showSymptoms: true, showRecover: true, showCoping: true };
  return raw ? { ...def, ...JSON.parse(raw) } : def;
}
export async function saveProfile(p: ProfileData) {
  await AsyncStorage.setItem(k('profile'), JSON.stringify(p));
}
