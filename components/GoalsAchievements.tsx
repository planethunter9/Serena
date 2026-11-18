// Página única com "Conquistas" e "Objetivos", alternadas por um segmented control.

import { Ionicons } from '@expo/vector-icons';
import { newId } from '../lib/id';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ACHIEVEMENTS, AchStats } from '../data/achievements';
import { pick, useLang , tr2 } from '../i18n/i18n';
import {
  Goal,
  isoLocal,
  loadGoals,
  saveGoals,
  saveManualAchievements,
} from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, CardHeader, PrimaryButton, Segmented, TopBackBar } from './ui';
import { goalsText } from '../data/goalsText';
import { loadAchStats } from '../lib/achievementStats';
import { loadLadderSteps } from '../lib/ladder';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

// Objetivos sugeridos (bilingue).
const GOAL_SUGGESTIONS: { pt: string; en: string }[] = [
  { pt: 'Comer fora sem verificar tudo', en: 'Eat out without checking everything' },
  { pt: 'Viajar sem levar "itens de segurança"', en: 'Travel without "safety items"' },
  { pt: 'Comer um alimento que ando a evitar', en: 'Eat a food I have been avoiding' },
  { pt: 'Estar perto de alguém doente sem fugir', en: 'Be near someone ill without fleeing' },
  { pt: 'Dormir sem precisar de ninguém por perto', en: 'Sleep without needing anyone nearby' },
  { pt: 'Ver um vídeo que costumo evitar', en: 'Watch a video I usually avoid' },
  { pt: 'Passar um dia sem procurar reassurance', en: 'Go a day without seeking reassurance' },
  { pt: 'Reduzir as verificações de validade', en: 'Cut down on checking expiry dates' },
  { pt: 'Dizer "sim" a um plano que diria que não', en: 'Say "yes" to a plan I would decline' },
  { pt: 'Ficar com a náusea sem tomar nada', en: 'Stay with nausea without taking anything' },
];

