// Exposição gradual: escada de degraus, dias de exposição e sessões (SUDS).

import { Ionicons } from '@expo/vector-icons';
import { newId } from '../../lib/id';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SUBTYPE_OPTIONS } from '../../data/content';
import ExposureDaysCard from '../ExposureDaysCard';
import { EXPOSURE_LADDER } from '../../data/exercises';
import { LADDER_TEMPLATES } from '../../data/ladderTemplates';
import { pick, useLang, tr2 } from '../../i18n/i18n';
import {
  ExposureSession,
  loadExposureDays,
  loadNextStepId,
  saveNextStepId,
  loadExposureHidden,
  loadExposureOrder,
  loadExposureSessions,
  loadExposureSteps,
  loadOnboarding,
  ProfileItem,
  saveExposureDays,
  saveExposureHidden,
  saveExposureOrder,
  saveExposureSessions,
  saveExposureSteps,
} from '../../storage/storage';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/theme';
import { Card, CardHeader, PrimaryButton, Segmented } from '../ui';
import { ExposureSessionFlow } from './ExposureSessionFlow';
import { consecutiveDays, L, Step, ymd } from './shared';
import { exposureText } from '../../data/exposureText';
import { homeText } from '../../data/homeText';
import { migrateNextStep } from '../../lib/nextStepMigration';

const EXPOSURE_PHASES: L[] = [
  { pt: 'Dizer palavras ou frases', en: 'Say words or phrases' },
  { pt: 'Ver imagens', en: 'Look at images' },
  { pt: 'Ver e ouvir vídeos', en: 'Watch and listen to videos' },
  { pt: 'Simulação de sensações', en: 'Simulate the sensations' },
  { pt: 'Fazer / comer o que evitavas', en: 'Do / eat what you avoided' },
];

const EXPOSURE_REMINDERS: L[] = [
  { pt: 'Não tomar medicamentos anti-náusea.', en: 'Do not take anti-nausea medication.' },
  { pt: 'Não verificar repetidamente a validade dos alimentos.', en: 'Do not repeatedly check food expiry dates.' },
  { pt: 'Não usar "rituais" de distração ou rezas.', en: 'Do not use distraction "rituals" or prayers.' },
  { pt: 'Deixa a ansiedade subir e descer naturalmente, até o corpo perceber que o perigo não é real.', en: 'Let anxiety rise and fall naturally, until the body learns the danger is not real.' },
  { pt: 'Não pedir reassurance nem pesquisar razões ou sintomas.', en: 'Do not seek reassurance or search for reasons or symptoms.' },
];

const EXPOSURE_PHRASE_GROUPS: { title: L; phrases: L[] }[] = [
  {
    title: { pt: 'Reformular o negativo', en: 'Reframe the negative' },
    phrases: [
      { pt: 'Sou capaz.', en: 'I am capable.' },
      { pt: 'Eu consigo.', en: 'I can do this.' },
      { pt: 'Vale a pena, por mim.', en: 'It is worth it, for me.' },
      { pt: 'Estou a aguentar — e isso é suficiente.', en: 'I am holding on — and that is enough.' },
      { pt: 'Não preciso de perfeição — só de continuar.', en: 'I do not have to be perfect, I just have to keep going.' },
      { pt: 'Já cheguei até aqui; consigo dar mais um passo.', en: 'I have come this far; I can take one more step.' },
      { pt: 'Isto é difícil, mas não é impossível.', en: 'This is hard, but it is not impossible.' },
      { pt: 'Cada vez que fico, fico mais forte.', en: 'Every time I stay, I get stronger.' },
    ],
  },
  {
    title: { pt: 'Usar a raiva contra a fobia', en: 'Use anger against the phobia' },
    phrases: [
      { pt: 'Já chega. Não quero viver mais assim.', en: 'Enough. I do not want to live like this anymore.' },
      { pt: 'Não vou deixar o medo escolher por mim.', en: 'I will not let fear choose for me.' },
      { pt: 'A fobia já me tirou demais. Acabou.', en: 'The phobia has taken too much. It is over.' },
      { pt: 'Esta é a minha vida — não é a do medo.', en: 'This is my life — not the fear’s.' },
      { pt: 'Cansei-me de fugir. Hoje enfrento.', en: 'I am done running. Today I face it.' },
      { pt: 'O medo não manda em mim.', en: 'Fear does not run my life.' },
      { pt: 'Quero a minha liberdade de volta, e vou buscá-la.', en: 'I want my freedom back, and I am taking it.' },
    ],
  },
  {
    title: { pt: 'Para tolerar a incerteza (durante a exposição)', en: 'To tolerate uncertainty (during exposure)' },
    phrases: [
      { pt: 'Posso sentir isto e continuar.', en: 'I can feel this and carry on.' },
      { pt: 'Deixo a dúvida existir, sem a resolver.', en: 'I let the doubt be there, without resolving it.' },
      { pt: 'Não preciso de ter a certeza para ficar.', en: 'I don\'t need to be certain to stay.' },
      { pt: 'Isto é desconfortável, não é perigoso.', en: 'This is uncomfortable, not dangerous.' },
      { pt: 'Deixo a onda subir e descer.', en: 'I let the wave rise and fall.' },
    ],
  },
];

