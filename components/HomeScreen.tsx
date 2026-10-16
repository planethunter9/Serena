// Página inicial com duas abas no topo:
//  • "Visão geral" — contador (herói), "Num relance" e gráfico (ex-Progresso, melhorado).
//  • "Hoje" — check-in do dia (intensidade só em ataques), gatilho, exposição não
//    planeada, técnicas e sons.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { CHAPTERS } from '../data/content';
import { useLang } from '../i18n/i18n';
import {
  addAttack,
  addSeverity,
  AttackEntry,
  ExposureSession,
  JournalEntry,
  loadAttacks,
  loadExposureDays,
  loadExposureSessions,
  loadJournal,
  loadLessonsDone,
  loadSeverity,
  loadStreakStart,
  saveStreakStart,
  SeverityEntry,
} from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, ScreenTitle } from './ui';

export default function HomeScreen({
  onBreathing,
  onBodyScan,
  onPositive,
  onSounds,
  onTrigger,
  onUnplanned,
  startDate,
}: {
  onBreathing: () => void;
  onBodyScan: () => void;
  onPositive: () => void;
  onSounds: (category: 'calm' | 'sleep') => void;
  onTrigger: () => void;
  onUnplanned?: () => void;
  startDate: string;
}) {
  const { colors } = useTheme();
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
  const [chartView, setChartView] = useState<'progress' | 'activity'>('progress');
  const [chartW, setChartW] = useState(0);
  const fearScrollRef = useRef<ScrollView>(null);

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
  const CHART_HEIGHT = 130;
  const AX_LEFT = 24;    // coluna fixa com a escala Y
  const AX_BOTTOM = 30;  // faixa dos dias no eixo X
  const PAD = 6;
  const PAD_X = 10;
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
      wk.push(dt.toISOString().slice(0, 10));
    }
    weeks.push(wk);
  }
  const allFearVals = weeks.flat().map(fearFor).filter((v): v is number => v !== null);
  const avg = allFearVals.length ? allFearVals.reduce((s, v) => s + v, 0) / allFearVals.length : 0;

  // Geometria de cada página (uma semana ocupa a largura visível).
  const visibleW = Math.max(0, chartW - AX_LEFT);
  const innerW = Math.max(0, visibleW - PAD_X * 2);
  const xAt = (j: number) => PAD_X + (innerW / 6) * j; // 7 pontos (Seg..Dom)

  // 14 dias para o gráfico de atividade.
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  const activityByDay = days.map((d) => {
    const ex = exposures.filter((e) => e.date === d).length;
    const jn = journal.filter((j) => j.date === d).length;
    const sv = severity.filter((e) => e.date === d).length;
    return ex + jn + sv;
  });
  const maxActivity = Math.max(1, ...activityByDay);

  const techniques = [
    { key: 'breathing', title: t('tech.breathing'), desc: t('tech.breathingDesc'), icon: 'ellipse-outline' as const, onPress: onBreathing },
    { key: 'bodyscan', title: t('tech.bodyscan'), desc: t('tech.bodyscanDesc'), icon: 'body-outline' as const, onPress: onBodyScan },
    { key: 'positive', title: t('tech.positive'), desc: t('tech.positiveDesc'), icon: 'chatbubble-ellipses-outline' as const, onPress: onPositive },
  ];

  function CheckinButton({ label, onPress, positive }: { label: string; onPress: () => void; positive?: boolean }) {
    return (
      <Pressable onPress={onPress} style={{ flex: 1, paddingVertical: 16, borderRadius: radius.md, alignItems: 'center', backgroundColor: positive ? colors.primarySoft : colors.cardAlt, borderWidth: 2, borderColor: positive ? colors.primary : colors.border }}>
        <Text style={{ color: positive ? colors.primary : colors.text, fontWeight: '700' }}>{label}</Text>
      </Pressable>
    );
  }

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
          <View style={{ alignItems: 'center', gap: 8 }}>
            <View style={{ width: 170, height: 170, borderRadius: 85, borderWidth: 10, borderColor: colors.primary, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.primary, fontSize: 54, fontWeight: '800' }}>{dayNumber}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingHorizontal: 10 }}>{t(dayNumber === 1 ? 'home.journeyDay' : 'home.journeyDays')}</Text>
            </View>
            {dayNumber >= 30 && (
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('home.journeyMonthsCaption', { n: Math.floor(dayNumber / 30) })}</Text>
            )}
          </View>

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

          {/* Seletor Progresso / Atividade */}
          <View style={{ flexDirection: 'row', backgroundColor: colors.cardAlt, borderRadius: 999, padding: 4 }}>
            {(['progress', 'activity'] as const).map((v) => {
              const active = chartView === v;
              return (
                <Pressable key={v} onPress={() => setChartView(v)} style={{ flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center', backgroundColor: active ? colors.card : 'transparent' }}>
                  <Text style={{ color: active ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 14 }}>
                    {v === 'progress' ? t('progress.tabProgress') : t('progress.tabActivity')}
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
                  <View onLayout={(e) => setChartW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', height: CHART_HEIGHT }}>
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
                        style={{ width: visibleW }}
                        onContentSizeChange={() => fearScrollRef.current?.scrollToEnd({ animated: false })}
                      >
                        {weeks.map((wk, wi) => {
                          const pts = wk
                            .map((d, j) => { const v = fearFor(d); return v === null ? null : { x: xAt(j), y: yAt(v) }; })
                            .filter((p): p is { x: number; y: number } => p !== null);
                          const poly = pts.map((p) => `${p.x},${p.y}`).join(' ');
                          const range = `${dmShort(wk[0])} – ${dmShort(wk[6])}`;
                          return (
                            <Svg key={wi} width={visibleW} height={CHART_HEIGHT}>
                              {/* Grelha horizontal (0 a 5) */}
                              {[0, 1, 2, 3, 4, 5].map((v) => (
                                <Line key={'g' + v} x1={PAD_X} y1={yAt(v)} x2={visibleW - PAD_X} y2={yAt(v)} stroke={colors.border} strokeWidth={0.5} opacity={v === 0 ? 1 : 0.4} />
                              ))}
                              {/* Intervalo da semana */}
                              <SvgText x={visibleW / 2} y={plotH + 30} fontSize={8} fill={colors.textMuted} textAnchor="middle">{range}</SvgText>
                              {/* Dias da semana no eixo X */}
                              {WEEKDAYS.map((wd, j) => (
                                <SvgText key={'wd' + j} x={xAt(j)} y={plotH + 12} fontSize={8} fill={colors.textMuted} textAnchor="middle">{wd}</SvgText>
                              ))}
                              {/* Linha + pontos da semana */}
                              {pts.length > 1 && (
                                <Polyline points={poly} fill="none" stroke={colors.primary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                              )}
                              {pts.map((p, i) => (
                                <Circle key={'p' + i} cx={p.x} cy={p.y} r={3.5} fill={colors.primary} />
                              ))}
                            </Svg>
                          );
                        })}
                      </ScrollView>
                    )}
                  </View>
                )}
              </>
            ) : (
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
              <CheckinButton label={t('home.none')} onPress={noneToday} positive />
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

          {/* Estou com um gatilho */}
          <Pressable onPress={onTrigger} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.primarySoft }}>
            <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="flash-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{t('home.triggerTitle')}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('home.triggerDesc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>

          {/* Exposição não planeada */}
          {onUnplanned && (
            <Pressable onPress={onUnplanned} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="footsteps-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{t('home.unplannedTitle')}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('home.unplannedDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          )}

          {/* Técnicas */}
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 }}>{t('home.techniquesTitle')}</Text>
          {techniques.map((tech) => (
            <Pressable key={tech.key} onPress={tech.onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={tech.icon} size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{tech.title}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{tech.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          ))}

          {/* Sons */}
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 }}>{t('home.soundsTitle')}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {[
              { key: 'calm' as const, label: t('home.soundsCalm'), icon: 'leaf-outline' as const },
              { key: 'sleep' as const, label: t('home.soundsSleep'), icon: 'moon-outline' as const },
            ].map((s) => (
              <Pressable key={s.key} onPress={() => onSounds(s.key)} style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: 8 }}>
                <Ionicons name={s.icon} size={26} color={colors.primary} />
                <Text style={{ color: colors.text, fontWeight: '600' }}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
