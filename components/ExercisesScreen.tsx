// Exercícios: exposição gradual (escada + SUDS) e reestruturação cognitiva.
// Baseado em técnicas usadas por profissionais (CBT/ERP).

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { EXPOSURE_LADDER } from '../data/exercises';
import { useLang } from '../i18n/i18n';
import {
  ExposureSession,
  loadExposureDays,
  loadExposureHidden,
  loadExposureOrder,
  loadExposureSessions,
  loadExposureSteps,
  loadThoughtRecords,
  ProfileItem,
  saveExposureDays,
  saveExposureHidden,
  saveExposureOrder,
  saveExposureSessions,
  saveExposureSteps,
  saveThoughtRecords,
  ThoughtRecord,
} from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import MemoryView from './MemoryReprocessing';
import SensationsGuide from './SensationsGuide';
import { Card, PrimaryButton, TopBackBar } from './ui';

type L = { pt: string; en: string };
type Step = { id: string; label: string };

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
    title: { pt: 'Para repetir durante os vídeos', en: 'To repeat during the videos' },
    phrases: [
      { pt: 'Isto não é nada de grave.', en: 'This is nothing serious.' },
      { pt: 'É normal.', en: 'It is normal.' },
      { pt: 'Eu estou bem.', en: 'I am okay.' },
      { pt: 'Isto acontece e passa.', en: 'This happens and it passes.' },
      { pt: 'Estou em segurança.', en: 'I am safe.' },
      { pt: 'É só uma imagem — não me pode fazer mal.', en: 'It is just an image — it cannot harm me.' },
    ],
  },
];

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
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
function ExposureView({ selected, setSelected }: { selected: Step | null; setSelected: (s: Step | null) => void }) {
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
  }, []);

  const todayStr = ymd(new Date());
  const markedToday = expDays.includes(todayStr);
  const streak = consecutiveDays(expDays);

  function toggleToday() {
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
      date: now.toISOString().slice(0, 10), ts: now.toISOString(),
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
        <Pressable onPress={toggleToday} hitSlop={8} style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={markedToday ? 'checkmark-circle' : 'add-circle-outline'} size={34} color={markedToday ? colors.success : colors.primary} />
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
                <Pressable onPress={() => move(i, -1)} hitSlop={6} disabled={i === 0} style={{ padding: 4, opacity: i === 0 ? 0.3 : 1 }}>
                  <Ionicons name="chevron-up" size={20} color={colors.primary} />
                </Pressable>
                <Pressable onPress={() => move(i, 1)} hitSlop={6} disabled={i === steps.length - 1} style={{ padding: 4, opacity: i === steps.length - 1 ? 0.3 : 1 }}>
                  <Ionicons name="chevron-down" size={20} color={colors.primary} />
                </Pressable>
                <Pressable onPress={() => removeStep(s)} hitSlop={6} style={{ padding: 4, marginLeft: 2 }}>
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

      {/* Adicionar degrau (escondido atrás de um botão) */}
      {adding ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput value={newStep} onChangeText={setNewStep} onSubmitEditing={addStep} autoFocus placeholder={t('exposure.addStep')} placeholderTextColor={colors.textMuted} style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15 }} />
          <Pressable onPress={addStep} style={{ paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('common.add')}</Text>
          </Pressable>
        </View>
      ) : (
        !reordering && (
          <Pressable onPress={() => setAdding(true)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 }}>
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>{t('exposure.addStep')}</Text>
          </Pressable>
        )
      )}

      <Text style={{ color: colors.danger, fontSize: 12, textAlign: 'center' }}>{t('exposure.safety')}</Text>
    </ScrollView>
  );
}