// ---------- Conquistas ----------
function AchievementsBody() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [stats, setStats] = useState<AchStats | null>(null);
  const [manual, setManual] = useState<string[]>([]);

  useEffect(() => {
    loadAchStats().then(({ stats: st, manual: m }) => { setStats(st); setManual(m); });
  }, []);

  function isUnlocked(a: (typeof ACHIEVEMENTS)[number]) {
    if (a.manual) return manual.includes(a.id);
    return stats ? a.check(stats).unlocked : false;
  }
  function toggleManual(id: string) {
    const next = manual.includes(id) ? manual.filter((x) => x !== id) : [...manual, id];
    setManual(next);
    saveManualAchievements(next);
  }

  const unlockedCount = ACHIEVEMENTS.filter(isUnlocked).length;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }}>
      <Text style={{ color: colors.textMuted, fontSize: 14 }}>
        {t('ach.count', { have: unlockedCount, total: ACHIEVEMENTS.length })}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {ACHIEVEMENTS.map((a) => {
          const unlocked = isUnlocked(a);
          const res = !a.manual && stats ? a.check(stats) : { unlocked, have: undefined as number | undefined, need: undefined as number | undefined };
          return (
            <Pressable
              key={a.id}
              onPress={a.manual ? () => toggleManual(a.id) : undefined}
              style={{ width: '47%', flexGrow: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: unlocked ? colors.primary : colors.border, alignItems: 'center', gap: 8 }}
            >
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: unlocked ? colors.primarySoft : colors.cardAlt, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={a.icon} size={26} color={unlocked ? colors.primary : colors.textMuted} style={{ opacity: unlocked ? 1 : 0.45 }} />
              </View>
              <Text style={{ color: unlocked ? colors.text : colors.textMuted, fontSize: 15, fontWeight: '700', textAlign: 'center' }}>{pick(a.title, lang)}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{pick(a.desc, lang)}</Text>

              {unlocked ? (
                <View style={{ backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>{t('ach.unlocked')}</Text>
                </View>
              ) : a.manual ? (
                <View style={{ backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>{t('ach.mark')}</Text>
                </View>
              ) : res.need ? (
                <View style={{ alignSelf: 'stretch', gap: 4, marginTop: 2 }}>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.track, overflow: 'hidden' }}>
                    <View style={{ width: `${Math.min(100, ((res.have ?? 0) / res.need) * 100)}%`, height: '100%', backgroundColor: colors.primary, borderRadius: 3 }} />
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600', textAlign: 'center', fontVariant: ['tabular-nums'] }}>{Math.min(res.have ?? 0, res.need)}/{res.need}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ---------- Objetivos ----------
// Sugestões sempre à vista, um cartão para criar (texto, prazo opcional e
// degrau da exposição opcional), e as listas "Em curso" e "Cumpridos".
const DAY = 86400000;
function addDays(n: number) {
  return isoLocal(new Date(Date.now() + n * DAY));
}
const fmtD = (d: string) => d.split('-').reverse().join('/');

function GoalsBody() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const gx = goalsText(lang);
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [text, setText] = useState('');
  const [target, setTarget] = useState<number>(0); // dias (0 = sem prazo)
  const [stepId, setStepId] = useState<string | null>(null);
  const [steps, setSteps] = useState<{ id: string; label: string }[]>([]);
  const [celebrate, setCelebrate] = useState<string | null>(null);

  useEffect(() => {
    loadGoals().then(setGoals);
    loadLadderSteps(lang).then(setSteps);
  }, [lang]);

  // O cartão de celebração desaparece sozinho.
  useEffect(() => {
    if (!celebrate) return;
    const id = setTimeout(() => setCelebrate(null), 4000);
    return () => clearTimeout(id);
  }, [celebrate]);

  function persist(next: Goal[]) {
    setGoals(next);
    saveGoals(next);
  }
  function create(label: string, opts?: { target?: number; stepId?: string | null }) {
    const v = label.trim();
    if (!v || goals.some((g) => g.text === v && !g.done)) return;
    const st = opts?.stepId ? steps.find((s) => s.id === opts.stepId) : undefined;
    const g: Goal = {
      id: newId('g'), text: v, done: false,
      ...(opts?.target ? { target: addDays(opts.target) } : {}),
      ...(st ? { stepId: st.id, stepLabel: st.label } : {}),
    };
    persist([...goals, g]);
  }
  function add() {
    create(text, { target, stepId });
    setText(''); setTarget(0); setStepId(null);
  }
  function toggle(g: Goal) {
    const done = !g.done;
    if (done) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setCelebrate(g.text);
    }
    persist(goals.map((x) => (x.id === g.id ? { ...x, done, doneAt: done ? isoLocal() : undefined } : x)));
  }
  function remove(id: string) {
    persist(goals.filter((g) => g.id !== id));
  }

  const available = GOAL_SUGGESTIONS.map((g) => pick(g, lang)).filter((label) => !goals.some((x) => x.text === label));
  const open = goals.filter((g) => !g.done);
  const done = goals.filter((g) => g.done).sort((a, b) => ((a.doneAt ?? '') < (b.doneAt ?? '') ? 1 : -1));
  const today = isoLocal();
  const chip = (on: boolean) => ({ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primary : 'transparent' });
  const chipText = (on: boolean) => ({ color: on ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' as const });

  const goalCard = (g: Goal) => {
    const late = !g.done && g.target && g.target < today;
    return (
      <View key={g.id} style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: g.done ? colors.success : colors.border, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => toggle(g)} hitSlop={8} accessibilityRole="checkbox" accessibilityState={{ checked: g.done }} accessibilityLabel={g.text}>
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: g.done ? colors.success : 'transparent', borderWidth: 2, borderColor: g.done ? colors.success : colors.border, alignItems: 'center', justifyContent: 'center' }}>
              {g.done && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </Pressable>
          <Text style={{ color: g.done ? colors.textMuted : colors.text, fontSize: 16, flex: 1, textDecorationLine: g.done ? 'line-through' : 'none' }}>{g.text}</Text>
          <Pressable onPress={() => remove(g.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={tr2(lang, 'Remover objetivo', 'Remove goal')} style={{ padding: 4 }}>
            <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
        {(g.target || g.stepLabel || g.doneAt) && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginLeft: 38 }}>
            {g.done && g.doneAt ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.successSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                <Ionicons name="trophy-outline" size={13} color={colors.success} />
                <Text style={{ color: colors.success, fontSize: 12, fontWeight: '600' }}>{gx.doneOn} {fmtD(g.doneAt)}</Text>
              </View>
            ) : g.target ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: late ? colors.cardAlt : colors.primarySoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                <Ionicons name="calendar-outline" size={13} color={late ? colors.textMuted : colors.primary} />
                <Text style={{ color: late ? colors.textMuted : colors.primary, fontSize: 12, fontWeight: '600' }}>{gx.until} {fmtD(g.target)}{late ? ` · ${gx.late}` : ''}</Text>
              </View>
            ) : null}
            {g.stepLabel ? (
              <Pressable onPress={() => router.push({ pathname: '/exercise', params: { type: 'exposure' } } as any)} accessibilityRole="button" accessibilityHint={gx.openStep} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.cardAlt, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, maxWidth: '100%' }}>
                <Ionicons name="trending-up-outline" size={13} color={colors.primary} />
                <Text numberOfLines={1} style={{ color: colors.text, fontSize: 12, fontWeight: '600', flexShrink: 1 }}>{gx.stepLabel}: {g.stepLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('goals.subtitle')}</Text>

      {celebrate && (
        <View accessibilityLiveRegion="polite" style={{ backgroundColor: colors.successSoft, borderRadius: radius.lg, padding: spacing.lg, gap: 4, borderWidth: 1, borderColor: colors.success }}>
          <Text style={{ color: colors.success, fontSize: 17, fontWeight: '700' }}>{gx.celebrateTitle}</Text>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{celebrate}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{gx.celebrateBody}</Text>
        </View>
      )}

      {/* Sugestões */}
      {available.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{gx.sugg}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.xl }} contentContainerStyle={{ gap: 8, paddingHorizontal: spacing.xl }}>
            {available.map((label) => (
              <Pressable
                key={label}
                onPress={() => create(label)}
                accessibilityRole="button"
                style={{ maxWidth: 230, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.lg }}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 13, flexShrink: 1 }}>{label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Novo objetivo */}
      <Card style={{ gap: spacing.md }}>
        <CardHeader icon="flag-outline" title={gx.newGoal} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t('goals.addPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={{ padding: 14, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 16 }}
        />
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{gx.target}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {([[0, gx.none], [7, gx.week], [30, gx.month], [90, gx.months3]] as const).map(([d, l]) => (
            <Pressable key={d} onPress={() => setTarget(d)} accessibilityRole="radio" accessibilityState={{ selected: target === d }} style={chip(target === d)}>
              <Text style={chipText(target === d)}>{l}</Text>
            </Pressable>
          ))}
        </View>
        {steps.length > 0 && (
          <>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{gx.step}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {steps.map((st) => {
                const on = stepId === st.id;
                return (
                  <Pressable key={st.id} onPress={() => setStepId(on ? null : st.id)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[chip(on), { maxWidth: 220 }]}>
                    <Text numberOfLines={1} style={chipText(on)}>{st.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        )}
        <PrimaryButton label={t('common.add')} onPress={add} disabled={!text.trim()} />
      </Card>

      {/* Em curso */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.sm }}>
        <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>{gx.inProgress}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{open.length}</Text>
      </View>
      {open.length === 0 ? (done.length === 0 ? <Text style={{ color: colors.textMuted, fontSize: 14 }}>{gx.empty}</Text> : null) : open.map(goalCard)}

      {/* Cumpridos */}
      {done.length > 0 && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.sm }}>
            <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>{gx.done}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{done.length}</Text>
          </View>
          {done.map(goalCard)}
        </>
      )}
    </ScrollView>
  );
}

export default function GoalsAchievements({ onBack, initial = 'achievements' }: { onBack: () => void; initial?: 'achievements' | 'goals' }) {
  const { colors } = useTheme();
  const { t } = useLang();
  const [tab, setTab] = useState<'achievements' | 'goals'>(initial);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('goalsAchievements.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm }}>
        <Segmented value={tab} onChange={setTab} options={[['achievements', t('resources.achievements')], ['goals', t('resources.goals')]]} />
      </View>
      {tab === 'achievements' ? <AchievementsBody /> : <GoalsBody />}
    </View>
  );
}
