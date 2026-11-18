// Página inicial com duas abas: "Visão geral" (afirmação, círculo dos pilares,
// frase dos dias de exposição, próximo passo e plano) e "Estatísticas".
// O círculo pode ser diário / semanal / mensal (escolhido na Personalização).

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Alert, Dimensions, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, { runOnJS, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, Stop } from 'react-native-svg';
import { HOME_BLOCK_IDS, HomeBlockId, homeEmptyText, normalizeHomeOrder } from '../data/homeBlocks';
import EmptyState from './EmptyState';
import PlanView, { PlanEditor } from './Plan';
import { migrateNextStep } from '../lib/nextStepMigration';
import { homeText } from '../data/homeText';
import { plansText } from '../data/plansText';
import ProgressScreen from './ProgressScreen';
import { pick, useLang , tr2 } from '../i18n/i18n';
import {
  ActCommitment,
  DroppedBehavior,
  ExerciseLogEntry,
  ExperimentEntry,
  ExposureSession,
  isoLocal,
  loadActCommitments,
  addSeverity,
  loadChallengesDone,
  loadDashboardOrder,
  loadHomeHidden,
  loadDropped,
  loadExerciseLog,
  loadExperiments,
  loadExposureDays,
  loadExposureSessions,
  loadMemorySessions,
  loadRingMode,
  loadSeverity,
  saveRingMode,
  loadThoughtRecords,
  loadUnplanned,
  MemorySession,
  RingMode,
  saveDashboardOrder,
  ThoughtRecord,
  UnplannedLog,
} from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { CoachTarget } from './CoachMarks';
import { Card } from './ui';

type L = { pt: string; en: string };

const AFFIRMATIONS: L[] = [
  { pt: 'Posso sentir isto e continuar.', en: 'I can feel this and carry on.' },
  { pt: 'Desconfortável não é perigoso.', en: 'Uncomfortable is not dangerous.' },
  { pt: 'Não preciso de ter a certeza para seguir em frente.', en: "I don't need certainty to move forward." },
  { pt: 'Cada vez que fico, fico mais forte.', en: 'Every time I stay, I get stronger.' },
  { pt: 'O medo mente — não tenho de acreditar nele.', en: "Fear lies — I don't have to believe it." },
  { pt: 'Já cheguei até aqui; consigo dar mais um passo.', en: 'I have come this far; I can take one more step.' },
  { pt: 'Deixo a onda subir e descer.', en: 'I let the wave rise and fall.' },
  { pt: 'A minha vida é maior do que o meu medo.', en: 'My life is bigger than my fear.' },
];

