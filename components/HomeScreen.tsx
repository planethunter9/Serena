// Página inicial com duas abas: "Visão geral" (afirmação, círculo dos pilares,
// frase dos dias de exposição, próximo passo e plano) e "Estatísticas".
// O círculo pode ser diário / semanal / mensal (escolhido na Personalização).

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, { runOnJS, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, Stop } from 'react-native-svg';
import { EXPOSURE_LADDER } from '../data/exercises';
import PlanView, { PlanEditor } from './Plan';
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
  loadDropped,
  loadExerciseLog,
  loadExperiments,
  loadExposureDays,
  loadExposureHidden,
  loadExposureOrder,
  loadExposureSessions,
  loadExposureSteps,
  loadMemorySessions,
  loadNextStep,
  loadRingMode,
  loadSeverity,
  saveRingMode,
  loadThoughtRecords,
  loadUnplanned,
  MemorySession,
  ProfileItem,
  RingMode,
  saveDashboardOrder,
  saveExposureOrder,
  saveExposureSteps,
  saveNextStep,
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
  const { lang } = useLang();
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

  // Próximo passo.
  const [customSteps, setCustomSteps] = useState<ProfileItem[]>([]);
  const [stepOrder, setStepOrder] = useState<string[]>([]);
  const [stepHidden, setStepHidden] = useState<string[]>([]);
  const [savedNextStep, setSavedNextStep] = useState('');
  const [severityToday, setSeverityToday] = useState<number | null>(null);
  const [nsText, setNsText] = useState('');
  const [nsSheetOpen, setNsSheetOpen] = useState(false);
  const [nsAdding, setNsAdding] = useState(false);
  const [nsNewStep, setNsNewStep] = useState('');
  function closeNsSheet() { setNsSheetOpen(false); setNsAdding(false); setNsNewStep(''); }

  const [dashOrder, setDashOrder] = useState<string[]>(['hero', 'plan']);
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

  // Sheet do "próximo passo" (mesmo comportamento: arrastar para baixo fecha).
  const nsTY = useSharedValue(0);
  const nsScroll = useSharedValue(0);
  const nsScrollRef = useAnimatedRef<any>();
  useEffect(() => { if (nsSheetOpen) nsTY.set(0); }, [nsSheetOpen, nsTY]);
  const nsOnScroll = useAnimatedScrollHandler((e) => { nsScroll.set(e.contentOffset.y); });
  const nsGesture = Gesture.Pan()
    .onUpdate((e) => { if (e.translationY > 0 && nsScroll.get() <= 0) nsTY.set(e.translationY); })
    .onEnd((e) => {
      if (nsTY.get() > 120 || e.velocityY > 800) {
        nsTY.set(withTiming(SCREEN_H, { duration: 220 }, (f) => { if (f) runOnJS(closeNsSheet)(); }));
      } else {
        nsTY.set(withSpring(0, { damping: 20, stiffness: 200 }));
      }
    })
    // eslint-disable-next-line react-hooks/refs -- o gesture-handler só guarda o ref; não o lê aqui
    .simultaneousWithExternalGesture(nsScrollRef);
  const nsAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateY: nsTY.get() }] }));

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
    loadExposureSteps().then(setCustomSteps);
    loadExposureOrder().then(setStepOrder);
    loadExposureHidden().then(setStepHidden);
    loadNextStep().then((s) => { setSavedNextStep(s); setNsText(s); });
    loadSeverity().then((list) => { const today = list.find((e) => e.date === isoLocal()); setSeverityToday(today ? today.value : null); });
    loadDashboardOrder().then((o) => {
      const valid = o.filter((k): k is 'hero' | 'plan' => k === 'hero' || k === 'plan');
      const full = [...valid, ...(['hero', 'plan'] as const).filter((k) => !valid.includes(k))];
      setDashOrder(full);
    });
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

  // --- Próximo passo: sugestão a partir da escada ---
  const hiddenSet = new Set(stepHidden);
  const base = [
    ...EXPOSURE_LADDER.map((s) => ({ id: s.id, label: pick(s.label, lang) })),
    ...customSteps.map((c) => ({ id: c.id, label: c.label })),
  ].filter((s) => !hiddenSet.has(s.id));
  const byId = new Map(base.map((s) => [s.id, s]));
  const ordered = stepOrder.map((id) => byId.get(id)).filter(Boolean) as { id: string; label: string }[];
  const seen = new Set(stepOrder);
  const steps = [...ordered, ...base.filter((s) => !seen.has(s.id))];
  const countByStep: Record<string, number> = {};
  exposures.forEach((e) => { countByStep[e.stepId] = (countByStep[e.stepId] ?? 0) + 1; });
  const sugStep = steps.find((s) => (countByStep[s.id] ?? 0) === 0)
    ?? steps.reduce<{ id: string; label: string } | null>((min, s) => (!min || (countByStep[s.id] ?? 0) < (countByStep[min.id] ?? 0) ? s : min), null);
  const sug = sugStep?.label ?? '';

  function saveNs() {
    const v = nsText.trim();
    setSavedNextStep(v);
    saveNextStep(v);
    closeNsSheet();
  }

  // Adiciona um passo novo à escada (fica também disponível como sugestão) e seleciona-o.
  function addNsStep() {
    const v = nsNewStep.trim();
    if (!v) return;
    const id = 'custom:' + Date.now();
    const nextCustom = [...customSteps, { id, label: v }];
    setCustomSteps(nextCustom);
    saveExposureSteps(nextCustom);
    const nextOrder = [...steps.map((s) => s.id), id];
    setStepOrder(nextOrder);
    saveExposureOrder(nextOrder);
    setNsText(v);
    setNsNewStep('');
    setNsAdding(false);
  }

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
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>{p.pct}%</Text>
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

  function nextStepBlock() {
    return (
      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="footsteps-outline" size={18} color={colors.primary} />
          <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{L('O teu próximo passo', 'Your next step')}</Text>
          <Pressable onPress={() => { setNsText(savedNextStep); setNsSheetOpen(true); }} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="create-outline" size={15} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{savedNextStep ? L('mudar', 'change') : L('definir', 'set')}</Text>
          </Pressable>
        </View>

        {savedNextStep ? (
          <Text style={{ color: colors.text, fontSize: 15 }}>{savedNextStep}</Text>
        ) : (
          <>
            <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{L('Ainda não definiste o teu próximo passo. Toca em "definir".', 'You haven\'t set your next step yet. Tap "set".')}</Text>
            {!!sug && (
              <Pressable onPress={() => { setNsText(sug); setNsSheetOpen(true); }} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, alignSelf: 'flex-start', maxWidth: '100%', backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.md }}>
                <Ionicons name="bulb-outline" size={14} color={colors.primary} style={{ marginTop: 2 }} />
                {/* flexShrink: o texto quebra linha dentro do cartão em vez de sair pela direita */}
                <Text style={{ color: colors.primary, fontSize: 13, lineHeight: 18, flexShrink: 1 }} numberOfLines={3}>
                  <Text style={{ fontWeight: '700' }}>{L('Sugestão: ', 'Suggestion: ')}</Text>{sug}
                </Text>
              </Pressable>
            )}
          </>
        )}
      </Card>
    );
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
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
          {severityToday != null ? L(`Hoje: ${severityToday}/5 · toca para mudar`, `Today: ${severityToday}/5 · tap to change`) : L('0 = nada · 5 = muito', '0 = none · 5 = a lot')}
        </Text>
      </Card>
    );
  }

  const DASH: Record<string, () => any> = { hero: heroBlock, plan: planBlock };

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
          <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="sunny-outline" size={20} color={colors.primary} />
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', flex: 1, lineHeight: 21 }}>{pick(affirmation, lang)}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: -spacing.sm }}>
            <Pressable onPress={toggleReorder} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name={reordering ? 'checkmark' : unlocked ? 'swap-vertical' : 'lock-closed-outline'} size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{reordering ? L('Concluir', 'Done') : L('Reordenar', 'Reorder')}</Text>
            </Pressable>
          </View>

          {dashOrder.map((key, i) => (
            reordering ? (
              <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radius.lg, padding: spacing.sm }}>
                <View style={{ flex: 1 }}>{DASH[key]?.()}</View>
                <View style={{ gap: 4 }}>
                  <Pressable onPress={() => moveDash(i, -1)} hitSlop={6} disabled={i === 0} accessibilityRole="button" accessibilityLabel={L('Mover para cima', 'Move up')} style={{ padding: 4, opacity: i === 0 ? 0.3 : 1 }}>
                    <Ionicons name="chevron-up" size={22} color={colors.primary} />
                  </Pressable>
                  <Pressable onPress={() => moveDash(i, 1)} hitSlop={6} disabled={i === dashOrder.length - 1} accessibilityRole="button" accessibilityLabel={L('Mover para baixo', 'Move down')} style={{ padding: 4, opacity: i === dashOrder.length - 1 ? 0.3 : 1 }}>
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

          {severityBlock()}

          {nextStepBlock()}

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
                  <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', flex: 1 }}>{L('Editar plano', 'Edit plan')}</Text>
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

      {/* Próximo passo — sheet que desliza de baixo para cima */}
      <Modal visible={nsSheetOpen} transparent animationType="slide" onRequestClose={closeNsSheet}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <Pressable style={{ flex: 1 }} onPress={closeNsSheet} />
            <GestureDetector gesture={nsGesture}>
              <Reanimated.View style={[{ backgroundColor: colors.background, borderTopLeftRadius: 22, borderTopRightRadius: 22, height: '82%' }, nsAnimStyle]}>
                <View style={{ alignItems: 'center', paddingTop: 8 }}>
                  <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border }} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 6, paddingBottom: 8 }}>
                  <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', flex: 1 }}>{L('Próximo passo', 'Next step')}</Text>
                  <Pressable onPress={closeNsSheet} hitSlop={8} accessibilityRole="button" accessibilityLabel={L('Fechar', 'Close')}>
                    <Ionicons name="close" size={26} color={colors.textMuted} />
                  </Pressable>
                </View>
                <Reanimated.ScrollView ref={nsScrollRef} onScroll={nsOnScroll} scrollEventThrottle={16} contentContainerStyle={{ padding: spacing.xl, paddingTop: 4, paddingBottom: 60, gap: spacing.md }} keyboardShouldPersistTaps="handled">
                  <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{L('Escolhe um passo da lista ou adiciona o teu.', 'Pick a step from the list or add your own.')}</Text>

                  {/* Adicionar passo — no topo, não no fundo */}
                  {nsAdding ? (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TextInput value={nsNewStep} onChangeText={setNsNewStep} onSubmitEditing={addNsStep} autoFocus
                        placeholder={L('Escreve o teu passo…', 'Write your own step…')} placeholderTextColor={colors.textMuted}
                        style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15 }} />
                      <Pressable onPress={addNsStep} style={{ paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>{L('Adicionar', 'Add')}</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable onPress={() => setNsAdding(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.primarySoft, paddingHorizontal: 14, height: 38, borderRadius: 999 }}>
                      <Ionicons name="add" size={18} color={colors.primary} />
                      <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{L('Adicionar passo', 'Add step')}</Text>
                    </Pressable>
                  )}

                  {/* Lista de passos */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {steps.map((s) => {
                      const sel = nsText.trim() === s.label;
                      return (
                        <Pressable key={s.id} onPress={() => setNsText(s.label)} style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 2, borderColor: sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primarySoft : colors.cardAlt }}>
                          <Text style={{ color: sel ? colors.primary : colors.text, fontSize: 14, fontWeight: sel ? '700' : '500' }}>{s.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Pressable onPress={saveNs} disabled={!nsText.trim()} style={{ alignItems: 'center', paddingVertical: 13, borderRadius: radius.md, backgroundColor: colors.primary, opacity: nsText.trim() ? 1 : 0.5, marginTop: 4 }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{L('Guardar', 'Save')}</Text>
                  </Pressable>
                </Reanimated.ScrollView>
              </Reanimated.View>
            </GestureDetector>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}
