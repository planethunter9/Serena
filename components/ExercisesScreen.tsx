// Exercícios: exposição gradual (escada + SUDS) e reestruturação cognitiva.
// Baseado em técnicas usadas por profissionais (CBT/ERP).

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { SUBTYPE_OPTIONS } from '../data/content';
import { EXPOSURE_LADDER } from '../data/exercises';
import { LADDER_TEMPLATES } from '../data/ladderTemplates';
import { useLang } from '../i18n/i18n';
import { tr2 } from '../i18n/i18n';
import {
  appendExerciseLog,
  ExerciseLogEntry,
  ExperimentEntry,
  ExposureSession,
  loadExerciseLog,
  loadExperiments,
  loadExposureDays,
  loadExposureHidden,
  loadExposureOrder,
  loadExposureSessions,
  loadExposureSteps,
  loadOnboarding,
  loadThoughtRecords,
  removeLastExerciseLog,
  ProfileItem,
  saveExposureDays,
  saveExposureHidden,
  saveExposureOrder,
  saveExposureSessions,
  saveExperiments,
  saveExposureSteps,
  saveThoughtRecords,
  ThoughtRecord,
} from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, PrimaryButton, TopBackBar } from './ui';

type L = { pt: string; en: string };
export type Step = { id: string; label: string };

const EXPOSURE_PHASES: L[] = [
  { pt: 'Dizer palavras ou frases', en: 'Say words or phrases' },
  { pt: 'Ver imagens', en: 'Look at images' },
  { pt: 'Ver e ouvir vídeos', en: 'Watch and listen to videos' },
  { pt: 'Simulação de sensações', en: 'Simulate the sensations' },
  { pt: 'Fazer / comer o que evitavas', en: 'Do / eat what you avoided' },
];

const EXPOSURE_REMINDERS: L[] = [
  { pt: 'Não tomar medicamentos anti-náusea.', en: 'Do not take anti-nausea medication.' },
  { pt: 'Não verificar repetidamente a validade dos alimentos.', en: 'Do not repeatedly check food expiry dates.' },
  { pt: 'Não usar "rituais" de distração ou rezas.', en: 'Do not use distraction "rituals" or prayers.' },
  { pt: 'Deixa a ansiedade subir e descer naturalmente, até o corpo perceber que o perigo não é real.', en: 'Let anxiety rise and fall naturally, until the body learns the danger is not real.' },
  { pt: 'Não pedir reassurance nem pesquisar razões ou sintomas.', en: 'Do not seek reassurance or search for reasons or symptoms.' },
];

