// Técnicas de atenção com cores (sugestão da psicóloga), boas também para
// crianças:
// - Arco-íris: as 7 cores por ordem; em cada uma nomeia-se N coisas dessa cor.
//   O arco vai-se pintando banda a banda.
// - 7 balões: escolhe-se um balão (qualquer ordem), nomeia-se N coisas da cor
//   para o encher (cresce a cada coisa) e depois deixa-se voar.
// Em ambas: "À minha volta" (coisas que se veem agora) ou "De memória", e
// 3 ou 5 coisas por cor. Um círculo por cada coisa dita (toque).

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, FadeIn, ReduceMotion, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { ColorId, groundText } from '../data/groundText';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import KeepAwake from './KeepAwake';
import { Card, CardHeader, PrimaryButton, TopBackBar } from './ui';

export const COLOR_HEX: Record<ColorId, string> = {
  red: '#e5484d', orange: '#f08c2b', yellow: '#f2c418', green: '#46a758',
  blue: '#3b9eff', indigo: '#4c5fd5', violet: '#8e4ec6', pink: '#e93d82',
};
const RAINBOW: ColorId[] = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
const BALLOONS: ColorId[] = ['red', 'orange', 'yellow', 'green', 'blue', 'violet', 'pink'];

type Mode = 'around' | 'memory';
type GX = ReturnType<typeof groundText>;

// ---------- Peças partilhadas ----------
function Setup({ x, icon, title, mode, setMode, count, setCount, onStart }: {
  x: GX; icon: keyof typeof Ionicons.glyphMap; title: string;
  mode: Mode; setMode: (m: Mode) => void; count: number; setCount: (n: number) => void; onStart: () => void;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.md, gap: spacing.lg, flexGrow: 1 }}>
      <Card style={{ gap: spacing.md }}>
        <CardHeader icon={icon} title={title} />
        {([['around', x.around, x.aroundDesc, 'eye-outline'], ['memory', x.memory, x.memoryDesc, 'cloud-outline']] as const).map(([m, name, desc, ic]) => {
          const on = mode === m;
          return (
            <Pressable key={m} onPress={() => setMode(m)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primarySoft : 'transparent' }}>
              <Ionicons name={ic} size={22} color={on ? colors.primary : colors.textMuted} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: on ? colors.primary : colors.text }}>{name}</Text>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>{desc}</Text>
              </View>
            </Pressable>
          );
        })}
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14, marginTop: 4 }}>{x.howMany}</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {[3, 5].map((n) => {
            const on = count === n;
            return (
              <Pressable key={n} onPress={() => setCount(n)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primarySoft : 'transparent' }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: on ? colors.primary : colors.text }}>{n}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>
      <View style={{ flex: 1 }} />
      <PrimaryButton label={x.start} onPress={onStart} />
    </ScrollView>
  );
}

