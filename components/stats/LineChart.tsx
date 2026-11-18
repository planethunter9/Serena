// Gráfico de linhas das Estatísticas.
// - Uma ou mais séries sobre `n` posições no eixo X (dias ou sessões).
// - Linha na cor da série; os pontos podem ser coloridos pelo valor.
// - Linha da média tracejada (opcional).
// - Toque no gráfico: mostra o valor do ponto mais próximo num balão.
// - Os textos dos eixos são <Text> da app (mesma letra do resto da app).

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Stop } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { radius } from '../../theme/theme';

export type LinePoint = { i: number; v: number };
export type Series = { color: string; points: LinePoint[]; label?: string; fill?: boolean; dotColor?: (v: number) => string };

const H = 170;
const BOTTOM = 22;
const TOP = 14;
const PAD_X = 10;

// Linhas retas entre pontos (sem curvas que passem acima/abaixo dos valores reais).
function smooth(ps: { x: number; y: number }[]) {
  if (ps.length < 2) return '';
  return ps.map((p, i) => `${i ? 'L' : 'M'} ${p.x},${p.y}`).join(' ');
}

export default function LineChart({
  series, n, yMin, yMax, yTicks, xLabels, avg, format, slotLabel, tickFormat, leftW = 30,
}: {
  series: Series[];
  n: number;
  yMin: number;
  yMax: number;
  yTicks: number[];
  xLabels: { i: number; text: string; strong?: boolean }[];
  avg?: number | null;
  format: (v: number) => string;
  slotLabel: (i: number) => string;
  tickFormat?: (v: number) => string;
  leftW?: number;
}) {
  const LEFT = leftW;
  const { colors } = useTheme();
  const [w, setW] = useState(0);
  const [sel, setSel] = useState<number | null>(null);

  const plotW = Math.max(0, w - LEFT);
  const xAt = (i: number) => LEFT + PAD_X + (n <= 1 ? (plotW - PAD_X * 2) / 2 : (i / (n - 1)) * (plotW - PAD_X * 2));
  const yAt = (v: number) => TOP + (1 - (v - yMin) / (yMax - yMin)) * (H - TOP - BOTTOM);
  const allIdx = Array.from(new Set(series.flatMap((s) => s.points.map((p) => p.i)))).sort((a, b) => a - b);
  const dense = n > 31;

  function onPress(x: number) {
    if (!allIdx.length) return;
    let best = allIdx[0];
    for (const i of allIdx) if (Math.abs(xAt(i) - x) < Math.abs(xAt(best) - x)) best = i;
    setSel(sel === best ? null : best);
  }

  const selVals = sel === null ? [] : series.map((s) => ({ s, p: s.points.find((p) => p.i === sel) })).filter((x) => x.p);
  const tipLeft = sel === null ? 0 : Math.min(Math.max(xAt(sel) - 70, 0), Math.max(0, w - 140));

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: H }}>
      {w > 0 && (
        <>
          <Svg width={w} height={H}>
            <Defs>
              {series.map((s, si) => (
                <LinearGradient key={si} id={`lg${si}`} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={s.color} stopOpacity={0.22} />
                  <Stop offset="1" stopColor={s.color} stopOpacity={0} />
                </LinearGradient>
              ))}
            </Defs>
            {yTicks.map((v) => (
              <Line key={v} x1={LEFT} y1={yAt(v)} x2={w - 4} y2={yAt(v)} stroke={colors.border} strokeWidth={1} strokeDasharray={v === yMin ? undefined : '2 5'} opacity={v === yMin ? 0.8 : 0.5} />
            ))}
            {typeof avg === 'number' && (
              <Line x1={LEFT} y1={yAt(avg)} x2={w - 4} y2={yAt(avg)} stroke={colors.textMuted} strokeWidth={1.2} strokeDasharray="6 4" opacity={0.7} />
            )}
            {sel !== null && <Line x1={xAt(sel)} y1={TOP - 4} x2={xAt(sel)} y2={H - BOTTOM} stroke={colors.textMuted} strokeWidth={1} opacity={0.5} />}
            {series.map((s, si) => {
              const ps = s.points.map((p) => ({ x: xAt(p.i), y: yAt(p.v) }));
              return (
                <G key={si}>
                  {s.fill && ps.length > 1 && <Path d={`${smooth(ps)} L ${ps[ps.length - 1].x},${yAt(yMin)} L ${ps[0].x},${yAt(yMin)} Z`} fill={`url(#lg${si})`} />}
                  {ps.length > 1 && <Path d={smooth(ps)} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
                  {s.points.map((p, k) => {
                    const on = p.i === sel;
                    if (dense && !on && k !== s.points.length - 1) return null;
                    return <Circle key={k} cx={xAt(p.i)} cy={yAt(p.v)} r={on ? 6 : 4} fill={colors.card} stroke={s.dotColor ? s.dotColor(p.v) : s.color} strokeWidth={on ? 3 : 2.5} />;
                  })}
                </G>
              );
            })}
          </Svg>
          {/* Eixo Y */}
          {yTicks.map((v) => (
            <Text key={'y' + v} maxFontSizeMultiplier={1.3} style={{ position: 'absolute', left: 0, width: LEFT - 6, top: yAt(v) - 7, textAlign: 'right', fontSize: 11, color: colors.textMuted, fontVariant: ['tabular-nums'] }}>{(tickFormat ?? String)(v)}</Text>
          ))}
          {/* Eixo X */}
          {xLabels.map((l) => (
            <Text key={'x' + l.i} numberOfLines={1} maxFontSizeMultiplier={1.3} style={{ position: 'absolute', top: H - BOTTOM + 5, left: xAt(l.i) - 24, width: 48, textAlign: 'center', fontSize: 11, color: l.strong ? colors.primary : colors.textMuted, fontWeight: l.strong ? '700' : '400' }}>{l.text}</Text>
          ))}
          {/* Toque */}
          <Pressable onPress={(e) => onPress(e.nativeEvent.locationX)} style={{ position: 'absolute', left: LEFT, top: 0, right: 0, bottom: BOTTOM }} accessibilityRole="adjustable" />
          {sel !== null && selVals.length > 0 && (
            <View pointerEvents="none" style={{ position: 'absolute', top: -6, left: tipLeft, width: 140, backgroundColor: colors.text, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text numberOfLines={1} style={{ color: colors.card, fontSize: 11, opacity: 0.8 }}>{slotLabel(sel)}</Text>
              {selVals.map(({ s, p }, k) => (
                <Text key={k} numberOfLines={1} style={{ color: colors.card, fontSize: 13, fontWeight: '700' }}>
                  {s.label ? `${s.label}: ` : ''}{format(p!.v)}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}
