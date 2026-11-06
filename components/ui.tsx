// Peças de interface reutilizadas em vários ecrãs.

import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useRef } from 'react';
import { PanResponder, Pressable, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';

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
    <Pressable
      onPress={onPress}
      disabled={disabled}
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
    </Pressable>
  );
}

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
    <Pressable
      onPress={onPress}
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
        {selected && <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700' }}>✓</Text>}
      </View>
      <Text style={{ color: colors.text, fontSize: 16, flex: 1 }}>{label}</Text>
    </Pressable>
  );
}

// Cabeçalho com botão "Voltar", usado nos ecrãs que abrem por cima
// (Definições e detalhe de cada Recurso).
export function TopBackBar({ title, onBack, right }: { title: string; onBack: () => void; right?: ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm }}>
        <Pressable onPress={onBack} hitSlop={12} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text numberOfLines={1} style={{ color: colors.text, fontSize: 18, fontWeight: '700', flex: 1 }}>{title}</Text>
        {right ? <View style={{ paddingRight: 8 }}>{right}</View> : null}
      </View>
    </View>
  );
}


// Deteta um deslize a partir da margem esquerda e chama onBack.
// Versão leve (sem transição interativa) — não precisa de bibliotecas.
export function SwipeBack({ onBack, children }: { onBack: () => void; children: ReactNode }) {
  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, g) => {
        const startX = g.moveX - g.dx; // x onde o dedo começou
        return startX < 32 && g.dx > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5;
      },
      onPanResponderRelease: (_evt, g) => {
        if (g.dx > 80) onBack();
      },
    })
  ).current;
  return (
    <View style={{ flex: 1 }} {...responder.panHandlers}>
      {children}
    </View>
  );
}
