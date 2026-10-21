// Plano (hoje): tarefas do dia + "comportamento da semana" escolhido da tua lista
// de comportamentos de segurança. Começas pelos mais fáceis e vais subindo.
// PlanToday  -> usado na aba "Hoje".
// PlanSummary-> resumo pequeno na aba "Visão geral".

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SAFETY_BEHAVIORS } from '../data/safety';
import { useLang } from '../i18n/i18n';
import { loadSafety, loadWeekPlan, saveWeekPlan, WeekPlan } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card } from './ui';

type L = { pt: string; en: string };

const L_EXP: L = { pt: 'Exposição do degrau atual', en: 'Exposure at your current step' };
const L_REV: L = { pt: 'Rever (o que previa vs o que aconteceu)', en: 'Review (predicted vs what happened)' };
const L_MEM: L = { pt: 'Trabalhar uma memória', en: 'Work on a memory' };
const L_LEVE: L = { pt: 'Dia mais leve / descanso', en: 'Lighter day / rest' };

function ymd(d: Date) {
  // Data local (evita o desvio de 1 dia do toISOString, que é UTC).
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function weekStartOf(d: Date) {
  const dow = (d.getDay() + 6) % 7; // 0 = segunda
  return ymd(new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow));
}
// Tarefas-base do dia (sem o comportamento da semana).
function baseTasks(dow: number): { key: string; label: L }[] {
  if (dow <= 4) return [{ key: 'exp', label: L_EXP }, { key: 'rev', label: L_REV }];
  if (dow === 5) return [{ key: 'mem', label: L_MEM }];
  return [{ key: 'leve', label: L_LEVE }];
}

// Carrega o plano, renovando a semana (novo comportamento a escolher) se mudou.
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

// ---------- Cartão do dia (aba "Hoje") ----------
export default function PlanToday() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (o: L) => o[lang];

  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [picking, setPicking] = useState(false);
  const [custom, setCustom] = useState<{ id: string; label: string }[]>([]);

  const today = ymd(new Date());
  const dow = (new Date().getDay() + 6) % 7;

  useEffect(() => {
    loadFreshPlan().then(setPlan);
    loadSafety().then((list) => setCustom(list.filter((s) => s.id.startsWith('custom:')).map((s) => ({ id: s.id, label: s.label }))));
  }, []);

  if (!plan) return null;

  function persist(next: WeekPlan) {
    setPlan(next);
    saveWeekPlan(next);
  }
  function toggle(key: string) {
    if (!plan) return;
    const id = `${today}:${key}`;
    const done = plan.done.includes(id) ? plan.done.filter((x) => x !== id) : [...plan.done, id];
    persist({ ...plan, done });
  }
  function chooseFocus(id: string, label: string) {
    if (!plan) return;
    persist({ ...plan, focusId: id, focusLabel: label });
    setPicking(false);
  }

  // Lista de comportamentos para escolher (catálogo + personalizados).
  const options = [
    ...SAFETY_BEHAVIORS.map((b: { id: string; label: L }) => ({ id: b.id, label: b.label[lang] })),
    ...custom,
  ];

  const tasks = [...baseTasks(dow)];
  if (plan.focusLabel) tasks.push({ key: 'focus', label: { pt: `Resistir hoje a: ${plan.focusLabel}`, en: `Resist today: ${plan.focusLabel}` } });
  const doneToday = tasks.filter((t) => plan.done.includes(`${today}:${t.key}`)).length;

  return (
    <Card style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{tt({ pt: 'O teu plano de hoje', en: 'Your plan for today' })}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{doneToday}/{tasks.length}</Text>
      </View>

      {tasks.map((task) => {
        const checked = plan.done.includes(`${today}:${task.key}`);
        return (
          <Pressable key={task.key} onPress={() => toggle(task.key)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 }}>
            <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: checked ? colors.success : colors.border, backgroundColor: checked ? colors.success : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {checked && <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>✓</Text>}
            </View>
            <Text style={{ color: checked ? colors.textMuted : colors.text, fontSize: 15, flex: 1, textDecorationLine: checked ? 'line-through' : 'none' }}>{tt(task.label)}</Text>
          </Pressable>
        );
      })}

      {/* Comportamento da semana */}
      <View style={{ marginTop: 4, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
        {plan.focusLabel ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13, flex: 1 }}>
              {tt({ pt: 'Esta semana vou largar:', en: 'This week I will drop:' })} <Text style={{ color: colors.text, fontWeight: '700' }}>{plan.focusLabel}</Text>
            </Text>
            <Pressable onPress={() => setPicking((o) => !o)} hitSlop={8}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{tt({ pt: 'mudar', en: 'change' })}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setPicking((o) => !o)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>{tt({ pt: 'Escolher o comportamento da semana', en: 'Choose this week\'s behaviour' })}</Text>
          </Pressable>
        )}

        {picking && (
          <View style={{ marginTop: spacing.sm, gap: 6 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{tt({ pt: 'Escolhe da tua lista — começa pelos mais fáceis.', en: 'Choose from your list — start with the easier ones.' })}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {options.map((o) => (
                <Pressable key={o.id} onPress={() => chooseFocus(o.id, o.label)} style={{ backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}>
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{o.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    </Card>
  );
}

// ---------- Resumo (aba "Visão geral") ----------
export function PlanSummary() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (o: L) => o[lang];
  const [plan, setPlan] = useState<WeekPlan | null>(null);

  const today = ymd(new Date());
  const dow = (new Date().getDay() + 6) % 7;

  useEffect(() => {
    loadFreshPlan().then(setPlan);
  }, []);

  if (!plan) return null;

  const tasks = [...baseTasks(dow)];
  if (plan.focusLabel) tasks.push({ key: 'focus', label: L_EXP });
  const doneToday = tasks.filter((t) => plan.done.includes(`${today}:${t.key}`)).length;

  return (
    <Card style={{ gap: 6 }}>
      <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{tt({ pt: 'Plano', en: 'Plan' })}</Text>
      <Text style={{ color: colors.text, fontSize: 14 }}>
        {plan.focusLabel
          ? <>{tt({ pt: 'Esta semana: largar ', en: 'This week: drop ' })}<Text style={{ fontWeight: '700' }}>{plan.focusLabel}</Text></>
          : tt({ pt: 'Escolhe o comportamento da semana na aba "Hoje".', en: 'Choose this week\'s behaviour in the "Today" tab.' })}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{tt({ pt: 'Hoje', en: 'Today' })}: {doneToday}/{tasks.length}</Text>
    </Card>
  );
}
