// Peças partilhadas pelos exercícios: tipos, datas, secção recolhível e
// a escala de desconforto (SUDS 0–10).

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/theme';

export type L = { pt: string; en: string };
export type Step = { id: string; label: string };

export function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function consecutiveDays(days: string[]): number {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(ymd(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (set.has(ymd(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// Secção recolhível reutilizável (fechada por defeito).
export function Collapsible({ title, icon, danger, children }: { title: string; icon: keyof typeof Ionicons.glyphMap; danger?: boolean; children: React.ReactNode }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const accent = danger ? colors.danger : colors.primary;
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
      <Pressable onPress={() => setOpen((o) => !o)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.lg }}>
        <Ionicons name={icon} size={20} color={accent} />
        <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>
      {open && <View style={{ padding: spacing.lg, paddingTop: 0, gap: spacing.sm }}>{children}</View>}
    </View>
  );
}

// Linha de seleção de 0 a 10 (escala SUDS).
export function Suds({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {Array.from({ length: 11 }, (_, v) => {
        const active = value === v;
        return (
          <Pressable
            key={v}
            onPress={() => onChange(v)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={{ width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.primary : colors.cardAlt, borderWidth: 2, borderColor: active ? colors.primary : colors.border }}
          >
            <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700' }}>{v}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---- Exercício de exposição gradual ----
// `selected` está no componente pai (ExercisesScreen) para que o botão de voltar
// de cima regresse à escada e não ao menu dos exercícios.