function CountDots({ n, value, color, onChange }: { n: number; value: number; color: string; onChange: (v: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
      {Array.from({ length: n }, (_, k) => {
        const on = k < value;
        return (
          <Pressable
            key={k}
            onPress={() => { Haptics.selectionAsync().catch(() => {}); onChange(on && k === value - 1 ? k : k + 1); }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            accessibilityLabel={String(k + 1)}
            hitSlop={6}
            style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: color, backgroundColor: on ? color : colors.card, alignItems: 'center', justifyContent: 'center' }}
          >
            {on ? <Ionicons name="checkmark" size={24} color="#ffffff" /> : <Text style={{ color: colors.textMuted, fontSize: 15, fontWeight: '700' }}>{k + 1}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

function Ideas({ x, id }: { x: GX; id: ColorId }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  return open ? (
    <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center', fontStyle: 'italic' }}>{x.colors[id].ideas}…</Text>
  ) : (
    <Pressable onPress={() => setOpen(true)} accessibilityRole="button" hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <Ionicons name="bulb-outline" size={15} color={colors.primary} />
      <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{x.ideas}</Text>
    </Pressable>
  );
}

function Done({ x, title, art, onAgain, onBack }: { x: GX; title: string; art: React.ReactNode; onAgain: () => void; onBack: () => void }) {
  const { colors } = useTheme();
  useEffect(() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); }, []);
  return (
    <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'center', gap: spacing.lg }}>
      <Card style={{ gap: spacing.md, alignItems: 'center', paddingVertical: spacing.xl }}>
        {art}
        <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' }}>{title}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center' }}>{x.doneBody}</Text>
      </Card>
      <PrimaryButton label={x.again} onPress={onAgain} />
      <Pressable onPress={onBack} accessibilityRole="button" style={{ alignItems: 'center', padding: 12 }}>
        <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>{x.back}</Text>
      </Pressable>
    </View>
  );
}

// ---------- Arco-íris ----------
function RainbowArc({ filled, current, width }: { filled: number; current: number; width: number }) {
  const { colors } = useTheme();
  const band = Math.max(10, Math.round(width / 22));
  const R = width / 2 - band / 2;
  const h = width / 2 + 4;
  return (
    <Svg width={width} height={h}>
      {RAINBOW.map((c, k) => {
        const r = R - k * band;
        const cx = width / 2;
        const cy = h - 2;
        const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
        const color = k < filled ? COLOR_HEX[c] : k === current ? COLOR_HEX[c] : colors.track;
        const opacity = k < filled ? 1 : k === current ? 0.35 : 1;
        return <Path key={c} d={d} stroke={color} strokeOpacity={opacity} strokeWidth={band - 2} fill="none" strokeLinecap="butt" />;
      })}
    </Svg>
  );
}

export function RainbowScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const x = groundText(lang);
  const { width } = useWindowDimensions();
  const [stage, setStage] = useState<'setup' | 'run' | 'done'>('setup');
  const [mode, setMode] = useState<Mode>('around');
  const [count, setCount] = useState(3);
  const [i, setI] = useState(0);
  const [got, setGot] = useState(0);

  const arcW = Math.min(width - spacing.xl * 2, 340);
  const start = () => { setI(0); setGot(0); setStage('run'); };
  const next = () => {
    if (i + 1 >= RAINBOW.length) { setStage('done'); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setI(i + 1);
    setGot(0);
  };
  const id = RAINBOW[i];
  const complete = got >= count;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={x.rb_title} onBack={onBack} info={x.rb_intro} />
      {stage === 'setup' && <Setup x={x} icon="color-palette-outline" title={x.rb_title} mode={mode} setMode={setMode} count={count} setCount={setCount} onStart={start} />}
      {stage === 'run' && (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.md, gap: spacing.lg, flexGrow: 1 }}>
          <KeepAwake />
          <View style={{ alignItems: 'center' }} accessible accessibilityLabel={x.colorOf.replace('{a}', String(i + 1)).replace('{b}', String(RAINBOW.length))}>
            <RainbowArc filled={i + (complete ? 1 : 0)} current={i} width={arcW} />
          </View>
          <Animated.View key={id} entering={FadeIn.duration(300).reduceMotion(ReduceMotion.System)} style={{ gap: spacing.md, alignItems: 'center' }}>
            <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '700' }}>{x.colorOf.replace('{a}', String(i + 1)).replace('{b}', String(RAINBOW.length))}</Text>
            <Text accessibilityRole="header" style={{ color: COLOR_HEX[id], fontSize: 34, fontWeight: '800', textAlign: 'center' }}>{x.colors[id].name}</Text>
            <Text style={{ color: colors.text, fontSize: 17, lineHeight: 25, textAlign: 'center' }}>
              {(mode === 'around' ? x.nameAround : x.nameMemory).replace('{n}', String(count))}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>{x.tapHint}</Text>
            <CountDots n={count} value={got} color={COLOR_HEX[id]} onChange={setGot} />
            <Ideas key={id} x={x} id={id} />
          </Animated.View>
          <View style={{ flex: 1 }} />
          <PrimaryButton label={i + 1 >= RAINBOW.length ? x.finish : x.nextColor} onPress={next} disabled={!complete} />
          <Pressable onPress={next} accessibilityRole="button" style={{ alignItems: 'center', padding: 8 }}>
            <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600' }}>{x.skip}</Text>
          </Pressable>
        </ScrollView>
      )}
      {stage === 'done' && <Done x={x} title={x.rb_done} art={<RainbowArc filled={7} current={-1} width={Math.min(arcW, 240)} />} onAgain={start} onBack={onBack} />}
    </View>
  );
}

// ---------- 7 balões ----------
function Balloon({ color, size }: { color: string; size: number }) {
  const w = size;
  const h = size * 1.25;
  return (
    <Svg width={w} height={h + size * 0.45}>
      <Ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 1} ry={h / 2 - 1} fill={color} />
      <Ellipse cx={w * 0.34} cy={h * 0.3} rx={w * 0.09} ry={h * 0.13} fill="#ffffff" opacity={0.35} />
      <Path d={`M ${w / 2 - 5} ${h + 3} L ${w / 2} ${h - 3} L ${w / 2 + 5} ${h + 3} Z`} fill={color} />
      <Path d={`M ${w / 2} ${h + 3} q ${-size * 0.08} ${size * 0.12} 0 ${size * 0.22} t 0 ${size * 0.2}`} stroke="#9aa5ad" strokeWidth={1.5} fill="none" />
    </Svg>
  );
}

