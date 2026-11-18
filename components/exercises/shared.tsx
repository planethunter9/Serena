// Peças partilhadas pelos exercícios: tipos, datas, secção recolhível e
// a escala de desconforto (SUDS 0–10).

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PROB_STEPS } from '../../data/exposureText';
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
            <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: '700' }}>{v}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---- Exercício de exposição gradual ----
// `selected` está no componente pai (ExercisesScreen) para que o botão de voltar
// de cima regresse à escada e não ao menu dos exercícios.

// Passos numerados no topo (1 — 2 — 3 …), usados na Exposição, nas
// Experiências e no Desconstruir pensamentos.
export function Stepper({ labels, current, done }: { labels: string[]; current: number; done?: boolean }) {
  const { colors } = useTheme();
  const last = labels.length - 1;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }} accessible accessibilityLabel={`${Math.min(current, last) + 1}/${labels.length} · ${labels[Math.min(current, last)]}`}>
      {labels.map((l, i) => {
        const isDone = i < current || !!done;
        const on = i === current && !done;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              <View style={{ flex: 1, height: 2, backgroundColor: i === 0 ? 'transparent' : i <= current || done ? colors.primary : colors.border }} />
              <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: isDone || on ? colors.primary : colors.card, borderWidth: 2, borderColor: isDone || on ? colors.primary : colors.border }}>
                {isDone ? <Ionicons name="checkmark" size={16} color={colors.onPrimary} /> : <Text style={{ color: on ? colors.onPrimary : colors.textMuted, fontSize: 13, fontWeight: '700' }}>{i + 1}</Text>}
              </View>
              <View style={{ flex: 1, height: 2, backgroundColor: i === last ? 'transparent' : i < current || done ? colors.primary : colors.border }} />
            </View>
            <Text numberOfLines={1} maxFontSizeMultiplier={1.4} style={{ color: on ? colors.primary : colors.textMuted, fontSize: 12, fontWeight: on ? '700' : '500' }}>{l}</Text>
          </View>
        );
      })}
    </View>
  );
}

// Medidor de probabilidade 0–100%: barra de segmentos tocáveis + número grande.
export function ProbMeter({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: value === null ? colors.textMuted : colors.text, fontSize: 32, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
        {value === null ? '–' : `${value}%`}
      </Text>
      <View style={{ flexDirection: 'row', gap: 3, height: 34 }}>
        {PROB_STEPS.map((v) => {
          const filled = value !== null && v <= value;
          return (
            <Pressable
              key={v}
              onPress={() => { Haptics.selectionAsync().catch(() => {}); onChange(v); }}
              accessibilityRole="adjustable"
              accessibilityLabel={`${v}%`}
              accessibilityState={{ selected: value === v }}
              hitSlop={{ top: 8, bottom: 8 }}
              style={{ flex: 1, borderRadius: 4, backgroundColor: filled ? colors.primary : colors.track, opacity: filled ? 0.35 + (0.65 * v) / 100 : 1 }}
            />
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>0%</Text>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>50%</Text>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>100%</Text>
      </View>
    </View>
  );
}
