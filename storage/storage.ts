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

// --- Sincronização: quando foi alterado cada tipo de dado -------------------
// Guardamos, por utilizador, a hora (ms) da última alteração local de cada
// chave. Ao sincronizar com a cloud, juntamos as duas cópias chave a chave e
// fica a mais recente — em vez de a cloud substituir tudo (o que apagava
// alterações feitas no telemóvel ou repunha coisas já eliminadas).
const META = 'syncMeta';
type SyncMeta = Record<string, number>;
let metaQueue: Promise<unknown> = Promise.resolve();
let onLocalChange: (() => void) | null = null;

// O AuthContext regista aqui o envio (com atraso) para a cloud.
export function setOnLocalChange(cb: (() => void) | null) {
  onLocalChange = cb;
}

async function readMeta(): Promise<SyncMeta> {
  try {
    const raw = await AsyncStorage.getItem(k(META));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Marca chaves como alteradas agora (serializado para não perder marcações).
function touch(names: string[]) {
  const run = metaQueue.then(async () => {
    const meta = await readMeta();
    const now = Date.now();
    for (const n of names) meta[n] = now;
    await AsyncStorage.setItem(k(META), JSON.stringify(meta));
  });
  metaQueue = run.catch(() => {});
  return run.then(() => { onLocalChange?.(); }, () => {});
}

// Todas as escritas de dados do utilizador passam por aqui.
async function setUserItem(name: string, value: string) {
  await AsyncStorage.setItem(k(name), value);
  await touch([name]);
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
  triggers: ProfileItem[];
  completedAt: string;
};

export type SeverityEntry = { date: string; value: number }; // 0 a 5
export type AttackEntry = {
  id?: string;
  ts: string;
  date: string;
  type: 'anxiety' | 'panic' | 'behavior';
  reason?: string;        // motivo/gatilho (opcional)
  vomited?: boolean;      // acabou por vomitar? (opcional)
};

// --- Onboarding -----------------------------------------------------------

export async function saveOnboarding(data: OnboardingData) {
  await setUserItem('onboarding', JSON.stringify(data));
}
export async function loadOnboarding(): Promise<OnboardingData | null> {
  const raw = await AsyncStorage.getItem(k('onboarding'));
  return raw ? JSON.parse(raw) : null;
}
export async function clearAll() {
  const names = ['onboarding', 'severity', 'lessonsDone', 'attacks'];
  await AsyncStorage.multiRemove(names.map(k));
  await touch(names); // a remoção também conta como alteração (para não voltar da cloud)
}

// Apaga TODOS os dados locais do utilizador atual (usado ao eliminar a conta).
export async function wipeLocalUserData() {
  await AsyncStorage.multiRemove([...USER_KEY_NAMES.map((n) => k(n)), k(META)]);
}

// --- Intensidade do medo --------------------------------------------------

export async function loadSeverity(): Promise<SeverityEntry[]> {
  const raw = await AsyncStorage.getItem(k('severity'));
  return raw ? JSON.parse(raw) : [];
}
// Data local em formato YYYY-MM-DD (evita o desvio de 1 dia do toISOString, que é UTC).
export function isoLocal(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function addSeverity(value: number): Promise<SeverityEntry[]> {
  const list = await loadSeverity();
  const today = isoLocal();
  const filtered = list.filter((e) => e.date !== today);
  const next = [...filtered, { date: today, value }].sort((a, b) => (a.date < b.date ? -1 : 1));
  await setUserItem('severity', JSON.stringify(next));
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
  const next = [...list, { ts: now.toISOString(), date: isoLocal(now), type }];
  await setUserItem('attacks', JSON.stringify(next));
  return next;
}
export async function saveAttacks(list: AttackEntry[]) {
  await setUserItem('attacks', JSON.stringify(list));
}

// --- Plano da semana ------------------------------------------------------
// Tarefas do dia + "comportamento da semana" a largar. Renova-se a cada semana.
export type WeekPlan = { weekStart: string; focusId: string | null; focusLabel: string | null; done: string[] };

export async function loadWeekPlan(): Promise<WeekPlan> {
  const raw = await AsyncStorage.getItem(k('weekPlan'));
  return raw ? JSON.parse(raw) : { weekStart: '', focusId: null, focusLabel: null, done: [] };
}
export async function saveWeekPlan(plan: WeekPlan): Promise<void> {
  await setUserItem('weekPlan', JSON.stringify(plan));
}

// --- Lições concluídas ----------------------------------------------------

export async function loadLessonsDone(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('lessonsDone'));
  return raw ? JSON.parse(raw) : [];
}
export async function toggleLessonDone(id: string): Promise<string[]> {
  const done = await loadLessonsDone();
  const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
  await setUserItem('lessonsDone', JSON.stringify(next));
  return next;
}

// --- Objetivos ------------------------------------------------------------

export type Goal = { id: string; text: string; done: boolean };

export async function loadGoals(): Promise<Goal[]> {
  const raw = await AsyncStorage.getItem(k('goals'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveGoals(goals: Goal[]) {
  await setUserItem('goals', JSON.stringify(goals));
}

// --- Diário ---------------------------------------------------------------

export type JournalEntry = { id: string; date: string; ts: string; text: string; prompt?: string; mood?: number; tags?: string[] };

export async function loadJournal(): Promise<JournalEntry[]> {
  const raw = await AsyncStorage.getItem(k('journal'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveJournal(entries: JournalEntry[]) {
  await setUserItem('journal', JSON.stringify(entries));
}

// --- Lembretes ------------------------------------------------------------
// Vários lembretes à escolha (estilo "Alarmes"). Cada um tem a sua hora,
// nome opcional, interruptor e id da notificação agendada.

export type Reminder = { id: string; hour: number; minute: number; label: string; enabled: boolean; notificationId: string | null };

export async function loadReminders(): Promise<Reminder[]> {
  const raw = await AsyncStorage.getItem(k('reminders'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveReminders(list: Reminder[]) {
  await setUserItem('reminders', JSON.stringify(list));
}

// (Compatibilidade) — lembrete único antigo. Mantido para não quebrar nada.
export type ReminderConfig = { enabled: boolean; hour: number; minute: number; notificationId: string | null };

export async function loadReminder(): Promise<ReminderConfig> {
  const raw = await AsyncStorage.getItem(k('reminder'));
  return raw ? JSON.parse(raw) : { enabled: false, hour: 9, minute: 0, notificationId: null };
}
export async function saveReminder(cfg: ReminderConfig) {
  await setUserItem('reminder', JSON.stringify(cfg));
}

// --- Contador de progresso (streak) --------------------------------------
// Guarda a data a partir da qual se contam os dias sem ataques/comportamentos.

export async function loadStreakStart(): Promise<string | null> {
  return AsyncStorage.getItem(k('streakStart'));
}
export async function saveStreakStart(iso: string) {
  await setUserItem('streakStart', iso);
}

// --- Exportar/importar tudo (usado pela sincronização com a cloud) --------

const USER_KEY_NAMES = ['onboarding', 'severity', 'lessonsDone', 'attacks', 'goals', 'journal', 'reminder', 'reminders', 'streakStart', 'exposureSteps', 'exposureSessions', 'thoughtRecords', 'safetyBehaviors', 'unplannedLogs', 'profile', 'userSounds', 'feeding', 'exposureDays', 'manualAchievements', 'exposureOrder', 'memorySessions', 'weekPlan', 'experiments', 'droppedBehaviors', 'affirmationReminder', 'dashboardOrder', 'resourcesOrder', 'challengesDone', 'customChallenges', 'hardDayPlan', 'recapDismissed', 'actValues', 'actCommitments', 'ringMode', 'planEnabled', 'planTasks', 'nextStep', 'exerciseLog', 'relapsePlan', 'walkthroughSeen', 'healthConsent', 'homeHidden', 'phraseFavs', 'myPhrases', 'safetyFree'];

// Exporta os dados (cópia de segurança e envio para a cloud). Inclui as horas
// das alterações em "_meta", para a sincronização saber qual é a mais recente.
export async function exportUserData(): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const name of USER_KEY_NAMES) {
    const v = await AsyncStorage.getItem(k(name));
    if (v != null) out[name] = v;
  }
  out._meta = JSON.stringify(await readMeta());
  return out;
}

// Restaura uma cópia de segurança escolhida pelo utilizador: substitui o local
// e marca tudo como alterado agora (para seguir também para a cloud).
export async function importUserData(data: Record<string, string>) {
  if (!data) return;
  const pairs: [string, string][] = [];
  for (const name of USER_KEY_NAMES) {
    if (data[name] != null) pairs.push([k(name), data[name]]);
  }
  if (pairs.length) await AsyncStorage.multiSet(pairs);
  await touch(USER_KEY_NAMES.filter((n) => data[n] != null));
}

// Junta a cópia da cloud com a local, chave a chave: fica a alterada mais
// recentemente. Dados antigos sem horas contam como "hora 0"; em empate fica o
// local, se existir. Devolve true se o local tiver algo mais recente que a
// cloud (e portanto convém enviar de volta).
export async function mergeUserData(cloud: Record<string, string>): Promise<boolean> {
  if (!cloud) return false;
  await metaQueue;
  let cloudMeta: SyncMeta = {};
  try { cloudMeta = cloud._meta ? JSON.parse(cloud._meta) : {}; } catch {}
  const localMeta = await readMeta();
  const nextMeta: SyncMeta = { ...localMeta };
  const toSet: [string, string][] = [];
  const toRemove: string[] = [];
  let localNewer = false;

  for (const name of USER_KEY_NAMES) {
    const localVal = await AsyncStorage.getItem(k(name));
    const cloudVal = cloud[name] ?? null;
    const lt = localMeta[name] ?? 0;
    const ct = cloudMeta[name] ?? 0;
    const takeCloud = ct > lt || (ct === lt && localVal == null);
    if (takeCloud) {
      if (cloudVal != null && cloudVal !== localVal) toSet.push([k(name), cloudVal]);
      else if (cloudVal == null && localVal != null && ct > lt) toRemove.push(k(name));
      if (ct) nextMeta[name] = ct;
    } else if (lt > ct || (localVal != null && cloudVal !== localVal)) {
      localNewer = true;
    }
  }
  if (toSet.length) await AsyncStorage.multiSet(toSet);
  if (toRemove.length) await AsyncStorage.multiRemove(toRemove);
  await AsyncStorage.setItem(k(META), JSON.stringify(nextMeta));
  return localNewer;
}

// --- Exercícios: exposição e reestruturação cognitiva --------------------

export type ExposureSession = {
  id: string; stepId: string; stepLabel: string; date: string; ts: string; before: number; peak: number; after: number; note: string;
  // Aprendizagem inibitória (opcionais: sessões antigas não os têm).
  fear?: string;            // o que temia que acontecesse
  prob?: number;            // quão provável parecia antes (0–100)
  happened?: 'yes' | 'partly' | 'no';
  probAfter?: number;       // quão provável parece depois (0–100)
  learned?: string;
  minutes?: number;         // duração, se usou o modo "Estou a fazer agora"
  checkins?: number[];      // desconforto a cada 2 min durante a sessão
};
export type ThoughtRecord = { id: string; date: string; ts: string; situation: string; thought: string; before: number; traps?: string[]; evidenceFor: string; evidenceAgainst: string; balanced: string; after: number };

export async function loadExposureSteps(): Promise<ProfileItem[]> {
  const raw = await AsyncStorage.getItem(k('exposureSteps'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveExposureSteps(steps: ProfileItem[]) {
  await setUserItem('exposureSteps', JSON.stringify(steps));
}
export async function loadExposureSessions(): Promise<ExposureSession[]> {
  const raw = await AsyncStorage.getItem(k('exposureSessions'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveExposureSessions(list: ExposureSession[]) {
  await setUserItem('exposureSessions', JSON.stringify(list));
}
export async function loadThoughtRecords(): Promise<ThoughtRecord[]> {
  const raw = await AsyncStorage.getItem(k('thoughtRecords'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveThoughtRecords(list: ThoughtRecord[]) {
  await setUserItem('thoughtRecords', JSON.stringify(list));
}

// --- Experiências comportamentais (prever vs resultado) -------------------
export type ExperimentEntry = {
  id: string; date: string; ts: string;
  experiment: string; prediction: string; belief: number; // 0–10
  outcome: string; learned: string; done: boolean;
};
export async function loadExperiments(): Promise<ExperimentEntry[]> {
  const raw = await AsyncStorage.getItem(k('experiments'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveExperiments(list: ExperimentEntry[]) {
  await setUserItem('experiments', JSON.stringify(list));
}

// --- Comportamentos largados (progresso ERP) ------------------------------
export type DroppedBehavior = { id: string; label: string; date: string };
export async function loadDropped(): Promise<DroppedBehavior[]> {
  const raw = await AsyncStorage.getItem(k('droppedBehaviors'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveDropped(list: DroppedBehavior[]) {
  await setUserItem('droppedBehaviors', JSON.stringify(list));
}

// --- Lembrete de afirmação diária -----------------------------------------
export type AffirmationReminder = { enabled: boolean; hour: number; minute: number; notificationId: string | null };
export async function loadAffirmationReminder(): Promise<AffirmationReminder> {
  const raw = await AsyncStorage.getItem(k('affirmationReminder'));
  return raw ? JSON.parse(raw) : { enabled: false, hour: 9, minute: 0, notificationId: null };
}
export async function saveAffirmationReminder(s: AffirmationReminder) {
  await setUserItem('affirmationReminder', JSON.stringify(s));
}

// --- Ordem das secções do painel inicial (personalização paga) ------------
export async function loadDashboardOrder(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('dashboardOrder'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveDashboardOrder(order: string[]) {
  await setUserItem('dashboardOrder', JSON.stringify(order));
}

// Frases positivas: favoritas (id = texto em inglês da frase do catálogo, que é
// estável) e frases escritas pela pessoa.
export type MyPhrase = { id: string; text: string };
async function loadJsonArray<T>(name: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(k(name));
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
export async function loadPhraseFavs(): Promise<string[]> {
  return (await loadJsonArray<unknown>('phraseFavs')).filter((x): x is string => typeof x === 'string');
}
export async function savePhraseFavs(ids: string[]) {
  await setUserItem('phraseFavs', JSON.stringify(ids));
}
export async function loadMyPhrases(): Promise<MyPhrase[]> {
  return (await loadJsonArray<MyPhrase>('myPhrases')).filter((p) => p && typeof p.id === 'string' && typeof p.text === 'string');
}
export async function saveMyPhrases(list: MyPhrase[]) {
  await setUserItem('myPhrases', JSON.stringify(list));
}

// Blocos da Visão geral escondidos pela pessoa (Definições › Ecrã inicial).
export async function loadHomeHidden(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(k('homeHidden'));
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
export async function saveHomeHidden(ids: string[]) {
  await setUserItem('homeHidden', JSON.stringify(ids));
}

// --- Ordem dos itens do ecrã Recursos -------------------------------------
export async function loadResourcesOrder(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('resourcesOrder'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveResourcesOrder(order: string[]) {
  await setUserItem('resourcesOrder', JSON.stringify(order));
}

// --- Resumo semanal (dispensado por semana) -------------------------------
export async function loadRecapDismissed(): Promise<string> {
  const raw = await AsyncStorage.getItem(k('recapDismissed'));
  return raw ?? '';
}
export async function saveRecapDismissed(weekStart: string) {
  await setUserItem('recapDismissed', weekStart);
}

// --- Plano para dias difíceis (prevenção de recaída) ----------------------
export type HardDayPlan = { signs: string; helps: string; reminders: string; contacts: string };
export async function loadHardDayPlan(): Promise<HardDayPlan> {
  const raw = await AsyncStorage.getItem(k('hardDayPlan'));
  return raw ? JSON.parse(raw) : { signs: '', helps: '', reminders: '', contacts: '' };
}
export async function saveHardDayPlan(p: HardDayPlan) {
  await setUserItem('hardDayPlan', JSON.stringify(p));
}

// --- Desafios de incerteza concluídos (chaves `${data}:${id}`) ------------
export async function loadChallengesDone(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('challengesDone'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveChallengesDone(list: string[]) {
  await setUserItem('challengesDone', JSON.stringify(list));
}

// "Os meus desafios" de incerteza: escolhidos das sugestões (só o id, ex. "c3")
// ou criados pelo utilizador (id "u…" + texto).
export type CustomChallenge = { id: string; text?: string };
export async function loadCustomChallenges(): Promise<CustomChallenge[]> {
  const raw = await AsyncStorage.getItem(k('customChallenges'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveCustomChallenges(list: CustomChallenge[]) {
  await setUserItem('customChallenges', JSON.stringify(list));
}

export async function loadExposureOrder(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('exposureOrder'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveExposureOrder(order: string[]) {
  await setUserItem('exposureOrder', JSON.stringify(order));
}

export async function loadExposureHidden(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('exposureHidden'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveExposureHidden(ids: string[]) {
  await setUserItem('exposureHidden', JSON.stringify(ids));
}

export type MemorySession = { id: string; date: string; ts: string; before: number; after: number; note: string };

export async function loadMemorySessions(): Promise<MemorySession[]> {
  const raw = await AsyncStorage.getItem(k('memorySessions'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveMemorySessions(list: MemorySession[]) {
  await setUserItem('memorySessions', JSON.stringify(list));
}

// --- Comportamentos de segurança & exposição não planeada -----------------

export type SafetyItem = { id: string; label: string; doing: boolean; dropping: boolean };
// Dias em que a pessoa marcou "hoje não fiz isto" num comportamento a largar.
export type SafetyFreeDays = Record<string, string[]>;
export async function loadSafetyFree(): Promise<SafetyFreeDays> {
  try {
    const raw = await AsyncStorage.getItem(k('safetyFree'));
    const v = raw ? JSON.parse(raw) : {};
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}
export async function saveSafetyFree(v: SafetyFreeDays) {
  await setUserItem('safetyFree', JSON.stringify(v));
}
export type UnplannedLog = {
  id: string; date: string; ts: string; before: number; after: number; stayed: boolean; note: string;
  // Campos acrescentados depois (opcionais, para registos antigos continuarem válidos).
  triggers?: string[];          // o que aconteceu (ids de UNPLANNED_TRIGGERS ou texto livre)
  where?: string;               // onde estava
  peak?: number;                // pico do desconforto (0–10)
  fear?: string;                // o que temia que acontecesse
  happened?: 'yes' | 'partly' | 'no';
  safety?: string[];            // comportamentos de segurança usados (ids de SAFETY_BEHAVIORS)
  learned?: string;             // o que aprendi
};

export async function loadSafety(): Promise<SafetyItem[]> {
  const raw = await AsyncStorage.getItem(k('safetyBehaviors'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveSafety(list: SafetyItem[]) {
  await setUserItem('safetyBehaviors', JSON.stringify(list));
}
export async function loadUnplanned(): Promise<UnplannedLog[]> {
  const raw = await AsyncStorage.getItem(k('unplannedLogs'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveUnplanned(list: UnplannedLog[]) {
  await setUserItem('unplannedLogs', JSON.stringify(list));
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
  showTriggers: boolean;
};

export async function loadProfile(): Promise<ProfileData> {
  const raw = await AsyncStorage.getItem(k('profile'));
  const def: ProfileData = { name: '', username: '', bio: '', photoUri: null, showSubtypes: true, showLosses: true, showSymptoms: true, showRecover: true, showCoping: true, showTriggers: true };
  return raw ? { ...def, ...JSON.parse(raw) } : def;
}
export async function saveProfile(p: ProfileData) {
  await setUserItem('profile', JSON.stringify(p));
}

// --- Sons personalizados do utilizador ------------------------------------

export type UserSound = { id: string; name: string; uri: string; category: 'calm' | 'sleep' };

export async function loadUserSounds(): Promise<UserSound[]> {
  const raw = await AsyncStorage.getItem(k('userSounds'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveUserSounds(list: UserSound[]) {
  await setUserItem('userSounds', JSON.stringify(list));
}

// --- "Alimentar o medo" (comportamentos a trabalhar) ----------------------
export async function loadFeeding(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('feeding'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveFeeding(ids: string[]) {
  await setUserItem('feeding', JSON.stringify(ids));
}

// --- Dias de terapia exposta (streak manual) ------------------------------
export async function loadExposureDays(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('exposureDays'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveExposureDays(dates: string[]) {
  await setUserItem('exposureDays', JSON.stringify(dates));
}

// --- Conquistas marcadas manualmente --------------------------------------
export async function loadManualAchievements(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('manualAchievements'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveManualAchievements(ids: string[]) {
  await setUserItem('manualAchievements', JSON.stringify(ids));
}

// --- Aceitação e valores (ACT) -------------------------------------------
export type ActValues = { values: string; reflection: string };
export async function loadActValues(): Promise<ActValues> {
  const raw = await AsyncStorage.getItem(k('actValues'));
  return raw ? JSON.parse(raw) : { values: '', reflection: '' };
}
export async function saveActValues(v: ActValues) {
  await setUserItem('actValues', JSON.stringify(v));
}

// key = compromisso predefinido (rótulo vem do catálogo, bilingue);
// label = compromisso escrito pela utilizadora. logs = datas em que o fez.
export type ActCommitment = { id: string; key?: string; label?: string; logs: string[] };
export async function loadActCommitments(): Promise<ActCommitment[]> {
  const raw = await AsyncStorage.getItem(k('actCommitments'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveActCommitments(list: ActCommitment[]) {
  await setUserItem('actCommitments', JSON.stringify(list));
}

// --- Preferência do círculo de pilares (diário / semanal / mensal) --------
export type RingMode = 'daily' | 'weekly' | 'monthly';
export async function loadRingMode(): Promise<RingMode> {
  const raw = await AsyncStorage.getItem(k('ringMode'));
  if (raw === 'weekly' || raw === 'rolling') return 'weekly'; // 'rolling' (14 dias) antigo → semanal
  if (raw === 'monthly') return 'monthly';
  return 'daily'; // por omissão
}
export async function saveRingMode(m: RingMode) {
  await setUserItem('ringMode', m);
}

// --- Plano de prevenção de recaída ----------------------------------------
export type RelapsePlan = { learned: string; warningSigns: string; ifItReturns: string };
export async function loadRelapsePlan(): Promise<RelapsePlan> {
  const raw = await AsyncStorage.getItem(k('relapsePlan'));
  return raw ? JSON.parse(raw) : { learned: '', warningSigns: '', ifItReturns: '' };
}
export async function saveRelapsePlan(p: RelapsePlan) {
  await setUserItem('relapsePlan', JSON.stringify(p));
}

// --- Walkthrough de abertura (mostra-se uma vez após o onboarding) ---------
export async function loadWalkthroughSeen(): Promise<boolean> {
  return (await AsyncStorage.getItem(k('walkthroughSeen'))) === '1';
}
export async function saveWalkthroughSeen() {
  await setUserItem('walkthroughSeen', '1');
}
// "Ver o tutorial outra vez" (Definições): volta a mostrá-lo ao regressar ao início.
export async function resetWalkthroughSeen() {
  await setUserItem('walkthroughSeen', '0');
}

// --- Próximo passo (escolhido pelo utilizador) ----------------------------
export async function loadNextStep(): Promise<string> {
  const raw = await AsyncStorage.getItem(k('nextStep'));
  return raw ?? '';
}
export async function saveNextStep(s: string) {
  await setUserItem('nextStep', s);
}

// --- Registo genérico de sessões de exercícios (para o contador/pilares) ---
// Cada vez que o utilizador marca uma sessão de um exercício, fica aqui um
// registo datado. Permite marcar MAIS do que uma sessão por dia.
export type ExerciseLogEntry = { type: string; date: string; ts: string; detail?: string }; // detail: ex. pontuação
export async function loadExerciseLog(): Promise<ExerciseLogEntry[]> {
  const raw = await AsyncStorage.getItem(k('exerciseLog'));
  return raw ? JSON.parse(raw) : [];
}
export async function appendExerciseLog(type: string, detail?: string): Promise<ExerciseLogEntry[]> {
  const list = await loadExerciseLog();
  const now = new Date();
  const next: ExerciseLogEntry[] = [...list, { type, date: isoLocal(now), ts: now.toISOString(), ...(detail ? { detail } : {}) }];
  await setUserItem('exerciseLog', JSON.stringify(next));
  return next;
}
export async function removeLastExerciseLog(type: string): Promise<ExerciseLogEntry[]> {
  const list = await loadExerciseLog();
  const idx = [...list].reverse().findIndex((e) => e.type === type);
  if (idx >= 0) list.splice(list.length - 1 - idx, 1);
  await setUserItem('exerciseLog', JSON.stringify(list));
  return list;
}

// --- Plano ativo (opcional; ligado pelo botão no ecrã inicial) ------------
export async function loadPlanEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(k('planEnabled'));
  return raw === '1'; // por omissão: desligado
}
export async function savePlanEnabled(on: boolean) {
  await setUserItem('planEnabled', on ? '1' : '0');
}

// Tarefas do plano, escolhidas pelo utilizador. Uma tarefa predefinida guarda só
// o id (o rótulo vem do catálogo, bilingue); uma tarefa própria guarda o label.
export type PlanTask = { id: string; label?: string };
export async function loadPlanTasks(): Promise<PlanTask[]> {
  const raw = await AsyncStorage.getItem(k('planTasks'));
  return raw ? JSON.parse(raw) : [];
}
export async function savePlanTasks(list: PlanTask[]) {
  await setUserItem('planTasks', JSON.stringify(list));
}

// --- Consentimento explícito para dados de saúde (RGPD, art. 9.º) ----------
// Guardado com a versão do texto aceite; se o texto mudar de forma relevante,
// sobe-se CONSENT_VERSION e o ecrã volta a aparecer.
export const CONSENT_VERSION = 1;
export type HealthConsent = { version: number; acceptedAt: string };
export async function loadHealthConsent(): Promise<HealthConsent | null> {
  try {
    const raw = await AsyncStorage.getItem(k('healthConsent'));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export async function saveHealthConsent(c: HealthConsent) {
  await setUserItem('healthConsent', JSON.stringify(c));
}
