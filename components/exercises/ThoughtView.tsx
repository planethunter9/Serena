// Registo de pensamentos (reestruturação cognitiva) e armadilhas de pensamento.

import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { pick, useLang, tr2 } from '../../i18n/i18n';
import { loadThoughtRecords, saveThoughtRecords, ThoughtRecord } from '../../storage/storage';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/theme';
import { Card, PrimaryButton } from '../ui';
import { L, Suds, ymd } from './shared';

export const THOUGHT_TRAPS: L[] = [
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

  const trapLabel = (id: string) => pick(THOUGHT_TRAPS.find((x) => x.pt === id), lang) || id;

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
                    <Text style={{ color: active ? colors.primary : colors.text, fontSize: 13, fontWeight: active ? '700' : '500' }}>{pick(tr, lang)}</Text>
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
