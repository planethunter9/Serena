// "Surfar o impulso" (urge surfing): quando dá vontade de fazer um comportamento
// de segurança (verificar, perguntar, lavar...), observas o impulso como uma onda
// que sobe e desce sozinha — sem lhe obedecer. Com o tempo, perde força.

import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { pick, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, PrimaryButton, TopBackBar } from './ui';

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

function Suds({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {Array.from({ length: 11 }, (_, v) => {
        const active = value === v;
        return (
          <Pressable key={v} onPress={() => onChange(v)} style={{ width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.primary : colors.cardAlt, borderWidth: 2, borderColor: active ? colors.primary : colors.border }}>
            <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700' }}>{v}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function UrgeSurfScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (o: L) => pick(o, lang);

  const [step, setStep] = useState<Step>('intro');
  const [before, setBefore] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const [left, setLeft] = useState(RIDE_SECONDS);
  const [promptIdx, setPromptIdx] = useState(0);

  const [scale] = useState(() => new Animated.Value(1));
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const promptTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function cleanup() {
    loopRef.current?.stop();
    if (timer.current) clearInterval(timer.current);
    if (promptTimer.current) clearInterval(promptTimer.current);
  }
  useEffect(() => cleanup, []);

  function startRide() {
    setStep('ride');
    setLeft(RIDE_SECONDS);
    setPromptIdx(0);
    // Onda que sobe e desce (inspira ~4s / expira ~6s).
    scale.setValue(1);
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.45, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loopRef.current.start();
    timer.current = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) { cleanup(); setStep('done'); return 0; }
        return v - 1;
      });
    }, 1000);
    promptTimer.current = setInterval(() => setPromptIdx((i) => (i + 1) % PROMPTS.length), 12000);
  }

  function finishEarly() {
    cleanup();
    setStep('done');
  }
  function reset() {
    cleanup();
    setStep('intro'); setBefore(null); setAfter(null); setLeft(RIDE_SECONDS); setPromptIdx(0);
  }

  const mmss = `${Math.floor(left / 60)}:${(left % 60).toString().padStart(2, '0')}`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={lang === 'pt' ? 'Surfar o impulso' : 'Urge surfing'} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: 40 }}>
        {step === 'intro' && (
          <>
            <Text style={{ color: colors.text, fontSize: 15, lineHeight: 23 }}>
              {tt({
                pt: 'Quando dá vontade de fazer um comportamento de segurança — verificar, perguntar, lavar, evitar — essa vontade é como uma onda: sobe, atinge um pico e desce sozinha, se não lhe obedeceres.\n\nAqui não lutas contra o impulso nem o cumpres. Só o observas enquanto passa. Cada vez que o fazes, o cérebro aprende que não precisava dele.',
                en: 'When you feel the urge to do a safety behaviour — check, ask, wash, avoid — that urge is like a wave: it rises, peaks and falls on its own, if you do not obey it.\n\nHere you neither fight the urge nor carry it out. You just observe it as it passes. Each time you do, the brain learns it did not need it.',
              })}
            </Text>
            <Card style={{ gap: 10 }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{tt({ pt: 'Quão forte é o impulso agora? (0–10)', en: 'How strong is the urge now? (0–10)' })}</Text>
              <Suds value={before} onChange={setBefore} />
            </Card>
            <PrimaryButton label={tt({ pt: 'Começar a surfar', en: 'Start surfing' })} onPress={startRide} disabled={before === null} />
          </>
        )}

        {step === 'ride' && (
          <>
            <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>{mmss}</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center', height: 240 }}>
              <Animated.View style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: colors.primarySoft, transform: [{ scale }], alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary, opacity: 0.25 }} />
              </Animated.View>
            </View>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '600', textAlign: 'center', lineHeight: 24, minHeight: 56 }}>
              {tt(PROMPTS[promptIdx])}
            </Text>
            <PrimaryButton label={tt({ pt: 'A onda passou', en: 'The wave passed' })} onPress={finishEarly} />
          </>
        )}

        {step === 'done' && (
          <>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{tt({ pt: 'Boa — ficaste com ela.', en: 'Well done — you stayed with it.' })}</Text>
            <Card style={{ gap: 10 }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{tt({ pt: 'E o impulso agora? (0–10)', en: 'And the urge now? (0–10)' })}</Text>
              <Suds value={after} onChange={setAfter} />
              {before !== null && after !== null && (
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{tt({ pt: 'Início', en: 'Start' })} {before} → {tt({ pt: 'agora', en: 'now' })} {after}</Text>
              )}
            </Card>
            <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>
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
