// Respiração guiada: um círculo que cresce (inspirar) e encolhe (expirar).
// - Ritmos: Calma 4–6 (por defeito: expiração mais longa, ~6 respirações/min),
//   Equilibrada 5–5 e Quadrada 4–4–4–4 (com pausas).
// - Duração escolhida (1, 3 ou 5 min), contagem dos segundos de cada fase e um
//   ecrã de fim.
// - Vibração leve em cada mudança de fase (dá para fazer de olhos fechados) e o
//   ecrã não se apaga durante o exercício.

import * as Haptics from 'expo-haptics';
import KeepAwake from './KeepAwake';
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { BREATH_MINUTES, BREATH_PATTERNS, BreathPatternId, breathText } from '../data/techniques';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, CardHeader, PrimaryButton, Segmented, TopBackBar } from './ui';

type Phase = { kind: 'in' | 'hold' | 'out'; sec: number };

function phasesOf(id: BreathPatternId): Phase[] {
  const p = BREATH_PATTERNS[id];
  const out: Phase[] = [{ kind: 'in', sec: p.inhale }];
  if (p.hold1) out.push({ kind: 'hold', sec: p.hold1 });
  out.push({ kind: 'out', sec: p.exhale });
  if (p.hold2) out.push({ kind: 'hold', sec: p.hold2 });
  return out;
}

export default function BreathingScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const x = breathText(lang);

  const [stage, setStage] = useState<'setup' | 'run' | 'done'>('setup');
  const [pattern, setPattern] = useState<BreathPatternId>('calm');
  const [minutes, setMinutes] = useState<number>(3);

  // Estado da sessão em curso.
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secLeft, setSecLeft] = useState(0);     // segundos que faltam na fase
  const [totalLeft, setTotalLeft] = useState(0); // segundos que faltam no total
  const [scale] = useState(() => new Animated.Value(0));

  const phases = phasesOf(pattern);
  const phase = phases[phaseIdx] ?? phases[0];

  // Relógio da sessão: calcula a fase a partir do tempo decorrido (não acumula erros).
  useEffect(() => {
    if (stage !== 'run') return;
    const cycle = phases.reduce((n, p) => n + p.sec, 0);
    const totalMs = minutes * 60 * 1000;
    const startedAt = Date.now();
    let lastIdx = -1;
    const tick = () => {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= totalMs) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setStage('done');
        return;
      }
      const inCycle = (elapsed / 1000) % cycle;
      let acc = 0, idx = 0;
      for (let i = 0; i < phases.length; i++) {
        if (inCycle < acc + phases[i].sec) { idx = i; break; }
        acc += phases[i].sec;
      }
      if (idx !== lastIdx) {
        lastIdx = idx;
        setPhaseIdx(idx);
        const p = phases[idx];
        // Vibração leve a cada mudança (mais marcada a inspirar).
        Haptics.impactAsync(p.kind === 'in' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        // Círculo: cresce a inspirar, encolhe a expirar, fica parado a segurar.
        if (p.kind !== 'hold') {
          Animated.timing(scale, {
            toValue: p.kind === 'in' ? 1 : 0,
            duration: p.sec * 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }).start();
        }
      }
      setSecLeft(Math.max(1, Math.ceil(acc + phases[idx].sec - inCycle)));
      setTotalLeft(Math.max(0, Math.ceil((totalMs - elapsed) / 1000)));
    };
    tick();
    const id = setInterval(tick, 200);
    return () => { clearInterval(id); scale.stopAnimation(); };
    // phases deriva de pattern
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, pattern, minutes, scale]);

  function start() {
    scale.setValue(0);
    setPhaseIdx(0);
    setStage('run');
  }

  const size = scale.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const phaseLabel = phase.kind === 'in' ? x.inhale : phase.kind === 'out' ? x.exhale : x.hold;
  const mmss = `${Math.floor(totalLeft / 60)}:${String(totalLeft % 60).padStart(2, '0')}`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('tech.breathing')} onBack={onBack} />

      {stage === 'setup' && (
        <View style={{ flex: 1, padding: spacing.xl, paddingTop: spacing.md, gap: spacing.lg }}>
          <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{x.intro}</Text>
          <Card style={{ gap: spacing.md }}>
            <CardHeader icon="pulse-outline" title={x.pattern} />
            {(['calm', 'even', 'box'] as BreathPatternId[]).map((id) => {
              const on = pattern === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setPattern(id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  style={{ padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primarySoft : 'transparent', gap: 2 }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: on ? colors.primary : colors.text }}>{x.names[id]}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>{x.descs[id]}</Text>
                </Pressable>
              );
            })}
          </Card>
          <Card style={{ gap: spacing.md }}>
            <CardHeader icon="time-outline" title={x.duration} />
            <Segmented
              value={String(minutes)}
              onChange={(v) => setMinutes(Number(v))}
              options={BREATH_MINUTES.map((m) => [String(m), `${m} ${x.min}`] as [string, string])}
            />
          </Card>
          <View style={{ flex: 1 }} />
          <PrimaryButton label={x.start} onPress={start} />
        </View>
      )}

      {stage === 'run' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 36, padding: spacing.xl }}>
          <KeepAwake />
          <View style={{ width: 260, height: 260, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View
              style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: colors.primarySoft, transform: [{ scale: size }] }}
            />
            <Animated.View
              style={{ position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: colors.primary, opacity: 0.85, transform: [{ scale: size }] }}
            />
            <View accessible accessibilityLiveRegion="polite" accessibilityLabel={`${phaseLabel} ${secLeft}`} style={{ alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>{phaseLabel}</Text>
              <Text style={{ color: '#fff', fontSize: 34, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{secLeft}</Text>
            </View>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 15, fontVariant: ['tabular-nums'] }}>{mmss} {x.left}</Text>
          <Pressable onPress={() => setStage('setup')} accessibilityRole="button" hitSlop={8} style={{ padding: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>{x.stop}</Text>
          </Pressable>
          <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{x.dizzy}</Text>
        </View>
      )}

      {stage === 'done' && (
        <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'center', gap: spacing.lg }}>
          <Card style={{ gap: spacing.md, alignItems: 'center', paddingVertical: spacing.xl }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.success, fontSize: 26 }}>✓</Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{x.doneTitle}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center' }}>{x.doneBody}</Text>
          </Card>
          <PrimaryButton label={x.again} onPress={start} />
          <Pressable onPress={onBack} accessibilityRole="button" style={{ alignItems: 'center', padding: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>{x.back}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
