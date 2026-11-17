// Sessão de exposição a um degrau, em três passos (Antes → Durante → Depois),
// segundo o modelo de aprendizagem inibitória: antes, a pessoa escreve o que
// teme e quão provável lhe parece; durante (opcional), um temporizador com uma
// pergunta rápida de desconforto a cada 2 minutos; depois, compara a previsão
// com o que aconteceu e anota o que aprendeu.
// Visual próprio (passos numerados, medidor de probabilidade, cartão
// "Previsão vs. realidade") para não se confundir com a Exposição não planeada.

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import KeepAwake from '../KeepAwake';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CHECKIN_EVERY_SEC, exposureText, PROB_STEPS } from '../../data/exposureText';
import { useLang } from '../../i18n/i18n';
import { ExposureSession } from '../../storage/storage';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/theme';
import { Card, CardHeader, PrimaryButton } from '../ui';
import { Step, Suds, ymd } from './shared';

type Stage = 'before' | 'during' | 'after' | 'done';
type Happened = 'yes' | 'partly' | 'no';

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

// Passos numerados no topo: 1 Antes — 2 Durante — 3 Depois.
function Stepper({ stage, labels }: { stage: Stage; labels: [string, string, string] }) {
  const { colors } = useTheme();
  const cur = stage === 'before' ? 0 : stage === 'during' ? 1 : 2;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      {labels.map((l, i) => {
        const done = i < cur || stage === 'done';
        const on = i === cur && stage !== 'done';
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              <View style={{ flex: 1, height: 2, backgroundColor: i === 0 ? 'transparent' : i <= cur ? colors.primary : colors.border }} />
              <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: done || on ? colors.primary : colors.card, borderWidth: 2, borderColor: done || on ? colors.primary : colors.border }}>
                {done ? <Ionicons name="checkmark" size={16} color="#fff" /> : <Text style={{ color: on ? '#fff' : colors.textMuted, fontSize: 13, fontWeight: '700' }}>{i + 1}</Text>}
              </View>
              <View style={{ flex: 1, height: 2, backgroundColor: i === 2 ? 'transparent' : i < cur ? colors.primary : colors.border }} />
            </View>
            <Text style={{ color: on ? colors.primary : colors.textMuted, fontSize: 12, fontWeight: on ? '700' : '500' }}>{l}</Text>
          </View>
        );
      })}
    </View>
  );
}