// ---- Reestruturação cognitiva (registo de pensamento) ----
function ThoughtView() {
  const { colors } = useTheme();
  const { t } = useLang();
  const [records, setRecords] = useState<ThoughtRecord[]>([]);
  const [situation, setSituation] = useState('');
  const [thought, setThought] = useState('');
  const [before, setBefore] = useState<number | null>(null);
  const [evidenceFor, setEvidenceFor] = useState('');
  const [evidenceAgainst, setEvidenceAgainst] = useState('');
  const [balanced, setBalanced] = useState('');
  const [after, setAfter] = useState<number | null>(null);

  useEffect(() => {
    loadThoughtRecords().then(setRecords);
  }, []);

  function save() {
    if (!thought.trim()) return;
    const now = new Date();
    const entry: ThoughtRecord = {
      id: 'tr' + now.getTime(), date: now.toISOString().slice(0, 10), ts: now.toISOString(),
      situation: situation.trim(), thought: thought.trim(), before: before ?? 0,
      evidenceFor: evidenceFor.trim(), evidenceAgainst: evidenceAgainst.trim(), balanced: balanced.trim(), after: after ?? 0,
    };
    const next = [entry, ...records];
    setRecords(next);
    saveThoughtRecords(next);
    setSituation(''); setThought(''); setBefore(null); setEvidenceFor(''); setEvidenceAgainst(''); setBalanced(''); setAfter(null);
  }

  const field = (label: string, value: string, setValue: (v: string) => void) => (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{label}</Text>
      <TextInput value={value} onChangeText={setValue} multiline placeholderTextColor={colors.textMuted}
        style={{ minHeight: 48, padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15, textAlignVertical: 'top' }} />
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ gap: spacing.md }}>
        <Card style={{ gap: spacing.md }}>
          {field(t('thought.situation'), situation, setSituation)}
          {field(t('thought.thought'), thought, setThought)}
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{t('thought.before')}</Text>
            <Suds value={before} onChange={setBefore} />
          </View>
          {field(t('thought.evidenceFor'), evidenceFor, setEvidenceFor)}
          {field(t('thought.evidenceAgainst'), evidenceAgainst, setEvidenceAgainst)}
          {field(t('thought.balanced'), balanced, setBalanced)}
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{t('thought.after')}</Text>
            <Suds value={after} onChange={setAfter} />
          </View>
          <PrimaryButton label={t('thought.save')} onPress={save} disabled={!thought.trim()} />
        </Card>

        {records.map((r) => (
          <Card key={r.id} style={{ gap: 4 }}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{r.date.split('-').reverse().join('/')} · {r.before} → {r.after}</Text>
            <Text style={{ color: colors.text, fontSize: 15 }}>{r.balanced || r.thought}</Text>
          </Card>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function ExercisesScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t } = useLang();
  const [view, setView] = useState<'hub' | 'exposure' | 'thought' | 'memory' | 'sensations'>('hub');
  const [expSelected, setExpSelected] = useState<Step | null>(null);

  const title = view === 'exposure' ? t('exposure.title') : view === 'thought' ? t('thought.title') : view === 'memory' ? t('memory.title') : view === 'sensations' ? t('sensations.title') : t('resources.exercises');

  // Voltar: de um degrau → escada; de uma vista → hub; do hub → sair.
  function handleBack() {
    if (view === 'exposure' && expSelected) { setExpSelected(null); return; }
    if (view !== 'hub') { setView('hub'); return; }
    onBack();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={title} onBack={handleBack} />
      <View style={{ flex: 1, padding: spacing.xl }}>
        {view === 'hub' && (
          <ScrollView contentContainerStyle={{ gap: spacing.md }}>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('exercises.intro')}</Text>
            <Pressable onPress={() => { setExpSelected(null); setView('exposure'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="trending-up-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{t('exercises.exposure')}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('exercises.exposureDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
            <Pressable onPress={() => setView('thought')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="bulb-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{t('exercises.thought')}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('exercises.thoughtDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
            <Pressable onPress={() => setView('memory')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="sparkles-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{t('exercises.memory')}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('exercises.memoryDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
            <Pressable onPress={() => setView('sensations')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="body-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{t('exercises.sensations')}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('exercises.sensationsDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          </ScrollView>
        )}
        {view === 'exposure' && <ExposureView selected={expSelected} setSelected={setExpSelected} />}
        {view === 'thought' && <ThoughtView />}
        {view === 'memory' && <MemoryView />}
        {view === 'sensations' && <SensationsGuide />}
      </View>
    </View>
  );
}
