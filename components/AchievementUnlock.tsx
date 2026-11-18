// "Conquista desbloqueada": quando uma conquista nova é desbloqueada aparece
// um cartão por cima da app, ao estilo das apps de jogos/hábitos:
// - faixa no topo (com "pontas" de fita) com o nome e a descrição;
// - medalha com o ícone, que "salta" ao aparecer, com raios a rodar atrás e
//   pequenas estrelas a cintilar;
// - confetes a cair; vibração de sucesso;
// - "Parabéns! · Conquista desbloqueada" e o botão Continuar (sem partilhar).
// Respeita "Reduzir movimento" (sem confetes nem rotação).
//
// <AchievementWatcher/> verifica as conquistas sempre que se muda de ecrã e
// mostra as novas, uma de cada vez. Na primeira vez só guarda o estado atual
// (para quem já tinha conquistas não receber uma enxurrada de avisos).

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useAuth } from '../auth/AuthContext';
import { ACHIEVEMENTS, Achievement } from '../data/achievements';
import { practiceText } from '../data/practiceText';
import { pick, useLang } from '../i18n/i18n';
import { loadAchStats, newlyUnlocked, unlockedIds } from '../lib/achievementStats';
import { loadAchSeen, saveAchSeen } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { PrimaryButton } from './ui';

// ---------- Peças animadas ----------
function ConfettiPiece({ i, W, H, color }: { i: number; W: number; H: number; color: string }) {
  // Posição, tamanho e tempos "aleatórios" mas estáveis (derivados do índice).
  const seed = (n: number) => { const x = Math.sin(i * 999 + n * 77) * 10000; return x - Math.floor(x); };
  const [cfg] = useState(() => ({ x: seed(1) * W, w: 6 + seed(2) * 6, h: 10 + seed(3) * 8, delay: seed(4) * 500, dur: 1800 + seed(5) * 1400, drift: (seed(6) - 0.5) * 120, spin: (seed(7) > 0.5 ? 1 : -1) * (360 + seed(8) * 540) }));
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(cfg.delay, withTiming(1, { duration: cfg.dur, easing: Easing.out(Easing.quad) })));
  }, [t, cfg]);
  const style = useAnimatedStyle(() => ({
    opacity: t.get() < 0.85 ? 1 : (1 - t.get()) / 0.15,
    transform: [
      { translateX: cfg.x + cfg.drift * t.get() },
      { translateY: -40 + (H * 0.9) * t.get() },
      { rotate: `${cfg.spin * t.get()}deg` },
    ],
  }));
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, width: cfg.w, height: cfg.h, borderRadius: 2, backgroundColor: color }, style]} />;
}

