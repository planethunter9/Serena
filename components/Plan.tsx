// Plano do utilizador. Dois modos:
//  • PlanView   — checklist do dia, VISÍVEL no ecrã inicial (marcar feito + "Editar").
//  • PlanEditor — formulário livre (no sheet): escolher sugestões, acrescentar
//    tarefas próprias e definir o comportamento da semana a largar.

import { Ionicons } from '@expo/vector-icons';
import { useA11y } from '../lib/a11y';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import Reanimated from 'react-native-reanimated';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { homeText } from '../data/homeText';
import { safetyText } from '../data/safetyText';
import { loadLadderSteps } from '../lib/ladder';
import { appliesOn, AutoCtx, catOf, dayState, isAutoDone, PlanCat, TASK_META } from '../lib/planLogic';
import { dowMon, weekdaysOf } from '../lib/weekdays';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SAFETY_BEHAVIORS } from '../data/safety';
import { Lang, pick, useLang , tr2 } from '../i18n/i18n';
import {
  loadActCommitments,
  loadExerciseLog,
  loadExperiments,
  loadExposureSessions,
  loadJournal,
  loadMemorySessions,
  loadNextStepId,
  loadSafetyFree,
  loadThoughtRecords,
  SafetyFreeDays,
  saveSafetyFree,
  loadPlanTasks,
  loadSafety,
  loadWeekPlan,
  PlanTask,
  savePlanTasks,
  saveWeekPlan,
  WeekPlan,
} from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, checkPop } from './ui';

type L = { pt: string; en: string };

