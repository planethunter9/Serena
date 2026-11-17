// Varrimento corporal: passar a atenção pelo corpo, zona a zona, com uma
// instrução curta em cada uma (a da barriga escrita com cuidado: na emetofobia
// é a zona mais sensível — reparar sem julgar, sem tentar fazer desaparecer).
// Dois modos: "Ao meu ritmo" (botões) e "Guiado" (20 s por zona, com vibração
// a cada mudança e pausa). O ecrã não se apaga durante o exercício.

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import KeepAwake from './KeepAwake';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BODYSCAN_SECONDS, scanText } from '../data/techniques';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, CardHeader, PrimaryButton, TopBackBar } from './ui';

export default function BodyScanScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const x = scanText(lang);
  const total = x.areas.length;

  const [stage, setStage] = useState<'setup' | 'run' | 'done'>('setup');
  const [mode, setMode] = useState<'manual' | 'guided'>('guided');
  const [manualI, setManualI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0); // segundos decorridos (modo guiado)

  // Modo guiado: a zona é calculada a partir do tempo decorrido.
  const guidedIdx = Math.floor(elapsed / BODYSCAN_SECONDS);
  const guidedFinished = stage === 'run' && mode === 'guided' && guidedIdx >= total;
  const showDone = stage === 'done' || guidedFinished;
  const i = mode === 'guided' ? Math.min(guidedIdx, total - 1) : manualI;
  const left = BODYSCAN_SECONDS - (elapsed % BODYSCAN_SECONDS);

  useEffect(() => {
    if (stage !== 'run' || mode !== 'guided' || paused || guidedFinished) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [stage, mode, paused, guidedFinished]);

  // Vibração ao mudar de zona (e uma de sucesso no fim).
  useEffect(() => {
    if (stage !== 'run' || mode !== 'guided' || guidedIdx === 0) return;
    if (guidedIdx >= total) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [guidedIdx, stage, mode, total]);

  function start() {
    setManualI(0);
    setElapsed(0);
    setPaused(false);
    setStage('run');
  }
  function next() {
    if (manualI + 1 >= total) { setStage('done'); return; }
    Haptics.selectionAsync().catch(() => {});
    setManualI(manualI + 1);
  }
  function prev() {
    if (manualI > 0) setManualI(manualI - 1);
  }

  const area = x.areas[Math.min(i, total - 1)];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('tech.bodyscan')} onBack={onBack} />

      {stage === 'setup' && (
        <View style={{ flex: 1, padding: spacing.xl, paddingTop: spacing.md, gap: spacing.lg }}>
          <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{x.intro}</Text>
          <Card style={{ gap: spacing.md }}>
            <CardHeader icon="body-outline" title={t('tech.bodyscan')} />
            {([['guided', x.guided, x.guidedDesc, 'play-circle-outline'], ['manual', x.manual, x.manualDesc, 'hand-left-outline']] as const).map(([m, name, desc, icon]) => {
              const on = mode === m;
              return (
                <Pressable key={m} onPress={() => setMode(m)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primarySoft : 'transparent' }}>
                  <Ionicons name={icon} size={22} color={on ? colors.primary : colors.textMuted} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: on ? colors.primary : colors.text }}>{name}</Text>
                    <Text style={{ fontSize: 13, color: colors.textMuted }}>{desc}</Text>
                  </View>
                </Pressable>
              );
            })}
          </Card>
          <View style={{ flex: 1 }} />
          <PrimaryButton label={x.start} onPress={start} />
        </View>
      )}

      {stage === 'run' && !showDone && (
        <View style={{ flex: 1, padding: spacing.xl, gap: spacing.lg }}>
          <KeepAwake />
          {/* Progresso: uma marca por zona */}
          <View style={{ flexDirection: 'row', gap: 4 }} accessible accessibilityLabel={`${i + 1}/${total}`}>
            {x.areas.map((_, k) => (
              <View key={k} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: k < i ? colors.primary : k === i ? colors.primarySoft : colors.cardAlt, overflow: 'hidden' }}>
                {k === i && mode === 'guided' && (
                  <View style={{ width: `${((BODYSCAN_SECONDS - left) / BODYSCAN_SECONDS) * 100}%`, height: '100%', backgroundColor: colors.primary }} />
                )}
              </View>
            ))}
          </View>

          <View style={{ flex: 1, justifyContent: 'center', gap: spacing.md }}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700', textAlign: 'center' }}>{i + 1} / {total}</Text>
            <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 26, fontWeight: '700', textAlign: 'center' }}>{area.name}</Text>
            <Text accessibilityLiveRegion="polite" style={{ color: colors.text, fontSize: 17, lineHeight: 26, textAlign: 'center' }}>{area.text}</Text>
          </View>

          {mode === 'guided' ? (
            <View style={{ gap: spacing.sm }}>
              <PrimaryButton label={paused ? x.resume : x.pause} onPress={() => setPaused((p) => !p)} />
              <Pressable onPress={() => setStage('done')} accessibilityRole="button" style={{ alignItems: 'center', padding: 12 }}>
                <Text style={{ color: colors.textMuted, fontSize: 15, fontWeight: '600' }}>{x.finish}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Pressable onPress={prev} disabled={i === 0} accessibilityRole="button" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, opacity: i === 0 ? 0.4 : 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{x.prev}</Text>
              </Pressable>
              <View style={{ flex: 2 }}>
                <PrimaryButton label={i + 1 >= total ? x.finish : x.next} onPress={next} />
              </View>
            </View>
          )}
        </View>
      )}

      {showDone && (
        <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'center', gap: spacing.lg }}>
          <Card style={{ gap: spacing.md, alignItems: 'center', paddingVertical: spacing.xl }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="checkmark" size={28} color={colors.success} />
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
