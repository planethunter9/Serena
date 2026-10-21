// Página inicial com duas abas no topo:
//  • "Visão geral" — contador (herói), "Num relance" e gráfico (ex-Progresso, melhorado).
//  • "Hoje" — check-in do dia (intensidade só em ataques), gatilho, exposição não
//    planeada, técnicas e sons.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { CHAPTERS } from '../data/content';
import PlanToday, { PlanSummary } from './Plan';
import { useLang } from '../i18n/i18n';
import {
  addAttack,
  addSeverity,
  AttackEntry,
  DroppedBehavior,
  ExposureSession,
  isoLocal,
  JournalEntry,
  loadAttacks,
  loadDashboardOrder,
  loadDropped,
  loadExposureDays,
  loadExposureSessions,
  loadJournal,
  loadLessonsDone,
  loadSeverity,
  loadStreakStart,
  saveDashboardOrder,
  saveStreakStart,
  SeverityEntry,
} from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, ScreenTitle } from './ui';

export default function HomeScreen({ startDate }: { startDate: string }) {
  const { colors, unlocked } = useTheme();
  const { t, lang } = useLang();

  const [tab, setTab] = useState<'overview' | 'today'>('overview');

  // Dados partilhados pelas duas abas.
  const [streakStart, setStreakStart] = useState<string | null>(null);
  const [severity, setSeverity] = useState<SeverityEntry[]>([]);
  const [lessonsDone, setLessonsDone] = useState<string[]>([]);
  const [attacks, setAttacks] = useState<AttackEntry[]>([]);
  const [exposures, setExposures] = useState<ExposureSession[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [expDays, setExpDays] = useState<string[]>([]);

  // Estado do check-in (aba Hoje).
  const [fear, setFear] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastKind, setLastKind] = useState<'anxiety' | 'panic' | 'behavior' | null>(null);
  const [chartView, setChartView] = useState<'progress' | 'activity' | 'dropped'>('progress');
  const [chartW, setChartW] = useState(0);
  const fearScrollRef = useRef<ScrollView>(null);

  // Comportamentos largados (progresso ERP) e ordem do painel (reordenável, pago).
  const [dropped, setDropped] = useState<DroppedBehavior[]>([]);
  const [dashOrder, setDashOrder] = useState<string[]>(['hero', 'glance', 'plan']);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    loadStreakStart().then((v) => {
      if (v) setStreakStart(v);
      else { setStreakStart(startDate); saveStreakStart(startDate); }
    });
    loadSeverity().then(setSeverity);
    loadLessonsDone().then(setLessonsDone);
    loadAttacks().then(setAttacks);
    loadExposureSessions().then(setExposures);
    loadJournal().then(setJournal);
    loadExposureDays().then(setExpDays);
    loadDropped().then(setDropped);
    loadDashboardOrder().then((o) => { if (o.length) setDashOrder(o); });
  }, []);

  const streakDays = streakStart
    ? Math.max(0, Math.floor((Date.now() - new Date(streakStart).getTime()) / 86400000))
    : 0;
  const dayNumber = streakDays;

  function relapse(kind: 'anxiety' | 'panic' | 'behavior') {
    Alert.alert(t('home.resetTitle'), t('home.resetBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('home.reset'),
        style: 'destructive',
        onPress: async () => {
          const next = await addAttack(kind);
          setAttacks(next);
          const iso = new Date().toISOString();
          await saveStreakStart(iso);
          setStreakStart(iso);
          setFear(null);
          setLastKind(kind);
          setFeedback(kind === 'behavior' ? t('home.logged') : null);
        },
      },
    ]);
  }

  function noneToday() {
    setLastKind(null);
    setFear(null);
    setFeedback(t('home.keptStreak'));
  }

  async function logFear(v: number) {
    setFear(v);
    const next = await addSeverity(v);
    setSeverity(next);
    setFeedback(t('home.logged'));
  }

  const showIntensity = lastKind === 'anxiety' || lastKind === 'panic';

  // --- Num relance ---
  const totalLessons = CHAPTERS.flatMap((c) => c.lessons).length;
  const glance = [
    { icon: 'book-outline' as const, label: t('progress.glLessons'), value: `${lessonsDone.length}/${totalLessons}` },
    { icon: 'trending-up-outline' as const, label: t('progress.glExposures'), value: `${exposures.length}` },
    { icon: 'footsteps-outline' as const, label: t('progress.glExposureDays'), value: `${expDays.length}` },
    { icon: 'create-outline' as const, label: t('progress.glJournal'), value: `${new Set(journal.map((j) => j.date)).size}` },
  ];

  // --- Gráficos ---
  const CHART_HEIGHT = 156;
  const AX_LEFT = 26;    // coluna fixa com a escala Y
  const AX_BOTTOM = 24;  // faixa dos dias no eixo X
  const PAD = 12;
  const PAD_X = 14;
  const WEEKS = 12;      // nº de semanas de histórico (deslizável, paginado)
  const plotH = CHART_HEIGHT - AX_BOTTOM;
  const yAt = (v: number) => plotH - PAD - (v / 5) * (plotH - PAD * 2);
  const dmShort = (iso: string) => { const p = iso.split('-'); return `${p[2]}/${p[1]}`; };
  const WEEKDAYS = lang === 'pt'
    ? ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Intensidade por dia (0–5): ataques (puxam sempre para cima), registos de intensidade
  // e o desconforto na terapia de exposição (SUDS 0–10 → 0–5). Dia sem dados = sem ponto.
  const fearFor = (d: string): number | null => {
    const cands: number[] = severity.filter((e) => e.date === d).map((e) => e.value);
    exposures.filter((e) => e.date === d).forEach((e) => cands.push((typeof e.peak === 'number' ? e.peak : e.before) / 2));
    if (attacks.some((a) => a.date === d)) cands.push(4);
    return cands.length ? Math.min(5, Math.max(...cands)) : null;
  };

  // Semanas alinhadas de segunda a domingo; a última é a semana atual.
  const nowD = new Date();
  const dow = (nowD.getDay() + 6) % 7; // 0 = segunda
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

  // Geometria de cada página (uma semana ocupa a largura visível).
  const visibleW = Math.max(0, chartW - AX_LEFT);
  const innerW = Math.max(0, visibleW - PAD_X * 2);
  const xAt = (j: number) => PAD_X + (innerW / 6) * j; // 7 pontos (Seg..Dom)

  // Curva suave (Catmull-Rom → Bézier) para a linha; versão fechada para a área.
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

  // 14 dias para o gráfico de atividade.
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) days.push(isoLocal(new Date(Date.now() - i * 86400000)));
  const activityByDay = days.map((d) => {
    const ex = exposures.filter((e) => e.date === d).length;
    const jn = journal.filter((j) => j.date === d).length;
    const sv = severity.filter((e) => e.date === d).length;
    return ex + jn + sv;
  });
  const maxActivity = Math.max(1, ...activityByDay);

  function CheckinButton({ label, onPress, positive }: { label: string; onPress: () => void; positive?: boolean }) {
    return (
      <Pressable onPress={onPress} style={{ flex: 1, paddingVertical: 16, borderRadius: radius.md, alignItems: 'center', backgroundColor: positive ? colors.primarySoft : colors.cardAlt, borderWidth: 2, borderColor: positive ? colors.primary : colors.border }}>
        <Text style={{ color: positive ? colors.primary : colors.text, fontWeight: '700' }}>{label}</Text>
      </Pressable>
    );
  }

  // --- Painel reordenável (Visão geral) ---
  function moveDash(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= dashOrder.length) return;
    const ids = [...dashOrder];
    [ids[index], ids[j]] = [ids[j], ids[index]];
    setDashOrder(ids);
    saveDashboardOrder(ids);
  }
  function toggleReorder() {
    if (!unlocked) {
      Alert.alert(
        lang === 'pt' ? 'Personalização' : 'Personalization',
        lang === 'pt' ? 'Reordenar o painel faz parte do pack de personalização.' : 'Reordering the panel is part of the personalization pack.'
      );
      return;
    }
    setReordering((r) => !r);
  }
  function heroBlock() {
    return (
      <View style={{ alignItems: 'center', gap: 8 }}>
        <View style={{ width: 170, height: 170, borderRadius: 85, borderWidth: 10, borderColor: colors.primary, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.primary, fontSize: 54, fontWeight: '800' }}>{dayNumber}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingHorizontal: 10 }}>{t(dayNumber === 1 ? 'home.journeyDay' : 'home.journeyDays')}</Text>
        </View>
        {dayNumber >= 30 && (
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('home.journeyMonthsCaption', { n: Math.floor(dayNumber / 30) })}</Text>
        )}
      </View>
    );
  }
  function glanceBlock() {
    return (
      <View style={{ gap: spacing.lg }}>
        <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>{t('progress.glance')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {glance.map((g) => (
            <Card key={g.label} style={{ width: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={g.icon} size={19} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{g.value}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{g.label}</Text>
              </View>
            </Card>
          ))}
        </View>
      </View>
    );
  }
  function planBlock() { return <PlanSummary />; }
  const DASH: Record<string, () => any> = { hero: heroBlock, glance: glanceBlock, plan: planBlock };

  return (
    <View style={{ flex: 1 }}>
      {/* Abas */}
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.xs }}>
        <View style={{ flexDirection: 'row', backgroundColor: colors.cardAlt, borderRadius: 999, padding: 4 }}>
          {(['overview', 'today'] as const).map((v) => {
            const active = tab === v;
            return (
              <Pressable key={v} onPress={() => setTab(v)} style={{ flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center', backgroundColor: active ? colors.card : 'transparent' }}>
                <Text style={{ color: active ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 14 }}>
                  {v === 'overview' ? t('home.overviewTab') : t('home.todayTab')}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ---------- VISÃO GERAL ---------- */}
      {tab === 'overview' && (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.md, gap: spacing.lg, paddingBottom: 120 }}>
          {/* Reordenar o painel (pack de personalização) */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: -spacing.sm }}>
            <Pressable onPress={toggleReorder} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name={reordering ? 'checkmark' : unlocked ? 'swap-vertical' : 'lock-closed-outline'} size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{reordering ? (lang === 'pt' ? 'Concluir' : 'Done') : (lang === 'pt' ? 'Reordenar' : 'Reorder')}</Text>
            </Pressable>
          </View>

          {dashOrder.map((key, i) => (
            reordering ? (
              <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radius.lg, padding: spacing.sm }}>
                <View style={{ flex: 1 }}>{DASH[key]?.()}</View>
                <View style={{ gap: 4 }}>
                  <Pressable onPress={() => moveDash(i, -1)} hitSlop={6} disabled={i === 0} style={{ padding: 4, opacity: i === 0 ? 0.3 : 1 }}>
                    <Ionicons name="chevron-up" size={22} color={colors.primary} />
                  </Pressable>
                  <Pressable onPress={() => moveDash(i, 1)} hitSlop={6} disabled={i === dashOrder.length - 1} style={{ padding: 4, opacity: i === dashOrder.length - 1 ? 0.3 : 1 }}>
                    <Ionicons name="chevron-down" size={22} color={colors.primary} />
                  </Pressable>
                </View>
              </View>
            ) : (
              <View key={key}>{DASH[key]?.()}</View>
            )
          ))}

          {/* Seletor Progresso / Atividade / Largados */}
          <View style={{ flexDirection: 'row', backgroundColor: colors.cardAlt, borderRadius: 999, padding: 4 }}>
            {(['progress', 'activity', 'dropped'] as const).map((v) => {
              const active = chartView === v;
              const label = v === 'progress' ? t('progress.tabProgress') : v === 'activity' ? t('progress.tabActivity') : (lang === 'pt' ? 'Largados' : 'Dropped');
              return (
                <Pressable key={v} onPress={() => setChartView(v)} style={{ flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center', backgroundColor: active ? colors.card : 'transparent' }}>
                  <Text numberOfLines={1} style={{ color: active ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 13 }}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Card style={{ gap: 14 }}>
            {chartView === 'progress' ? (
              <>
                <View style={{ gap: 2 }}>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>{t('progress.chartTitle')}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('progress.statAvg')} {avg.toFixed(1)}/5</Text>
                </View>
                {allFearVals.length === 0 ? (
                  <Text style={{ color: colors.textMuted }}>{t('progress.chartEmpty')}</Text>
                ) : (
                  <View onLayout={(e) => setChartW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', height: CHART_HEIGHT + 24, alignItems: 'flex-start' }}>
                    {/* Eixo Y fixo (0 a 5) */}
                    <Svg width={AX_LEFT} height={CHART_HEIGHT}>
                      {[0, 1, 2, 3, 4, 5].map((v) => (
                        <SvgText key={'y' + v} x={AX_LEFT - 6} y={yAt(v) + 3} fontSize={9} fill={colors.textMuted} textAnchor="end">{String(v)}</SvgText>
                      ))}
                    </Svg>
                    {/* Páginas semanais (paginado) */}
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
                              </Defs>

                              {/* Grelha horizontal tracejada (0 a 5) */}
                              {[0, 1, 2, 3, 4, 5].map((v) => (
                                <Line
                                  key={'g' + v}
                                  x1={PAD_X} y1={yAt(v)} x2={visibleW - PAD_X} y2={yAt(v)}
                                  stroke={colors.border}
                                  strokeWidth={v === 0 ? 1 : 1}
                                  strokeDasharray={v === 0 ? undefined : '2 5'}
                                  opacity={v === 0 ? 0.7 : 0.45}
                                  strokeLinecap="round"
                                />
                              ))}

                              {/* Dias da semana no eixo X (hoje a destaque) */}
                              {WEEKDAYS.map((wd, j) => {
                                const isToday = wk[j] === todayIso;
                                return (
                                  <SvgText key={'wd' + j} x={xAt(j)} y={CHART_HEIGHT - 7} fontSize={9} fontWeight={isToday ? '700' : '400'} fill={isToday ? colors.primary : colors.textMuted} textAnchor="middle">{wd}</SvgText>
                                );
                              })}

                              {/* Área com gradiente + linha curva */}
                              {pts.length > 1 && <Path d={area} fill={`url(#${gid})`} />}
                              {pts.length > 1 && <Path d={line} fill="none" stroke={colors.primary} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />}

                              {/* Pontos (anel branco + miolo); halo no último */}
                              {last && <Circle cx={last.x} cy={last.y} r={9} fill={colors.primary} opacity={0.14} />}
                              {pts.map((p, i) => {
                                const isLast = i === pts.length - 1;
                                return (
                                  <Circle key={'p' + i} cx={p.x} cy={p.y} r={isLast ? 5 : 4} fill={colors.card} stroke={colors.primary} strokeWidth={isLast ? 3 : 2} />
                                );
                              })}

                              {/* Valor do último dia registado */}
                              {last && (
                                <SvgText x={last.x} y={Math.max(18, last.y - 12)} fontSize={10} fontWeight="700" fill={colors.primary} textAnchor="middle">{last.v.toFixed(1)}</SvgText>
                              )}
                            </Svg>
                            {/* Intervalo da semana (por baixo do eixo x) */}
                            <Text style={{ textAlign: 'center', marginTop: 4, fontSize: 11, fontWeight: '600', color: colors.textMuted }}>{range}</Text>
                            </View>
                          );
                        })}
                      </ScrollView>
                    )}
                  </View>
                )}
              </>
            ) : chartView === 'activity' ? (
              <>
                <Text style={{ color: colors.text, fontWeight: '600' }}>{t('progress.activityTitle')}</Text>
                {activityByDay.every((n) => n === 0) ? (
                  <Text style={{ color: colors.textMuted }}>{t('progress.activityEmpty')}</Text>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: CHART_HEIGHT }}>
                    {activityByDay.map((n, idx) => (
                      <View key={idx} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                        <View style={{ width: '70%', height: Math.max(4, (n / maxActivity) * CHART_HEIGHT), backgroundColor: colors.success, borderRadius: 4 }} />
                      </View>
                    ))}
                  </View>
                )}
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t('progress.activityHint')}</Text>
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ color: colors.success, fontSize: 30, fontWeight: '800' }}>{dropped.length}</Text>
                  <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{lang === 'pt' ? 'comportamentos que estás a largar' : 'behaviours you are dropping'}</Text>
                </View>
                {dropped.length === 0 ? (
                  <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>{lang === 'pt' ? 'Marca um comportamento como "a largar" em Recursos › Comportamentos para veres aqui o teu progresso.' : 'Mark a behaviour as "dropping" in Resources › Behaviours to see your progress here.'}</Text>
                ) : (
                  <View onLayout={(e) => setChartW(e.nativeEvent.layout.width)} style={{ height: CHART_HEIGHT }}>
                    {chartW > 0 && (() => {
                      const sorted = [...dropped].sort((a, b) => (a.date < b.date ? -1 : 1));
                      const map = new Map<string, number>();
                      sorted.forEach((d, i) => map.set(d.date, i + 1));
                      const dates = Array.from(map.keys());
                      const maxC = sorted.length;
                      const first = new Date(dates[0] + 'T00:00:00').getTime();
                      const today = new Date(isoLocal() + 'T00:00:00').getTime();
                      const span = Math.max(1, today - first);
                      const w = chartW;
                      const plotH2 = CHART_HEIGHT - 16;
                      const xOf = (iso: string) => PAD_X + ((new Date(iso + 'T00:00:00').getTime() - first) / span) * (w - PAD_X * 2);
                      const yOf = (c: number) => (plotH2 - PAD) - (c / maxC) * (plotH2 - PAD * 2);
                      const pts = dates.map((iso) => ({ x: xOf(iso), y: yOf(map.get(iso)!) }));
                      const lastPt = pts[pts.length - 1];
                      const endPts = lastPt.x < w - PAD_X ? [...pts, { x: w - PAD_X, y: lastPt.y }] : pts;
                      return (
                        <Svg width={w} height={CHART_HEIGHT}>
                          <Defs>
                            <LinearGradient id="dropGrad" x1="0" y1="0" x2="0" y2="1">
                              <Stop offset="0" stopColor={colors.success} stopOpacity={0.28} />
                              <Stop offset="1" stopColor={colors.success} stopOpacity={0} />
                            </LinearGradient>
                          </Defs>
                          {endPts.length > 1 && <Path d={smoothArea(endPts, plotH2 - PAD)} fill="url(#dropGrad)" />}
                          {endPts.length > 1 && <Path d={smoothLine(endPts)} fill="none" stroke={colors.success} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />}
                          {pts.map((p, i) => (
                            <Circle key={i} cx={p.x} cy={p.y} r={4} fill={colors.card} stroke={colors.success} strokeWidth={2} />
                          ))}
                        </Svg>
                      );
                    })()}
                  </View>
                )}
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{lang === 'pt' ? 'Total de comportamentos que começaste a largar ao longo do tempo.' : 'Cumulative safety behaviours you have started dropping over time.'}</Text>
              </>
            )}
          </Card>
        </ScrollView>
      )}

      {/* ---------- HOJE ---------- */}
      {tab === 'today' && (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.md, gap: spacing.lg, paddingBottom: 120 }}>
          <View>
            <ScreenTitle title={t('home.greeting')} />
            <Text style={{ color: colors.textMuted, fontSize: 15, marginTop: 4 }}>{t('home.subtitle')}</Text>
          </View>

          <PlanToday />

          {/* Check-in */}
          <Card style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{t('home.checkinTitle')}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('home.checkinHint')}</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 4 }}>
              <CheckinButton label={t('home.anxiety')} onPress={() => relapse('anxiety')} />
              <CheckinButton label={t('home.panic')} onPress={() => relapse('panic')} />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <CheckinButton label={t('home.behavior')} onPress={() => relapse('behavior')} />
              <CheckinButton label={t('home.none')} onPress={noneToday} />
            </View>

            {showIntensity && (
              <View style={{ gap: spacing.sm, marginTop: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>{t('home.fearTitle')}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('home.fearHint')}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  {[0, 1, 2, 3, 4, 5].map((v) => {
                    const active = fear === v;
                    return (
                      <Pressable key={v} onPress={() => logFear(v)} style={{ flex: 1, aspectRatio: 1, borderRadius: radius.md, backgroundColor: active ? colors.primary : colors.cardAlt, borderWidth: 2, borderColor: active ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: active ? '#ffffff' : colors.text, fontSize: 18, fontWeight: '700' }}>{v}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {feedback && <Text style={{ color: colors.success, fontSize: 13, marginTop: 2 }}>{feedback}</Text>}
          </Card>

        </ScrollView>
      )}
    </View>
  );
}
