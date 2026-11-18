// Mini-leitor: aparece em baixo, em qualquer ecrã, enquanto há um som de
// "Acalmar"/"Dormir" ativo. Mostra o nome, barras animadas enquanto toca, o
// tempo que falta (temporizador), pausa/retoma e parar. Tocar no nome abre o
// ecrã dos sons.

import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, ReduceMotion, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TIMER_TEXT } from '../data/sounds';
import { tr2, useLang } from '../i18n/i18n';
import { useSound } from '../store/SoundContext';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';

function Bar({ delay, playing, color }: { delay: number; playing: boolean; color: string }) {
  const reduced = useReducedMotion();
  const h = useSharedValue(0.4);
  useEffect(() => {
    if (!playing || reduced) { h.set(withTiming(0.4, { duration: 200 })); return; }
    h.set(withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 380 }), withTiming(0.3, { duration: 420 })), -1, true)));
  }, [playing, reduced, delay, h]);
  const style = useAnimatedStyle(() => ({ height: 18 * h.get() }));
  return <Animated.View style={[{ width: 4, borderRadius: 2, backgroundColor: color }, style]} />;
}

export default function MiniPlayer() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const snd = useSound();
  if (!snd.current) return null;
  const tm = TIMER_TEXT[lang] ?? TIMER_TEXT.en;
  // No início há a barra de separadores a flutuar em baixo: o leitor fica por cima dela.
  const bottom = insets.bottom + (pathname === '/' ? 96 : 12);
  const cur = snd.current;

  return (
    <Animated.View
      entering={FadeInDown.duration(220).reduceMotion(ReduceMotion.System)}
      exiting={FadeOutDown.duration(180).reduceMotion(ReduceMotion.System)}
      style={{ position: 'absolute', left: spacing.lg, right: spacing.lg, bottom }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: 10, paddingLeft: 14, paddingRight: 8, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}>
        <Pressable
          onPress={() => router.push({ pathname: '/sounds', params: { category: cur.category } } as any)}
          accessibilityRole="button"
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <Bar delay={0} playing={snd.playing} color={colors.primary} />
            <Bar delay={150} playing={snd.playing} color={colors.primary} />
            <Bar delay={300} playing={snd.playing} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{cur.name}</Text>
            {snd.remaining != null ? (
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>{tm.endsIn} {snd.remaining} {tm.min}</Text>
            ) : (
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{snd.playing ? tr2(lang, 'A tocar', 'Playing') : tr2(lang, 'Em pausa', 'Paused')}</Text>
            )}
          </View>
        </Pressable>
        <Pressable onPress={snd.toggle} hitSlop={8} accessibilityRole="button" accessibilityLabel={snd.playing ? tr2(lang, 'Pausa', 'Pause') : tr2(lang, 'Tocar', 'Play')} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={snd.playing ? 'pause' : 'play'} size={20} color="#fff" />
        </Pressable>
        <Pressable onPress={snd.stop} hitSlop={8} accessibilityRole="button" accessibilityLabel={tr2(lang, 'Parar', 'Stop')} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="close" size={22} color={colors.textMuted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}
