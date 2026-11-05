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
  await AsyncStorage.setItem(k('onboarding'), JSON.stringify(data));
}
export async function loadOnboarding(): Promise<OnboardingData | null> {
  const raw = await AsyncStorage.getItem(k('onboarding'));
  return raw ? JSON.parse(raw) : null;
}
export async function clearAll() {
  await AsyncStorage.multiRemove([k('onboarding'), k('severity'), k('lessonsDone'), k('attacks')]);
}

// Apaga TODOS os dados locais do utilizador atual (usado ao eliminar a conta).
export async function wipeLocalUserData() {
  await AsyncStorage.multiRemove(USER_KEY_NAMES.map((n) => k(n)));
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
  const next = [...list, { ts: now.toISOString(), date: isoLocal(now), type }];
  await AsyncStorage.setItem(k('attacks'), JSON.stringify(next));
  return next;
}
export async function saveAttacks(list: AttackEntry[]) {
  await AsyncStorage.setItem(k('attacks'), JSON.stringify(list));
}

// --- Plano da semana ------------------------------------------------------
// Tarefas do dia + "comportamento da semana" a largar. Renova-se a cada semana.
export type WeekPlan = { weekStart: string; focusId: string | null; focusLabel: string | null; done: string[] };

export async function loadWeekPlan(): Promise<WeekPlan> {
  const raw = await AsyncStorage.getItem(k('weekPlan'));
  return raw ? JSON.parse(raw) : { weekStart: '', focusId: null, focusLabel: null, done: [] };
}
export async function saveWeekPlan(plan: WeekPlan): Promise<void> {
  await AsyncStorage.setItem(k('weekPlan'), JSON.stringify(plan));
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
// Vários lembretes à escolha (estilo "Alarmes"). Cada um tem a sua hora,
// nome opcional, interruptor e id da notificação agendada.

export type Reminder = { id: string; hour: number; minute: number; label: string; enabled: boolean; notificationId: string | null };

export async function loadReminders(): Promise<Reminder[]> {
  const raw = await AsyncStorage.getItem(k('reminders'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveReminders(list: Reminder[]) {
  await AsyncStorage.setItem(k('reminders'), JSON.stringify(list));
}

// (Compatibilidade) — lembrete único antigo. Mantido para não quebrar nada.
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

const USER_KEY_NAMES = ['onboarding', 'severity', 'lessonsDone', 'attacks', 'goals', 'journal', 'reminder', 'reminders', 'streakStart', 'exposureSteps', 'exposureSessions', 'thoughtRecords', 'safetyBehaviors', 'unplannedLogs', 'profile', 'userSounds', 'feeding', 'exposureDays', 'manualAchievements', 'exposureOrder', 'memorySessions', 'weekPlan', 'experiments', 'droppedBehaviors', 'affirmationReminder', 'dashboardOrder', 'resourcesOrder', 'challengesDone', 'hardDayPlan', 'recapDismissed', 'actValues', 'actCommitments', 'ringMode', 'planEnabled', 'planTasks', 'nextStep', 'exerciseLog', 'relapsePlan', 'walkthroughSeen'];

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
export type ThoughtRecord = { id: string; date: string; ts: string; situation: string; thought: string; before: number; traps?: string[]; evidenceFor: string; evidenceAgainst: string; balanced: string; after: number };

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
  await AsyncStorage.setItem(k('experiments'), JSON.stringify(list));
}

// --- Comportamentos largados (progresso ERP) ------------------------------
export type DroppedBehavior = { id: string; label: string; date: string };
export async function loadDropped(): Promise<DroppedBehavior[]> {
  const raw = await AsyncStorage.getItem(k('droppedBehaviors'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveDropped(list: DroppedBehavior[]) {
  await AsyncStorage.setItem(k('droppedBehaviors'), JSON.stringify(list));
}

// --- Lembrete de afirmação diária -----------------------------------------
export type AffirmationReminder = { enabled: boolean; hour: number; minute: number; notificationId: string | null };
export async function loadAffirmationReminder(): Promise<AffirmationReminder> {
  const raw = await AsyncStorage.getItem(k('affirmationReminder'));
  return raw ? JSON.parse(raw) : { enabled: false, hour: 9, minute: 0, notificationId: null };
}
export async function saveAffirmationReminder(s: AffirmationReminder) {
  await AsyncStorage.setItem(k('affirmationReminder'), JSON.stringify(s));
}

// --- Ordem das secções do painel inicial (personalização paga) ------------
export async function loadDashboardOrder(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('dashboardOrder'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveDashboardOrder(order: string[]) {
  await AsyncStorage.setItem(k('dashboardOrder'), JSON.stringify(order));
}

// --- Ordem dos itens do ecrã Recursos -------------------------------------
export async function loadResourcesOrder(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('resourcesOrder'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveResourcesOrder(order: string[]) {
  await AsyncStorage.setItem(k('resourcesOrder'), JSON.stringify(order));
}

// --- Resumo semanal (dispensado por semana) -------------------------------
export async function loadRecapDismissed(): Promise<string> {
  const raw = await AsyncStorage.getItem(k('recapDismissed'));
  return raw ?? '';
}
export async function saveRecapDismissed(weekStart: string) {
  await AsyncStorage.setItem(k('recapDismissed'), weekStart);
}

// --- Plano para dias difíceis (prevenção de recaída) ----------------------
export type HardDayPlan = { signs: string; helps: string; reminders: string; contacts: string };
export async function loadHardDayPlan(): Promise<HardDayPlan> {
  const raw = await AsyncStorage.getItem(k('hardDayPlan'));
  return raw ? JSON.parse(raw) : { signs: '', helps: '', reminders: '', contacts: '' };
}
export async function saveHardDayPlan(p: HardDayPlan) {
  await AsyncStorage.setItem(k('hardDayPlan'), JSON.stringify(p));
}

// --- Desafios de incerteza concluídos (chaves `${data}:${id}`) ------------
export async function loadChallengesDone(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('challengesDone'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveChallengesDone(list: string[]) {
  await AsyncStorage.setItem(k('challengesDone'), JSON.stringify(list));
}

export async function loadExposureOrder(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('exposureOrder'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveExposureOrder(order: string[]) {
  await AsyncStorage.setItem(k('exposureOrder'), JSON.stringify(order));
}

export async function loadExposureHidden(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('exposureHidden'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveExposureHidden(ids: string[]) {
  await AsyncStorage.setItem(k('exposureHidden'), JSON.stringify(ids));
}

export type MemorySession = { id: string; date: string; ts: string; before: number; after: number; note: string };

export async function loadMemorySessions(): Promise<MemorySession[]> {
  const raw = await AsyncStorage.getItem(k('memorySessions'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveMemorySessions(list: MemorySession[]) {
  await AsyncStorage.setItem(k('memorySessions'), JSON.stringify(list));
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
  showTriggers: boolean;
};

export async function loadProfile(): Promise<ProfileData> {
  const raw = await AsyncStorage.getItem(k('profile'));
  const def: ProfileData = { name: '', username: '', bio: '', photoUri: null, showSubtypes: true, showLosses: true, showSymptoms: true, showRecover: true, showCoping: true, showTriggers: true };
  return raw ? { ...def, ...JSON.parse(raw) } : def;
}
export async function saveProfile(p: ProfileData) {
  await AsyncStorage.setItem(k('profile'), JSON.stringify(p));
}

// --- Sons personalizados do utilizador ------------------------------------

export type UserSound = { id: string; name: string; uri: string; category: 'calm' | 'sleep' };

export async function loadUserSounds(): Promise<UserSound[]> {
  const raw = await AsyncStorage.getItem(k('userSounds'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveUserSounds(list: UserSound[]) {
  await AsyncStorage.setItem(k('userSounds'), JSON.stringify(list));
}

// --- "Alimentar o medo" (comportamentos a trabalhar) ----------------------
export async function loadFeeding(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('feeding'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveFeeding(ids: string[]) {
  await AsyncStorage.setItem(k('feeding'), JSON.stringify(ids));
}

// --- Dias de terapia exposta (streak manual) ------------------------------
export async function loadExposureDays(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('exposureDays'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveExposureDays(dates: string[]) {
  await AsyncStorage.setItem(k('exposureDays'), JSON.stringify(dates));
}

// --- Conquistas marcadas manualmente --------------------------------------
export async function loadManualAchievements(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(k('manualAchievements'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveManualAchievements(ids: string[]) {
  await AsyncStorage.setItem(k('manualAchievements'), JSON.stringify(ids));
}

// --- Aceitação e valores (ACT) -------------------------------------------
export type ActValues = { values: string; reflection: string };
export async function loadActValues(): Promise<ActValues> {
  const raw = await AsyncStorage.getItem(k('actValues'));
  return raw ? JSON.parse(raw) : { values: '', reflection: '' };
}
export async function saveActValues(v: ActValues) {
  await AsyncStorage.setItem(k('actValues'), JSON.stringify(v));
}

// key = compromisso predefinido (rótulo vem do catálogo, bilingue);
// label = compromisso escrito pela utilizadora. logs = datas em que o fez.
export type ActCommitment = { id: string; key?: string; label?: string; logs: string[] };
export async function loadActCommitments(): Promise<ActCommitment[]> {
  const raw = await AsyncStorage.getItem(k('actCommitments'));
  return raw ? JSON.parse(raw) : [];
}
export async function saveActCommitments(list: ActCommitment[]) {
  await AsyncStorage.setItem(k('actCommitments'), JSON.stringify(list));
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
  await AsyncStorage.setItem(k('ringMode'), m);
}

// --- Plano de prevenção de recaída ----------------------------------------
export type RelapsePlan = { learned: string; warningSigns: string; ifItReturns: string };
export async function loadRelapsePlan(): Promise<RelapsePlan> {
  const raw = await AsyncStorage.getItem(k('relapsePlan'));
  return raw ? JSON.parse(raw) : { learned: '', warningSigns: '', ifItReturns: '' };
}
export async function saveRelapsePlan(p: RelapsePlan) {
  await AsyncStorage.setItem(k('relapsePlan'), JSON.stringify(p));
}

// --- Walkthrough de abertura (mostra-se uma vez após o onboarding) ---------
export async function loadWalkthroughSeen(): Promise<boolean> {
  return (await AsyncStorage.getItem(k('walkthroughSeen'))) === '1';
}
export async function saveWalkthroughSeen() {
  await AsyncStorage.setItem(k('walkthroughSeen'), '1');
}

// --- Próximo passo (escolhido pelo utilizador) ----------------------------
export async function loadNextStep(): Promise<string> {
  const raw = await AsyncStorage.getItem(k('nextStep'));
  return raw ?? '';
}
export async function saveNextStep(s: string) {
  await AsyncStorage.setItem(k('nextStep'), s);
}

// --- Registo genérico de sessões de exercícios (para o contador/pilares) ---
// Cada vez que o utilizador marca uma sessão de um exercício, fica aqui um
// registo datado. Permite marcar MAIS do que uma sessão por dia.
export type ExerciseLogEntry = { type: string; date: string; ts: string };
export async function loadExerciseLog(): Promise<ExerciseLogEntry[]> {
  const raw = await AsyncStorage.getItem(k('exerciseLog'));
  return raw ? JSON.parse(raw) : [];
}
export async function appendExerciseLog(type: string): Promise<ExerciseLogEntry[]> {
  const list = await loadExerciseLog();
  const now = new Date();
  const next = [...list, { type, date: isoLocal(now), ts: now.toISOString() }];
  await AsyncStorage.setItem(k('exerciseLog'), JSON.stringify(next));
  return next;
}
export async function removeLastExerciseLog(type: string): Promise<ExerciseLogEntry[]> {
  const list = await loadExerciseLog();
  const idx = [...list].reverse().findIndex((e) => e.type === type);
  if (idx >= 0) list.splice(list.length - 1 - idx, 1);
  await AsyncStorage.setItem(k('exerciseLog'), JSON.stringify(list));
  return list;
}

// --- Plano ativo (opcional; ligado pelo botão no ecrã inicial) ------------
export async function loadPlanEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(k('planEnabled'));
  return raw === '1'; // por omissão: desligado
}
export async function savePlanEnabled(on: boolean) {
  await AsyncStorage.setItem(k('planEnabled'), on ? '1' : '0');
}

// Tarefas do plano, escolhidas pelo utilizador. Uma tarefa predefinida guarda só
// o id (o rótulo vem do catálogo, bilingue); uma tarefa própria guarda o label.
export type PlanTask = { id: string; label?: string };
export async function loadPlanTasks(): Promise<PlanTask[]> {
  const raw = await AsyncStorage.getItem(k('planTasks'));
  return raw ? JSON.parse(raw) : [];
}
export async function savePlanTasks(list: PlanTask[]) {
  await AsyncStorage.setItem(k('planTasks'), JSON.stringify(list));
}