// Medidor de probabilidade 0–100%: barra de segmentos tocáveis + número grande.
function ProbMeter({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: value === null ? colors.textMuted : colors.text, fontSize: 32, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
        {value === null ? '–' : `${value}%`}
      </Text>
      <View style={{ flexDirection: 'row', gap: 3, height: 34 }}>
        {PROB_STEPS.map((v) => {
          const filled = value !== null && v <= value;
          return (
            <Pressable
              key={v}
              onPress={() => { Haptics.selectionAsync().catch(() => {}); onChange(v); }}
              accessibilityRole="adjustable"
              accessibilityLabel={`${v}%`}
              accessibilityState={{ selected: value === v }}
              hitSlop={{ top: 8, bottom: 8 }}
              style={{ flex: 1, borderRadius: 4, backgroundColor: filled ? colors.primary : colors.track, opacity: filled ? 0.35 + (0.65 * v) / 100 : 1 }}
            />
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>0%</Text>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>50%</Text>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>100%</Text>
      </View>
    </View>
  );
}

// Pequeno gráfico das respostas de 2 em 2 minutos.
function Curve({ values }: { values: number[] }) {
  const { colors } = useTheme();
  const col = (v: number) => (v <= 3 ? colors.chartLow : v <= 6 ? colors.chartMid : colors.chartHigh);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 70 }}>
      {values.map((v, i) => (
        <View key={i} style={{ flex: 1, maxWidth: 28, alignItems: 'center', gap: 2 }}>
          <Text style={{ color: colors.textMuted, fontSize: 10, fontVariant: ['tabular-nums'] }}>{v}</Text>
          <View style={{ width: '100%', height: Math.max(4, (v / 10) * 50), borderRadius: 4, backgroundColor: col(v) }} />
        </View>
      ))}
    </View>
  );
}

export function ExposureSessionFlow({
  step, history, onSave, onClose,
}: { step: Step; history: ExposureSession[]; onSave: (e: ExposureSession) => void; onClose: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const x = exposureText(lang);

  const [stage, setStage] = useState<Stage>('before');
  const [mode, setMode] = useState<'now' | 'log'>('now');
  const [fear, setFear] = useState('');
  const [prob, setProb] = useState<number | null>(null);
  const [before, setBefore] = useState<number | null>(null);
  const [peak, setPeak] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const [happened, setHappened] = useState<Happened | null>(null);
  const [probAfter, setProbAfter] = useState<number | null>(null);
  const [learned, setLearned] = useState('');
  const [saved, setSaved] = useState<ExposureSession | null>(null);

  // Temporizador (modo "Estou a fazer agora").
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [checkins, setCheckins] = useState<number[]>([]);
  const [answeredSlot, setAnsweredSlot] = useState(0);
  const elapsed = stage === 'during' ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  const slot = Math.floor(elapsed / CHECKIN_EVERY_SEC);
  const askNow = stage === 'during' && slot > answeredSlot;

  useEffect(() => {
    if (stage !== 'during') return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [stage]);

  // Vibração suave quando chega a hora da pergunta.
  useEffect(() => {
    if (stage === 'during' && slot > 0) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }, [slot, stage]);

  function begin() {
    if (mode === 'now') {
      const t0 = Date.now();
      setStartedAt(t0);
      setNow(t0);
      setCheckins([]);
      setAnsweredSlot(0);
      setStage('during');
    } else {
      setStage('after');
    }
  }
  function answer(v: number) {
    Haptics.selectionAsync().catch(() => {});
    setCheckins([...checkins, v]);
    setAnsweredSlot(slot);
  }
  function finish() {
    // O pico sugerido é o mais alto que foi registado; pode ser alterado.
    const all = [before ?? 0, ...checkins];
    setPeak(Math.max(...all));
    setStage('after');
  }
  function save() {
    if (before === null || after === null) return;
    const d = new Date();
    const entry: ExposureSession = {
      id: 'e' + d.getTime(), stepId: step.id, stepLabel: step.label, date: ymd(d), ts: d.toISOString(),
      before, peak: peak ?? Math.max(before, after), after, note: '',
      fear: fear.trim() || undefined,
      prob: prob ?? undefined,
      happened: happened ?? undefined,
      probAfter: probAfter ?? undefined,
      learned: learned.trim() || undefined,
      minutes: mode === 'now' && startedAt ? Math.max(1, Math.round((now - startedAt) / 60000)) : undefined,
      checkins: checkins.length ? checkins : undefined,
    };
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onSave(entry);
    setSaved(entry);
    setStage('done');
  }

  const input = { minHeight: 56, padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 15, textAlignVertical: 'top' as const };
  const happenedLabel = (h: Happened) => (h === 'yes' ? x.yes : h === 'partly' ? x.partly : x.no);
  const label = (s: string) => <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>{s}</Text>;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={onClose} hitSlop={8}>
          <Text style={{ color: colors.textMuted }}>‹ {t('common.back')}</Text>
        </Pressable>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{step.label}</Text>
        <Stepper stage={stage} labels={[x.sBefore, x.sDuring, x.sAfter]} />

        {/* 1 · Antes: a previsão */}
        {stage === 'before' && (
          <>
            <Card style={{ gap: spacing.md }}>
              <CardHeader icon="flask-outline" title={x.predictTitle} />
              <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>{x.predictHint}</Text>
              {label(x.fearQ)}
              <TextInput value={fear} onChangeText={setFear} multiline placeholder={x.fearPh} placeholderTextColor={colors.textMuted} style={input} />
              {label(x.probQ)}
              <ProbMeter value={prob} onChange={setProb} />
            </Card>
            <Card style={{ gap: 8 }}>
              {label(t('exposure.before'))}
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t('exposure.sudsHint')}</Text>
              <Suds value={before} onChange={setBefore} />
            </Card>
            {label(x.howQ)}
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {([['now', x.modeNow, x.modeNowDesc, 'timer-outline'], ['log', x.modeLog, x.modeLogDesc, 'create-outline']] as const).map(([m, name, desc, icon]) => {
                const on = mode === m;
                return (
                  <Pressable key={m} onPress={() => setMode(m)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={{ flex: 1, gap: 6, padding: spacing.md, borderRadius: radius.lg, borderWidth: 2, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primarySoft : colors.card }}>
                    <Ionicons name={icon} size={24} color={on ? colors.primary : colors.textMuted} />
                    <Text style={{ color: on ? colors.primary : colors.text, fontSize: 14, fontWeight: '700' }}>{name}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 16 }}>{desc}</Text>
                  </Pressable>
                );
              })}
            </View>
            <PrimaryButton label={mode === 'now' ? x.start : x.next} onPress={begin} disabled={before === null} />

            {history.length > 0 && (
              <View style={{ gap: 8, marginTop: 4 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{t('exposure.history')}</Text>
                {history.map((h) => (
                  <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ color: colors.textMuted, fontSize: 13, flex: 1 }}>{h.date.split('-').reverse().join('/')}</Text>
                    {typeof h.prob === 'number' && (
                      <Text style={{ color: colors.primary, fontSize: 13, fontVariant: ['tabular-nums'] }}>
                        {h.prob}%{typeof h.probAfter === 'number' ? ` → ${h.probAfter}%` : ''}
                      </Text>
                    )}
                    <Text style={{ color: colors.text, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{h.before} → {h.after}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* 2 · Durante: temporizador e perguntas de 2 em 2 minutos */}
        {stage === 'during' && (
          <>
            <KeepAwake />
            <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg }}>
              <View style={{ width: 180, height: 180, borderRadius: 90, borderWidth: 6, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card }}>
                <Text accessibilityLabel={mmss(elapsed)} style={{ color: colors.text, fontSize: 40, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{mmss(elapsed)}</Text>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center' }}>{x.timerHint}</Text>
            </View>
            {fear.trim() ? (
              <View style={{ borderLeftWidth: 3, borderLeftColor: colors.primary, paddingLeft: spacing.md, gap: 2 }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{x.fear}{prob !== null ? ` · ${prob}%` : ''}</Text>
                <Text style={{ color: colors.text, fontSize: 15 }}>“{fear.trim()}”</Text>
              </View>
            ) : null}
            {askNow && (
              <Card style={{ gap: 8, borderColor: colors.primary, borderWidth: 2 }}>
                <Text accessibilityLiveRegion="polite" style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{x.checkQ}</Text>
                <Suds value={null} onChange={answer} />
              </Card>
            )}
            {checkins.length > 0 && (
              <Card style={{ gap: 8 }}>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{x.curve}</Text>
                <Curve values={[before ?? 0, ...checkins]} />
              </Card>
            )}
            <PrimaryButton label={x.finish} onPress={finish} />
          </>
        )}

        {/* 3 · Depois: previsão vs. o que aconteceu */}
        {stage === 'after' && (
          <>
            <Card style={{ gap: 8 }}>
              {label(t('exposure.peak'))}
              <Suds value={peak} onChange={setPeak} />
              <View style={{ height: 4 }} />
              {label(t('exposure.after'))}
              <Suds value={after} onChange={setAfter} />
            </Card>
            <Card style={{ gap: spacing.md }}>
              <CardHeader icon="flask-outline" title={x.happenedQ} />
              {fear.trim() ? <Text style={{ color: colors.textMuted, fontSize: 14, fontStyle: 'italic' }}>“{fear.trim()}”</Text> : null}
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
              {prob !== null && (
                <>
                  {label(x.probAfterQ)}
                  <ProbMeter value={probAfter} onChange={setProbAfter} />
                </>
              )}
              {label(x.learnedQ)}
              <TextInput value={learned} onChangeText={setLearned} multiline placeholder={x.learnedPh} placeholderTextColor={colors.textMuted} style={input} />
            </Card>
            <PrimaryButton label={x.save} onPress={save} disabled={after === null} />
          </>
        )}

        {/* Fim: cartão "Previsão vs. realidade" */}
        {stage === 'done' && saved && (
          <>
            <Card style={{ gap: spacing.md }}>
              <CardHeader icon="analytics-outline" title={x.resultTitle} />
              {saved.fear ? <Text style={{ color: colors.text, fontSize: 15, fontStyle: 'italic' }}>“{saved.fear}”</Text> : null}
              {typeof saved.prob === 'number' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{x.predicted}</Text>
                    <Text style={{ color: colors.text, fontSize: 30, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{saved.prob}%</Text>
                  </View>
                  {typeof saved.probAfter === 'number' && (
                    <>
                      <Ionicons name="arrow-forward" size={22} color={colors.textMuted} />
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{x.nowProb}</Text>
                        <Text style={{ color: saved.probAfter < saved.prob ? colors.success : colors.text, fontSize: 30, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{saved.probAfter}%</Text>
                      </View>
                    </>
                  )}
                </View>
              )}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {saved.happened && (
                  <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: saved.happened === 'no' ? colors.successSoft : colors.cardAlt }}>
                    <Text style={{ color: saved.happened === 'no' ? colors.success : colors.text, fontSize: 13, fontWeight: '600' }}>{x.happened} {happenedLabel(saved.happened)}</Text>
                  </View>
                )}
                <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.cardAlt }}>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{saved.before} → {saved.peak} → {saved.after}</Text>
                </View>
                {saved.minutes ? (
                  <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.cardAlt }}>
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{saved.minutes} {x.min}</Text>
                  </View>
                ) : null}
              </View>
              {saved.learned ? (
                <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, gap: 2 }}>
                  <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{x.learned}</Text>
                  <Text style={{ color: colors.text, fontSize: 15, lineHeight: 21 }}>{saved.learned}</Text>
                </View>
              ) : null}
              <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>{x.doneBody}</Text>
            </Card>
            <PrimaryButton label={x.backToLadder} onPress={onClose} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
