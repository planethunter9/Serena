// Exercícios: exposição gradual (escada + SUDS) e reestruturação cognitiva.
// Baseado em técnicas usadas por profissionais (CBT/ERP).

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { EXPOSURE_LADDER } from '../data/exercises';
import { useLang } from '../i18n/i18n';
import {
  ExposureSession,
  loadExposureSessions,
  loadExposureSteps,
  loadThoughtRecords,
  ProfileItem,
  saveExposureSessions,
  saveExposureSteps,
  saveThoughtRecords,
  ThoughtRecord,
} from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, PrimaryButton, TopBackBar } from './ui';

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
function ExposureView() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [custom, setCustom] = useState<ProfileItem[]>([]);
  const [sessions, setSessions] = useState<ExposureSession[]>([]);
  const [newStep, setNewStep] = useState('');
  const [selected, setSelected] = useState<{ id: string; label: string } | null>(null);
  const [before, setBefore] = useState<number | null>(null);
  const [peak, setPeak] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    loadExposureSteps().then(setCustom);
    loadExposureSessions().then(setSessions);
  }, []);

  const steps = [
    ...EXPOSURE_LADDER.map((s) => ({ id: s.id, label: s.label[lang] })),
    ...custom.map((c) => ({ id: c.id, label: c.label })),
  ];

  function addStep() {
    const v = newStep.trim();
    if (!v) return;
    const next = [...custom, { id: 'custom:' + Date.now(), label: v }];
    setCustom(next);
    saveExposureSteps(next);
    setNewStep('');
  }

  function openStep(s: { id: string; label: string }) {
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
                <Card key={h.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>{h.date.split('-').reverse().join('/')}</Text>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>{h.before} → {h.after}</Text>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Lista da escada.
  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md }}>
      <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft, gap: 6 }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{t('exposure.guideTitle')}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>{t('exposure.guide')}</Text>
        <Text style={{ color: colors.danger, fontSize: 13, fontWeight: '600', marginTop: 4 }}>{t('exposure.safety')}</Text>
      </Card>

      {steps.map((s) => (
        <Pressable key={s.id} onPress={() => openStep(s)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{s.label}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      ))}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput value={newStep} onChangeText={setNewStep} onSubmitEditing={addStep} placeholder={t('exposure.addStep')} placeholderTextColor={colors.textMuted} style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15 }} />
        <Pressable onPress={addStep} style={{ paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('common.add')}</Text>
        </Pressable>
      </View>
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
  const [view, setView] = useState<'hub' | 'exposure' | 'thought'>('hub');

  const title = view === 'exposure' ? t('exposure.title') : view === 'thought' ? t('thought.title') : t('resources.exercises');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={title} onBack={() => (view === 'hub' ? onBack() : setView('hub'))} />
      <View style={{ flex: 1, padding: spacing.xl }}>
        {view === 'hub' && (
          <ScrollView contentContainerStyle={{ gap: spacing.md }}>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('exercises.intro')}</Text>
            <Pressable onPress={() => setView('exposure')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
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
          </ScrollView>
        )}
        {view === 'exposure' && <ExposureView />}
        {view === 'thought' && <ThoughtView />}
      </View>
    </View>
  );
}
