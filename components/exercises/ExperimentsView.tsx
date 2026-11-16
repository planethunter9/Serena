// Experiências comportamentais: prever, testar e aprender.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { pick, useLang } from '../../i18n/i18n';
import { ExperimentEntry, loadExperiments, saveExperiments } from '../../storage/storage';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/theme';
import { Card, PrimaryButton } from '../ui';
import { L, Suds, ymd } from './shared';

export function ExperimentsView() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (o: L) => pick(o, lang);

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
