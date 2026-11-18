// Mapa de prática: colunas = semanas, linhas = dias (segunda → domingo).
// Quanto mais escuro, mais coisas foram feitas nesse dia. Toque num dia para
// ver a data e o número.

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius } from '../../theme/theme';

export default function Heatmap({ grid, weekdays, less, more, dayLabel }: {
  grid: ({ date: string; n: number } | null)[][];
  weekdays: string[];
  less: string;
  more: string;
  dayLabel: (iso: string, n: number) => string;
}) {
  const { colors } = useTheme();
  const [w, setW] = useState(0);
  const [sel, setSel] = useState<{ date: string; n: number } | null>(null);
  const LABEL = 30;
  const gap = 4;
  const cols = grid.length;
  const cell = cols ? Math.max(8, Math.min(22, (w - LABEL - gap * (cols - 1)) / cols)) : 0;
  const level = (n: number) => (n <= 0 ? 0 : n === 1 ? 0.45 : n === 2 ? 0.7 : n <= 4 ? 0.85 : 1);
  const bg = (n: number) => (n <= 0 ? colors.track : colors.primary);

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ gap: 8 }}>
      {w > 0 && (
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: LABEL, gap }}>
            {weekdays.map((d, i) => (
              <Text key={i} maxFontSizeMultiplier={1.2} style={{ height: cell, fontSize: 10, lineHeight: cell, color: colors.textMuted }}>{i % 2 === 0 ? d : ''}</Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap }}>
            {grid.map((col, ci) => (
              <View key={ci} style={{ gap }}>
                {col.map((c, ri) => (
                  <Pressable
                    key={ri}
                    disabled={!c}
                    onPress={() => setSel(sel?.date === c?.date ? null : c)}
                    accessibilityLabel={c ? dayLabel(c.date, c.n) : undefined}
                    style={{ width: cell, height: cell, borderRadius: 4, backgroundColor: c ? bg(c.n) : 'transparent', opacity: c && c.n > 0 ? level(c.n) : 1, borderWidth: sel && c && sel.date === c.date ? 2 : 0, borderColor: colors.text }}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
        <Text style={{ fontSize: 11, color: colors.textMuted, marginRight: 2 }}>{less}</Text>
        {[0, 1, 2, 3, 5].map((n) => (
          <View key={n} style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: bg(n), opacity: n > 0 ? level(n) : 1 }} />
        ))}
        <Text style={{ fontSize: 11, color: colors.textMuted, marginLeft: 2 }}>{more}</Text>
      </View>
      {sel && (
        <View style={{ alignSelf: 'flex-start', backgroundColor: colors.text, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Text style={{ color: colors.card, fontSize: 13, fontWeight: '600' }}>{dayLabel(sel.date, sel.n)}</Text>
        </View>
      )}
    </View>
  );
}