const CATEGORIES: { key: string; title: L }[] = [
  { key: 'exp', title: { pt: 'Exposição', en: 'Exposure' } },
  { key: 'cog', title: { pt: 'Pensamento', en: 'Thinking' } },
  { key: 'acc', title: { pt: 'Aceitação e valores', en: 'Acceptance & values' } },
  { key: 'beh', title: { pt: 'Comportamentos a largar', en: 'Behaviours to drop' } },
  { key: 'care', title: { pt: 'Autocuidado', en: 'Self-care' } },
];
const SUGGESTIONS: { id: string; cat: string; label: L }[] = [
  { id: 'exp_day', cat: 'exp', label: { pt: 'Exposição do dia (um degrau)', en: "Today's exposure (one step)" } },
  { id: 'exp_video', cat: 'exp', label: { pt: 'Ver um vídeo temido', en: 'Watch a feared video' } },
  { id: 'exp_words', cat: 'exp', label: { pt: 'Palavra a palavra', en: 'Word by word' } },
  { id: 'exp_senso', cat: 'exp', label: { pt: 'Exposição às sensações do corpo', en: 'Body-sensation exposure' } },
  { id: 'exp_food', cat: 'exp', label: { pt: 'Comer algo "assustador"', en: 'Eat something "scary"' } },
  { id: 'exp_read', cat: 'exp', label: { pt: 'Ler um relato / lição', en: 'Read an account / lesson' } },
  { id: 'exp_mem', cat: 'exp', label: { pt: 'Trabalhar uma memória', en: 'Work on a memory' } },
  { id: 'cog_thought', cat: 'cog', label: { pt: 'Desconstruir um pensamento', en: 'Deconstruct a thought' } },
  { id: 'cog_review', cat: 'cog', label: { pt: 'Rever (previa vs aconteceu)', en: 'Review (predicted vs happened)' } },
  { id: 'cog_myth', cat: 'cog', label: { pt: 'Verdade ou mito', en: 'True or myth' } },
  { id: 'acc_approach', cat: 'acc', label: { pt: 'Um passo de aproximação', en: 'One approach step' } },
  { id: 'acc_values', cat: 'acc', label: { pt: 'Reler os meus valores', en: 'Re-read my values' } },
  { id: 'acc_accept', cat: 'acc', label: { pt: 'Ficar com o desconforto sem lutar', en: 'Stay with discomfort without fighting' } },
  { id: 'acc_wave', cat: 'acc', label: { pt: 'Deixar passar uma onda de ansiedade', en: 'Let a wave of anxiety pass' } },
  { id: 'beh_drop', cat: 'beh', label: { pt: 'Largar um comportamento de segurança', en: 'Drop a safety behaviour' } },
  { id: 'beh_expiry', cat: 'beh', label: { pt: 'Não verificar validades', en: "Don't check expiry dates" } },
  { id: 'beh_reassure', cat: 'beh', label: { pt: 'Não pedir tranquilização', en: "Don't seek reassurance" } },
  { id: 'beh_monitor', cat: 'beh', label: { pt: 'Não vigiar a barriga', en: "Don't monitor my stomach" } },
  { id: 'care_breath', cat: 'care', label: { pt: 'Técnica de respiração', en: 'Breathing technique' } },
  { id: 'care_ground', cat: 'care', label: { pt: 'Grounding (5-4-3-2-1)', en: 'Grounding (5-4-3-2-1)' } },
  { id: 'care_journal', cat: 'care', label: { pt: 'Escrever no diário', en: 'Write in the journal' } },
  { id: 'care_sounds', cat: 'care', label: { pt: 'Ouvir sons para acalmar', en: 'Listen to calming sounds' } },
  { id: 'care_affirm', cat: 'care', label: { pt: 'Ler a afirmação do dia', en: 'Read the daily affirmation' } },
  { id: 'care_move', cat: 'care', label: { pt: 'Mexer o corpo / caminhar', en: 'Move my body / walk' } },
  { id: 'care_sleep', cat: 'care', label: { pt: 'Cuidar do sono', en: 'Look after my sleep' } },
];
// Ids antigos → novos (para planos criados na versão anterior).
const LEGACY: Record<string, string> = {
  exp: 'exp_day', rev: 'cog_review', approach: 'acc_approach',
  mem: 'exp_mem', breath: 'care_breath', journal: 'care_journal', values: 'acc_values',
};
function migrate(list: PlanTask[]): PlanTask[] {
  return list.map((t) => (!t.label && LEGACY[t.id] ? { id: LEGACY[t.id] } : t));
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function weekStartOf(d: Date) {
  const dow = (d.getDay() + 6) % 7;
  return ymd(new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow));
}
async function loadFreshPlan(): Promise<WeekPlan> {
  const p = await loadWeekPlan();
  const ws = weekStartOf(new Date());
  if (p.weekStart !== ws) {
    const renewed: WeekPlan = { weekStart: ws, focusId: null, focusLabel: null, done: p.done ?? [] };
    saveWeekPlan(renewed);
    return renewed;
  }
  return p;
}

function labelOf(tk: PlanTask, lang: Lang) {
  return tk.label ?? (pick(SUGGESTIONS.find((s) => s.id === tk.id)?.label, lang) || tk.id);
}

// ============ VISTA (to-do do dia, no ecrã inicial) ============
// Cabeçalho com anel de progresso e a semana (um ponto por dia); tarefas com
// o ícone/cor da categoria; tocar no texto abre o exercício; algumas marcam-se
// sozinhas quando o exercício é feito; as feitas descem e ficam riscadas; o
// comportamento a largar tem cartão próprio com "Hoje não fiz isto".
const CAT_ICON: Record<PlanCat, keyof typeof Ionicons.glyphMap> = {
  exp: 'trending-up-outline', cog: 'bulb-outline', acc: 'leaf-outline', beh: 'hand-left-outline', care: 'heart-outline', custom: 'checkbox-outline',
};

