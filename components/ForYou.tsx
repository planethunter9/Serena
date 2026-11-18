// Recomendações por regras (lib/recommendations.ts), usadas em dois sítios:
// - no "Como está a fobia hoje?" do ecrã inicial (a melhor sugestão para hoje);
// - no topo de Recursos › Exercícios ("Para ti", só exercícios).
// Junta o que a pessoa indicou (tipo de medo) com o que tem feito; cada
// sugestão diz o porquê. Nada sai do telemóvel.

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CHAPTERS, SUBTYPE_OPTIONS } from '../data/content';
import { LADDER_TEMPLATES } from '../data/ladderTemplates';
import { SAFETY_BEHAVIORS } from '../data/safety';
import { recText } from '../data/recText';
import { pick, useLang } from '../i18n/i18n';
import { loadLadderSteps } from '../lib/ladder';
import { Rec, RecId, recommend, RecInput } from '../lib/recommendations';
import {
  isoLocal,
  loadExerciseLog,
  loadExperiments,
  loadExposureSessions,
  loadExposureSteps,
  loadJournal,
  loadLessonsDone,
  loadNextStepId,
  loadOnboarding,
  loadSafety,
  loadSafetyFree,
  loadThoughtRecords,
} from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, CardHeader } from './ui';

// Lições escolhidas para alguns tipos de medo (a 1.ª ainda por ler).
const LESSONS_FOR: Record<string, string[]> = {
  pregnancy: ['kids1'], family: ['kids1'], parenting: ['kids1'], illness: ['l25'], food: ['l25'],
};

type Base = Omit<RecInput, 'severity' | 'today'>;
const arr = <T,>(x: T[] | null | undefined): T[] => (Array.isArray(x) ? x : []);
const lastDate = (xs: { date: string }[]) => xs.reduce<string | null>((m, x) => (!m || x.date > m ? x.date : m), null);

// Carrega o resumo usado pelas regras (recarrega ao voltar ao ecrã).
export function useRecBase(): Base | null {
  const { lang } = useLang();
  const [base, setBase] = useState<Base | null>(null);
  useFocusEffect(useCallback(() => {
    let alive = true;
    (async () => {
      const today = isoLocal();
      const [onb, exp, custom, steps, pinned, done, xp, safety, free, th, jr, log] = await Promise.all([
        loadOnboarding(), loadExposureSessions(), loadExposureSteps(), loadLadderSteps(lang), loadNextStepId(),
        loadLessonsDone(), loadExperiments(), loadSafety(), loadSafetyFree(), loadThoughtRecords(), loadJournal(), loadExerciseLog(),
      ]);
      const subtypes = arr(onb?.subtypes).map((s: any) => (typeof s === 'string' ? s : s?.id)).filter(Boolean) as string[];
      const sessions = arr(exp);
      const pinnedStep = pinned ? steps.find((s) => s.id === pinned) ?? null : null;
      const step = pinnedStep ?? steps.find((s) => !sessions.some((e) => e.stepId === s.id)) ?? steps[0] ?? null;
      const tpl = LADDER_TEMPLATES.find((t) => subtypes.includes(t.subtypeId));
      const tplLabel = tpl ? pick(SUBTYPE_OPTIONS.find((o) => o.id === tpl.subtypeId)?.label, lang) : '';
      const lessons = CHAPTERS.flatMap((c) => c.lessons);
      const doneL = arr(done);
      const nextL = lessons.find((l) => !doneL.includes(l.id)) ?? null;
      const forId = subtypes.flatMap((s) => LESSONS_FOR[s] ?? []).find((id) => !doneL.includes(id));
      const forL = forId ? lessons.find((l) => l.id === forId) ?? null : null;
      const pending = arr(xp).find((e) => !e.done);
      const saf = arr(safety);
      const dropping = saf.filter((s) => s.dropping);
      const notFree = dropping.find((s) => !(free[s.id] ?? []).includes(today));
      const labelOf = (id: string, fallback: string) => pick(SAFETY_BEHAVIORS.find((b) => b.id === id)?.label, lang) || fallback;
      const next: Base = {
        subtypes,
        lastExposure: lastDate(sessions),
        step,
        hasCustomSteps: arr(custom).length > 0,
        templateSubtype: tpl ? { id: tpl.subtypeId, label: tplLabel } : null,
        nextLesson: nextL ? { id: nextL.id, title: pick(nextL.title, lang) } : null,
        lessonsDone: doneL.length,
        forLesson: forL ? { id: forL.id, title: pick(forL.title, lang) } : null,
        pendingExperiment: pending ? pending.experiment : null,
        doingCount: saf.filter((s) => s.doing).length,
        droppingCount: dropping.length,
        droppingNotFreeToday: notFree ? { id: notFree.id, label: labelOf(notFree.id, notFree.label) } : null,
        lastThought: lastDate(arr(th)),
        lastJournal: lastDate(arr(jr)),
        mythPlayed: arr(log).some((e) => e.type === 'myth'),
        wordsPlayed: arr(log).some((e) => e.type === 'words'),
      };
      if (alive) setBase(next);
    })();
    return () => { alive = false; };
  }, [lang]));
  return base;
}

// Texto (título e porquê) de uma recomendação.
export function recLabels(r: Rec, rx: Record<string, string>) {
  const fill = (s: string) => Object.entries(r.vars ?? {}).reduce((acc, [k, v]) => acc.replace(`{${k}}`, v), s);
  const titleKey = r.id === 'lessonFor' ? 't_lesson' : `t_${r.id}`;
  const reasonKey = r.reasonKey ?? (r.id === 'lessonFor' ? 'r_lessonFor' : r.id === 'experiment' ? 'r_experimentFor' : r.id === 'words' ? 'r_wordsFor' : `r_${r.id}`);
  return { title: fill(rx[titleKey] ?? ''), reason: fill(rx[reasonKey] ?? '') };
}

// Uma linha de recomendação (ícone, título, porquê, seta).
export function RecRow({ r, first, divider }: { r: Rec; first?: boolean; divider?: boolean }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const router = useRouter();
  const { title, reason } = recLabels(r, recText(lang) as unknown as Record<string, string>);
  return (
    <Pressable
      onPress={() => router.push(r.route as any)}
      accessibilityRole="button"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: divider ? 1 : 0, borderTopColor: colors.border }}
    >
      <View style={{ width: 38, height: 38, borderRadius: radius.md, backgroundColor: first ? colors.primary : colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={r.icon as keyof typeof Ionicons.glyphMap} size={19} color={first ? colors.onPrimary : colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={2} style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 17 }}>{reason}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

// Só sugestões de exercícios (para o topo de Recursos › Exercícios).
const EXERCISE_RECS: RecId[] = ['exposure', 'template', 'result', 'experiment', 'words', 'thought', 'myth'];

export function ForYouExercises({ severity }: { severity: number | null }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const base = useRecBase();
  if (!base) return null;
  const recs = recommend({ ...base, severity, today: isoLocal() }, 99).filter((r) => EXERCISE_RECS.includes(r.id)).slice(0, 2);
  if (!recs.length) return null;
  return (
    <Card style={{ gap: spacing.xs, borderColor: colors.primary }}>
      <CardHeader icon="sparkles-outline" title={recText(lang).forExercises} />
      {recs.map((r, i) => <RecRow key={r.id} r={r} first={i === 0} divider={i > 0} />)}
    </Card>
  );
}
