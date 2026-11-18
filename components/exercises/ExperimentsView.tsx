// Experiências comportamentais: prever, testar e aprender — com o mesmo
// visual da Exposição (passos 1 Previsão → 2 Fazer → 3 Resultado, medidor de
// probabilidade e cartão "Previsão vs. realidade").
// Ao contrário da exposição, o resultado é registado mais tarde: a experiência
// fica em "Por fazer" até a pessoa voltar.

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { exposureText } from '../../data/exposureText';
import { practiceText } from '../../data/practiceText';
import { pick, useLang } from '../../i18n/i18n';
import { ExperimentEntry, loadExperiments, saveExperiments } from '../../storage/storage';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/theme';
import { Card, CardHeader, PrimaryButton } from '../ui';
import { L, ProbMeter, Stepper, ymd } from './shared';

type Happened = 'yes' | 'partly' | 'no';
// Experiências antigas guardavam a crença em 0–10.
const probOf = (e: ExperimentEntry) => (typeof e.prob === 'number' ? e.prob : e.belief * 10);

export function ExperimentsView() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (o: L) => pick(o, lang);
  const x = exposureText(lang);
  const px = practiceText(lang);

  const [entries, setEntries] = useState<ExperimentEntry[]>([]);
  // Nova experiência
  const [creating, setCreating] = useState(true);
  const [experiment, setExperiment] = useState('');
  const [prediction, setPrediction] = useState('');
  const [prob, setProb] = useState<number | null>(null);
  const [justSaved, setJustSaved] = useState<ExperimentEntry | null>(null);
  // Registar resultado
  const [resultId, setResultId] = useState<string | null>(null);
  const [happened, setHappened] = useState<Happened | null>(null);
  const [probAfter, setProbAfter] = useState<number | null>(null);
  const [outcome, setOutcome] = useState('');
  const [learned, setLearned] = useState('');
  const [finished, setFinished] = useState<ExperimentEntry | null>(null);

  useEffect(() => {
    loadExperiments().then((l) => setEntries(Array.isArray(l) ? l : []));
  }, []);

  function persist(next: ExperimentEntry[]) {
    setEntries(next);
    saveExperiments(next);
  }

  function savePlan() {
    if (!experiment.trim() || !prediction.trim() || prob === null) return;
    const now = new Date();
    const entry: ExperimentEntry = {
      id: 'x' + now.getTime(), date: ymd(now), ts: now.toISOString(),
      experiment: experiment.trim(), prediction: prediction.trim(), belief: Math.round(prob / 10), prob,
      outcome: '', learned: '', done: false,
    };
    persist([entry, ...entries]);
    setExperiment(''); setPrediction(''); setProb(null);
    setJustSaved(entry);
    setCreating(false);
  }

  function openResult(id: string) {
    setResultId(id); setHappened(null); setProbAfter(null); setOutcome(''); setLearned(''); setFinished(null); setJustSaved(null);
  }
  function finishResult() {
    if (!resultId || !outcome.trim()) return;
    let done: ExperimentEntry | null = null;
    const next = entries.map((e) => {
      if (e.id !== resultId) return e;
      done = { ...e, outcome: outcome.trim(), learned: learned.trim(), done: true, happened: happened ?? undefined, probAfter: probAfter ?? undefined };
      return done;
    });
    persist(next);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setFinished(done);
    setResultId(null);
  }

  const input = { minHeight: 56, padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 15, textAlignVertical: 'top' as const };
  const label = (s: string) => <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>{s}</Text>;
  const happenedLabel = (h: Happened) => (h === 'yes' ? x.yes : h === 'partly' ? x.partly : x.no);
  const pending = entries.filter((e) => !e.done);
  const doneList = entries.filter((e) => e.done);
  const current = resultId ? entries.find((e) => e.id === resultId) : null;

  // Cartão "Previsão vs. realidade" (igual ao da exposição).
  const resultCard = (e: ExperimentEntry) => (
    <Card style={{ gap: spacing.md }}>
      <CardHeader icon="analytics-outline" title={x.resultTitle} />
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{e.experiment}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 14, fontStyle: 'italic' }}>“{e.prediction}”</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{x.predicted}</Text>
          <Text style={{ color: colors.text, fontSize: 30, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{probOf(e)}%</Text>
        </View>
        {typeof e.probAfter === 'number' && (
          <>
            <Ionicons name="arrow-forward" size={22} color={colors.textMuted} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{x.nowProb}</Text>
              <Text style={{ color: e.probAfter < probOf(e) ? colors.success : colors.text, fontSize: 30, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{e.probAfter}%</Text>
            </View>
          </>
        )}
      </View>
      {e.happened && (
        <View style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: e.happened === 'no' ? colors.successSoft : colors.cardAlt }}>
          <Text style={{ color: e.happened === 'no' ? colors.success : colors.text, fontSize: 13, fontWeight: '600' }}>{x.happened} {happenedLabel(e.happened)}</Text>
        </View>
      )}
      {e.outcome ? <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>{e.outcome}</Text> : null}
      {e.learned ? (
        <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, gap: 2 }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{x.learned}</Text>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 21 }}>{e.learned}</Text>
        </View>
      ) : null}
    </Card>
  );

  // --- Registar o resultado de uma experiência (passo 3) ---
  if (current) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => setResultId(null)} hitSlop={8}>
            <Text style={{ color: colors.textMuted }}>‹ {px.prev}</Text>
          </Pressable>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{current.experiment}</Text>
          <Stepper labels={[px.x_s1, px.x_s2, px.x_s3]} current={2} />
          <Card style={{ gap: spacing.md }}>
            <CardHeader icon="flask-outline" title={x.happenedQ} />
            <Text style={{ color: colors.textMuted, fontSize: 14, fontStyle: 'italic' }}>“{current.prediction}” · {probOf(current)}%</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {(['no', 'partly', 'yes'] as Happened[]).map((h) => {
                const on = happened === h;
                return (
                  <Pressable key={h} onPress={() => setHappened(on ? null : h)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: radius.md, borderWidth: 2, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primary : 'transparent' }}>
                    <Text style={{ color: on ? '#fff' : colors.text, fontWeight: '700', fontSize: 15 }}>{happenedLabel(h)}</Text>
                  </Pressable>
                );
              })}
            </View>
            {label(x.probAfterQ)}
            <ProbMeter value={probAfter} onChange={setProbAfter} />
            {label(px.x_what)}
            <TextInput value={outcome} onChangeText={setOutcome} multiline placeholder="…" placeholderTextColor={colors.textMuted} style={input} />
            {label(x.learnedQ)}
            <TextInput value={learned} onChangeText={setLearned} multiline placeholder={x.learnedPh} placeholderTextColor={colors.textMuted} style={input} />
          </Card>
          <PrimaryButton label={px.x_complete} onPress={finishResult} disabled={!outcome.trim()} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
          {tt({
            pt: 'Uma experiência comportamental é como um mini-teste à fobia: antes de fazeres algo que evitas, escreves o que achas que vai acontecer. Depois comparas com o que aconteceu mesmo. Quase sempre a catástrofe prevista não acontece — e é esse contraste que reescreve o medo.',
            en: 'A behavioural experiment is a mini-test of the phobia: before doing something you avoid, you write down what you think will happen. Then you compare it with what actually happened. Almost always the predicted catastrophe does not happen — and that contrast is what rewrites the fear.',
          })}
        </Text>

        {finished && resultCard(finished)}

        {creating ? (
          <>
            <Stepper labels={[px.x_s1, px.x_s2, px.x_s3]} current={0} />
            <Card style={{ gap: spacing.md }}>
              <CardHeader icon="flask-outline" title={x.predictTitle} />
              {label(tt({ pt: 'A experiência (o que vais fazer / largar)', en: 'The experiment (what you will do / drop)' }))}
              <TextInput value={experiment} onChangeText={setExperiment} multiline placeholder={tt({ pt: 'Ex.: comer sem verificar a validade', en: 'E.g. eat without checking the expiry date' })} placeholderTextColor={colors.textMuted} style={input} />
              {label(tt({ pt: 'O que prevejo que vai acontecer', en: 'What I predict will happen' }))}
              <TextInput value={prediction} onChangeText={setPrediction} multiline placeholder={tt({ pt: 'Ex.: vou passar mal e não aguento', en: 'E.g. I will get sick and can\'t cope' })} placeholderTextColor={colors.textMuted} style={input} />
              {label(x.probQ)}
              <ProbMeter value={prob} onChange={setProb} />
            </Card>
            <PrimaryButton label={px.x_save} onPress={savePlan} disabled={!experiment.trim() || !prediction.trim() || prob === null} />
          </>
        ) : (
          <>
            {justSaved && (
              <>
                <Stepper labels={[px.x_s1, px.x_s2, px.x_s3]} current={1} />
                <Card style={{ gap: 8, borderColor: colors.primary }}>
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{justSaved.experiment}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{px.x_doHint}</Text>
                </Card>
              </>
            )}
            <Pressable onPress={() => { setCreating(true); setJustSaved(null); setFinished(null); }} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.primarySoft, paddingHorizontal: 14, height: 38, borderRadius: 999 }}>
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{px.x_new}</Text>
            </Pressable>
          </>
        )}

        {/* Por fazer */}
        {pending.length > 0 && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.sm }}>
              <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>{px.x_pending}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{pending.length}</Text>
            </View>
            {pending.map((e) => (
              <Card key={e.id} style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="flask-outline" size={16} color={colors.primary} />
                  <Text style={{ color: colors.textMuted, fontSize: 12, flex: 1 }}>{e.date.split('-').reverse().join('/')}</Text>
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{probOf(e)}%</Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{e.experiment}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, fontStyle: 'italic' }}>“{e.prediction}”</Text>
                <PrimaryButton label={px.x_record} onPress={() => openResult(e.id)} />
              </Card>
            ))}
          </>
        )}

        {/* Feitas */}
        {doneList.length > 0 && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.sm }}>
              <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>{px.x_doneList}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{doneList.length}</Text>
            </View>
            {doneList.filter((e) => e.id !== finished?.id).slice(0, 6).map((e) => (
              <Card key={e.id} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={{ color: colors.textMuted, fontSize: 12, flex: 1 }}>{e.date.split('-').reverse().join('/')}</Text>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
                    {probOf(e)}%{typeof e.probAfter === 'number' ? ` → ${e.probAfter}%` : ''}
                  </Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{e.experiment}</Text>
                {e.learned ? <Text style={{ color: colors.text, fontSize: 14 }}><Text style={{ fontWeight: '700' }}>{x.learned}: </Text>{e.learned}</Text> : null}
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
