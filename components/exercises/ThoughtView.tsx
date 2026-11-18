// Registo de pensamentos (reestruturação cognitiva) e armadilhas de pensamento.

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { practiceText } from '../../data/practiceText';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { pick, useLang, tr2 } from '../../i18n/i18n';
import { loadThoughtRecords, saveThoughtRecords, ThoughtRecord } from '../../storage/storage';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/theme';
import { Card, CardHeader, PrimaryButton } from '../ui';
import { L, Stepper, Suds, ymd } from './shared';

export const THOUGHT_TRAPS: L[] = [
  { pt: 'Catastrofizar (saltar para o pior)', en: 'Catastrophising (jumping to the worst)' },
  { pt: 'Sobrestimar a probabilidade', en: 'Overestimating the odds' },
  { pt: 'Confundir sentir com acontecer', en: 'Confusing feeling with happening' },
  { pt: 'Hipervigilância aos sintomas', en: 'Hyper-focus on symptoms' },
  { pt: 'Raciocínio emocional', en: 'Emotional reasoning' },
  { pt: 'Pensamento tudo-ou-nada', en: 'All-or-nothing thinking' },
  { pt: 'Preciso de ter a certeza', en: 'Needing to be certain' },
];

// Em quatro passos: 1 O pensamento → 2 A armadilha → 3 As provas →
// 4 A versão equilibrada; no fim, um cartão com "antes → depois".
export function ThoughtView() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const px = practiceText(lang);
  const [records, setRecords] = useState<ThoughtRecord[]>([]);
  const [step, setStep] = useState(0); // 0..3, 4 = feito
  const [saved, setSaved] = useState<ThoughtRecord | null>(null);
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSaved(entry);
    setStep(4);
  }
  function reset() {
    setSituation(''); setThought(''); setBefore(null); setTraps([]);
    setEvidenceFor(''); setEvidenceAgainst(''); setBalanced(''); setAfter(null);
    setSaved(null); setStep(0);
  }

  const field = (label: string, value: string, setValue: (v: string) => void, ph?: string, big?: boolean) => (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>{label}</Text>
      <TextInput value={value} onChangeText={setValue} multiline placeholder={ph} placeholderTextColor={colors.textMuted}
        style={{ minHeight: big ? 90 : 56, padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 15, textAlignVertical: 'top' }} />
    </View>
  );

  const trapLabel = (id: string) => pick(THOUGHT_TRAPS.find((x) => x.pt === id), lang) || id;
  const canNext = step === 0 ? !!thought.trim() : true;

  const nav = (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      {step > 0 && (
        <Pressable onPress={() => setStep(step - 1)} accessibilityRole="button" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingVertical: 14 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{px.prev}</Text>
        </Pressable>
      )}
      <View style={{ flex: 2 }}>
        {step < 3
          ? <PrimaryButton label={px.next} onPress={() => setStep(step + 1)} disabled={!canNext} />
          : <PrimaryButton label={t('thought.save')} onPress={save} disabled={!thought.trim()} />}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
        <Stepper labels={[px.t_s1, px.t_s2, px.t_s3, px.t_s4]} current={Math.min(step, 3)} done={step === 4} />

        {step === 0 && (
          <Card style={{ gap: spacing.md }}>
            {field(t('thought.situation'), situation, setSituation, L('O que estava a acontecer? (gatilho)', 'What was happening? (trigger)'))}
            {field(t('thought.thought'), thought, setThought, L('O que o medo disse que ia acontecer?', 'What did the fear say would happen?'), true)}
            <View style={{ gap: 6 }}>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>{t('thought.before')}</Text>
              <Suds value={before} onChange={setBefore} />
            </View>
          </Card>
        )}

        {step === 1 && (
          <Card style={{ gap: spacing.md }}>
            {thought.trim() ? <Text style={{ color: colors.textMuted, fontSize: 15, fontStyle: 'italic' }}>“{thought.trim()}”</Text> : null}
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>{px.t_trapQ}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, marginTop: -6 }}>{px.t_trapHint}</Text>
            <View style={{ gap: 8 }}>
              {THOUGHT_TRAPS.map((tr) => {
                const active = traps.includes(tr.pt);
                return (
                  <Pressable key={tr.pt} onPress={() => toggleTrap(tr.pt)} accessibilityRole="checkbox" accessibilityState={{ checked: active }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primarySoft : 'transparent' }}>
                    <Ionicons name={active ? 'checkbox' : 'square-outline'} size={20} color={active ? colors.primary : colors.textMuted} />
                    <Text style={{ color: active ? colors.primary : colors.text, fontSize: 15, fontWeight: active ? '700' : '500', flex: 1 }}>{pick(tr, lang)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        )}

        {step === 2 && (
          <Card style={{ gap: spacing.md }}>
            {thought.trim() ? <Text style={{ color: colors.textMuted, fontSize: 15, fontStyle: 'italic' }}>“{thought.trim()}”</Text> : null}
            {field(t('thought.evidenceFor'), evidenceFor, setEvidenceFor, L('Que factos apoiam mesmo este pensamento?', 'What facts actually support this thought?'), true)}
            {field(t('thought.evidenceAgainst'), evidenceAgainst, setEvidenceAgainst, L('Quantas vezes já temi isto e não aconteceu? Qual é a probabilidade real?', "How often have I feared this and it didn't happen? What are the real odds?"), true)}
          </Card>
        )}

        {step === 3 && (
          <Card style={{ gap: spacing.md }}>
            {field(t('thought.balanced'), balanced, setBalanced, L('Uma forma mais justa e realista de ver isto…', 'A fairer, more realistic way to see this…'), true)}
            <View style={{ gap: 6 }}>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>{t('thought.after')}</Text>
              <Suds value={after} onChange={setAfter} />
            </View>
          </Card>
        )}

        {step < 4 && nav}

        {step === 4 && saved && (
          <>
            <Card style={{ gap: spacing.md }}>
              <CardHeader icon="bulb-outline" title={px.t_doneTitle} />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{px.anxiety} · {px.start}</Text>
                  <Text style={{ color: colors.text, fontSize: 30, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{saved.before}</Text>
                </View>
                <Ionicons name="arrow-forward" size={22} color={colors.textMuted} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{px.anxiety} · {px.end}</Text>
                  <Text style={{ color: saved.after < saved.before ? colors.success : colors.text, fontSize: 30, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{saved.after}</Text>
                </View>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 14, fontStyle: 'italic', textDecorationLine: 'line-through' }}>“{saved.thought}”</Text>
              {saved.balanced ? (
                <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, gap: 2 }}>
                  <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{px.balanced}</Text>
                  <Text style={{ color: colors.text, fontSize: 16, lineHeight: 22 }}>{saved.balanced}</Text>
                </View>
              ) : null}
              {!!saved.traps?.length && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {saved.traps.map((id) => (
                    <View key={id} style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.cardAlt }}>
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>{trapLabel(id)}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>{px.t_doneBody}</Text>
            </Card>
            <PrimaryButton label={px.newRecord} onPress={reset} />
          </>
        )}

        {step === 0 && records.length > 0 && (
          <>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: spacing.sm }}>{px.past}</Text>
            {records.slice(0, 5).map((r) => (
              <Card key={r.id} style={{ gap: 6 }}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{r.date.split('-').reverse().join('/')} · {r.before} → {r.after}</Text>
                <Text style={{ color: colors.text, fontSize: 15 }}>{r.balanced || r.thought}</Text>
                {!!(r.traps && r.traps.length) && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                    {r.traps.map((id) => (
                      <View key={id} style={{ paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999, backgroundColor: colors.cardAlt }}>
                        <Text style={{ color: colors.textMuted, fontSize: 11 }}>{trapLabel(id)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ---- Experiências comportamentais (prever vs resultado) ----
