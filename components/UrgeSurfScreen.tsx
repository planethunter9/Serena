// "Surfar o impulso" (urge surfing): quando dá vontade de fazer um comportamento
// de segurança (verificar, perguntar, lavar...), observas o impulso como uma onda
// que sobe e desce sozinha — sem lhe obedecer. Com o tempo, perde força.

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { practiceText } from '../data/practiceText';
import { introText } from '../data/introTexts';
import KeepAwake from './KeepAwake';
import LineChart from './stats/LineChart';
import { Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { pick, tr2, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, CardHeader, PrimaryButton, TopBackBar } from './ui';

type L = { pt: string; en: string };
type Step = 'intro' | 'ride' | 'done';

const PROMPTS: L[] = [
  { pt: 'Onde sentes o impulso no corpo? Repara, sem o afastar.', en: 'Where do you feel the urge in your body? Notice it, without pushing it away.' },
  { pt: 'Respira devagar. Não tens de fazer nada.', en: 'Breathe slowly. You do not have to do anything.' },
  { pt: 'O impulso é uma onda — deixa-a subir.', en: 'The urge is a wave — let it rise.' },
  { pt: 'Não tens de lhe obedecer. Só observar.', en: 'You do not have to obey it. Just observe.' },
  { pt: 'Repara: a onda já mudou de tamanho?', en: 'Notice: has the wave changed size already?' },
  { pt: 'Cada segundo que esperas, a onda perde força.', en: 'Every second you wait, the wave loses strength.' },
];

const RIDE_SECONDS = 180;
const CHECK_EVERY = 60; // pergunta a força do impulso a cada minuto

function Suds({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {Array.from({ length: 11 }, (_, v) => {
        const active = value === v;
        return (
          <Pressable key={v} onPress={() => onChange(v)} accessibilityRole="button" accessibilityState={{ selected: active }} style={{ width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.primary : colors.cardAlt, borderWidth: 2, borderColor: active ? colors.primary : colors.border }}>
            <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: '700' }}>{v}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Onda animada: uma sinusoide que desliza para o lado; a altura acompanha a
// força do impulso que a pessoa vai indicando (a onda baixa quando o impulso baixa).
const WAVE_H = 150;
function Wave({ level }: { level: number }) {
  const { colors } = useTheme();
  const [w, setW] = useState(0);
  const [shift] = useState(() => new Animated.Value(0));
  const [amp] = useState(() => new Animated.Value(level));
  const period = Math.max(1, w / 1.5);

  useEffect(() => {
    if (!w) return;
    shift.setValue(0);
    const loop = Animated.loop(Animated.timing(shift, { toValue: -period, duration: 5000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [w, period, shift]);
  useEffect(() => {
    Animated.timing(amp, { toValue: level, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }).start();
  }, [level, amp]);

  // Caminho com 3 períodos (para poder deslizar um período sem se ver o fim).
  const mid = WAVE_H / 2;
  const A = 1; // amplitude base, a escala vertical vem da animação
  let d = `M 0 ${mid}`;
  const total = period * 3;
  for (let x = 0; x <= total; x += 6) d += ` L ${x} ${mid - A * 40 * Math.sin((x / period) * Math.PI * 2)}`;
  const fill = `${d} L ${total} ${WAVE_H} L 0 ${WAVE_H} Z`;
  const scaleY = amp.interpolate({ inputRange: [0, 10], outputRange: [0.12, 1.35] });

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: WAVE_H, overflow: 'hidden', borderRadius: radius.lg, backgroundColor: colors.card }}>
      {w > 0 && (
        <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: total, height: WAVE_H, transform: [{ translateX: shift }, { scaleY }] }}>
          <Svg width={total} height={WAVE_H}>
            <Path d={fill} fill={colors.primarySoft} />
            <Path d={d} fill="none" stroke={colors.primary} strokeWidth={3} strokeLinecap="round" />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}

export default function UrgeSurfScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (o: L) => pick(o, lang);
  const px = practiceText(lang);

  const [step, setStep] = useState<Step>('intro');
  const [before, setBefore] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const [checks, setChecks] = useState<number[]>([]);
  const [answeredSlot, setAnsweredSlot] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);

  const elapsed = step === 'ride' ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  const left = Math.max(0, RIDE_SECONDS - elapsed);
  const slot = Math.floor(elapsed / CHECK_EVERY);
  const askNow = step === 'ride' && slot > answeredSlot && left > 0;
  const promptIdx = Math.floor(elapsed / 12) % PROMPTS.length;
  const level = checks.length ? checks[checks.length - 1] : before ?? 5;
  const timeUp = step === 'ride' && left === 0;

  useEffect(() => {
    if (step !== 'ride') return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [step]);
  // Vibração quando chega a pergunta e quando o tempo acaba.
  useEffect(() => {
    if (step === 'ride' && slot > 0) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }, [slot, step]);

  function startRide() {
    const t0 = Date.now();
    setStartedAt(t0); setNow(t0); setChecks([]); setAnsweredSlot(0);
    setStep('ride');
  }
  function answer(v: number) {
    Haptics.selectionAsync().catch(() => {});
    setChecks([...checks, v]);
    setAnsweredSlot(slot);
  }
  function finish() {
    setAfter(null);
    setStep('done');
  }
  function reset() {
    setStep('intro'); setBefore(null); setAfter(null); setChecks([]);
  }

  const mmss = `${Math.floor(left / 60)}:${(left % 60).toString().padStart(2, '0')}`;
  const series = [before ?? 0, ...checks, ...(after !== null ? [after] : [])];
  const dropped = after !== null && before !== null && after < before;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={tr2(lang, 'Surfar o impulso', 'Urge surfing')} onBack={onBack} info={introText('urgesurf', lang)} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: 40 }}>
        {step === 'intro' && (
          <>
            <Card style={{ gap: 10 }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{tt({ pt: 'Quão forte é o impulso agora? (0–10)', en: 'How strong is the urge now? (0–10)' })}</Text>
              <Suds value={before} onChange={setBefore} />
            </Card>
            <PrimaryButton label={tt({ pt: 'Começar a surfar', en: 'Start surfing' })} onPress={startRide} disabled={before === null} />
          </>
        )}

        {step === 'ride' && (
          <>
            <KeepAwake />
            <Text style={{ color: colors.text, fontSize: 28, fontWeight: '600', textAlign: 'center', fontVariant: ['tabular-nums'] }}>{mmss}</Text>
            <Wave level={level} />
            <Text accessibilityLiveRegion="polite" style={{ color: colors.text, fontSize: 17, fontWeight: '600', textAlign: 'center', lineHeight: 24, minHeight: 50 }}>
              {tt(PROMPTS[promptIdx])}
            </Text>
            {askNow && (
              <Card style={{ gap: 8, borderColor: colors.primary, borderWidth: 2 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{px.u_checkQ}</Text>
                <Suds value={null} onChange={answer} />
              </Card>
            )}
            <PrimaryButton label={timeUp ? tt({ pt: 'Concluir', en: 'Done' }) : tt({ pt: 'A onda passou', en: 'The wave passed' })} onPress={finish} />
          </>
        )}

        {step === 'done' && (
          <>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{tt({ pt: 'Boa — ficaste com ela.', en: 'Well done — you stayed with it.' })}</Text>
            <Card style={{ gap: 10 }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{tt({ pt: 'E o impulso agora? (0–10)', en: 'And the urge now? (0–10)' })}</Text>
              <Suds value={after} onChange={setAfter} />
            </Card>
            {after !== null && (
              <Card style={{ gap: spacing.md }}>
                <CardHeader icon="water-outline" title={px.u_curve} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{px.start}</Text>
                    <Text style={{ color: colors.text, fontSize: 30, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{before}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={22} color={colors.textMuted} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{px.end}</Text>
                    <Text style={{ color: dropped ? colors.success : colors.text, fontSize: 30, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{after}</Text>
                  </View>
                </View>
                {series.length >= 2 && (
                  <LineChart
                    series={[{ color: colors.primary, points: series.map((v, i) => ({ i, v })), fill: true }]}
                    n={series.length}
                    yMin={0}
                    yMax={10}
                    yTicks={[0, 5, 10]}
                    xLabels={[{ i: 0, text: px.start }, { i: series.length - 1, text: px.end }]}
                    format={(v) => String(Math.round(v))}
                    slotLabel={(i) => (i === 0 ? px.start : i === series.length - 1 ? px.end : `${i} min`)}
                  />
                )}
                <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{dropped ? px.u_down : px.u_same}</Text>
              </Card>
            )}
            <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 21 }}>
              {tt({
                pt: 'Repara no que acabou de acontecer: o impulso existiu, não lhe obedeceste, e mesmo assim passou (ou está a passar). É esta a prova que o cérebro precisa — podes repetir sempre que precisares.',
                en: 'Notice what just happened: the urge was there, you did not obey it, and it passed anyway (or is passing). This is the evidence the brain needs — you can repeat it whenever you need.',
              })}
            </Text>
            <PrimaryButton label={tt({ pt: 'Concluir', en: 'Done' })} onPress={reset} />
          </>
        )}
      </ScrollView>
    </View>
  );
}