function ProgressRing({ done, total }: { done: number; total: number }) {
  const { colors } = useTheme();
  const S = 46, R = 19, C = 2 * Math.PI * R;
  const pct = total ? done / total : 0;
  return (
    <View style={{ width: S, height: S, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={S} height={S} style={{ position: 'absolute' }}>
        <SvgCircle cx={S / 2} cy={S / 2} r={R} stroke={colors.track} strokeWidth={5} fill="none" />
        <SvgCircle cx={S / 2} cy={S / 2} r={R} stroke={pct >= 1 ? colors.success : colors.primary} strokeWidth={5} fill="none"
          strokeDasharray={`${C * pct} ${C}`} strokeLinecap="round" transform={`rotate(-90 ${S / 2} ${S / 2})`} />
      </Svg>
      <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{done}/{total}</Text>
    </View>
  );
}

export default function PlanView({ onEdit }: { onEdit: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const Lx = (pt: string, en: string) => tr2(lang, pt, en);
  const hx = homeText(lang);
  const sx = safetyText(lang);
  const router = useRouter();

  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [ctxDays, setCtxDays] = useState<Record<string, AutoCtx>>({});
  const [free, setFree] = useState<SafetyFreeDays>({});
  const [nextLabel, setNextLabel] = useState<{ id: string; label: string } | null>(null);

  const now = new Date();
  const today = ymd(now);
  const todayDow = dowMon(now);
  const weekDates = Array.from({ length: 7 }, (_, i) => ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayDow + i)));

  // Recarrega ao voltar ao ecrã (para apanhar exercícios feitos entretanto).
  useFocusEffect(useCallback(() => {
    loadFreshPlan().then(setPlan);
    loadPlanTasks().then((stored) => {
      const m = migrate(stored);
      setTasks(m);
      if (JSON.stringify(m) !== JSON.stringify(stored)) savePlanTasks(m);
    });
    loadSafetyFree().then(setFree);
    Promise.all([loadNextStepId(), loadLadderSteps(lang)]).then(([id, steps]) => setNextLabel(id ? steps.find((x) => x.id === id) ?? null : null));
    Promise.all([loadExposureSessions(), loadExerciseLog(), loadThoughtRecords(), loadMemorySessions(), loadExperiments(), loadActCommitments(), loadJournal()])
      .then(([exp, log, th, mem, xp, act, jr]) => {
        const arr = <T,>(x: T[] | null | undefined) => (Array.isArray(x) ? x : []);
        const map: Record<string, AutoCtx> = {};
        const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - dowMon(d) + i); return ymd(d); });
        for (const d of days) {
          map[d] = {
            exposure: arr(exp).some((e) => e.date === d),
            words: arr(log).some((e) => e.type === 'words' && e.date === d),
            myth: arr(log).some((e) => e.type === 'myth' && e.date === d),
            thought: arr(th).some((e) => e.date === d),
            memory: arr(mem).some((e) => e.date === d),
            experiment: arr(xp).some((e) => e.date === d),
            approach: arr(act).some((c) => arr(c.logs).includes(d)),
            journal: arr(jr).some((e) => e.date === d),
            focusFree: false,
          };
        }
        setCtxDays(map);
      });
  }, [lang]));

  if (!plan) return null;
  const p = plan;

  const focusDisplay = p.focusLabel
    ? (pick(SAFETY_BEHAVIORS.find((b: { id: string; label: L }) => b.id === p.focusId)?.label, lang) || p.focusLabel)
    : null;
  const ctxFor = (d: string): AutoCtx => ({ ...(ctxDays[d] ?? { exposure: false, words: false, myth: false, thought: false, memory: false, experiment: false, approach: false, journal: false, focusFree: false }), focusFree: !!(p.focusId && (free[p.focusId] ?? []).includes(d)) });
  const isDone = (key: string, d: string) => p.done.includes(`${d}:${key}`) || isAutoDone(key, ctxFor(d));
  const keysFor = (dow: number) => [...tasks.filter((tk) => appliesOn(tk.days, dow)).map((tk) => tk.id), ...(focusDisplay ? ['focus'] : [])];

  function toggleDone(key: string) {
    const id = `${today}:${key}`;
    const wasDone = p.done.includes(id);
    const done = wasDone ? p.done.filter((x) => x !== id) : [...p.done, id];
    if (!wasDone) {
      Haptics.selectionAsync().catch(() => {});
      const remaining = keysFor(todayDow).filter((k) => k !== key && !isDone(k, today));
      if (remaining.length === 0) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    setPlan({ ...p, done });
    saveWeekPlan({ ...p, done });
  }
  function toggleFocusFree() {
    if (!p.focusId) return;
    const list = free[p.focusId] ?? [];
    const on = list.includes(today);
    if (!on) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const next = { ...free, [p.focusId]: on ? list.filter((d) => d !== today) : [...list, today] };
    setFree(next);
    saveSafetyFree(next);
  }

  const totalTasks = tasks.length + (focusDisplay ? 1 : 0);

  // Plano vazio → convite a criar.
  if (totalTasks === 0) {
    return (
      <Card style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="list-outline" size={18} color={colors.primary} />
          <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{Lx('O teu plano', 'Your plan')}</Text>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{Lx('Ainda não tens um plano. Cria um.', "You don't have a plan yet. Create one.")}</Text>
        <Pressable onPress={onEdit} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.primary }}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{Lx('Criar plano', 'Create plan')}</Text>
        </Pressable>
      </Card>
    );
  }

  const todayTasks = tasks.filter((tk) => appliesOn(tk.days, todayDow)).map((tk) => {
    const meta = TASK_META[tk.id];
    let label = labelOf(tk, lang);
    let route = meta?.route;
    if (tk.id === 'exp_day' && nextLabel) {
      label = hx.p_exposureOn.replace('{step}', nextLabel.label);
      route = { pathname: '/exercise', params: { type: 'exposure', step: nextLabel.id, label: nextLabel.label } };
    }
    const manual = p.done.includes(`${today}:${tk.id}`);
    const auto = !manual && isAutoDone(tk.id, ctxFor(today));
    return { key: tk.id, label, route, cat: catOf(tk.id), done: manual || auto, auto };
  });
  const ordered = [...todayTasks.filter((x) => !x.done), ...todayTasks.filter((x) => x.done)];
  const focusDone = focusDisplay ? isDone('focus', today) : false;
  const totalToday = todayTasks.length + (focusDisplay ? 1 : 0);
  const doneToday = todayTasks.filter((x) => x.done).length + (focusDone ? 1 : 0);
  const allDone = totalToday > 0 && doneToday === totalToday;
  const WD = weekdaysOf(lang);

  return (
    <Card style={{ gap: spacing.md }}>
      {/* Cabeçalho: anel + título + editar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <ProgressRing done={doneToday} total={totalToday} />
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, flex: 1 }}>{hx.p_today}</Text>
        <Pressable onPress={onEdit} hitSlop={8} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{Lx('Editar', 'Edit')}</Text>
        </Pressable>
      </View>

      {/* A semana: um ponto por dia */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {weekDates.map((d, i) => {
          const keys = keysFor(i);
          const st = dayState(keys.length, keys.filter((k) => isDone(k, d)).length, d > today);
          const isToday = d === today;
          const fill = st === 'full' ? colors.success : st === 'partial' ? colors.primarySoft : 'transparent';
          const border = st === 'full' ? colors.success : st === 'partial' ? colors.primary : colors.border;
          return (
            <View key={d} style={{ alignItems: 'center', gap: 4, flex: 1 }}>
              <Text style={{ color: isToday ? colors.primary : colors.textMuted, fontSize: 11, fontWeight: isToday ? '700' : '500' }}>{WD[i]}</Text>
              <View style={{ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: fill, borderWidth: st === 'rest' ? 0 : 2, borderColor: border, borderStyle: st === 'future' ? 'dashed' : 'solid', opacity: st === 'future' ? 0.6 : 1 }}>
                {st === 'full' ? <Ionicons name="checkmark" size={13} color="#fff" /> : st === 'rest' ? <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.border }} /> : null}
              </View>
            </View>
          );
        })}
      </View>

      {allDone && (
        <View accessibilityLiveRegion="polite" style={{ backgroundColor: colors.successSoft, borderRadius: radius.md, padding: spacing.md, gap: 2 }}>
          <Text style={{ color: colors.success, fontWeight: '700', fontSize: 15 }}>{hx.p_doneAll}</Text>
          <Text style={{ color: colors.text, fontSize: 13 }}>{hx.p_doneAllBody}</Text>
        </View>
      )}

      {todayTasks.length === 0 && !focusDisplay && <Text style={{ color: colors.textMuted, fontSize: 14 }}>{hx.p_rest}</Text>}

      {/* Tarefas de hoje (por fazer em cima, feitas em baixo) */}
      <View style={{ gap: 2 }}>
        {ordered.map((task) => {
          return (
            <View key={task.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, opacity: task.done ? 0.6 : 1 }}>
              <Pressable onPress={() => !task.auto && toggleDone(task.key)} hitSlop={6} accessibilityRole="checkbox" accessibilityState={{ checked: task.done }} accessibilityLabel={task.label}>
                <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: task.done ? colors.success : colors.border, backgroundColor: task.done ? colors.success : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {task.done && <Reanimated.View entering={checkPop}><Ionicons name="checkmark" size={15} color="#fff" /></Reanimated.View>}
                </View>
              </Pressable>
              <Pressable
                onPress={() => (task.route ? router.push(task.route as any) : toggleDone(task.key))}
                accessibilityRole={task.route ? 'link' : 'button'}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: task.done ? colors.textMuted : colors.text, fontSize: 15, textDecorationLine: task.done ? 'line-through' : 'none' }}>{task.label}</Text>
                  {task.auto && <Text style={{ color: colors.success, fontSize: 11 }}>{hx.p_auto}</Text>}
                </View>
                {task.route && !task.done && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Comportamento a largar esta semana */}
      {focusDisplay && (
        <View style={{ backgroundColor: colors.cardAlt, borderRadius: radius.md, padding: spacing.md, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="flag-outline" size={16} color={colors.chartHigh} />
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 }}>{hx.p_resist}</Text>
          </View>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{focusDisplay}</Text>
          <Pressable onPress={toggleFocusFree} accessibilityRole="checkbox" accessibilityState={{ checked: focusDone }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 999, backgroundColor: focusDone ? colors.successSoft : colors.primary }}>
            {!focusDone && <Ionicons name="checkmark" size={15} color="#fff" />}
            <Text style={{ color: focusDone ? colors.success : '#fff', fontSize: 13, fontWeight: '700' }}>{focusDone ? sx.todayDone : sx.todayNot}</Text>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

// Secção recolhível (mesmo estilo das secções dos Exercícios).
function Section({ title, icon, badge, defaultOpen, children }: { title: string; icon: keyof typeof Ionicons.glyphMap; badge?: number; defaultOpen?: boolean; children: React.ReactNode }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.lg }}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{title}</Text>
        {!!badge && (
          <View style={{ minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{badge}</Text>
          </View>
        )}
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>
      {open && <View style={{ padding: spacing.lg, paddingTop: 0, gap: spacing.sm }}>{children}</View>}
    </View>
  );
}

// ============ EDITOR (formulário, no sheet) ============
const EDIT_CAT_ICON = CAT_ICON;

export function PlanEditor() {
  const { colors } = useTheme();
  const a11y = useA11y();
  const { lang } = useLang();
  const hx = homeText(lang);
  const Lx = (pt: string, en: string) => tr2(lang, pt, en);

  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [custom, setCustom] = useState<{ id: string; label: string }[]>([]);
  const [newTask, setNewTask] = useState('');
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    loadFreshPlan().then(setPlan);
    loadSafety().then((list) => setCustom(list.filter((s) => s.id.startsWith('custom:')).map((s) => ({ id: s.id, label: s.label }))));
    loadPlanTasks().then((stored) => {
      const m = migrate(stored);
      setTasks(m);
      if (JSON.stringify(m) !== JSON.stringify(stored)) savePlanTasks(m);
    });
  }, []);

  if (!plan) return null;

  function persistTasks(next: PlanTask[]) { setTasks(next); savePlanTasks(next); }
  function addSuggestion(id: string) { if (!tasks.some((t) => t.id === id)) persistTasks([...tasks, { id }]); }
  function addCustomTask() {
    const v = newTask.trim();
    if (!v) return;
    persistTasks([...tasks, { id: 'c' + Date.now(), label: v }]);
    setNewTask('');
  }
  function removeTask(id: string) { persistTasks(tasks.filter((t) => t.id !== id)); }
  // Liga/desliga um dia; com os 7 dias ligados guarda-se "todos" (sem lista).
  function toggleDay(id: string, d: number) {
    persistTasks(tasks.map((t) => {
      if (t.id !== id) return t;
      const cur = t.days && t.days.length ? t.days : [0, 1, 2, 3, 4, 5, 6];
      const next = cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort();
      if (next.length === 0) return t; // pelo menos um dia
      return next.length === 7 ? { id: t.id, ...(t.label ? { label: t.label } : {}) } : { ...t, days: next };
    }));
  }
  function chooseFocus(id: string, label: string) {
    if (!plan) return;
    setPlan({ ...plan, focusId: id, focusLabel: label });
    saveWeekPlan({ ...plan, focusId: id, focusLabel: label });
    setPicking(false);
  }
  function clearFocus() {
    if (!plan) return;
    setPlan({ ...plan, focusId: null, focusLabel: null });
    saveWeekPlan({ ...plan, focusId: null, focusLabel: null });
  }

  const focusDisplay = plan.focusLabel
    ? ([...SAFETY_BEHAVIORS.map((b: { id: string; label: L }) => ({ id: b.id, label: pick(b.label, lang) })), ...custom].find((o) => o.id === plan.focusId)?.label ?? plan.focusLabel)
    : null;
  const behaviourOptions = [
    ...SAFETY_BEHAVIORS.map((b: { id: string; label: L }) => ({ id: b.id, label: pick(b.label, lang) })),
    ...custom,
  ];

  return (
    <View style={{ gap: spacing.lg }}>
      <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
        {Lx('A emetofobia é diferente para cada pessoa — monta o plano com o que fizer sentido para ti. Escolhe das sugestões ou acrescenta as tuas tarefas.',
            'Emetophobia is different for everyone — build the plan with whatever makes sense for you. Pick from the suggestions or add your own tasks.')}
      </Text>

      {/* As minhas tarefas */}
      <Card style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{Lx('As minhas tarefas', 'My tasks')}</Text>
        {tasks.length === 0 && !focusDisplay ? (
          <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{Lx('Vazio. Acrescenta tarefas abaixo.', 'Empty. Add tasks below.')}</Text>
        ) : (
          <>
            {tasks.map((tk, ti) => (
              <View key={tk.id} style={{ gap: 8, paddingVertical: 8, borderTopWidth: ti ? 1 : 0, borderTopColor: colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name={EDIT_CAT_ICON[catOf(tk.id)]} size={16} color={colors.primary} />
                  <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{labelOf(tk, lang)}</Text>
                  <Pressable onPress={() => removeTask(tk.id)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${a11y.delete}: ${labelOf(tk, lang)}`}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </View>
                {/* Dias da semana desta tarefa (todos = todos os dias) */}
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {weekdaysOf(lang).map((wd, d) => {
                    const on = appliesOn(tk.days, d);
                    return (
                      <Pressable key={d} onPress={() => toggleDay(tk.id, d)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={`${labelOf(tk, lang)}: ${wd}`}
                        style={{ flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center', backgroundColor: on ? colors.primarySoft : 'transparent', borderWidth: 1, borderColor: on ? colors.primary : colors.border }}>
                        <Text style={{ color: on ? colors.primary : colors.textMuted, fontSize: 11, fontWeight: '700' }}>{wd}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {!!tk.days?.length && tk.days.length < 7 ? null : <Text style={{ color: colors.textMuted, fontSize: 11 }}>{hx.p_everyDay}</Text>}
              </View>
            ))}
            {focusDisplay && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 }}>
                <Ionicons name="hand-left-outline" size={14} color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{Lx(`Resistir a: ${focusDisplay}`, `Resist: ${focusDisplay}`)}</Text>
                <Pressable onPress={clearFocus} hitSlop={6} accessibilityRole="button" accessibilityLabel={a11y.delete}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              </View>
            )}
          </>
        )}
      </Card>

      {/* Acrescentar tarefa própria */}
      <Card style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{Lx('Acrescentar a minha tarefa', 'Add my own task')}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput value={newTask} onChangeText={setNewTask} onSubmitEditing={addCustomTask} placeholder={Lx('Escreve o que quiseres fazer…', 'Write whatever you want to do…')} placeholderTextColor={colors.textMuted}
            style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15 }} />
          <Pressable onPress={addCustomTask} style={{ paddingHorizontal: 18, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{Lx('Adicionar', 'Add')}</Text>
          </Pressable>
        </View>
      </Card>

      {/* Sugestões por categoria — cada categoria abre/fecha */}
      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{Lx('Sugestões (toca para adicionar)', 'Suggestions (tap to add)')}</Text>
        {CATEGORIES.map((cat) => {
          const items = SUGGESTIONS.filter((s) => s.cat === cat.key && !tasks.some((t) => t.id === s.id));
          if (items.length === 0) return null;
          return (
            <Section key={cat.key} title={pick(cat.title, lang)} icon="bulb-outline" badge={items.length}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {items.map((s) => (
                  <Pressable key={s.id} onPress={() => addSuggestion(s.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}>
                    <Ionicons name="add" size={15} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13 }}>{pick(s.label, lang)}</Text>
                  </Pressable>
                ))}
              </View>
            </Section>
          );
        })}
      </View>

      {/* Comportamento a largar esta semana */}
      <Card style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{Lx('Comportamento a largar esta semana', "This week's behaviour to drop")}</Text>
        {focusDisplay ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{focusDisplay}</Text>
            <Pressable onPress={() => setPicking((o) => !o)} hitSlop={8}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{Lx('mudar', 'change')}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setPicking((o) => !o)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name={picking ? 'remove-circle-outline' : 'add-circle-outline'} size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>{Lx('Escolher da minha lista', 'Choose from my list')}</Text>
          </Pressable>
        )}
        {picking && (
          <View style={{ gap: 8, marginTop: 4 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{Lx('Começa pelos mais fáceis.', 'Start with the easier ones.')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {behaviourOptions.map((o) => (
                <Pressable key={o.id} onPress={() => chooseFocus(o.id, o.label)} style={{ backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}>
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{o.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </Card>
    </View>
  );
}

// ---------- Resumo pequeno (compatibilidade) ----------
export function PlanSummary() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (o: L) => pick(o, lang);
  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [tasks, setTasks] = useState<PlanTask[]>([]);

  const today = ymd(new Date());

  useEffect(() => {
    loadFreshPlan().then(setPlan);
    loadPlanTasks().then((s) => setTasks(migrate(s)));
  }, []);

  if (!plan) return null;

  const keys = [...tasks.map((t) => t.id), ...(plan.focusLabel ? ['focus'] : [])];
  const total = keys.length;
  const doneToday = keys.filter((k) => plan.done.includes(`${today}:${k}`)).length;

  return (
    <Card style={{ gap: 6 }}>
      <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{tt({ pt: 'Plano', en: 'Plan' })}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{tt({ pt: 'Hoje', en: 'Today' })}: {doneToday}/{total}</Text>
    </Card>
  );
}
