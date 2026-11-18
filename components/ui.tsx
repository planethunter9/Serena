// Peças de interface reutilizadas em vários ecrãs.

import InfoButton from './InfoButton';
import { Ionicons } from '@expo/vector-icons';
import { useA11y } from '../lib/a11y';
import { ReactNode } from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import Animated, { ReduceMotion, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale, tapHaptic } from '../lib/motion';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';

// "Pop" do visto ao marcar uma opção.
export const checkPop = ZoomIn.springify().damping(12).stiffness(260).reduceMotion(ReduceMotion.System);

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function ScreenTitle({ title }: { title: string }) {
  const { colors } = useTheme();
  return <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700' }}>{title}</Text>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={{
        backgroundColor: disabled ? colors.track : colors.primary,
        padding: 18,
        borderRadius: radius.lg,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: disabled ? colors.textMuted : colors.onPrimary, fontSize: 17, fontWeight: '600' }}>
        {label}
      </Text>
    </PressableScale>
  );
}

// Opção de escolha múltipla: encolhe ao toque, vibra levemente e o visto
// aparece com um pequeno "pop".
export function OptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={() => { tapHaptic(); onPress(); }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: radius.md,
        backgroundColor: selected ? colors.primarySoft : colors.card,
        borderWidth: 2,
        borderColor: selected ? colors.primary : colors.border,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && (
          <Animated.Text entering={checkPop} style={{ color: colors.onPrimary, fontSize: 14, fontWeight: '700' }}>✓</Animated.Text>
        )}
      </View>
      <Text style={{ color: colors.text, fontSize: 16, flex: 1 }}>{label}</Text>
    </PressableScale>
  );
}

// Cabeçalho com botão "Voltar", usado nos ecrãs que abrem por cima
// (Definições e detalhe de cada Recurso).
// `info`: texto explicativo mostrado num balão ao tocar no "i" junto ao título.
export function TopBackBar({ title, onBack, right, info }: { title: string; onBack: () => void; right?: ReactNode; info?: string }) {
  const { colors } = useTheme();
  const a11y = useA11y();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm }}>
        <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel={a11y.back} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text numberOfLines={1} accessibilityRole="header" style={{ color: colors.text, fontSize: 18, fontWeight: '700', flexShrink: 1 }}>{title}</Text>
        {info ? <InfoButton text={info} title={title} /> : null}
        <View style={{ flex: 1 }} />
        {right ? <View style={{ paddingRight: 8 }}>{right}</View> : null}
      </View>
    </View>
  );
}

// Seletor pequeno (segmentado), usado dentro dos cartões — o mesmo dos pilares
// na Visão geral. Use-o em vez de criar seletores próprios em cada ecrã.
export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.cardAlt, borderRadius: 999, padding: 3 }}>
      {options.map(([v, label]) => {
        const active = value === v;
        return (
          <Pressable key={v} onPress={() => onChange(v)} accessibilityRole="button" accessibilityState={{ selected: active }} style={{ flex: 1, paddingVertical: 7, borderRadius: 999, alignItems: 'center', backgroundColor: active ? colors.card : 'transparent' }}>
            <Text numberOfLines={1} maxFontSizeMultiplier={1.4} style={{ color: active ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 12 }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Cabeçalho de cartão — ícone azul + título (+ algo à direita, opcional).
// É o padrão de toda a app: use-o no topo de cada Card com título.
export function CardHeader({ icon, title, right }: { icon: keyof typeof Ionicons.glyphMap; title: string; right?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, flex: 1 }}>{title}</Text>
      {right}
    </View>
  );
}