function Rays({ color }: { color: string }) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.set(withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1));
  }, [r]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.get()}deg` }] }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: 190, height: 190, alignItems: 'center', justifyContent: 'center' }, style]}>
      {Array.from({ length: 12 }, (_, k) => (
        <View key={k} style={{ position: 'absolute', width: 4, height: 190, alignItems: 'center', transform: [{ rotate: `${k * 15}deg` }] }}>
          <View style={{ width: 4, height: 22, borderRadius: 2, backgroundColor: color, opacity: 0.55 }} />
          <View style={{ flex: 1 }} />
          <View style={{ width: 4, height: 22, borderRadius: 2, backgroundColor: color, opacity: 0.55 }} />
        </View>
      ))}
    </Animated.View>
  );
}

function Twinkle({ x, y, delay, color }: { x: number; y: number; delay: number; color: string }) {
  const o = useSharedValue(0);
  useEffect(() => {
    o.set(withDelay(delay, withRepeat(withSequence(withTiming(0.9, { duration: 900 }), withTiming(0.25, { duration: 1100 })), -1, true)));
  }, [o, delay]);
  const style = useAnimatedStyle(() => ({ opacity: o.get(), transform: [{ scale: 0.6 + 0.6 * o.get() }] }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: x, top: y }, style]}>
      <Ionicons name="sparkles" size={16} color={color} />
    </Animated.View>
  );
}

function Medal({ icon }: { icon: Achievement['icon'] }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const s = useSharedValue(reduced ? 1 : 0);
  const rot = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    // Entrada suave (sem ressalto) e um pequeno abanão.
    s.set(withDelay(150, withSpring(1, { damping: 16, stiffness: 120 })));
    rot.set(withDelay(450, withSequence(withTiming(-4, { duration: 140 }), withTiming(3, { duration: 160 }), withTiming(0, { duration: 140 }))));
  }, [s, rot, reduced]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.get() }, { rotate: `${rot.get()}deg` }] }));
  return (
    <View style={{ width: 190, height: 190, alignItems: 'center', justifyContent: 'center' }}>
      {!reduced && <Rays color={colors.primary} />}
      <Animated.View style={[{ width: 132, height: 132, borderRadius: 66, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.primary }, style]}>
        <View style={{ width: 98, height: 98, borderRadius: 49, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={50} color={colors.primary} />
        </View>
      </Animated.View>
      {!reduced && (
        <>
          <Twinkle x={18} y={30} delay={300} color={colors.chartMid} />
          <Twinkle x={160} y={44} delay={650} color={colors.chartMid} />
          <Twinkle x={150} y={150} delay={900} color={colors.primary} />
          <Twinkle x={26} y={146} delay={1200} color={colors.primary} />
        </>
      )}
    </View>
  );
}

// ---------- O cartão ----------
export function AchievementUnlockModal({ achievement, onClose, onSeeAll }: { achievement: Achievement | null; onClose: () => void; onSeeAll: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const px = practiceText(lang);
  const reduced = useReducedMotion();
  const { width: W, height: H } = useWindowDimensions();

  useEffect(() => {
    if (achievement) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [achievement]);

  if (!achievement) return null;
  const confettiColors = [colors.primary, colors.chartMid, colors.success, colors.chartHigh, colors.primarySoft];
  const CARD_W = Math.min(320, W - 48);

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
        {!reduced && Array.from({ length: 22 }, (_, i) => <ConfettiPiece key={i} i={i} W={W} H={H} color={confettiColors[i % confettiColors.length]} />)}

        <Animated.View entering={ZoomIn.springify().damping(20).stiffness(140).reduceMotion(ReduceMotion.System)} style={{ width: CARD_W }}>
          {/* Pontas da fita (atrás do cartão) */}
          <View style={{ position: 'absolute', top: 30, left: -24, width: 48, height: 44, backgroundColor: colors.primary, borderTopLeftRadius: 4, borderBottomLeftRadius: 4, transform: [{ skewY: '-10deg' }] }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.22)' }} />
          </View>
          <View style={{ position: 'absolute', top: 30, right: -24, width: 48, height: 44, backgroundColor: colors.primary, borderTopRightRadius: 4, borderBottomRightRadius: 4, transform: [{ skewY: '10deg' }] }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.22)' }} />
          </View>

          <View style={{ backgroundColor: colors.card, borderRadius: radius.lg * 1.4, overflow: 'hidden' }}>
            {/* Faixa com o nome da conquista */}
            <View style={{ backgroundColor: colors.primary, paddingVertical: spacing.lg, paddingHorizontal: spacing.lg, alignItems: 'center', gap: 2 }}>
              <Text accessibilityRole="header" style={{ color: colors.onPrimary, fontSize: 20, fontWeight: '700', textAlign: 'center' }}>{pick(achievement.title, lang)}</Text>
              <Text style={{ color: colors.onPrimary, opacity: 0.9, fontSize: 14, textAlign: 'center' }}>{pick(achievement.desc, lang)}</Text>
            </View>

            <View style={{ backgroundColor: colors.cardAlt, alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.lg, gap: 6 }}>
              <Medal icon={achievement.icon} />
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{px.ach_congrats}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>{px.ach_unlocked}</Text>
            </View>

            <View style={{ padding: spacing.lg, gap: spacing.sm }}>
              <PrimaryButton label={px.ach_continue} onPress={onClose} />
              <Pressable onPress={onSeeAll} accessibilityRole="button" style={{ alignItems: 'center', paddingVertical: 8 }}>
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>{px.ach_seeAll}</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ---------- Vigia: verifica ao mudar de ecrã ----------
export function AchievementWatcher() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [queue, setQueue] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    const id = setTimeout(async () => {
      try {
        const [{ stats, manual }, seen] = await Promise.all([loadAchStats(), loadAchSeen()]);
        const unlocked = unlockedIds(stats, manual);
        if (seen === null) { await saveAchSeen(unlocked); return; } // 1.ª vez: sem avisos
        const fresh = newlyUnlocked(unlocked, seen);
        if (!fresh.length) return;
        await saveAchSeen([...seen, ...fresh]);
        if (alive) setQueue((q) => [...q, ...fresh.filter((f) => !q.includes(f))]);
      } catch {}
    }, 600); // deixa o ecrã novo aparecer primeiro
    return () => { alive = false; clearTimeout(id); };
  }, [user, pathname]);

  const current = queue.length ? ACHIEVEMENTS.find((a) => a.id === queue[0]) ?? null : null;
  const next = () => setQueue((q) => q.slice(1));

  return (
    <AchievementUnlockModal
      key={current?.id ?? 'none'}
      achievement={current}
      onClose={next}
      onSeeAll={() => { next(); router.push('/goalsachievements' as any); }}
    />
  );
}