function expStreakOf(days: string[]): number {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(isoLocal(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(isoLocal(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export default function HomeScreen({ startDate }: { startDate: string }) {
  const { colors, unlocked, ringColors, defaultRingColors } = useTheme();
  const { t, lang } = useLang();
  const hx = homeText(lang);
  const router = useRouter();
  const L = (pt: string, en: string) => tr2(lang, pt, en);

  const [tab, setTab] = useState<'overview' | 'stats'>('overview');
  // "Agora" fixado ao abrir (os dados também são carregados uma vez), para o desenho ser estável.
  const [nowMs] = useState(() => Date.now());

  // Dados (terapia / formas de enfrentar).
  const [exposures, setExposures] = useState<ExposureSession[]>([]);
  const [expDays, setExpDays] = useState<string[]>([]);
  const [dropped, setDropped] = useState<DroppedBehavior[]>([]);
  const [commitments, setCommitments] = useState<ActCommitment[]>([]);
  const [challengesDone, setChallengesDone] = useState<string[]>([]);
  const [exerciseLog, setExerciseLog] = useState<ExerciseLogEntry[]>([]);
  const [thoughts, setThoughts] = useState<ThoughtRecord[]>([]);
  const [experiments, setExperiments] = useState<ExperimentEntry[]>([]);
  const [memories, setMemories] = useState<MemorySession[]>([]);
  const [unplanned, setUnplanned] = useState<UnplannedLog[]>([]);
  const [ringMode, setRingMode] = useState<RingMode>('daily');

  const [severityToday, setSeverityToday] = useState<number | null>(null);

  const [dashOrder, setDashOrder] = useState<HomeBlockId[]>(HOME_BLOCK_IDS);
  // Blocos escondidos em Definições › Ecrã inicial (recarregados ao voltar ao início).
  const [hiddenBlocks, setHiddenBlocks] = useState<string[]>([]);
  useFocusEffect(useCallback(() => { loadHomeHidden().then(setHiddenBlocks); }, []));
  const [reordering, setReordering] = useState(false);
  const [planSheetOpen, setPlanSheetOpen] = useState(false);
  const [planViewKey, setPlanViewKey] = useState(0);
  function closePlanSheet() { setPlanSheetOpen(false); setPlanViewKey((k) => k + 1); }

  // Arrastar o sheet para baixo para fechar (gesture-handler + reanimated).
  const SCREEN_H = Dimensions.get('window').height;
  const sheetTY = useSharedValue(0);
  const sheetScroll = useSharedValue(0);
  const sheetScrollRef = useAnimatedRef<any>();
  useEffect(() => { if (planSheetOpen) sheetTY.set(0); }, [planSheetOpen, sheetTY]);
  const sheetOnScroll = useAnimatedScrollHandler((e) => { sheetScroll.set(e.contentOffset.y); });
  const sheetGesture = Gesture.Pan()
    .onUpdate((e) => { if (e.translationY > 0 && sheetScroll.get() <= 0) sheetTY.set(e.translationY); })
    .onEnd((e) => {
      if (sheetTY.get() > 120 || e.velocityY > 800) {
        sheetTY.set(withTiming(SCREEN_H, { duration: 220 }, (f) => { if (f) runOnJS(closePlanSheet)(); }));
      } else {
        sheetTY.set(withSpring(0, { damping: 20, stiffness: 200 }));
      }
    })
    // eslint-disable-next-line react-hooks/refs -- o gesture-handler só guarda o ref; não o lê aqui
    .simultaneousWithExternalGesture(sheetScrollRef);
  const sheetAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetTY.get() }] }));

  // O "próximo passo" passou para a Exposição: migra o texto antigo uma vez.
  useEffect(() => { migrateNextStep(lang).catch(() => {}); }, [lang]);

  useEffect(() => {
    loadExposureSessions().then(setExposures);
    loadExposureDays().then(setExpDays);
    loadDropped().then(setDropped);
    loadActCommitments().then(setCommitments);
    loadChallengesDone().then(setChallengesDone);
    loadExerciseLog().then(setExerciseLog);
    loadThoughtRecords().then(setThoughts);
    loadExperiments().then(setExperiments);
    loadMemorySessions().then(setMemories);
    loadUnplanned().then(setUnplanned);
    loadRingMode().then(setRingMode);
    loadSeverity().then((list) => { const today = list.find((e) => e.date === isoLocal()); setSeverityToday(today ? today.value : null); });
    loadDashboardOrder().then((o) => setDashOrder(normalizeHomeOrder(o)));
  }, []);

  const expStreak = expStreakOf(expDays);
  const totalExpDays = expDays.length;

  const now = new Date();
  const startY = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startY.getTime()) / 86400000);
  const affirmation = AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length];

  // --- Pilares ---
  // Contam: terapia de exposição + comportamentos largados + exercícios que são
  // terapia / formas de enfrentar (pensamentos, experiências, memória, não planeada,
  // compromissos de aproximação). NÃO contam diário nem lições.
  const periodDays = ringMode === 'daily' ? 1 : ringMode === 'weekly' ? 7 : 30;
  const periodSet = new Set<string>();
  for (let i = 0; i < periodDays; i++) periodSet.add(isoLocal(new Date(nowMs - i * 86400000)));

  const challengeDates = challengesDone.map((kk) => kk.split(':')[0]);
  const exerciseDates = exerciseLog.map((e) => e.date);
  const therapyDates = [
    ...exposures.map((e) => e.date),
    ...thoughts.map((r) => r.date),
    ...experiments.map((x) => x.date),
    ...memories.map((m) => m.date),
    ...unplanned.map((u) => u.date),
    ...commitments.flatMap((c) => c.logs),
    ...dropped.map((d) => d.date),
    ...challengeDates,
    ...exerciseDates,
  ];
  // "Aproximação" = enfrentar mesmo: exposição, não planeada, compromissos,
  // largados, desafios de incerteza e os exercícios de treino registados.
  const facingDates = [
    ...exposures.map((e) => e.date),
    ...unplanned.map((u) => u.date),
    ...commitments.flatMap((c) => c.logs),
    ...dropped.map((d) => d.date),
    ...challengeDates,
    ...exerciseDates,
  ];

  const therapyInPeriod = therapyDates.filter((d) => periodSet.has(d));
  const facingInPeriod = facingDates.filter((d) => periodSet.has(d));
  const daysWithTherapy = new Set(therapyInPeriod).size;

  const appTarget = ringMode === 'daily' ? 1 : ringMode === 'weekly' ? 5 : 15;
  // A 1.ª atividade do período conta para a Prática; as seguintes (repetições)
  // contam para a Repetição — só há repetição se já houver ≥1 feita.
  const repeats = Math.max(0, therapyInPeriod.length - 1);
  const repeatTarget = ringMode === 'daily' ? 1 : ringMode === 'weekly' ? 6 : 19;

  const practicePct = ringMode === 'daily'
    ? (therapyInPeriod.length >= 1 ? 100 : 0)
    : Math.min(100, Math.round((daysWithTherapy / periodDays) * 100));
  const repetitionPct = Math.min(100, Math.round((repeats / repeatTarget) * 100));
  const approachPct = Math.min(100, Math.round((facingInPeriod.length / appTarget) * 100));

  const ringCols = ringColors ?? defaultRingColors;
  const PILLARS = [
    { name: L('Prática', 'Practice'), pct: practicePct, color: ringCols[0] },
    { name: L('Repetição', 'Repetition'), pct: repetitionPct, color: ringCols[1] },
    { name: L('Aproximação', 'Approach'), pct: approachPct, color: ringCols[2] },
  ];

  // --- Anel ---
  const RING = 144, RC = RING / 2, SW = 10;
  const radii = [RC - SW, RC - SW * 2 - 6, RC - SW * 3 - 12];

  function heroBlock() {
    const streakLine = expStreak === 0
      ? L(`sem dias seguidos agora — e tudo bem · ${totalExpDays} no total`, `no streak right now — and that's okay · ${totalExpDays} total`)
      : L(`${expStreak} ${expStreak === 1 ? 'dia' : 'dias'} seguidos · ${totalExpDays} no total`, `${expStreak} ${expStreak === 1 ? 'day' : 'days'} in a row · ${totalExpDays} total`);
    return (
      <Card style={{ gap: spacing.md }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{L('Os teus pilares', 'Your pillars')}</Text>

        {/* Vista do círculo: diário / semanal / mensal (guarda-se) */}
        <View style={{ flexDirection: 'row', backgroundColor: colors.cardAlt, borderRadius: 999, padding: 3 }}>
          {([['daily', L('Diário', 'Daily')], ['weekly', L('Semanal', 'Weekly')], ['monthly', L('Mensal', 'Monthly')]] as const).map(([m, lbl]) => {
            const active = ringMode === m;
            return (
              <Pressable key={m} onPress={() => { setRingMode(m); saveRingMode(m); }} accessibilityRole="button" accessibilityState={{ selected: active }} style={{ flex: 1, paddingVertical: 7, borderRadius: 999, alignItems: 'center', backgroundColor: active ? colors.card : 'transparent' }}>
                <Text style={{ color: active ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 12 }}>{lbl}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <View style={{ width: RING, height: RING }}>
            <Svg width={RING} height={RING}>
              <Defs>
                {PILLARS.map((p, i) => (
                  <LinearGradient key={i} id={`ringGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor={p.color} stopOpacity={0.3} />
                    <Stop offset="1" stopColor={p.color} stopOpacity={1} />
                  </LinearGradient>
                ))}
              </Defs>
              <G rotation={-90} origin={`${RC}, ${RC}`}>
                {PILLARS.map((p, i) => {
                  const r = radii[i];
                  const circ = 2 * Math.PI * r;
                  return (
                    <G key={i}>
                      <Circle cx={RC} cy={RC} r={r} stroke={colors.cardAlt} strokeWidth={SW} fill="none" opacity={0.5} />
                      <Circle cx={RC} cy={RC} r={r} stroke={`url(#ringGrad${i})`} strokeWidth={SW} fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - p.pct / 100)} />
                    </G>
                  );
                })}
              </G>
            </Svg>
          </View>

          <View style={{ gap: 10, flex: 1 }}>
            {PILLARS.map((p) => (
              <View key={p.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: p.color }} />
                <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{p.name}</Text>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{p.pct}%</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
          <Ionicons name="flame-outline" size={13} color={colors.primary} /> {streakLine}
        </Text>
      </Card>
    );
  }

  function planBlock() {
    return <PlanView key={planViewKey} onEdit={() => setPlanSheetOpen(true)} />;
  }

  // Check-in diário de gravidade (0–5) — alimenta o gráfico "Gravidade" nas Estatísticas.
  function severityBlock() {
    return (
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="pulse-outline" size={18} color={colors.primary} />
          <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{L('Como está a fobia hoje?', 'How is the phobia today?')}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[0, 1, 2, 3, 4, 5].map((v) => {
            const sel = severityToday === v;
            return (
              <Pressable
                key={v}
                onPress={() => { Haptics.selectionAsync().catch(() => {}); setSeverityToday(v); addSeverity(v); }}
                accessibilityRole="button"
                accessibilityLabel={L(`Gravidade ${v} de 5`, `Severity ${v} of 5`)}
                style={{ flex: 1, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? colors.primary : colors.cardAlt, borderWidth: 2, borderColor: sel ? colors.primary : colors.border }}
              >
                <Text style={{ color: sel ? '#fff' : colors.text, fontWeight: '700' }}>{v}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{hx.s_zero}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{hx.s_five}</Text>
        </View>
        {/* Sugestão conforme o número escolhido */}
        {severityToday != null && (() => {
          const v = severityToday;
          const band = v <= 1 ? 'low' : v <= 3 ? 'mid' : v === 4 ? 'high' : 'max';
          const text = band === 'low' ? hx.s_low : band === 'mid' ? hx.s_mid : band === 'high' ? hx.s_high : hx.s_max;
          const acts: [string, keyof typeof Ionicons.glyphMap, any][] =
            band === 'low' ? [[t('exposure.title'), 'trending-up-outline', { pathname: '/exercise', params: { type: 'exposure' } }]]
            : band === 'mid' ? [[t('games.words'), 'text-outline', { pathname: '/exercise', params: { type: 'words' } }], [t('exposure.title'), 'trending-up-outline', { pathname: '/exercise', params: { type: 'exposure' } }]]
            : band === 'high' ? [[L('Surfar o impulso', 'Urge surfing'), 'water-outline', '/urgesurf'], [t('tech.breathing'), 'pulse-outline', '/breathing']]
            : [[plansText(lang).viewPlan, 'reader-outline', '/myplan'], [t('triggerhelp.title'), 'flash-outline', '/triggerhelp']];
          return (
            <View style={{ backgroundColor: band === 'max' || band === 'high' ? colors.cardAlt : colors.primarySoft, borderRadius: radius.md, padding: spacing.md, gap: 10 }}>
              <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>{text}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {acts.map(([label, icon, route]) => (
                  <Pressable key={label} onPress={() => router.push(route)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}>
                    <Ionicons name={icon} size={15} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })()}
      </Card>
    );
  }

  function affirmationBlock() {
    return (
      <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Ionicons name="sunny-outline" size={20} color={colors.primary} />
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', flex: 1, lineHeight: 21 }}>{pick(affirmation, lang)}</Text>
      </View>
    );
  }

  const DASH: Record<HomeBlockId, () => any> = { affirmation: affirmationBlock, hero: heroBlock, plan: planBlock, severity: severityBlock };
  // Só os blocos que a pessoa quer ver, pela ordem escolhida.
  const visibleBlocks = dashOrder.filter((k) => !hiddenBlocks.includes(k));

  // Move um bloco visível; os escondidos mantêm o lugar na ordem completa.
  function moveDash(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= visibleBlocks.length) return;
    const vis = [...visibleBlocks];
    [vis[index], vis[j]] = [vis[j], vis[index]];
    let n = 0;
    const ids = dashOrder.map((k) => (hiddenBlocks.includes(k) ? k : vis[n++]));
    setDashOrder(ids);
    saveDashboardOrder(ids);
  }
  function toggleReorder() {
    if (!unlocked) {
      Alert.alert(L('Personalização', 'Personalization'), L('Reordenar o painel faz parte do pack de personalização.', 'Reordering the panel is part of the personalization pack.'));
      return;
    }
    setReordering((r) => !r);
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg }}>
        <View style={{ flexDirection: 'row', backgroundColor: colors.cardAlt, borderRadius: 999, padding: 4 }}>
          {(['overview', 'stats'] as const).map((v) => {
            const active = tab === v;
            return (
              <Pressable key={v} onPress={() => setTab(v)} style={{ flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center', backgroundColor: active ? colors.card : 'transparent' }}>
                <Text style={{ color: active ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 14 }}>
                  {v === 'overview' ? L('Visão geral', 'Overview') : L('Estatísticas', 'Statistics')}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {tab === 'stats' ? (
        <ProgressScreen />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.lg, gap: spacing.lg, paddingBottom: 120 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: -spacing.sm }}>
            <Pressable onPress={toggleReorder} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name={reordering ? 'checkmark' : unlocked ? 'swap-vertical' : 'lock-closed-outline'} size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{reordering ? L('Concluir', 'Done') : L('Reordenar', 'Reorder')}</Text>
            </Pressable>
          </View>

          {visibleBlocks.length === 0 && (
            <EmptyState icon="eye-off-outline" title={homeEmptyText(lang)} />
          )}

          {visibleBlocks.map((key, i) => (
            reordering ? (
              <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radius.lg, padding: spacing.sm }}>
                <View style={{ flex: 1 }}>{DASH[key]?.()}</View>
                <View style={{ gap: 4 }}>
                  <Pressable onPress={() => moveDash(i, -1)} hitSlop={6} disabled={i === 0} accessibilityRole="button" accessibilityLabel={L('Mover para cima', 'Move up')} style={{ padding: 4, opacity: i === 0 ? 0.3 : 1 }}>
                    <Ionicons name="chevron-up" size={22} color={colors.primary} />
                  </Pressable>
                  <Pressable onPress={() => moveDash(i, 1)} hitSlop={6} disabled={i === visibleBlocks.length - 1} accessibilityRole="button" accessibilityLabel={L('Mover para baixo', 'Move down')} style={{ padding: 4, opacity: i === visibleBlocks.length - 1 ? 0.3 : 1 }}>
                    <Ionicons name="chevron-down" size={22} color={colors.primary} />
                  </Pressable>
                </View>
              </View>
            ) : key === 'hero' || key === 'plan' ? (
              <CoachTarget key={key} name={key === 'hero' ? 'pillars' : 'home-plan'}>{DASH[key]?.()}</CoachTarget>
            ) : (
              <View key={key}>{DASH[key]?.()}</View>
            )
          ))}


        </ScrollView>
      )}

      {/* Plano — sheet que desliza de baixo para cima */}
      <Modal visible={planSheetOpen} transparent animationType="slide" onRequestClose={closePlanSheet}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <Pressable style={{ flex: 1 }} onPress={closePlanSheet} />
            <GestureDetector gesture={sheetGesture}>
              <Reanimated.View style={[{ backgroundColor: colors.background, borderTopLeftRadius: 22, borderTopRightRadius: 22, height: '92%' }, sheetAnimStyle]}>
                <View style={{ alignItems: 'center', paddingTop: 8 }}>
                  <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border }} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 6, paddingBottom: 8 }}>
                  <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', flex: 1 }}>{L('Editar plano', 'Edit plan')}</Text>
                  <Pressable onPress={closePlanSheet} hitSlop={8} accessibilityRole="button" accessibilityLabel={L('Fechar', 'Close')}>
                    <Ionicons name="close" size={26} color={colors.textMuted} />
                  </Pressable>
                </View>
                <Reanimated.ScrollView ref={sheetScrollRef} onScroll={sheetOnScroll} scrollEventThrottle={16} contentContainerStyle={{ padding: spacing.xl, paddingTop: 4, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
                  <PlanEditor />
                </Reanimated.ScrollView>
              </Reanimated.View>
            </GestureDetector>
          </View>
        </GestureHandlerRootView>
      </Modal>

    </View>
  );
}
