// Seletor de gráfico: o título do cartão é um botão ("Nome ▾") que abre uma
// folha com todos os gráficos, cada um com ícone e uma frase a explicar.

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/theme';

export type ChartOption<T extends string> = { id: T; icon: keyof typeof Ionicons.glyphMap; name: string; desc: string };

export default function ChartPicker<T extends string>({ value, options, onChange, title }: {
  value: T;
  options: ChartOption<T>[];
  onChange: (v: T) => void;
  title: string;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const cur = options.find((o) => o.id === value) ?? options[0];

  return (
    <>
      <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityHint={title} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={cur.icon} size={18} color={colors.primary} />
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, flexShrink: 1 }}>{cur.name}</Text>
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="chevron-down" size={15} color={colors.primary} />
        </View>
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} accessibilityRole="button" accessibilityLabel={title} />
        <View style={{ backgroundColor: colors.background, borderTopLeftRadius: radius.lg * 1.5, borderTopRightRadius: radius.lg * 1.5, paddingTop: spacing.md, paddingBottom: insets.bottom + spacing.lg, maxHeight: '80%' }}>
          <View style={{ alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: spacing.md }} />
          <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 17, fontWeight: '700', paddingHorizontal: spacing.xl, marginBottom: spacing.sm }}>{title}</Text>
          <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.sm }}>
            {options.map((o) => {
              const on = o.id === value;
              return (
                <Pressable
                  key={o.id}
                  onPress={() => { onChange(o.id); setOpen(false); }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: on ? 2 : 1, borderColor: on ? colors.primary : colors.border }}
                >
                  <View style={{ width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={o.icon} size={19} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{o.name}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 17 }}>{o.desc}</Text>
                  </View>
                  {on && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
