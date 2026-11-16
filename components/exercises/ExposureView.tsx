// Exposição gradual: escada de degraus, dias de exposição e sessões (SUDS).

import { Ionicons } from '@expo/vector-icons';
import { newId } from '../../lib/id';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { Card, PrimaryButton } from '../ui';
import { Collapsible, consecutiveDays, L, Step, Suds, ymd } from './shared';

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
      { pt: 'Não tenho de ser perfeito/a, só tenho de continuar.', en: 'I do not have to be perfect, I just have to keep going.' },
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
  const [custom, setCustom] = useState<ProfileItem[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [sessions, setSessions] = useState<ExposureSession[]>([]);
  const [expDays, setExpDays] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');
  const [adding, setAdding] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [openPhrase, setOpenPhrase] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [subtypeIds, setSubtypeIds] = useState<string[]>([]);
  const [openTpl, setOpenTpl] = useState<string | null>(null);
  const [before, setBefore] = useState<number | null>(null);
  const [peak, setPeak] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    loadExposureSteps().then(setCustom);
    loadExposureOrder().then(setOrder);
    loadExposureHidden().then(setHidden);
    loadExposureSessions().then(setSessions);
    loadExposureDays().then(setExpDays);
    loadOnboarding().then((d: any) => { if (d?.subtypes) setSubtypeIds(d.subtypes.map((x: any) => x.id)); });
  }, []);

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

  function openStep(s: Step) {
    setSelected(s);
    setBefore(null); setPeak(null); setAfter(null); setNote('');
  }

  function saveSession() {
    if (!selected || before === null || after === null) return;
    const now = new Date();
    const entry: ExposureSession = {
      id: 'e' + now.getTime(), stepId: selected.id, stepLabel: selected.label,
      date: ymd(now), ts: now.toISOString(),
      before, peak: peak ?? before, after, note: note.trim(),
    };
    const next = [entry, ...sessions];
    setSessions(next);
    saveExposureSessions(next);
    setSelected(null);
  }

  // Vista de uma sessão para um degrau.
  if (selected) {
    const history = sessions.filter((s) => s.stepId === selected.id);
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ gap: spacing.md }}>
          <Pressable onPress={() => setSelected(null)} hitSlop={8}>
            <Text style={{ color: colors.textMuted }}>‹ {t('common.back')}</Text>
          </Pressable>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{selected.label}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('exposure.sudsHint')}</Text>

          <Card style={{ gap: 8 }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{t('exposure.before')}</Text>
            <Suds value={before} onChange={setBefore} />
          </Card>
          <Card style={{ gap: 8 }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{t('exposure.peak')}</Text>
            <Suds value={peak} onChange={setPeak} />
          </Card>
          <Card style={{ gap: 8 }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{t('exposure.after')}</Text>
            <Suds value={after} onChange={setAfter} />
          </Card>
          <TextInput
            value={note} onChangeText={setNote} placeholder={t('exposure.note')} placeholderTextColor={colors.textMuted} multiline
            style={{ minHeight: 60, padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15, textAlignVertical: 'top' }}
          />
          <PrimaryButton label={t('exposure.save')} onPress={saveSession} disabled={before === null || after === null} />

          {history.length > 0 && (
            <View style={{ gap: 8, marginTop: 4 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{t('exposure.history')}</Text>
              {history.map((h) => (
                <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>{h.date.split('-').reverse().join('/')}</Text>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>{h.before} → {h.after}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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

  // Lista da escada (visual limpo).
  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md }}>
      {/* Dias de exposição: série, últimos 7 dias e registar hoje */}
      <ExposureDaysCard days={expDays} streak={streak} markedToday={markedToday} onToggle={toggleToday} />

      {/* Referência recolhível (fechada por defeito) */}
      <Collapsible title={t('exposure.phasesTitle')} icon="list-outline">
        {EXPOSURE_PHASES.map((ph, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{pick(ph, lang)}</Text>
          </View>
        ))}
      </Collapsible>

      <Collapsible title={t('exposure.phrasesTitle')} icon="chatbox-ellipses-outline">
        {EXPOSURE_PHRASE_GROUPS.map((g, gi) => {
          const open = openPhrase === gi;
          return (
            <View key={gi} style={{ gap: 6 }}>
              <Pressable onPress={() => setOpenPhrase(open ? null : gi)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}>
                <Ionicons name={open ? 'remove' : 'add'} size={16} color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 }}>{pick(g.title, lang)}</Text>
              </Pressable>
              {open && g.phrases.map((ph, pi) => (
                <View key={pi} style={{ backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 10, marginLeft: 8 }}>
                  <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>“{pick(ph, lang)}”</Text>
                </View>
              ))}
            </View>
          );
        })}
      </Collapsible>

      <Collapsible title={t('exposure.reminderTitle')} icon="alert-circle-outline" danger>
        {EXPOSURE_REMINDERS.map((r, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={{ color: colors.danger }}>•</Text>
            <Text style={{ color: colors.text, fontSize: 13, lineHeight: 19, flex: 1 }}>{pick(r, lang)}</Text>
          </View>
        ))}
      </Collapsible>

      {/* A escada — cabeçalho + botão de reordenar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{t('exposure.ladderTitle')}</Text>
        {steps.length > 1 && (
          <Pressable onPress={() => setReordering((r) => !r)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name={reordering ? 'checkmark' : 'swap-vertical'} size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{reordering ? t('common.done') : t('exposure.reorder')}</Text>
          </Pressable>
        )}
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: -4 }}>{t('exposure.guide')}</Text>

      {/* Escada pronta (modelos por subtipo) */}
      <Pressable onPress={() => setShowTemplates(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.md }}>
        <Ionicons name="library-outline" size={20} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{tr2(lang, 'Usar uma escada pronta', 'Use a ready-made ladder')}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{tr2(lang, 'Degraus sugeridos para o teu medo', 'Suggested steps for your fear')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.primary} />
      </Pressable>

      {/* Adicionar degrau — no topo (não no fundo) */}
      {adding ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput value={newStep} onChangeText={setNewStep} onSubmitEditing={addStep} autoFocus placeholder={t('exposure.addStep')} placeholderTextColor={colors.textMuted} style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15 }} />
          <Pressable onPress={addStep} style={{ paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('common.add')}</Text>
          </Pressable>
        </View>
      ) : (
        !reordering && (
          <Pressable onPress={() => setAdding(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.primarySoft, paddingHorizontal: 14, height: 38, borderRadius: 999 }}>
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{t('exposure.addStep')}</Text>
          </Pressable>
        )
      )}

      {/* Degraus leves e numerados, num único cartão */}
      <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
        {steps.map((s, i) => (
          <View
            key={s.id}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: spacing.lg, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}
          >
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>
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
              <Pressable onPress={() => openStep(s)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{s.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <Text style={{ color: colors.danger, fontSize: 12, textAlign: 'center' }}>{t('exposure.safety')}</Text>
    </ScrollView>
  );
}

// ---- Reestruturação cognitiva (desconstruir pensamentos) ----
// Lista de "armadilhas" (distorções) frequentes na emetofobia. O id é o texto PT
// (estável); mostra-se no idioma atual.
