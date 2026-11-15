// Peças de interface reutilizadas em vários ecrãs.

import { Ionicons } from '@expo/vector-icons';
import { useA11y } from '../lib/a11y';
import { ReactNode } from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import Animated, { ReduceMotion, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale, tapHaptic } from '../lib/motion';
import { HideNativeHeader, NATIVE_BAR_HEIGHT, NativeHeaderButtons, USE_NATIVE_HEADER } from './NativeHeader';
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
  return <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>{title}</Text>;
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
      <Text style={{ color: disabled ? colors.textMuted : '#ffffff', fontSize: 17, fontWeight: '600' }}>
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
          <Animated.Text entering={checkPop} style={{ color: '#ffffff', fontSize: 14, fontWeight: '700' }}>✓</Animated.Text>
        )}
      </View>
      <Text style={{ color: colors.text, fontSize: 16, flex: 1 }}>{label}</Text>
    </PressableScale>
  );
}

// Cabeçalho com botão "Voltar", usado nos ecrãs que abrem por cima
// (Definições e detalhe de cada Recurso).
// No iPhone, se houver um botão à direita (ex.: Histórico), o "Voltar" e esse
// botão vão para a barra de navegação nativa (ver NativeHeader.tsx: a zona da
// direita da barra nativa apanhava os toques); o título fica igual.
export function TopBackBar({ title, onBack, right }: { title: string; onBack: () => void; right?: ReactNode }) {
  const { colors } = useTheme();
  const a11y = useA11y();
  const insets = useSafeAreaInsets();
  const backButton = (
    <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel={a11y.back} style={{ padding: 8 }}>
      <Ionicons name="chevron-back" size={26} color={colors.text} />
    </Pressable>
  );
  const titleText = (
    <Text numberOfLines={1} accessibilityRole="header" style={{ color: colors.text, fontSize: 18, fontWeight: '700', flex: 1 }}>{title}</Text>
  );

  if (USE_NATIVE_HEADER && right) {
    return (
      <View style={{ paddingTop: insets.top, backgroundColor: colors.background }}>
        <NativeHeaderButtons left={backButton} right={<View style={{ paddingHorizontal: 6 }}>{right}</View>} />
        {/* Os botões estão na barra nativa por cima; aqui fica só o título, alinhado com eles. */}
        <View style={{ flexDirection: 'row', alignItems: 'center', height: NATIVE_BAR_HEIGHT, paddingLeft: 58, paddingRight: 64, marginBottom: spacing.sm }}>
          {titleText}
        </View>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colors.background }}>
      {/* Garante a barra nativa escondida (ex.: ao voltar de uma vista com botões nativos). */}
      <HideNativeHeader />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm }}>
        {backButton}
        {titleText}
        {right ? <View style={{ paddingRight: 8 }}>{right}</View> : null}
      </View>
    </View>
  );
}
