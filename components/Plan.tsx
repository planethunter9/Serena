// Plano do utilizador. Dois modos:
//  • PlanView   — checklist do dia, VISÍVEL no ecrã inicial (marcar feito + "Editar").
//  • PlanEditor — formulário livre (no sheet): escolher sugestões, acrescentar
//    tarefas próprias e definir o comportamento da semana a largar.

import { Ionicons } from '@expo/vector-icons';
import { useA11y } from '../lib/a11y';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SAFETY_BEHAVIORS } from '../data/safety';
import { Lang, pick, useLang , tr2 } from '../i18n/i18n';
import {
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
import { Card } from './ui';

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

// ============ VISTA (checklist do dia, no ecrã inicial) ============
export default function PlanView({ onEdit }: { onEdit: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const Lx = (pt: string, en: string) => tr2(lang, pt, en);

  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [tasks, setTasks] = useState<PlanTask[]>([]);

  const today = ymd(new Date());

  useEffect(() => {
    loadFreshPlan().then(setPlan);
    loadPlanTasks().then((stored) => {
      const m = migrate(stored);
      setTasks(m);
      if (JSON.stringify(m) !== JSON.stringify(stored)) savePlanTasks(m);
    });
  }, []);

  if (!plan) return null;

  function toggleDone(key: string) {
    if (!plan) return;
    const id = `${today}:${key}`;
    const done = plan.done.includes(id) ? plan.done.filter((x) => x !== id) : [...plan.done, id];
    setPlan({ ...plan, done });
    saveWeekPlan({ ...plan, done });
  }

  const focusDisplay = plan.focusLabel
    ? (pick(SAFETY_BEHAVIORS.find((b: { id: string; label: L }) => b.id === plan!.focusId)?.label, lang) || plan.focusLabel)
    : null;
  const dayTasks: { key: string; label: string }[] = tasks.map((tk) => ({ key: tk.id, label: labelOf(tk, lang) }));
  if (focusDisplay) dayTasks.push({ key: 'focus', label: Lx(`Resistir hoje a: ${focusDisplay}`, `Resist today: ${focusDisplay}`) });
  const doneToday = dayTasks.filter((t) => plan.done.includes(`${today}:${t.key}`)).length;

  // Plano vazio → convite a criar.
  if (dayTasks.length === 0) {
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

  return (
    <Card style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{Lx('O teu plano de hoje', "Your plan for today")}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginRight: 12 }}>{doneToday}/{dayTasks.length}</Text>
        <Pressable onPress={onEdit} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{Lx('Editar', 'Edit')}</Text>
        </Pressable>
      </View>

      {dayTasks.map((task) => {
        const checked = plan.done.includes(`${today}:${task.key}`);
        return (
          <Pressable key={task.key} onPress={() => toggleDone(task.key)} accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={task.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 }}>
            <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: checked ? colors.success : colors.border, backgroundColor: checked ? colors.success : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {checked && <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>✓</Text>}
            </View>
            <Text style={{ color: checked ? colors.textMuted : colors.text, fontSize: 15, flex: 1, textDecorationLine: checked ? 'line-through' : 'none' }}>{task.label}</Text>
          </Pressable>
        );
      })}
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
export function PlanEditor() {
  const { colors } = useTheme();
  const a11y = useA11y();
  const { lang } = useLang();
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
            {tasks.map((tk) => (
              <View key={tk.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 }}>
                <Ionicons name="ellipse" size={8} color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{labelOf(tk, lang)}</Text>
                <Pressable onPress={() => removeTask(tk.id)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${a11y.delete}: ${labelOf(tk, lang)}`}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
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
