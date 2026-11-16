// "Estatísticas" (segundo separador do Início): no mesmo estilo da Visão geral —
// cartões com cabeçalho (ícone + título) e seletores pequenos lá dentro.
// Cartão "Resumo" (Geral/Semana + 4 indicadores) e cartão dos gráficos
// (ansiedade por semana, gravidade, exposições, comportamentos largados).

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { useLang , tr2 } from '../i18n/i18n';
import {
  ActCommitment,
  AttackEntry,
  DroppedBehavior,
  ExerciseLogEntry,
  ExperimentEntry,
  ExposureSession,
  isoLocal,
  loadActCommitments,
  loadAttacks,
  loadChallengesDone,
  loadDropped,
  loadExerciseLog,
  loadExperiments,
  loadExposureDays,
  loadExposureSessions,
  loadMemorySessions,
  loadSeverity,
  loadThoughtRecords,
  MemorySession,
  SeverityEntry,
  ThoughtRecord,
} from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import EmptyState from './EmptyState';
import { Card, CardHeader, Segmented } from './ui';

function expStreakOf(days: string[]): number {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(isoLocal(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(isoLocal(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

// Dias da semana (abreviados) em todas as línguas da app.
const WEEKDAYS_BY_LANG: Record<string, string[]> = {
  pt: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  'pt-BR': ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  es: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  it: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
  nl: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'],
  pl: ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
};

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  // Cor por nível (0–5): verde baixo, amarelo médio, vermelho alto — do tema.
  const valueColor = (v: number) => (v >= 3.5 ? colors.chartHigh : v >= 2 ? colors.chartMid : colors.chartLow);

  const [severity, setSeverity] = useState<SeverityEntry[]>([]);
  const [exposures, setExposures] = useState<ExposureSession[]>([]);
  const [attacks, setAttacks] = useState<AttackEntry[]>([]);
  const [expDays, setExpDays] = useState<string[]>([]);
  const [dropped, setDropped] = useState<DroppedBehavior[]>([]);
  const [thoughts, setThoughts] = useState<ThoughtRecord[]>([]);
  const [experiments, setExperiments] = useState<ExperimentEntry[]>([]);
  const [memories, setMemories] = useState<MemorySession[]>([]);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [commitments, setCommitments] = useState<ActCommitment[]>([]);
  const [exerciseLog, setExerciseLog] = useState<ExerciseLogEntry[]>([]);
  const [statScope, setStatScope] = useState<'all' | 'week'>('all');
  const [chartView, setChartView] = useState<'anxiety' | 'severity' | 'exposures' | 'dropped'>('anxiety');
  const [chartW, setChartW] = useState(0);
  const fearScrollRef = useRef<any>(null); // ScrollView; tipado como any p/ aceder a scrollToEnd (tipos do SDK 58)

  useEffect(() => {
    loadSeverity().then(setSeverity);
    loadExposureSessions().then(setExposures);
    loadAttacks().then(setAttacks);
    loadExposureDays().then(setExpDays);
    loadDropped().then(setDropped);
    loadThoughtRecords().then(setThoughts);
    loadExperiments().then(setExperiments);
    loadMemorySessions().then(setMemories);
    loadChallengesDone().then(setChallenges);
    loadActCommitments().then(setCommitments);
    loadExerciseLog().then(setExerciseLog);
  }, []);

  // Todas as datas de exercícios feitos (para contar "exercícios no geral").
  const allExerciseDates = [
    ...exposures.map((e) => e.date),
    ...thoughts.map((r) => r.date),
    ...experiments.map((x) => x.date),
    ...memories.map((m) => m.date),
    ...challenges.map((k) => k.split(':')[0]),
    ...commitments.flatMap((c) => c.logs),
    ...exerciseLog.map((e) => e.date),
  ];

  const expStreak = expStreakOf(expDays);
  const totalExpDays = expDays.length;

  const journeyMsg =
    totalExpDays >= 7 ? L('Estás a ganhar ritmo a sério.', 'You are building real momentum.')
    : totalExpDays >= 2 ? L('Estás a construir o teu hábito.', 'You are building your habit.')
    : L('Cada pequeno passo conta. Começa por um.', 'Every small step counts. Start with one.');

  // --- Alívio nas exposições (antes → depois) — usa dados que existem de facto ---
  const expRel = exposures.filter((e) => typeof e.before === 'number' && typeof e.after === 'number');
  const relBefore = expRel.length ? expRel.reduce((s, e) => s + e.before, 0) / expRel.length : 0;
  const relAfter = expRel.length ? expRel.reduce((s, e) => s + e.after, 0) / expRel.length : 0;
  const reliefPct = relBefore > 0 ? Math.max(0, Math.round(((relBefore - relAfter) / relBefore) * 100)) : 0;

  // --- A tua semana (segunda a domingo) ---
  const nowW = new Date();
  const dowW = (nowW.getDay() + 6) % 7;
  const mondayW = new Date(nowW.getFullYear(), nowW.getMonth(), nowW.getDate() - dowW);
  const weekSet = new Set(Array.from({ length: 7 }, (_, d) => isoLocal(new Date(mondayW.getFullYear(), mondayW.getMonth(), mondayW.getDate() + d))));
  // Os mesmos 4 cartões das estatísticas, mas só com o que aconteceu esta semana.
  const expWeek = exposures.filter((e) => weekSet.has(e.date));
  const expRelWeek = expWeek.filter((e) => typeof e.before === 'number' && typeof e.after === 'number');
  const relBeforeWeek = expRelWeek.length ? expRelWeek.reduce((s, e) => s + e.before, 0) / expRelWeek.length : 0;
  const relAfterWeek = expRelWeek.length ? expRelWeek.reduce((s, e) => s + e.after, 0) / expRelWeek.length : 0;
  const reliefPctWeek = relBeforeWeek > 0 ? Math.max(0, Math.round(((relBeforeWeek - relAfterWeek) / relBeforeWeek) * 100)) : 0;
  const practiceDaysWeek = expDays.filter((d) => weekSet.has(d)).length;
  const droppedWeek = dropped.filter((d) => weekSet.has(d.date)).length;
  const exercisesTotal = allExerciseDates.length;
  const exercisesWeek = allExerciseDates.filter((d) => weekSet.has(d)).length;

  // 4 cartões — mesmos indicadores, mudam conforme o âmbito escolhido (Geral / Semana).
  const statsAll = [
    { icon: 'trending-down-outline' as const, value: expRel.length ? `${reliefPct}%` : '—', label: L('alívio nas exposições', 'relief in exposures'), sub: expRel.length ? `${relBefore.toFixed(1)} → ${relAfter.toFixed(1)} /10` : L('faz uma exposição', 'do an exposure'), color: colors.success },
    { icon: 'flame-outline' as const, value: `${expStreak}`, label: L('dias seguidos', 'days in a row'), sub: L(`${totalExpDays} no total`, `${totalExpDays} total`), color: colors.primary, highlight: true },
    { icon: 'barbell-outline' as const, value: `${exercisesTotal}`, label: L('exercícios feitos', 'exercises done'), sub: L(`${exposures.length} de exposição`, `${exposures.length} exposure`), color: colors.primary },
    { icon: 'leaf-outline' as const, value: `${dropped.length}`, label: L('comportamentos largados', 'behaviours dropped'), sub: L('que já não alimentam o medo', 'no longer feeding the fear'), color: colors.success },
  ];
  const statsWeek = [
    { icon: 'trending-down-outline' as const, value: expRelWeek.length ? `${reliefPctWeek}%` : '—', label: L('alívio nas exposições', 'relief in exposures'), sub: expRelWeek.length ? `${relBeforeWeek.toFixed(1)} → ${relAfterWeek.toFixed(1)} /10` : L('faz uma exposição', 'do an exposure'), color: colors.success },
    { icon: 'flame-outline' as const, value: `${practiceDaysWeek}`, label: L('dias de prática', 'practice days'), sub: L('esta semana', 'this week'), color: colors.primary, highlight: true },
    { icon: 'barbell-outline' as const, value: `${exercisesWeek}`, label: L('exercícios feitos', 'exercises done'), sub: L('esta semana', 'this week'), color: colors.primary },
    { icon: 'leaf-outline' as const, value: `${droppedWeek}`, label: L('comportamentos largados', 'behaviours dropped'), sub: L('esta semana', 'this week'), color: colors.success },
  ];
  const stats = statScope === 'week' ? statsWeek : statsAll;

  // --- Gráficos ---
  const CHART_HEIGHT = 156;
  const AX_LEFT = 26;
  const AX_BOTTOM = 24;
  const PAD = 12;
  const PAD_X = 14;
  const WEEKS = 12;
  const plotH = CHART_HEIGHT - AX_BOTTOM;
  const yAt = (v: number) => plotH - PAD - (v / 5) * (plotH - PAD * 2);
  const dmShort = (iso: string) => { const p = iso.split('-'); return `${p[2]}/${p[1]}`; };
  const WEEKDAYS = WEEKDAYS_BY_LANG[lang] ?? WEEKDAYS_BY_LANG.en;

  // Intensidade por dia (0–5): registos de medo, desconforto da exposição (SUDS 0–10 → 0–5)
  // e ataques (puxam para cima). Dia sem dados = sem ponto.
  const fearFor = (d: string): number | null => {
    const cands: number[] = severity.filter((e) => e.date === d).map((e) => e.value);
    exposures.filter((e) => e.date === d).forEach((e) => cands.push((typeof e.peak === 'number' ? e.peak : e.before) / 2));
    if (attacks.some((a) => a.date === d)) cands.push(4);
    return cands.length ? Math.min(5, Math.max(...cands)) : null;
  };

  const nowD = new Date();
  const dow = (nowD.getDay() + 6) % 7;
  const monday = new Date(nowD.getFullYear(), nowD.getMonth(), nowD.getDate() - dow);
  const weeks: string[][] = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    const wk: string[] = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() - w * 7 + d);
      wk.push(isoLocal(dt));
    }
    weeks.push(wk);
  }
  const allFearVals = weeks.flat().map(fearFor).filter((v): v is number => v !== null);
  const avg = allFearVals.length ? allFearVals.reduce((s, v) => s + v, 0) / allFearVals.length : 0;

  // Variação da ansiedade desta semana face à anterior (negativo = desceu = bom).
  const weekAvg = (wk: string[]): number | null => {
    const vals = wk.map(fearFor).filter((v): v is number => v !== null);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  };
  const thisWeekAvg = weeks.length ? weekAvg(weeks[weeks.length - 1]) : null;
  const lastWeekAvg = weeks.length > 1 ? weekAvg(weeks[weeks.length - 2]) : null;
  const weekPct =
    thisWeekAvg !== null && lastWeekAvg !== null && lastWeekAvg > 0
      ? Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100)
      : null;

  const visibleW = Math.max(0, chartW - AX_LEFT);
  const innerW = Math.max(0, visibleW - PAD_X * 2);
  const xAt = (j: number) => PAD_X + (innerW / 6) * j;

  const smoothLine = (ps: { x: number; y: number }[]) => {
    if (ps.length < 2) return '';
    let d = `M ${ps[0].x},${ps[0].y}`;
    for (let i = 0; i < ps.length - 1; i++) {
      const p0 = ps[i - 1] || ps[i];
      const p1 = ps[i];
      const p2 = ps[i + 1];
      const p3 = ps[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
    }
    return d;
  };
  const smoothArea = (ps: { x: number; y: number }[], baseY: number) => {
    if (ps.length < 2) return '';
    return `${smoothLine(ps)} L ${ps[ps.length - 1].x},${baseY} L ${ps[0].x},${baseY} Z`;
  };


  const chartTitle = chartView === 'anxiety' ? L('Ansiedade ao longo do tempo', 'Anxiety over time')
    : chartView === 'severity' ? L('Gravidade da fobia ao longo do tempo', 'Phobia severity over time')
    : chartView === 'exposures' ? L('Exposições: desconforto antes vs depois', 'Exposures: distress before vs after')
    : L('Comportamentos que estás a largar', 'Behaviours you are dropping');

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.lg, gap: spacing.lg, paddingBottom: 120 }}>
      {/* Resumo: Geral / Semana + 4 indicadores */}
      <Card style={{ gap: spacing.md }}>
        <CardHeader icon="stats-chart-outline" title={L('Resumo', 'Summary')} />
        <Segmented value={statScope} onChange={setStatScope} options={[['all', L('Geral', 'Overall')], ['week', L('Semana', 'This week')]]} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.sm }}>
          {stats.map((s) => (
            <View key={s.label} style={{ width: '48.5%', backgroundColor: colors.cardAlt, borderRadius: radius.md, padding: spacing.md, gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name={s.icon} size={15} color={s.color} />
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{s.value}</Text>
              </View>
              <Text style={{ color: colors.text, fontSize: 13 }}>{s.label}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{s.sub}</Text>
            </View>
          ))}
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
          <Ionicons name="leaf-outline" size={13} color={colors.primary} /> {journeyMsg}
        </Text>
      </Card>

      {/* Gráficos */}
      <Card style={{ gap: spacing.md }}>
        <CardHeader
          icon="analytics-outline"
          title={chartTitle}
          right={chartView === 'dropped' && dropped.length > 0 ? (
            <View style={{ backgroundColor: colors.successSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ color: colors.success, fontWeight: '700', fontSize: 13 }}>{dropped.length}</Text>
            </View>
          ) : undefined}
        />
        <Segmented
          value={chartView}
          onChange={setChartView}
          options={[['anxiety', L('Ansiedade', 'Anxiety')], ['severity', L('Gravidade', 'Severity')], ['exposures', L('Exposições', 'Exposures')], ['dropped', L('Largados', 'Dropped')]]}
        />
        {chartView === 'anxiety' ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{L('Intensidade diária (0–5) · média', 'Daily intensity (0–5) · average')} {avg.toFixed(1)}/5</Text>
              </View>
              {weekPct !== null && (() => {
                const c = weekPct < 0 ? colors.success : weekPct > 0 ? colors.danger : colors.textMuted;
                const icon = weekPct < 0 ? 'arrow-down' : weekPct > 0 ? 'arrow-up' : 'remove';
                return (
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.cardAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
                      <Ionicons name={icon as any} size={13} color={c} />
                      <Text style={{ color: c, fontWeight: '600', fontSize: 13 }}>{Math.abs(weekPct)}%</Text>
                    </View>
                    <Text style={{ color: colors.textMuted, fontSize: 10 }}>{L('vs. semana passada', 'vs. last week')}</Text>
                  </View>
                );
              })()}
            </View>
            {allFearVals.length === 0 ? (
              <EmptyState compact icon="pulse-outline" title={t('progress.chartEmpty')} />
            ) : (
              <View onLayout={(e) => setChartW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', height: CHART_HEIGHT + 24, alignItems: 'flex-start' }}>
                <Svg width={AX_LEFT} height={CHART_HEIGHT}>
                  {[0, 1, 2, 3, 4, 5].map((v) => (
                    <SvgText key={'y' + v} x={AX_LEFT - 6} y={yAt(v) + 3} fontSize={11} fill={colors.textMuted} textAnchor="end">{String(v)}</SvgText>
                  ))}
                </Svg>
                {chartW > 0 && (
                  <ScrollView
                    ref={fearScrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={{ width: visibleW, height: CHART_HEIGHT + 24 }}
                    onContentSizeChange={() => fearScrollRef.current?.scrollToEnd({ animated: false })}
                  >
                    {weeks.map((wk, wi) => {
                      const pts = wk
                        .map((d, j) => { const v = fearFor(d); return v === null ? null : { x: xAt(j), y: yAt(v), v }; })
                        .filter((p): p is { x: number; y: number; v: number } => p !== null);
                      const baseY = yAt(0);
                      const line = smoothLine(pts);
                      const area = smoothArea(pts, baseY);
                      const last = pts[pts.length - 1];
                      const gid = `fearGrad${wi}`;
                      const lineGid = `fearLine${wi}`;
                      const todayIso = isoLocal();
                      const range = `${dmShort(wk[0])} – ${dmShort(wk[6])}`;
                      return (
                        <View key={wi} style={{ width: visibleW }}>
                          <Svg width={visibleW} height={CHART_HEIGHT}>
                            <Defs>
                              <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor={colors.primary} stopOpacity={0.28} />
                                <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
                              </LinearGradient>
                              {/* Cor da linha pela intensidade: vermelho em cima → amarelo → verde em baixo */}
                              <LinearGradient id={lineGid} x1="0" y1={yAt(5)} x2="0" y2={yAt(0)} gradientUnits="userSpaceOnUse">
                                <Stop offset="0" stopColor={colors.chartHigh} />
                                <Stop offset="0.5" stopColor={colors.chartMid} />
                                <Stop offset="1" stopColor={colors.chartLow} />
                              </LinearGradient>
                            </Defs>
                            {[0, 1, 2, 3, 4, 5].map((v) => (
                              <Line key={'g' + v} x1={PAD_X} y1={yAt(v)} x2={visibleW - PAD_X} y2={yAt(v)} stroke={colors.border} strokeWidth={1} strokeDasharray={v === 0 ? undefined : '2 5'} opacity={v === 0 ? 0.7 : 0.45} strokeLinecap="round" />
                            ))}
                            {WEEKDAYS.map((wd, j) => {
                              const isToday = wk[j] === todayIso;
                              return (
                                <SvgText key={'wd' + j} x={xAt(j)} y={CHART_HEIGHT - 7} fontSize={11} fontWeight={isToday ? '600' : '400'} fill={isToday ? colors.primary : colors.textMuted} textAnchor="middle">{wd}</SvgText>
                              );
                            })}
                            {pts.length > 1 && <Path d={area} fill={`url(#${gid})`} />}
                            {pts.length > 1 && <Path d={line} fill="none" stroke={`url(#${lineGid})`} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />}
                            {pts.length === 1 && <Circle cx={pts[0].x} cy={pts[0].y} r={5} fill={colors.card} stroke={valueColor(pts[0].v)} strokeWidth={3} />}
                            {last && <Circle cx={last.x} cy={last.y} r={9} fill={valueColor(last.v)} opacity={0.14} />}
                            {pts.map((p, i) => {
                              const isLast = i === pts.length - 1;
                              return (
                                <Circle key={'p' + i} cx={p.x} cy={p.y} r={isLast ? 5 : 4} fill={colors.card} stroke={valueColor(p.v)} strokeWidth={isLast ? 3 : 2} />
                              );
                            })}
                            {last && (
                              <SvgText x={last.x} y={Math.max(18, last.y - 12)} fontSize={10} fontWeight="600" fill={valueColor(last.v)} textAnchor="middle">{last.v.toFixed(1)}</SvgText>
                            )}
                          </Svg>
                          <Text style={{ textAlign: 'center', marginTop: 4, fontSize: 11, color: colors.textMuted }}>{range}</Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            )}
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{L('Junta os registos de gravidade, o desconforto nas exposições e os ataques.', 'Combines your severity check-ins, distress in exposures and attacks.')}</Text>
          </>
        ) : chartView === 'severity' ? (
          <>
            <View style={{ gap: 2 }}>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{L('Os teus check-ins de gravidade (0–5)', 'Your severity check-ins (0–5)')}</Text>
            </View>
            {severity.length < 2 ? (
              <EmptyState compact icon="trending-down-outline" title={L('Regista a gravidade algumas vezes para veres a tendência aqui.', 'Log your severity a few times to see the trend here.')} />
            ) : (
              <View onLayout={(e) => setChartW(e.nativeEvent.layout.width)} style={{ height: CHART_HEIGHT }}>
                {chartW > 0 && (() => {
                  const chron = [...severity].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-16);
                  const w = chartW, h = CHART_HEIGHT, nn = chron.length;
                  const left = 24, padR = 14, padTop = 12, padBot = 26; // em baixo: datas
                  const gap = 12; // afasta o primeiro ponto do eixo
                  const xA = (i: number) => (nn <= 1 ? (left + w - padR) / 2 : left + gap + (i / (nn - 1)) * (w - left - gap - padR));
                  const yA = (v: number) => (h - padBot) - (v / 5) * (h - padBot - padTop);
                  const pts = chron.map((s, i) => ({ x: xA(i), y: yA(s.value) }));
                  const last = pts[pts.length - 1];
                  const lastVal = chron[chron.length - 1].value;
                  return (
                    <Svg width={w} height={h}>
                      <Defs>
                        <LinearGradient id="sevGrad" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor={colors.primary} stopOpacity={0.26} />
                          <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
                        </LinearGradient>
                      </Defs>
                      {[0, 1, 2, 3, 4, 5].map((v) => (
                        <Line key={'g' + v} x1={left} y1={yA(v)} x2={w - padR} y2={yA(v)} stroke={colors.border} strokeWidth={1} strokeDasharray={v === 0 ? undefined : '2 5'} opacity={v === 0 ? 0.7 : 0.4} strokeLinecap="round" />
                      ))}
                      {[0, 1, 2, 3, 4, 5].map((v) => (
                        <SvgText key={'yl' + v} x={left - 5} y={yA(v) + 3} fontSize={11} fill={colors.textMuted} textAnchor="end">{String(v)}</SvgText>
                      ))}
                      {pts.length > 1 && <Path d={smoothArea(pts, yA(0))} fill="url(#sevGrad)" />}
                      {pts.length > 1 && <Path d={smoothLine(pts)} fill="none" stroke={colors.primary} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />}
                      {pts.map((p, i) => (
                        <Circle key={'p' + i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 4} fill={colors.card} stroke={colors.primary} strokeWidth={i === pts.length - 1 ? 3 : 2} />
                      ))}
                      {last && <SvgText x={last.x} y={Math.max(16, last.y - 12)} fontSize={11} fontWeight="600" fill={colors.primary} textAnchor="middle">{lastVal.toFixed(0)}</SvgText>}
                      {/* Datas: primeiro e último registo */}
                      <SvgText x={pts[0].x} y={h - 6} fontSize={11} fill={colors.textMuted} textAnchor="start">{dmShort(chron[0].date)}</SvgText>
                      <SvgText x={last.x} y={h - 6} fontSize={11} fill={colors.textMuted} textAnchor="end">{dmShort(chron[chron.length - 1].date)}</SvgText>
                    </Svg>
                  );
                })()}
              </View>
            )}
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{L('Uma linha a descer mostra que a fobia está a pesar menos.', 'A downward line means the phobia is weighing on you less.')}</Text>
          </>
        ) : chartView === 'exposures' ? (
          <>
            {expRel.length > 0 && (
              // O número que importa: quanto desce o desconforto, em média, numa exposição.
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{L('Em média', 'On average')}</Text>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: '600' }}>{relBefore.toFixed(1)} → {relAfter.toFixed(1)}</Text>
                <Text style={{ color: colors.success, fontSize: 13, fontWeight: '600' }}>−{Math.max(0, relBefore - relAfter).toFixed(1)}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><View style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: colors.primary }} /><Text style={{ color: colors.textMuted, fontSize: 12 }}>{L('antes', 'before')}</Text></View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><View style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: colors.success }} /><Text style={{ color: colors.textMuted, fontSize: 12 }}>{L('depois', 'after')}</Text></View>
            </View>
            {exposures.length < 2 ? (
              <EmptyState compact icon="barbell-outline" title={L('Regista sessões de exposição para veres a evolução aqui.', 'Log exposure sessions to see the trend here.')} />
            ) : (
              <View onLayout={(e) => setChartW(e.nativeEvent.layout.width)} style={{ height: CHART_HEIGHT }}>
                {chartW > 0 && (() => {
                  const chrono = [...exposures].reverse().slice(-12); // mais antigas → recentes
                  const w = chartW, h = CHART_HEIGHT, pad = 10, nn = chrono.length;
                  const left = pad + 22; // espaço para a escala 0–10
                  const bottom = 22;     // espaço para as datas
                  const xA = (i: number) => (nn <= 1 ? w / 2 : left + (i / (nn - 1)) * (w - left - pad));
                  const yA = (v: number) => (h - bottom) - (v / 10) * (h - bottom - pad);
                  const bPts = chrono.map((s, i) => ({ x: xA(i), y: yA(s.before) }));
                  const aPts = chrono.map((s, i) => ({ x: xA(i), y: yA(typeof s.after === 'number' ? s.after : s.before) }));
                  return (
                    <Svg width={w} height={h}>
                      {[0, 5, 10].map((v) => (
                        <Line key={v} x1={pad + 16} y1={yA(v)} x2={w - pad} y2={yA(v)} stroke={colors.border} strokeWidth={1} strokeDasharray={v === 0 ? undefined : '2 5'} opacity={0.5} />
                      ))}
                      {[0, 5, 10].map((v) => (
                        <SvgText key={'yl' + v} x={pad + 10} y={yA(v) + 3} fontSize={11} fill={colors.textMuted} textAnchor="end">{String(v)}</SvgText>
                      ))}
                      <Path d={smoothLine(bPts)} fill="none" stroke={colors.primary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                      <Path d={smoothLine(aPts)} fill="none" stroke={colors.success} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                      {bPts.map((p, i) => (<Circle key={'b' + i} cx={p.x} cy={p.y} r={3} fill={colors.primary} />))}
                      {aPts.map((p, i) => (<Circle key={'a' + i} cx={p.x} cy={p.y} r={3} fill={colors.success} />))}
                      {/* Datas: primeira e última sessão mostradas */}
                      <SvgText x={bPts[0].x} y={h - 6} fontSize={11} fill={colors.textMuted} textAnchor="start">{dmShort(chrono[0].date)}</SvgText>
                      <SvgText x={bPts[bPts.length - 1].x} y={h - 6} fontSize={11} fill={colors.textMuted} textAnchor="end">{dmShort(chrono[chrono.length - 1].date)}</SvgText>
                    </Svg>
                  );
                })()}
              </View>
            )}
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{L('A distância entre as linhas costuma encolher com a prática.', 'The gap between the lines tends to shrink with practice.')}</Text>
          </>
        ) : (
          <>
            {dropped.length === 0 ? (
              <EmptyState compact icon="leaf-outline" title={L('Marca um comportamento como "a largar" em Recursos › Comportamentos para veres aqui o teu progresso.', 'Mark a behaviour as "dropping" in Resources › Behaviours to see your progress here.')} />
            ) : (
              <View>
                {[...dropped].sort((x, y) => (x.date < y.date ? 1 : -1)).slice(0, 6).map((d, i) => (
                  <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="leaf-outline" size={14} color={colors.success} />
                    </View>
                    <Text style={{ color: colors.text, fontSize: 14, flex: 1 }} numberOfLines={2}>{d.label}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{dmShort(d.date)}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{L('Os comportamentos que começaste a largar, dos mais recentes para os mais antigos.', 'The behaviours you have started dropping, most recent first.')}</Text>
          </>
        )}
      </Card>
    </ScrollView>
  );
}