const EXPOSURE_PHRASE_GROUPS: { title: L; phrases: L[] }[] = [
  {
    title: { pt: 'Reformular o negativo', en: 'Reframe the negative' },
    phrases: [
      { pt: 'Sou capaz.', en: 'I am capable.' },
      { pt: 'Eu consigo.', en: 'I can do this.' },
      { pt: 'Vale a pena, por mim.', en: 'It is worth it, for me.' },
      { pt: 'Estou a aguentar — e isso é suficiente.', en: 'I am holding on — and that is enough.' },
      { pt: 'Não tenho de ser perfeita, só tenho de continuar.', en: 'I do not have to be perfect, I just have to keep going.' },
      { pt: 'Já cheguei até aqui; consigo dar mais um passo.', en: 'I have come this far; I can take one more step.' },
      { pt: 'Isto é difícil, mas não é impossível.', en: 'This is hard, but it is not impossible.' },
      { pt: 'Cada vez que fico, fico mais forte.', en: 'Every time I stay, I get stronger.' },
    ],
  },
  {
    title: { pt: 'Usar a raiva contra a fobia', en: 'Use anger against the phobia' },
    phrases: [
      { pt: 'Já chega. Não quero viver mais assim.', en: 'Enough. I do not want to live like this anymore.' },
      { pt: 'Não vou deixar o medo escolher por mim.', en: 'I will not let fear choose for me.' },
      { pt: 'A fobia já me tirou demais. Acabou.', en: 'The phobia has taken too much. It is over.' },
      { pt: 'Esta é a minha vida — não é a do medo.', en: 'This is my life — not the fear’s.' },
      { pt: 'Estou farta de fugir. Hoje enfrento.', en: 'I am done running. Today I face it.' },
      { pt: 'O medo não manda em mim.', en: 'Fear does not run my life.' },
      { pt: 'Quero a minha liberdade de volta, e vou buscá-la.', en: 'I want my freedom back, and I am taking it.' },
    ],
  },
  {
    title: { pt: 'Para tolerar a incerteza (durante a exposição)', en: 'To tolerate uncertainty (during exposure)' },
    phrases: [
      { pt: 'Posso sentir isto e continuar.', en: 'I can feel this and carry on.' },
      { pt: 'Deixo a dúvida existir, sem a resolver.', en: 'I let the doubt be there, without resolving it.' },
      { pt: 'Não preciso de ter a certeza para ficar.', en: 'I don\'t need to be certain to stay.' },
      { pt: 'Isto é desconfortável, não é perigoso.', en: 'This is uncomfortable, not dangerous.' },
      { pt: 'Deixo a onda subir e descer.', en: 'I let the wave rise and fall.' },
    ],
  },
];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function consecutiveDays(days: string[]): number {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(ymd(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (set.has(ymd(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// Secção recolhível reutilizável (fechada por defeito).
function Collapsible({ title, icon, danger, children }: { title: string; icon: keyof typeof Ionicons.glyphMap; danger?: boolean; children: React.ReactNode }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const accent = danger ? colors.danger : colors.primary;
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
      <Pressable onPress={() => setOpen((o) => !o)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.lg }}>
        <Ionicons name={icon} size={20} color={accent} />
        <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>
      {open && <View style={{ padding: spacing.lg, paddingTop: 0, gap: spacing.sm }}>{children}</View>}
    </View>
  );
}

// Linha de seleção de 0 a 10 (escala SUDS).
function Suds({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {Array.from({ length: 11 }, (_, v) => {
        const active = value === v;
        return (
          <Pressable
            key={v}
            onPress={() => onChange(v)}
            style={{ width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.primary : colors.cardAlt, borderWidth: 2, borderColor: active ? colors.primary : colors.border }}
          >
            <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700' }}>{v}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---- Exercício de exposição gradual ----
// `selected` está no componente pai (ExercisesScreen) para que o botão de voltar
// de cima regresse à escada e não ao menu dos exercícios.
export function ExposureView({ selected, setSelected }: { selected: Step | null; setSelected: (s: Step | null) => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [custom, setCustom] = useState<ProfileItem[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [sessions, setSessions] = useState<ExposureSession[]>([]);
  const [expDays, setExpDays] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');
  const [adding, setAdding] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [openPhrase, setOpenPhrase] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [subtypeIds, setSubtypeIds] = useState<string[]>([]);
  const [openTpl, setOpenTpl] = useState<string | null>(null);
  const [chartW2, setChartW2] = useState(0);
  const [before, setBefore] = useState<number | null>(null);
  const [peak, setPeak] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    loadExposureSteps().then(setCustom);
    loadExposureOrder().then(setOrder);
    loadExposureHidden().then(setHidden);
    loadExposureSessions().then(setSessions);
    loadExposureDays().then(setExpDays);
    loadOnboarding().then((d: any) => { if (d?.subtypes) setSubtypeIds(d.subtypes.map((x: any) => x.id)); });
  }, []);

  // Importa os degraus de um modelo para a escada (sem duplicar os que já existem).
  function importSteps(stepsL: L[]) {
    const existing = new Set(base.map((s) => s.label.trim().toLowerCase()));
    const toAdd = stepsL.map((s) => s[lang]).filter((label) => !existing.has(label.trim().toLowerCase()));
    if (toAdd.length) {
      const now = Date.now();
      const added = toAdd.map((label, i) => ({ id: 'custom:' + (now + i), label }));
      const nextCustom = [...custom, ...added];
      setCustom(nextCustom);
      saveExposureSteps(nextCustom);
      const nextOrder = [...steps.map((s) => s.id), ...added.map((a) => a.id)];
      setOrder(nextOrder);
      saveExposureOrder(nextOrder);
    }
    setShowTemplates(false);
    setOpenTpl(null);
  }

  // Modelos ordenados: os subtipos do próprio utilizador aparecem primeiro.
  const templates = [...LADDER_TEMPLATES].sort((a, b) =>
    (subtypeIds.includes(a.subtypeId) ? 0 : 1) - (subtypeIds.includes(b.subtypeId) ? 0 : 1)
  );

  const todayStr = ymd(new Date());
  const markedToday = expDays.includes(todayStr);
  const streak = consecutiveDays(expDays);

  function toggleToday() {
    if (!markedToday) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const next = markedToday ? expDays.filter((d) => d !== todayStr) : [...expDays, todayStr];
    setExpDays(next);
    saveExposureDays(next);
  }

  // Todos os degraus (predefinidos + personalizados), sem os removidos, reordenados segundo `order`.
  const hiddenSet = new Set(hidden);
  const base: Step[] = [
    ...EXPOSURE_LADDER.map((s) => ({ id: s.id, label: s.label[lang] })),
    ...custom.map((c) => ({ id: c.id, label: c.label })),
  ].filter((s) => !hiddenSet.has(s.id));
  const byId = new Map(base.map((s) => [s.id, s]));
  const ordered: Step[] = order.map((id) => byId.get(id)).filter(Boolean) as Step[];
  const seen = new Set(order);
  const steps: Step[] = [...ordered, ...base.filter((s) => !seen.has(s.id))];

  function addStep() {
    const v = newStep.trim();
    if (!v) return;
    const id = 'custom:' + Date.now();
    const nextCustom = [...custom, { id, label: v }];
    setCustom(nextCustom);
    saveExposureSteps(nextCustom);
    const nextOrder = [...steps.map((s) => s.id), id];
    setOrder(nextOrder);
    saveExposureOrder(nextOrder);
    setNewStep('');
    setAdding(false);
  }

  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= steps.length) return;
    const ids = steps.map((s) => s.id);
    [ids[index], ids[j]] = [ids[j], ids[index]];
    setOrder(ids);
    saveExposureOrder(ids);
  }

  function doRemove(s: Step) {
    // Degrau personalizado: apaga-o mesmo. Predefinido: fica escondido.
    const isCustom = custom.some((c) => c.id === s.id);
    if (isCustom) {
      const nextCustom = custom.filter((c) => c.id !== s.id);
      setCustom(nextCustom);
      saveExposureSteps(nextCustom);
    } else {
      const nextHidden = [...hidden, s.id];
      setHidden(nextHidden);
      saveExposureHidden(nextHidden);
    }
    const nextOrder = order.filter((id) => id !== s.id);
    setOrder(nextOrder);
    saveExposureOrder(nextOrder);
  }

  function removeStep(s: Step) {
    Alert.alert(t('exposure.removeTitle'), t('exposure.removeMsg', { label: s.label }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.remove'), style: 'destructive', onPress: () => doRemove(s) },
    ]);
  }

  function openStep(s: Step) {
    setSelected(s);
    setBefore(null); setPeak(null); setAfter(null); setNote('');
  }

  function saveSession() {
    if (!selected || before === null || after === null) return;
    const now = new Date();
    const entry: ExposureSession = {
      id: 'e' + now.getTime(), stepId: selected.id, stepLabel: selected.label,
      date: ymd(now), ts: now.toISOString(),
      before, peak: peak ?? before, after, note: note.trim(),
    };
    const next = [entry, ...sessions];
    setSessions(next);
    saveExposureSessions(next);
    setSelected(null);
  }

  // Vista de uma sessão para um degrau.
  if (selected) {
    const history = sessions.filter((s) => s.stepId === selected.id);
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ gap: spacing.md }}>
          <Pressable onPress={() => setSelected(null)} hitSlop={8}>
            <Text style={{ color: colors.textMuted }}>‹ {t('common.back')}</Text>
          </Pressable>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{selected.label}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('exposure.sudsHint')}</Text>

          <Card style={{ gap: 8 }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{t('exposure.before')}</Text>
            <Suds value={before} onChange={setBefore} />
          </Card>
          <Card style={{ gap: 8 }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{t('exposure.peak')}</Text>
            <Suds value={peak} onChange={setPeak} />
          </Card>
          <Card style={{ gap: 8 }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{t('exposure.after')}</Text>
            <Suds value={after} onChange={setAfter} />
          </Card>
          <TextInput
            value={note} onChangeText={setNote} placeholder={t('exposure.note')} placeholderTextColor={colors.textMuted} multiline
            style={{ minHeight: 60, padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15, textAlignVertical: 'top' }}
          />
          <PrimaryButton label={t('exposure.save')} onPress={saveSession} disabled={before === null || after === null} />

          {history.length > 0 && (
            <View style={{ gap: 8, marginTop: 4 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{t('exposure.history')}</Text>
              {history.map((h) => (
                <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>{h.date.split('-').reverse().join('/')}</Text>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>{h.before} → {h.after}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Escadas prontas (modelos por subtipo).
  if (showTemplates) {
    return (
      <ScrollView contentContainerStyle={{ gap: spacing.md }}>
        <Pressable onPress={() => { setShowTemplates(false); setOpenTpl(null); }} hitSlop={8}>
          <Text style={{ color: colors.textMuted }}>‹ {t('common.back')}</Text>
        </Pressable>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{tr2(lang, 'Escadas prontas', 'Ready-made ladders')}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>
          {lang === 'pt'
            ? 'Escolhe um modelo do teu medo. Os degraus são acrescentados à tua escada — podes editá-los, removê-los e reordená-los.'
            : 'Pick a template for your fear. The steps are added to your ladder — you can edit, remove and reorder them.'}
        </Text>
        {templates.map((tpl) => {
          const label = SUBTYPE_OPTIONS.find((o) => o.id === tpl.subtypeId)?.label[lang] ?? tpl.subtypeId;
          const mine = subtypeIds.includes(tpl.subtypeId);
          const open = openTpl === tpl.subtypeId;
          return (
            <View key={tpl.subtypeId} style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: mine ? colors.primary : colors.border, overflow: 'hidden' }}>
              <Pressable onPress={() => setOpenTpl(open ? null : tpl.subtypeId)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.lg }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{label}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{tpl.steps.length} {tr2(lang, 'degraus', 'steps')}{mine ? (tr2(lang, ' · o teu medo', ' · your fear')) : ''}</Text>
                </View>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </Pressable>
              {open && (
                <View style={{ padding: spacing.lg, paddingTop: 0, gap: 8 }}>
                  {tpl.steps.map((s: L, i: number) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
                      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{i + 1}.</Text>
                      <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{s[lang]}</Text>
                    </View>
                  ))}
                  <PrimaryButton label={tr2(lang, 'Adicionar estes degraus', 'Add these steps')} onPress={() => importSteps(tpl.steps)} />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  }

  // Lista da escada (visual limpo).
  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md }}>
      {/* Contador compacto */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg }}>
        <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.primary, fontSize: 22, fontWeight: '800' }}>{streak}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{t('exposure.streakTitle')}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t('exposure.streakHint')}</Text>
        </View>
        <Pressable
          onPress={toggleToday}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={markedToday ? (tr2(lang, 'Registado hoje, toca para anular', 'Logged today, tap to undo')) : (tr2(lang, 'Registar sessão de hoje', "Log today's session"))}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: markedToday ? colors.successSoft : colors.primary, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999 }}
        >
          <Ionicons name={markedToday ? 'checkmark' : 'add'} size={16} color={markedToday ? colors.success : '#fff'} />
          <Text style={{ color: markedToday ? colors.success : '#fff', fontWeight: '700', fontSize: 13 }}>
            {markedToday ? (tr2(lang, 'Registado hoje', 'Logged today')) : (tr2(lang, 'Registar hoje', 'Log today'))}
          </Text>
        </Pressable>
      </View>


      {/* Referência recolhível (fechada por defeito) */}
      <Collapsible title={t('exposure.phasesTitle')} icon="list-outline">
        {EXPOSURE_PHASES.map((ph, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12 }}>{i + 1}</Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{ph[lang]}</Text>
          </View>
        ))}
      </Collapsible>

      <Collapsible title={t('exposure.phrasesTitle')} icon="chatbox-ellipses-outline">
        {EXPOSURE_PHRASE_GROUPS.map((g, gi) => {
          const open = openPhrase === gi;
          return (
            <View key={gi} style={{ gap: 6 }}>
              <Pressable onPress={() => setOpenPhrase(open ? null : gi)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}>
                <Ionicons name={open ? 'remove' : 'add'} size={16} color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 }}>{g.title[lang]}</Text>
              </Pressable>
              {open && g.phrases.map((ph, pi) => (
                <View key={pi} style={{ backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 10, marginLeft: 8 }}>
                  <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>“{ph[lang]}”</Text>
                </View>
              ))}
            </View>
          );
        })}
      </Collapsible>

      <Collapsible title={t('exposure.reminderTitle')} icon="alert-circle-outline" danger>
        {EXPOSURE_REMINDERS.map((r, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={{ color: colors.danger }}>•</Text>
            <Text style={{ color: colors.text, fontSize: 13, lineHeight: 19, flex: 1 }}>{r[lang]}</Text>
          </View>
        ))}
      </Collapsible>

      {/* A escada — cabeçalho + botão de reordenar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{t('exposure.ladderTitle')}</Text>
        {steps.length > 1 && (
          <Pressable onPress={() => setReordering((r) => !r)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name={reordering ? 'checkmark' : 'swap-vertical'} size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{reordering ? t('common.done') : t('exposure.reorder')}</Text>
          </Pressable>
        )}
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: -4 }}>{t('exposure.guide')}</Text>

      {/* Escada pronta (modelos por subtipo) */}
      <Pressable onPress={() => setShowTemplates(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.md }}>
        <Ionicons name="library-outline" size={20} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{tr2(lang, 'Usar uma escada pronta', 'Use a ready-made ladder')}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{tr2(lang, 'Degraus sugeridos para o teu medo', 'Suggested steps for your fear')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.primary} />
      </Pressable>

      {/* Adicionar degrau — no topo (não no fundo) */}
      {adding ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput value={newStep} onChangeText={setNewStep} onSubmitEditing={addStep} autoFocus placeholder={t('exposure.addStep')} placeholderTextColor={colors.textMuted} style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15 }} />
          <Pressable onPress={addStep} style={{ paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('common.add')}</Text>
          </Pressable>
        </View>
      ) : (
        !reordering && (
          <Pressable onPress={() => setAdding(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.primarySoft, paddingHorizontal: 14, height: 38, borderRadius: 999 }}>
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{t('exposure.addStep')}</Text>
          </Pressable>
        )
      )}

      {/* Degraus leves e numerados, num único cartão */}
      <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
        {steps.map((s, i) => (
          <View
            key={s.id}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: spacing.lg, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}
          >
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>
            </View>
            {reordering ? (
              <>
                <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{s.label}</Text>
                <Pressable onPress={() => move(i, -1)} hitSlop={6} disabled={i === 0} accessibilityRole="button" accessibilityLabel={tr2(lang, 'Mover para cima', 'Move up')} style={{ padding: 4, opacity: i === 0 ? 0.3 : 1 }}>
                  <Ionicons name="chevron-up" size={20} color={colors.primary} />
                </Pressable>
                <Pressable onPress={() => move(i, 1)} hitSlop={6} disabled={i === steps.length - 1} accessibilityRole="button" accessibilityLabel={tr2(lang, 'Mover para baixo', 'Move down')} style={{ padding: 4, opacity: i === steps.length - 1 ? 0.3 : 1 }}>
                  <Ionicons name="chevron-down" size={20} color={colors.primary} />
                </Pressable>
                <Pressable onPress={() => removeStep(s)} hitSlop={6} accessibilityRole="button" accessibilityLabel={tr2(lang, `Remover ${s.label}`, `Remove ${s.label}`)} style={{ padding: 4, marginLeft: 2 }}>
                  <Ionicons name="trash-outline" size={19} color={colors.danger} />
                </Pressable>
              </>
            ) : (
              <Pressable onPress={() => openStep(s)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{s.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <Text style={{ color: colors.danger, fontSize: 12, textAlign: 'center' }}>{t('exposure.safety')}</Text>
    </ScrollView>
  );
}

// ---- Reestruturação cognitiva (desconstruir pensamentos) ----
// Lista de "armadilhas" (distorções) frequentes na emetofobia. O id é o texto PT
// (estável); mostra-se no idioma atual.
const THOUGHT_TRAPS: L[] = [
  { pt: 'Catastrofizar (saltar para o pior)', en: 'Catastrophising (jumping to the worst)' },
  { pt: 'Sobrestimar a probabilidade', en: 'Overestimating the odds' },
  { pt: 'Confundir sentir com acontecer', en: 'Confusing feeling with happening' },
  { pt: 'Hipervigilância aos sintomas', en: 'Hyper-focus on symptoms' },
  { pt: 'Raciocínio emocional', en: 'Emotional reasoning' },
  { pt: 'Pensamento tudo-ou-nada', en: 'All-or-nothing thinking' },
  { pt: 'Preciso de ter a certeza', en: 'Needing to be certain' },
];

export function ThoughtView() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const [records, setRecords] = useState<ThoughtRecord[]>([]);
  const [situation, setSituation] = useState('');
  const [thought, setThought] = useState('');
  const [before, setBefore] = useState<number | null>(null);
  const [traps, setTraps] = useState<string[]>([]);
  const [evidenceFor, setEvidenceFor] = useState('');
  const [evidenceAgainst, setEvidenceAgainst] = useState('');
  const [balanced, setBalanced] = useState('');
  const [after, setAfter] = useState<number | null>(null);

  useEffect(() => {
    loadThoughtRecords().then(setRecords);
  }, []);

  function toggleTrap(id: string) {
    setTraps((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function save() {
    if (!thought.trim()) return;
    const now = new Date();
    const entry: ThoughtRecord = {
      id: 'tr' + now.getTime(), date: ymd(now), ts: now.toISOString(),
      situation: situation.trim(), thought: thought.trim(), before: before ?? 0,
      traps: [...traps],
      evidenceFor: evidenceFor.trim(), evidenceAgainst: evidenceAgainst.trim(), balanced: balanced.trim(), after: after ?? 0,
    };
    const next = [entry, ...records];
    setRecords(next);
    saveThoughtRecords(next);
    setSituation(''); setThought(''); setBefore(null); setTraps([]);
    setEvidenceFor(''); setEvidenceAgainst(''); setBalanced(''); setAfter(null);
  }

  const field = (label: string, value: string, setValue: (v: string) => void, ph?: string) => (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{label}</Text>
      <TextInput value={value} onChangeText={setValue} multiline placeholder={ph} placeholderTextColor={colors.textMuted}
        style={{ minHeight: 48, padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15, textAlignVertical: 'top' }} />
    </View>
  );

  const trapLabel = (id: string) => THOUGHT_TRAPS.find((x) => x.pt === id)?.[lang] ?? id;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ gap: spacing.md }}>
        <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
          {L('O medo costuma mentir: exagera o perigo e a probabilidade. Aqui pões o pensamento à prova, passo a passo — nomeias a armadilha, pesas as provas e escreves uma versão mais realista.',
             'Fear tends to lie: it exaggerates danger and likelihood. Here you put the thought on trial, step by step — name the trap, weigh the evidence, and write a more realistic version.')}
        </Text>

        <Card style={{ gap: spacing.md }}>
          {field(t('thought.situation'), situation, setSituation, L('O que estava a acontecer? (gatilho)', 'What was happening? (trigger)'))}
          {field(t('thought.thought'), thought, setThought, L('O que o medo disse que ia acontecer?', 'What did the fear say would happen?'))}

          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{t('thought.before')}</Text>
            <Suds value={before} onChange={setBefore} />
          </View>

          {/* Armadilha(s) do pensamento */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>
              {L('Que armadilha é esta? (podes escolher várias)', 'Which trap is this? (pick any)')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {THOUGHT_TRAPS.map((tr) => {
                const active = traps.includes(tr.pt);
                return (
                  <Pressable key={tr.pt} onPress={() => toggleTrap(tr.pt)}
                    style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 2, borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primarySoft : colors.cardAlt }}>
                    <Text style={{ color: active ? colors.primary : colors.text, fontSize: 13, fontWeight: active ? '700' : '500' }}>{tr[lang]}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {field(t('thought.evidenceFor'), evidenceFor, setEvidenceFor, L('Que factos apoiam mesmo este pensamento?', 'What facts actually support this thought?'))}
          {field(t('thought.evidenceAgainst'), evidenceAgainst, setEvidenceAgainst, L('Quantas vezes já temi isto e não aconteceu? Qual é a probabilidade real?', "How often have I feared this and it didn't happen? What are the real odds?"))}
          {field(t('thought.balanced'), balanced, setBalanced, L('Uma forma mais justa e realista de ver isto…', 'A fairer, more realistic way to see this…'))}

          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{t('thought.after')}</Text>
            <Suds value={after} onChange={setAfter} />
          </View>
          <PrimaryButton label={t('thought.save')} onPress={save} disabled={!thought.trim()} />
        </Card>

        {records.map((r) => (
          <Card key={r.id} style={{ gap: 6 }}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{r.date.split('-').reverse().join('/')} · {r.before} → {r.after}</Text>
            <Text style={{ color: colors.text, fontSize: 15 }}>{r.balanced || r.thought}</Text>
            {!!(r.traps && r.traps.length) && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                {r.traps.map((id) => (
                  <View key={id} style={{ paddingVertical: 3, paddingHorizontal: 8, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border }}>
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>{trapLabel(id)}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ---- Experiências comportamentais (prever vs resultado) ----
export function ExperimentsView() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (o: L) => o[lang];

  const [entries, setEntries] = useState<ExperimentEntry[]>([]);
  const [experiment, setExperiment] = useState('');
  const [prediction, setPrediction] = useState('');
  const [belief, setBelief] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState('');
  const [learned, setLearned] = useState('');

  useEffect(() => {
    loadExperiments().then(setEntries);
  }, []);

  function persist(next: ExperimentEntry[]) {
    setEntries(next);
    saveExperiments(next);
  }

  function savePlan() {
    if (!experiment.trim() || !prediction.trim() || belief === null) return;
    const now = new Date();
    const entry: ExperimentEntry = {
      id: 'x' + now.getTime(), date: ymd(now), ts: now.toISOString(),
      experiment: experiment.trim(), prediction: prediction.trim(), belief,
      outcome: '', learned: '', done: false,
    };
    persist([entry, ...entries]);
    setExperiment(''); setPrediction(''); setBelief(null);
  }

  function startResult(id: string) {
    setEditingId(id); setOutcome(''); setLearned('');
  }
  function finishResult(id: string) {
    if (!outcome.trim()) return;
    persist(entries.map((e) => e.id === id ? { ...e, outcome: outcome.trim(), learned: learned.trim(), done: true } : e));
    setEditingId(null); setOutcome(''); setLearned('');
  }

  const field = (label: string, value: string, setValue: (v: string) => void, ph?: string) => (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{label}</Text>
      <TextInput value={value} onChangeText={setValue} multiline placeholder={ph} placeholderTextColor={colors.textMuted}
        style={{ minHeight: 48, padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15, textAlignVertical: 'top' }} />
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ gap: spacing.md }}>
        <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
          {tt({
            pt: 'Uma experiência comportamental é como um mini-teste à fobia: antes de fazeres algo que evitas, escreves o que achas que vai acontecer. Depois comparas com o que aconteceu mesmo. Quase sempre a catástrofe prevista não acontece — e é esse contraste que reescreve o medo.',
            en: 'A behavioural experiment is a mini-test of the phobia: before doing something you avoid, you write down what you think will happen. Then you compare it with what actually happened. Almost always the predicted catastrophe does not happen — and that contrast is what rewrites the fear.',
          })}
        </Text>

        <Card style={{ gap: spacing.md }}>
          {field(tt({ pt: 'A experiência (o que vais fazer / largar)', en: 'The experiment (what you will do / drop)' }), experiment, setExperiment, tt({ pt: 'Ex.: comer sem verificar a validade', en: 'E.g. eat without checking the expiry date' }))}
          {field(tt({ pt: 'O que prevejo que vai acontecer', en: 'What I predict will happen' }), prediction, setPrediction, tt({ pt: 'Ex.: vou passar mal e não aguento', en: 'E.g. I will get sick and can\'t cope' }))}
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{tt({ pt: 'Quanto acredito nisso? (0–10)', en: 'How much do I believe it? (0–10)' })}</Text>
            <Suds value={belief} onChange={setBelief} />
          </View>
          <PrimaryButton label={tt({ pt: 'Guardar previsão', en: 'Save prediction' })} onPress={savePlan} disabled={!experiment.trim() || !prediction.trim() || belief === null} />
        </Card>

        {entries.map((e) => (
          <Card key={e.id} style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name={e.done ? 'checkmark-circle' : 'flask-outline'} size={16} color={e.done ? colors.success : colors.primary} />
              <Text style={{ color: colors.textMuted, fontSize: 12, flex: 1 }}>{e.date.split('-').reverse().join('/')}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{tt({ pt: 'previa', en: 'predicted' })} {e.belief}/10</Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{e.experiment}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>{tt({ pt: 'Previsão: ', en: 'Prediction: ' })}{e.prediction}</Text>

            {e.done ? (
              <>
                <Text style={{ color: colors.text, fontSize: 14 }}><Text style={{ fontWeight: '700' }}>{tt({ pt: 'Aconteceu: ', en: 'Happened: ' })}</Text>{e.outcome}</Text>
                {!!e.learned && <Text style={{ color: colors.text, fontSize: 14 }}><Text style={{ fontWeight: '700' }}>{tt({ pt: 'Aprendi: ', en: 'Learned: ' })}</Text>{e.learned}</Text>}
              </>
            ) : editingId === e.id ? (
              <View style={{ gap: spacing.sm, marginTop: 4 }}>
                {field(tt({ pt: 'O que aconteceu mesmo', en: 'What actually happened' }), outcome, setOutcome)}
                {field(tt({ pt: 'O que aprendi', en: 'What I learned' }), learned, setLearned)}
                <PrimaryButton label={tt({ pt: 'Concluir', en: 'Complete' })} onPress={() => finishResult(e.id)} disabled={!outcome.trim()} />
              </View>
            ) : (
              <Pressable onPress={() => startResult(e.id)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, marginTop: 4 }}>
                <Ionicons name="create-outline" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>{tt({ pt: 'Registar resultado', en: 'Record the result' })}</Text>
              </Pressable>
            )}
          </Card>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Barra para registar sessões de um exercício (permite mais do que uma por dia).
export function ExerciseLogBar({ type }: { type: string }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const Lx = (pt: string, en: string) => tr2(lang, pt, en);
  const [log, setLog] = useState<ExerciseLogEntry[]>([]);
  useEffect(() => { loadExerciseLog().then(setLog); }, []);
  const today = ymd(new Date());
  const todayCount = log.filter((e) => e.type === type && e.date === today).length;
  async function add() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setLog(await appendExerciseLog(type));
  }
  async function undo() { setLog(await removeLastExerciseLog(type)); }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Pressable onPress={add} accessibilityRole="button" accessibilityLabel={Lx('Guardar registo', 'Save entry')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 11, paddingHorizontal: 16 }}>
        <Ionicons name="checkmark" size={16} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{Lx('Guardar registo', 'Save entry')}</Text>
      </Pressable>
      {todayCount > 0 && (
        <>
          <Text style={{ color: colors.success, fontSize: 13, fontWeight: '600' }}>{Lx(`✓ feito ${todayCount}× hoje`, `✓ done ${todayCount}× today`)}</Text>
          <Pressable onPress={undo} hitSlop={6} accessibilityRole="button" accessibilityLabel={Lx('Anular último registo', 'Undo last log')} style={{ marginLeft: 'auto' }}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{Lx('anular', 'undo')}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

// Categoria colapsável no hub de exercícios (estilo "Lições").
function HubGroup({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <View style={{ gap: spacing.sm }}>
      <Pressable onPress={() => setOpen((o) => !o)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, marginTop: 4 }}>
        <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 }}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>
      {open && <View style={{ gap: spacing.md }}>{children}</View>}
    </View>
  );
}

// Cartão de um exercício no hub.
function HubRow({ icon, title, desc, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

export default function ExercisesScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const router = useRouter();
  // Cada exercício abre numa rota própria (/exercise?type=…), para o deslizar do
  // iOS voltar a este hub e deste para os Recursos (hierarquia correta).
  const open = (type: string) => () => router.push({ pathname: '/exercise', params: { type } } as any);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('resources.exercises')} onBack={onBack} />
      <View style={{ flex: 1, padding: spacing.xl }}>
        <ScrollView contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xxl }}>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('exercises.intro')}</Text>

          <HubGroup title={L('Enfrentar o medo', 'Facing the fear')} defaultOpen>
            <HubRow icon="trending-up-outline" title={t('exercises.exposure')} desc={t('exercises.exposureDesc')} onPress={open('exposure')} />
            <HubRow icon="text-outline" title={t('games.words')} desc={t('games.wordsDesc')} onPress={open('words')} />
            <HubRow icon="shuffle-outline" title={t('exercises.challenges')} desc={t('exercises.challengesDesc')} onPress={open('challenges')} />
          </HubGroup>

          <HubGroup title={L('Trabalhar o pensamento', 'Working with thoughts')}>
            <HubRow icon="bulb-outline" title={t('exercises.thought')} desc={t('exercises.thoughtDesc')} onPress={open('thought')} />
            <HubRow icon="flask-outline" title={L('Experiências', 'Experiments')} desc={L('Prever vs o que acontece mesmo', 'Predict vs what actually happens')} onPress={open('experiments')} />
            <HubRow icon="help-circle-outline" title={t('games.myth')} desc={t('games.mythDesc')} onPress={open('myth')} />
          </HubGroup>

          <HubGroup title={L('Aceitação e memória', 'Acceptance & memory')}>
            <HubRow icon="leaf-outline" title={L('Aceitação e valores', 'Acceptance & values')} desc={L('Princípios, valores e compromissos de aproximação', 'Principles, values and approach commitments')} onPress={open('acceptance')} />
            <HubRow icon="sparkles-outline" title={t('exercises.memory')} desc={t('exercises.memoryDesc')} onPress={open('memory')} />
          </HubGroup>
        </ScrollView>
      </View>
    </View>
  );
}