export function ExposureView({ selected, setSelected }: { selected: Step | null; setSelected: (s: Step | null) => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const ex = exposureText(lang);
  const hx = homeText(lang);
  const [nextId, setNextId] = useState<string | null>(null);
  const [custom, setCustom] = useState<ProfileItem[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [sessions, setSessions] = useState<ExposureSession[]>([]);
  const [expDays, setExpDays] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');
  const [adding, setAdding] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [tab, setTab] = useState<'steps' | 'guide'>('steps');
  const [showTemplates, setShowTemplates] = useState(false);
  const [subtypeIds, setSubtypeIds] = useState<string[]>([]);
  const [openTpl, setOpenTpl] = useState<string | null>(null);

  useEffect(() => {
    loadExposureSteps().then(setCustom);
    loadExposureOrder().then(setOrder);
    loadExposureHidden().then(setHidden);
    loadExposureSessions().then(setSessions);
    loadExposureDays().then(setExpDays);
    migrateNextStep(lang).finally(() => loadNextStepId().then(setNextId));
    loadOnboarding().then((d: any) => { if (d?.subtypes) setSubtypeIds(d.subtypes.map((x: any) => x.id)); });
  }, [lang]);

  // Importa os degraus de um modelo para a escada (sem duplicar os que já existem).
  function importSteps(stepsL: L[]) {
    const existing = new Set(base.map((s) => s.label.trim().toLowerCase()));
    const toAdd = stepsL.map((s) => pick(s, lang)).filter((label) => !existing.has(label.trim().toLowerCase()));
    if (toAdd.length) {
      const added = toAdd.map((label) => ({ id: newId('custom:'), label }));
      const nextCustom = [...custom, ...added];
      setCustom(nextCustom);
      saveExposureSteps(nextCustom);
      const nextOrder = [...steps.map((s) => s.id), ...added.map((a) => a.id)];
      setOrder(nextOrder);
      saveExposureOrder(nextOrder);
    }
    setShowTemplates(false);
    setOpenTpl(null);
  }

  // Modelos ordenados: os subtipos do próprio utilizador aparecem primeiro.
  const templates = [...LADDER_TEMPLATES].sort((a, b) =>
    (subtypeIds.includes(a.subtypeId) ? 0 : 1) - (subtypeIds.includes(b.subtypeId) ? 0 : 1)
  );

  const todayStr = ymd(new Date());
  const markedToday = expDays.includes(todayStr);
  const streak = consecutiveDays(expDays);

  function toggleToday() {
    if (!markedToday) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const next = markedToday ? expDays.filter((d) => d !== todayStr) : [...expDays, todayStr];
    setExpDays(next);
    saveExposureDays(next);
  }

  // Todos os degraus (predefinidos + personalizados), sem os removidos, reordenados segundo `order`.
  const hiddenSet = new Set(hidden);
  const base: Step[] = [
    ...EXPOSURE_LADDER.map((s) => ({ id: s.id, label: pick(s.label, lang) })),
    ...custom.map((c) => ({ id: c.id, label: c.label })),
  ].filter((s) => !hiddenSet.has(s.id));
  const byId = new Map(base.map((s) => [s.id, s]));
  const ordered: Step[] = order.map((id) => byId.get(id)).filter(Boolean) as Step[];
  const seen = new Set(order);
  const steps: Step[] = [...ordered, ...base.filter((s) => !seen.has(s.id))];
  // Próximo degrau marcado; sem marcação, sugere o 1.º degrau ainda sem sessões.
  const nextStep = nextId ? steps.find((st) => st.id === nextId) ?? null : null;
  const suggested = nextStep ? null : steps.find((st) => !sessions.some((ss) => ss.stepId === st.id)) ?? steps[0] ?? null;

  function addStep() {
    const v = newStep.trim();
    if (!v) return;
    const id = newId('custom:');
    const nextCustom = [...custom, { id, label: v }];
    setCustom(nextCustom);
    saveExposureSteps(nextCustom);
    const nextOrder = [...steps.map((s) => s.id), id];
    setOrder(nextOrder);
    saveExposureOrder(nextOrder);
    setNewStep('');
    setAdding(false);
  }

  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= steps.length) return;
    const ids = steps.map((s) => s.id);
    [ids[index], ids[j]] = [ids[j], ids[index]];
    setOrder(ids);
    saveExposureOrder(ids);
  }

  function doRemove(s: Step) {
    // Degrau personalizado: apaga-o mesmo. Predefinido: fica escondido.
    const isCustom = custom.some((c) => c.id === s.id);
    if (isCustom) {
      const nextCustom = custom.filter((c) => c.id !== s.id);
      setCustom(nextCustom);
      saveExposureSteps(nextCustom);
    } else {
      const nextHidden = [...hidden, s.id];
      setHidden(nextHidden);
      saveExposureHidden(nextHidden);
    }
    const nextOrder = order.filter((id) => id !== s.id);
    setOrder(nextOrder);
    saveExposureOrder(nextOrder);
  }

  function removeStep(s: Step) {
    Alert.alert(t('exposure.removeTitle'), t('exposure.removeMsg', { label: s.label }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.remove'), style: 'destructive', onPress: () => doRemove(s) },
    ]);
  }

  function togglePin(id: string) {
    Haptics.selectionAsync().catch(() => {});
    const next = nextId === id ? null : id;
    setNextId(next);
    saveNextStepId(next);
  }

  function openStep(s: Step) {
    setSelected(s);
  }

  function saveSession(entry: ExposureSession) {
    const next = [entry, ...sessions];
    setSessions(next);
    saveExposureSessions(next);
  }

  // Sessão para um degrau: Antes → Durante → Depois.
  if (selected) {
    return (
      <ExposureSessionFlow
        key={selected.id}
        step={selected}
        history={sessions.filter((s) => s.stepId === selected.id)}
        onSave={saveSession}
        onClose={() => setSelected(null)}
      />
    );
  }

  // Escadas prontas (modelos por subtipo).
  if (showTemplates) {
    return (
      <ScrollView contentContainerStyle={{ gap: spacing.md }}>
        <Pressable onPress={() => { setShowTemplates(false); setOpenTpl(null); }} hitSlop={8}>
          <Text style={{ color: colors.textMuted }}>‹ {t('common.back')}</Text>
        </Pressable>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{tr2(lang, 'Escadas prontas', 'Ready-made ladders')}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>
          {tr2(lang, 'Escolhe um modelo do teu medo. Os degraus são acrescentados à tua escada — podes editá-los, removê-los e reordená-los.', 'Pick a template for your fear. The steps are added to your ladder — you can edit, remove and reorder them.')}
        </Text>
        {templates.map((tpl) => {
          const label = pick(SUBTYPE_OPTIONS.find((o) => o.id === tpl.subtypeId)?.label, lang) || tpl.subtypeId;
          const mine = subtypeIds.includes(tpl.subtypeId);
          const open = openTpl === tpl.subtypeId;
          return (
            <View key={tpl.subtypeId} style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: mine ? colors.primary : colors.border, overflow: 'hidden' }}>
              <Pressable onPress={() => setOpenTpl(open ? null : tpl.subtypeId)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.lg }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{label}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{tpl.steps.length} {tr2(lang, 'degraus', 'steps')}{mine ? (tr2(lang, ' · o teu medo', ' · your fear')) : ''}</Text>
                </View>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </Pressable>
              {open && (
                <View style={{ padding: spacing.lg, paddingTop: 0, gap: 8 }}>
                  {tpl.steps.map((s: L, i: number) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
                      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{i + 1}.</Text>
                      <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{pick(s, lang)}</Text>
                    </View>
                  ))}
                  <PrimaryButton label={tr2(lang, 'Adicionar estes degraus', 'Add these steps')} onPress={() => importSteps(tpl.steps)} />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  }

  // Ecrã principal: dois separadores — "Degraus" (o que se faz) e "Guia"
  // (o que se lê). Tudo visível, sem secções recolhíveis.
  const ladderActions: [string, keyof typeof Ionicons.glyphMap, () => void, boolean][] = [
    [ex.add, 'add-circle-outline', () => setAdding(true), false],
    [ex.ready, 'library-outline', () => setShowTemplates(true), false],
    [t('exposure.reorder'), 'swap-vertical', () => setReordering(true), steps.length < 2],
  ];

  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      <Segmented value={tab} onChange={(v) => { setTab(v); setReordering(false); setAdding(false); }} options={[['steps', ex.tabSteps], ['guide', ex.tabGuide]]} />

      {tab === 'steps' && (
        <>
          {/* O teu próximo degrau (antes estava no ecrã inicial) */}
          <Card style={{ gap: spacing.md, borderColor: nextStep ? colors.primary : colors.border }}>
            <CardHeader icon="pin-outline" title={hx.nx_title} />
            {nextStep ? (
              <>
                <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{nextStep.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View style={{ flex: 1 }}><PrimaryButton label={hx.nx_start} onPress={() => openStep(nextStep)} /></View>
                  <Pressable onPress={() => togglePin(nextStep.id)} hitSlop={8} accessibilityRole="button" style={{ padding: 6 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600' }}>{hx.nx_unpin}</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{hx.nx_none}</Text>
                {suggested && (
                  <Pressable onPress={() => togglePin(suggested.id)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primarySoft, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10 }}>
                    <Ionicons name="bulb-outline" size={16} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontSize: 14, flex: 1 }} numberOfLines={2}>
                      <Text style={{ fontWeight: '700' }}>{hx.nx_suggest}: </Text>{suggested.label}
                    </Text>
                    <Ionicons name="pin-outline" size={16} color={colors.primary} />
                  </Pressable>
                )}
              </>
            )}
          </Card>

          {/* Dias de exposição: série, últimos 7 dias e registar hoje */}
          <ExposureDaysCard days={expDays} streak={streak} markedToday={markedToday} onToggle={toggleToday} />

          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
            <Text accessibilityRole="header" style={{ color: colors.text, fontWeight: '700', fontSize: 17, flex: 1 }}>{t('exposure.ladderTitle')}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{steps.length}</Text>
          </View>

          {/* Ações da escada: adicionar, escada pronta, reordenar */}
          {adding ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput value={newStep} onChangeText={setNewStep} onSubmitEditing={addStep} autoFocus placeholder={t('exposure.addStep')} placeholderTextColor={colors.textMuted} style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 15 }} />
              <Pressable onPress={addStep} accessibilityRole="button" style={{ paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>{t('common.add')}</Text>
              </Pressable>
              <Pressable onPress={() => { setAdding(false); setNewStep(''); }} accessibilityRole="button" accessibilityLabel={t('common.cancel')} style={{ width: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
          ) : reordering ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primarySoft, borderRadius: radius.lg, paddingVertical: 10, paddingLeft: spacing.md, paddingRight: 10 }}>
              <Ionicons name="swap-vertical" size={18} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>{ex.reorderHint}</Text>
              <Pressable onPress={() => setReordering(false)} accessibilityRole="button" style={{ backgroundColor: colors.primary, paddingHorizontal: 14, height: 34, borderRadius: 999, justifyContent: 'center' }}>
                <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: 13 }}>{t('common.done')}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {ladderActions.map(([label, icon, onPress, disabled]) => (
                <Pressable
                  key={label}
                  onPress={onPress}
                  disabled={disabled}
                  accessibilityRole="button"
                  style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 12, paddingHorizontal: 4, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, opacity: disabled ? 0.4 : 1 }}
                >
                  <Ionicons name={icon} size={22} color={colors.primary} />
                  <Text numberOfLines={2} style={{ color: colors.text, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>{label}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Degraus numerados, num único cartão */}
          <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: reordering ? colors.primary : colors.border, overflow: 'hidden' }}>
            {steps.map((s, i) => (
              <View
                key={s.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: spacing.lg, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}
              >
                <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>
                </View>
                {reordering ? (
                  <>
                    <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{s.label}</Text>
                    <Pressable onPress={() => move(i, -1)} hitSlop={6} disabled={i === 0} accessibilityRole="button" accessibilityLabel={tr2(lang, 'Mover para cima', 'Move up')} style={{ padding: 4, opacity: i === 0 ? 0.3 : 1 }}>
                      <Ionicons name="chevron-up" size={20} color={colors.primary} />
                    </Pressable>
                    <Pressable onPress={() => move(i, 1)} hitSlop={6} disabled={i === steps.length - 1} accessibilityRole="button" accessibilityLabel={tr2(lang, 'Mover para baixo', 'Move down')} style={{ padding: 4, opacity: i === steps.length - 1 ? 0.3 : 1 }}>
                      <Ionicons name="chevron-down" size={20} color={colors.primary} />
                    </Pressable>
                    <Pressable onPress={() => removeStep(s)} hitSlop={6} accessibilityRole="button" accessibilityLabel={tr2(lang, `Remover ${s.label}`, `Remove ${s.label}`)} style={{ padding: 4, marginLeft: 2 }}>
                      <Ionicons name="trash-outline" size={19} color={colors.danger} />
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Pressable onPress={() => openStep(s)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                      <Text style={{ color: s.id === nextId ? colors.primary : colors.text, fontSize: 15, flex: 1, fontWeight: s.id === nextId ? '700' : '400' }}>{s.label}</Text>
                    </Pressable>
                    <Pressable onPress={() => togglePin(s.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={s.id === nextId ? hx.nx_unpin : hx.nx_pin} accessibilityState={{ selected: s.id === nextId }} style={{ padding: 4 }}>
                      <Ionicons name={s.id === nextId ? 'pin' : 'pin-outline'} size={18} color={s.id === nextId ? colors.primary : colors.textMuted} />
                    </Pressable>
                    <Pressable onPress={() => openStep(s)} hitSlop={6} accessibilityElementsHidden importantForAccessibility="no">
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </Pressable>
                  </>
                )}
              </View>
            ))}
          </View>

          <Text style={{ color: colors.danger, fontSize: 12, textAlign: 'center' }}>{t('exposure.safety')}</Text>
        </>
      )}

      {tab === 'guide' && (
        <>
          <Card style={{ gap: spacing.sm }}>
            <CardHeader icon="information-circle-outline" title={t('exposure.guideTitle')} />
            <Text style={{ color: colors.text, fontSize: 14, lineHeight: 21 }}>{t('exposure.guide')}</Text>
          </Card>

          <Card style={{ gap: spacing.sm }}>
            <CardHeader icon="list-outline" title={t('exposure.phasesTitle')} />
            {EXPOSURE_PHASES.map((ph, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{pick(ph, lang)}</Text>
              </View>
            ))}
          </Card>

          <Card style={{ gap: spacing.md }}>
            <CardHeader icon="chatbox-ellipses-outline" title={t('exposure.phrasesTitle')} />
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: -4 }}>{t('exposure.phrasesHint')}</Text>
            {EXPOSURE_PHRASE_GROUPS.map((g, gi) => (
              <View key={gi} style={{ gap: 6 }}>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{pick(g.title, lang)}</Text>
                {g.phrases.map((ph, pi) => (
                  <View key={pi} style={{ backgroundColor: colors.primarySoft, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 12 }}>
                    <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>“{pick(ph, lang)}”</Text>
                  </View>
                ))}
              </View>
            ))}
          </Card>

          <Card style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
              <Text accessibilityRole="header" style={{ color: colors.text, fontWeight: '700', fontSize: 15, flex: 1 }}>{t('exposure.reminderTitle')}</Text>
            </View>
            {EXPOSURE_REMINDERS.map((r, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
                <Text style={{ color: colors.danger }}>•</Text>
                <Text style={{ color: colors.text, fontSize: 13, lineHeight: 19, flex: 1 }}>{pick(r, lang)}</Text>
              </View>
            ))}
          </Card>

          <Text style={{ color: colors.danger, fontSize: 12, textAlign: 'center' }}>{t('exposure.safety')}</Text>
        </>
      )}
    </ScrollView>
  );
}

// ---- Reestruturação cognitiva (desconstruir pensamentos) ----
// Lista de "armadilhas" (distorções) frequentes na emetofobia. O id é o texto PT
// (estável); mostra-se no idioma atual.
