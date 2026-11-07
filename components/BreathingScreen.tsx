// Técnica de respiração: um círculo que cresce (inspira) e encolhe (expira),
// 4 segundos em cada. Usa a Animated API do React Native (sem bibliotecas).

import { useEffect, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { TopBackBar } from './ui';

export default function BreathingScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t } = useLang();
  const [scale] = useState(() => new Animated.Value(0));
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    // Ciclo: 4s a crescer, 4s a encolher, em repetição.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    );
    loop.start();

    // Texto "Inspira/Expira" alterna a cada 4 segundos (começa em "in").
    const interval = setInterval(() => setPhase((p) => (p === 'in' ? 'out' : 'in')), 4000);

    return () => {
      loop.stop();
      clearInterval(interval);
    };
  }, [scale]);

  const size = scale.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('tech.breathing')} onBack={onBack} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        <View style={{ width: 240, height: 240, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View
            style={{
              width: 240,
              height: 240,
              borderRadius: 120,
              backgroundColor: colors.primary,
              transform: [{ scale: size }],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '700' }}>
              {phase === 'in' ? t('tech.breatheIn') : t('tech.breatheOut')}
            </Text>
          </Animated.View>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 15, textAlign: 'center', paddingHorizontal: 40 }}>
          {t('tech.breathingDesc')}
        </Text>
      </View>
    </View>
  );
}
