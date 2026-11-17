// "Estatísticas" (segundo separador do Início): cartão "Resumo" (Geral/Semana
// + 4 indicadores) e cartão dos gráficos — o título é um seletor com 8
// gráficos (ansiedade, previsão vs. realidade, exposições, gravidade, humor,
// mapa de prática, dias sem comportamentos, comportamentos a largar) e um
// período (semana, mês, 3 meses). Toque nos gráficos mostra cada valor.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLang , tr2 } from '../i18n/i18n';
import {
  ActCommitment,
  AttackEntry,
  DroppedBehavior,
  ExerciseLogEntry,
  ExperimentEntry,
  ExposureSession,
  isoLocal,
  JournalEntry,
  loadActCommitments,
  loadJournal,
  loadSafetyFree,
  SafetyFreeDays,
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
import { behaviorLabel } from '../lib/behaviorLabel';
import EmptyState from './EmptyState';
import { Card, CardHeader, Segmented } from './ui';
import { statsText } from '../data/statsText';
import { changePct, countBy, fmtNum, heatmapGrid, lastDays, mean, Period, PERIOD_DAYS } from '../lib/statsData';
import LineChart, { LinePoint } from './stats/LineChart';
import BarChart from './stats/BarChart';
import Heatmap from './stats/Heatmap';
import ChartPicker, { ChartOption } from './stats/ChartPicker';

type ChartId = 'anxiety' | 'severity' | 'exposures' | 'prediction' | 'mood' | 'heatmap' | 'freeDays' | 'dropped';

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
  const { lang } = useLang();
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
  const [chartView, setChartView] = useState<ChartId>('anxiety');
  const [period, setPeriod] = useState<Period>('week');
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [safetyFree, setSafetyFree] = useState<SafetyFreeDays>({});

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
    loadJournal().then((j) => setJournal(Array.isArray(j) ? j : []));
    loadSafetyFree().then(setSafetyFree);
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
    { icon: 'trending-down-outline' as const, value: expRel.length ? `${reliefPct}%` : '—', label: L('alívio nas exposições', 'relief in exposures'), sub: expRel.length ? `${fmtNum(relBefore, 1, lang)} → ${fmtNum(relAfter, 1, lang)} /10` : L('faz uma exposição', 'do an exposure'), color: colors.success },
    { icon: 'flame-outline' as const, value: `${expStreak}`, label: L('dias seguidos', 'days in a row'), sub: L(`${totalExpDays} no total`, `${totalExpDays} total`), color: colors.primary, highlight: true },
    { icon: 'barbell-outline' as const, value: `${exercisesTotal}`, label: L('exercícios feitos', 'exercises done'), sub: L(`${exposures.length} de exposição`, `${exposures.length} exposure`), color: colors.primary },
    { icon: 'leaf-outline' as const, value: `${dropped.length}`, label: L('comportamentos largados', 'behaviours dropped'), sub: L('que já não alimentam o medo', 'no longer feeding the fear'), color: colors.success },
  ];
  const statsWeek = [
    { icon: 'trending-down-outline' as const, value: expRelWeek.length ? `${reliefPctWeek}%` : '—', label: L('alívio nas exposições', 'relief in exposures'), sub: expRelWeek.length ? `${fmtNum(relBeforeWeek, 1, lang)} → ${fmtNum(relAfterWeek, 1, lang)} /10` : L('faz uma exposição', 'do an exposure'), color: colors.success },
    { icon: 'flame-outline' as const, value: `${practiceDaysWeek}`, label: L('dias de prática', 'practice days'), sub: L('esta semana', 'this week'), color: colors.primary, highlight: true },
    { icon: 'barbell-outline' as const, value: `${exercisesWeek}`, label: L('exercícios feitos', 'exercises done'), sub: L('esta semana', 'this week'), color: colors.primary },
    { icon: 'leaf-outline' as const, value: `${droppedWeek}`, label: L('comportamentos largados', 'behaviours dropped'), sub: L('esta semana', 'this week'), color: colors.success },
  ];
  const stats = statScope === 'week' ? statsWeek : statsAll;

  // --- Gráficos ---
  const sx = statsText(lang);
  const WEEKDAYS = WEEKDAYS_BY_LANG[lang] ?? WEEKDAYS_BY_LANG.en;
  const nf = (v: number, dg = 1) => fmtNum(v, dg, lang);
  const dm = (iso: string) => { const p = iso.split('-'); return `${p[2]}/${p[1]}`; };
  const wdOf = (iso: string) => WEEKDAYS[(new Date(`${iso}T12:00:00`).getDay() + 6) % 7];
  const todayIso = isoLocal();

  // Intensidade por dia (0–5): registos de medo, desconforto da exposição (SUDS 0–10 → 0–5)
  // e ataques (puxam para cima). Dia sem dados = sem ponto.
  const fearFor = (d: string): number | null => {
    const cands: number[] = severity.filter((e) => e.date === d).map((e) => e.value);
    exposures.filter((e) => e.date === d).forEach((e) => cands.push((typeof e.peak === 'number' ? e.peak : e.before) / 2));
    if (attacks.some((a) => a.date === d)) cands.push(4);
    return cands.length ? Math.min(5, Math.max(...cands)) : null;
  };
  const sevFor = (d: string): number | null => {
    const v = severity.filter((e) => e.date === d);
    return v.length ? v[v.length - 1].value : null;
  };
  const moodFor = (d: string): number | null => mean(journal.filter((j) => j.date === d && typeof j.mood === 'number').map((j) => j.mood as number));

  const nDays = PERIOD_DAYS[period];
  const days = lastDays(nDays);
  const prevDays = lastDays(nDays * 2).slice(0, nDays);
  const inPeriod = (d: string) => d >= days[0];
  const step = nDays === 7 ? 1 : nDays === 30 ? 7 : 21;
  const dayLabels = days
    .map((d, i) => ({ i, d }))
    .filter(({ i }) => (nDays - 1 - i) % step === 0)
    .map(({ i, d }) => ({ i, text: nDays === 7 ? wdOf(d) : dm(d), strong: d === todayIso }));
  const daySlot = (i: number) => `${wdOf(days[i])}, ${dm(days[i])}`;

  // Em 3 meses agrupa por semana (média), para a linha ficar legível.
  const weekly = period === 'months3';
  const buckets: string[][] = weekly
    ? Array.from({ length: Math.ceil(nDays / 7) }, (_, k) => days.slice(Math.max(0, nDays - (Math.ceil(nDays / 7) - k) * 7), nDays - (Math.ceil(nDays / 7) - k - 1) * 7))
    : days.map((d) => [d]);
  const nSlots = buckets.length;
  const dailySeries = (fn: (d: string) => number | null) =>
    buckets.map((b, i) => ({ i, v: mean(b.map(fn).filter((v): v is number => v !== null)) })).filter((p): p is LinePoint => p.v !== null);
  const bucketSlot = (i: number) => (weekly ? `${dm(buckets[i][0])} – ${dm(buckets[i][buckets[i].length - 1])}` : daySlot(i));
  const bucketLabels = weekly
    ? buckets.map((b, i) => ({ i, text: dm(b[0]), strong: false })).filter(({ i }) => (nSlots - 1 - i) % 4 === 0)
    : dayLabels;
  const avgOver = (fn: (d: string) => number | null, ds: string[]) => mean(ds.map(fn).filter((v): v is number => v !== null));

  const moodColor = (v: number) => (v >= 3.5 ? colors.chartLow : v >= 2.5 ? colors.chartMid : colors.chartHigh);
  const periodOpts: [Period, string][] = [['week', sx.week], ['month', sx.month], ['months3', sx.months3]];

  const chartOptions: ChartOption<ChartId>[] = [
    { id: 'anxiety', icon: 'pulse-outline', sf: 'waveform.path.ecg', name: sx.n_anxiety, desc: sx.d_anxiety },
    { id: 'prediction', icon: 'flask-outline', sf: 'flask', name: sx.n_prediction, desc: sx.d_prediction },
    { id: 'exposures', icon: 'trending-up-outline', sf: 'chart.line.uptrend.xyaxis', name: sx.n_exposures, desc: sx.d_exposures },
    { id: 'severity', icon: 'speedometer-outline', sf: 'gauge.with.needle', name: sx.n_severity, desc: sx.d_severity },
    { id: 'mood', icon: 'happy-outline', sf: 'face.smiling', name: sx.n_mood, desc: sx.d_mood },
    { id: 'heatmap', icon: 'grid-outline', sf: 'square.grid.3x3', name: sx.n_heatmap, desc: sx.d_heatmap },
    { id: 'freeDays', icon: 'checkmark-done-outline', sf: 'checkmark.circle', name: sx.n_freeDays, desc: sx.d_freeDays },
    { id: 'dropped', icon: 'leaf-outline', sf: 'leaf', name: sx.n_dropped, desc: sx.d_dropped },
  ];
  const usesPeriod = chartView !== 'heatmap' && chartView !== 'dropped';

  // Variação face ao período anterior (para os gráficos diários).
  const change = (fn: (d: string) => number | null, goodWhenUp = false) => {
    const pct = changePct(avgOver(fn, days), avgOver(fn, prevDays));
    if (pct === null) return null;
    const good = goodWhenUp ? pct > 0 : pct < 0;
    const c = pct === 0 ? colors.textMuted : good ? colors.success : colors.danger;
    const icon = pct < 0 ? 'arrow-down' : pct > 0 ? 'arrow-up' : 'remove';
    return (
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.cardAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
          <Ionicons name={icon as any} size={13} color={c} />
          <Text style={{ color: c, fontWeight: '600', fontSize: 13 }}>{Math.abs(pct)}%</Text>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 10 }}>{sx.vsPrev}</Text>
      </View>
    );
  };
  const legend = (items: [string, string][]) => (
    <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
      {items.map(([c, l]) => (
        <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{ width: 12, height: 3, borderRadius: 2, backgroundColor: c }} />
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{l}</Text>
        </View>
      ))}
    </View>
  );
  const avgLegend = (avgV: number | null, scale: string) => avgV === null ? null : (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 14, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: colors.textMuted }} />
      <Text style={{ color: colors.textMuted, fontSize: 12 }}>{sx.avg} {nf(avgV)}{scale}</Text>
    </View>
  );
  const empty = (title: string, icon: keyof typeof Ionicons.glyphMap = 'analytics-outline') => <EmptyState compact icon={icon} title={title} />;

  function renderChart() {
    if (chartView === 'anxiety' || chartView === 'severity' || chartView === 'mood') {
      const fn = chartView === 'anxiety' ? fearFor : chartView === 'severity' ? sevFor : moodFor;
      const pts = dailySeries(fn);
      const avgV = mean(pts.map((p) => p.v));
      const isMood = chartView === 'mood';
      if (!pts.length) return empty(isMood ? sx.emptyMood : sx.empty, isMood ? 'happy-outline' : 'pulse-outline');
      return (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            {avgLegend(avgV, isMood ? '/5' : '/5')}
            {change(fn, isMood)}
          </View>
          <LineChart
            series={[{ color: colors.primary, points: pts, fill: true, dotColor: isMood ? moodColor : valueColor }]}
            n={nSlots}
            yMin={isMood ? 1 : 0}
            yMax={5}
            yTicks={isMood ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5]}
            xLabels={bucketLabels}
            avg={avgV}
            format={(v) => nf(v)}
            slotLabel={bucketSlot}
          />
        </>
      );
    }
    if (chartView === 'exposures' || chartView === 'prediction') {
      const isPred = chartView === 'prediction';
      const list = [...exposures]
        .filter((e) => inPeriod(e.date) && (isPred ? typeof e.prob === 'number' : typeof e.before === 'number'))
        .sort((x, y) => ((x.ts || x.date) < (y.ts || y.date) ? -1 : 1));
      if (!list.length) return empty(isPred ? sx.emptyPrediction : sx.empty, isPred ? 'flask-outline' : 'trending-up-outline');
      const aVal = (e: ExposureSession) => (isPred ? e.prob! : e.before);
      const bVal = (e: ExposureSession) => (isPred ? e.probAfter : e.after);
      const aPts = list.map((e, i) => ({ i, v: aVal(e) }));
      const bPts = list.map((e, i) => ({ i, v: bVal(e) })).filter((p): p is LinePoint => typeof p.v === 'number');
      const mA = mean(aPts.map((p) => p.v)), mB = mean(bPts.map((p) => p.v));
      const fmt = (v: number) => (isPred ? `${Math.round(v)}%` : nf(v));
      const xl = list.length === 1 ? [{ i: 0, text: dm(list[0].date) }] : [{ i: 0, text: dm(list[0].date) }, { i: list.length - 1, text: dm(list[list.length - 1].date) }];
      return (
        <>
          {mA !== null && mB !== null && (
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{sx.onAverage}</Text>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '600' }}>{fmt(mA)} → {fmt(mB)}</Text>
              {mB < mA && <Text style={{ color: colors.success, fontSize: 13, fontWeight: '600' }}>−{isPred ? `${Math.round(mA - mB)}%` : nf(mA - mB)}</Text>}
            </View>
          )}
          {legend([[colors.primary, sx.before], [colors.success, sx.after]])}
          <LineChart
            series={[
              { color: colors.primary, points: aPts, label: sx.before },
              { color: colors.success, points: bPts, label: sx.after },
            ]}
            n={list.length}
            yMin={0}
            yMax={isPred ? 100 : 10}
            yTicks={isPred ? [0, 50, 100] : [0, 5, 10]}
            tickFormat={isPred ? (v) => `${v}%` : undefined}
            leftW={isPred ? 42 : 30}
            xLabels={xl}
            format={fmt}
            slotLabel={(i) => `${dm(list[i].date)} · ${list[i].stepLabel}`}
          />
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{isPred ? sx.predHint : sx.expHint}</Text>
        </>
      );
    }
    if (chartView === 'freeDays') {
      const values = days.map((d) => Object.values(safetyFree).filter((l) => Array.isArray(l) && l.includes(d)).length);
      const total = values.reduce((a, b) => a + b, 0);
      if (!total) return empty(sx.emptyFree, 'checkmark-done-outline');
      return (
        <>
          <Text style={{ color: colors.text, fontSize: 15 }}>{sx.total}: <Text style={{ fontWeight: '700', color: colors.success }}>{total}</Text></Text>
          <BarChart values={values} xLabels={dayLabels} slotLabel={daySlot} color={colors.success} />
        </>
      );
    }
    if (chartView === 'heatmap') {
      const grid = heatmapGrid(countBy([...allExerciseDates, ...expDays]), 13);
      const daysWith = grid.flat().filter((c) => c && c.n > 0).length;
      return (
        <>
          <Text style={{ color: colors.text, fontSize: 15 }}>{sx.daysPractice}: <Text style={{ fontWeight: '700', color: colors.primary }}>{daysWith}</Text></Text>
          <Heatmap grid={grid} weekdays={WEEKDAYS} less={sx.less} more={sx.more} dayLabel={(iso, k) => `${wdOf(iso)}, ${dm(iso)} · ${k}`} />
        </>
      );
    }
    // Comportamentos a largar
    if (dropped.length === 0) return empty(sx.emptyDropped, 'leaf-outline');
    return (
      <View>
        {[...dropped].sort((x, y) => (x.date < y.date ? 1 : -1)).slice(0, 8).map((d, i) => (
          <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="leaf-outline" size={14} color={colors.success} />
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }} numberOfLines={2}>{behaviorLabel(d.id, d.label, lang)}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{dm(d.date)}</Text>
          </View>
        ))}
      </View>
    );
  }
  const curOpt = chartOptions.find((o) => o.id === chartView) ?? chartOptions[0];

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
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: '600' }}>{s.value}</Text>
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

      {/* Gráficos: o título é um seletor; período por baixo */}
      <Card style={{ gap: spacing.md }}>
        <ChartPicker value={chartView} onChange={setChartView} options={chartOptions} title={sx.choose} />
        <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, marginTop: -6 }}>{curOpt.desc}</Text>
        {usesPeriod && <Segmented value={period} onChange={setPeriod} options={periodOpts} />}
        {renderChart()}
        {(chartView === 'anxiety' || chartView === 'severity' || chartView === 'mood' || chartView === 'exposures' || chartView === 'prediction' || chartView === 'freeDays') && (
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>{sx.tapHint}</Text>
        )}
      </Card>
    </ScrollView>
  );
}