// Balão a encher (cresce com cada coisa) e a voar quando se larga.
function FillingBalloon({ color, progress, flying, onFlown }: { color: string; progress: number; flying: boolean; onFlown: () => void }) {
  const reduced = useReducedMotion();
  const { height } = useWindowDimensions();
  const scale = useSharedValue(0.45);
  const y = useSharedValue(0);
  const sway = useSharedValue(0);
  const [landed, setLanded] = useState(false);
  useEffect(() => { if (landed) onFlown(); }, [landed, onFlown]);
  useEffect(() => {
    scale.set(withSpring(0.45 + 0.55 * progress, { damping: 14, stiffness: 140 }));
  }, [progress, scale]);
  useEffect(() => {
    if (!flying) return;
    const dur = reduced ? 1 : 1600; // "Reduzir movimento": sai logo, sem voo
    if (!reduced) sway.set(withTiming(1, { duration: dur, easing: Easing.inOut(Easing.sin) }));
    y.set(withTiming(-height, { duration: dur, easing: Easing.in(Easing.quad) }, (fin) => { if (fin) runOnJS(setLanded)(true); }));
  }, [flying, reduced, height, y, sway]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.get() }, { translateX: Math.sin(sway.get() * Math.PI * 2) * 18 }, { scale: scale.get() }],
  }));
  return (
    <Animated.View style={[{ alignItems: 'center' }, style]}>
      <Balloon color={color} size={150} />
    </Animated.View>
  );
}

export function BalloonsScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const x = groundText(lang);
  const [stage, setStage] = useState<'setup' | 'pick' | 'fill' | 'done'>('setup');
  const [mode, setMode] = useState<Mode>('around');
  const [count, setCount] = useState(3);
  const [flown, setFlown] = useState<ColorId[]>([]);
  const [cur, setCur] = useState<ColorId | null>(null);
  const [got, setGot] = useState(0);
  const [flying, setFlying] = useState(false);

  const start = () => { setFlown([]); setCur(null); setGot(0); setFlying(false); setStage('pick'); };
  const pick = (c: ColorId) => { Haptics.selectionAsync().catch(() => {}); setCur(c); setGot(0); setFlying(false); setStage('fill'); };
  const letGo = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); setFlying(true); };
  const onFlown = () => {
    if (!cur) return;
    const next = [...flown, cur];
    setFlown(next);
    setCur(null);
    setFlying(false);
    setStage(next.length >= BALLOONS.length ? 'done' : 'pick');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={x.bl_title} onBack={onBack} info={x.bl_intro} />
      {stage === 'setup' && <Setup x={x} icon="balloon-outline" title={x.bl_title} mode={mode} setMode={setMode} count={count} setCount={setCount} onStart={start} />}

      {stage === 'pick' && (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.md, gap: spacing.lg }}>
          <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' }}>{x.bl_pick}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>{flown.length} / {BALLOONS.length}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md }}>
            {BALLOONS.map((c) => {
              const gone = flown.includes(c);
              return (
                <Pressable
                  key={c}
                  disabled={gone}
                  onPress={() => pick(c)}
                  accessibilityRole="button"
                  accessibilityLabel={x.colors[c].name}
                  accessibilityState={{ disabled: gone }}
                  style={{ width: 84, alignItems: 'center', gap: 4, opacity: gone ? 0.25 : 1 }}
                >
                  {gone ? (
                    <View style={{ width: 64, height: 80 + 29, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="checkmark-circle" size={28} color={COLOR_HEX[c]} />
                    </View>
                  ) : (
                    <Balloon color={COLOR_HEX[c]} size={64} />
                  )}
                  <Text numberOfLines={1} style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>{x.colors[c].name}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}

      {stage === 'fill' && cur && (
        <View style={{ flex: 1, padding: spacing.xl, paddingTop: spacing.md, gap: spacing.md }}>
          <KeepAwake />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', overflow: 'visible' }}>
            <FillingBalloon color={COLOR_HEX[cur]} progress={Math.min(1, got / count)} flying={flying} onFlown={onFlown} />
          </View>
          <View style={{ gap: spacing.md, alignItems: 'center', opacity: flying ? 0.3 : 1 }}>
            <Text accessibilityRole="header" style={{ color: COLOR_HEX[cur], fontSize: 30, fontWeight: '800' }}>{x.colors[cur].name}</Text>
            <Text style={{ color: colors.text, fontSize: 16, lineHeight: 23, textAlign: 'center' }}>
              {(mode === 'around' ? x.nameAround : x.nameMemory).replace('{n}', String(count))}
            </Text>
            <CountDots n={count} value={got} color={COLOR_HEX[cur]} onChange={(v) => !flying && setGot(v)} />
            <Ideas key={cur} x={x} id={cur} />
          </View>
          <PrimaryButton label={x.bl_letGo} onPress={letGo} disabled={got < count || flying} />
          <Pressable onPress={() => setStage('pick')} disabled={flying} accessibilityRole="button" style={{ alignItems: 'center', padding: 8 }}>
            <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600' }}>{x.bl_back}</Text>
          </Pressable>
        </View>
      )}

      {stage === 'done' && (
        <Done
          x={x}
          title={x.bl_done}
          art={<View style={{ flexDirection: 'row', gap: 2 }}>{BALLOONS.map((c) => <Balloon key={c} color={COLOR_HEX[c]} size={30} />)}</View>}
          onAgain={start}
          onBack={onBack}
        />
      )}
    </View>
  );
}
