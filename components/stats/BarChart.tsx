// Gráfico de barras simples (um valor inteiro por dia), com toque para ver o
// valor. Usado em "Dias sem comportamentos".

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius } from '../../theme/theme';

const H = 150;
const BOTTOM = 22;

export default function BarChart({ values, xLabels, slotLabel, color }: {
  values: number[];
  xLabels: { i: number; text: string; strong?: boolean }[];
  slotLabel: (i: number) => string;
  color: string;
}) {
  const { colors } = useTheme();
  const [w, setW] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const max = Math.max(1, ...values);
  const n = values.length;
  const slot = n ? w / n : 0;
  const barW = Math.max(2, Math.min(22, slot * 0.6));
  const plotH = H - BOTTOM - 8;

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: H }}>
      {w > 0 && (
        <>
          <View style={{ position: 'absolute', left: 0, right: 0, top: H - BOTTOM, height: 1, backgroundColor: colors.border }} />
          {values.map((v, i) => (
            <View key={i} style={{ position: 'absolute', left: i * slot + (slot - barW) / 2, width: barW, bottom: BOTTOM, height: v ? Math.max(4, (v / max) * plotH) : 0, borderRadius: 4, backgroundColor: color, opacity: sel === null || sel === i ? 1 : 0.4 }} />
          ))}
          {xLabels.map((l) => (
            <Text key={l.i} numberOfLines={1} style={{ position: 'absolute', top: H - BOTTOM + 5, left: l.i * slot + slot / 2 - 24, width: 48, textAlign: 'center', fontSize: 11, color: l.strong ? colors.primary : colors.textMuted, fontWeight: l.strong ? '700' : '400' }}>{l.text}</Text>
          ))}
          <Pressable
            onPress={(e) => { const i = Math.min(n - 1, Math.max(0, Math.floor(e.nativeEvent.locationX / slot))); setSel(sel === i ? null : i); }}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: BOTTOM }}
            accessibilityRole="adjustable"
          />
          {sel !== null && (
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: Math.min(Math.max(sel * slot + slot / 2 - 60, 0), Math.max(0, w - 120)), width: 120, backgroundColor: colors.text, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text numberOfLines={1} style={{ color: colors.card, fontSize: 11, opacity: 0.8 }}>{slotLabel(sel)}</Text>
              <Text style={{ color: colors.card, fontSize: 13, fontWeight: '700' }}>{values[sel]}</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}
