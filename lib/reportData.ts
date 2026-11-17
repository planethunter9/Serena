// Junta os registos guardados no telemóvel para o "Resumo para a consulta".
// Nada sai do telemóvel aqui: o PDF só é partilhado se a pessoa quiser.
// O diário nunca entra; os textos escritos só entram se a pessoa escolher.

import { reportText } from '../data/reportText';
import { Lang, tr2 } from '../i18n/i18n';
import {
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
  loadOnboarding,
  loadProfile,
  loadSafety,
  loadSeverity,
  loadThoughtRecords,
  loadUnplanned,
} from '../storage/storage';
import { UNPLANNED_TRIGGERS } from '../components/UnplannedScreen';
import { behaviorLabel } from './behaviorLabel';
import type { ReportData } from './reportHtml';

export type ReportPeriod = '30' | '90' | 'all';

const arr = <T,>(x: T[] | null | undefined): T[] => (Array.isArray(x) ? x : []);
const labelOf = (it: any) => (typeof it === 'string' ? it : it?.label ?? '');

// Formata "AAAA-MM-DD" na língua da app (ex.: 05/11/2026, 11/5/2026).
export function fmtDate(d: string, lang: Lang): string {
  const tag = lang === 'pt' ? 'pt-PT' : lang;
  try {
    return new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString(tag);
  } catch {
    return d.slice(0, 10).split('-').reverse().join('/');
  }
}

// Primeiro dia do período (inclusive), em "AAAA-MM-DD"; null = tudo.
export function periodStart(period: ReportPeriod, today = new Date()): string | null {
  if (period === 'all') return null;
  const d = new Date(today);
  d.setDate(d.getDate() - (Number(period) - 1));
  return isoLocal(d);
}

export async function collectReportData(opts: {
  lang: Lang; period: ReportPeriod; includeName: boolean; includeNotes: boolean; talk: string;
}): Promise<ReportData> {
  const { lang, period, includeNotes } = opts;
  const x = reportText(lang);
  const L = (o: { pt: string; en: string }) => tr2(lang, o.pt, o.en);
  const start = periodStart(period);
  const inPeriod = (date?: string) => !!date && (!start || date.slice(0, 10) >= start);
  const byDate = <T extends { date: string; ts?: string }>(a: T, b: T) => ((a.ts || a.date) < (b.ts || b.date) ? -1 : 1);

  const [exp, unp, th, attacks, days, sev, safety, dropped, log, chDone, mem, xp, act, onb, profile] = await Promise.all([
    loadExposureSessions(), loadUnplanned(), loadThoughtRecords(), loadAttacks(), loadExposureDays(), loadSeverity(),
    loadSafety(), loadDropped(), loadExerciseLog(), loadChallengesDone(), loadMemorySessions(), loadExperiments(),
    loadActCommitments(), loadOnboarding(), loadProfile(),
  ]);

  const exposures = arr(exp).filter((e) => inPeriod(e.date)).sort(byDate);
  const unplanned = arr(unp).filter((u) => inPeriod(u.date)).sort(byDate);
  const thoughts = arr(th).filter((t) => inPeriod(t.date)).sort(byDate);
  const hard = arr(attacks).filter((a) => inPeriod(a.date)).sort(byDate);
  const severity = arr(sev).filter((s) => inPeriod(s.date)).sort((a, b) => (a.date < b.date ? -1 : 1));

  const practice =
    arr(log).filter((e) => inPeriod(e.date)).length +
    arr(chDone).filter((k) => inPeriod(String(k).split(':')[0])).length +
    arr(mem).filter((m) => inPeriod(m.date)).length +
    arr(xp).filter((e) => inPeriod(e.date)).length +
    arr(act).reduce((n, c) => n + arr(c.logs).filter((d) => inPeriod(d)).length, 0);

  const allExp = [...exposures, ...unplanned];
  const avgDiscomfort = allExp.length
    ? { before: allExp.reduce((s, e) => s + e.before, 0) / allExp.length, after: allExp.reduce((s, e) => s + e.after, 0) / allExp.length }
    : null;

  const unplannedTrigger = (id: string) => { const f = UNPLANNED_TRIGGERS.find((t) => t.id === id); return f ? L(f.label) : id; };

  const today = isoLocal(new Date());
  const periodLabel = start ? `${fmtDate(start, lang)} – ${fmtDate(today, lang)}` : x.allTime;

  return {
    name: opts.includeName ? (profile?.name || '').trim() || undefined : undefined,
    periodLabel,
    createdAt: fmtDate(today, lang),
    includeNotes,
    counts: {
      exposures: exposures.length,
      unplanned: unplanned.length,
      thoughts: thoughts.length,
      hard: hard.length,
      exposureDays: new Set(arr(days).filter((d) => inPeriod(d))).size,
      practice,
    },
    avgDiscomfort,
    severity: severity.length >= 2 ? { first: severity[0].value, last: severity[severity.length - 1].value } : null,
    profile: {
      triggers: arr(onb?.triggers).map(labelOf).filter(Boolean),
      symptoms: arr(onb?.symptoms).map(labelOf).filter(Boolean),
    },
    exposures: exposures.map((e) => ({
      date: fmtDate(e.date, lang), step: e.stepLabel, before: e.before, peak: e.peak, after: e.after,
      note: [e.learned, e.note].filter(Boolean).join(' · '),
      feared: e.fear, prob: e.prob, probAfter: e.probAfter, happened: e.happened,
    })),
    unplanned: unplanned.map((u) => ({
      date: fmtDate(u.date, lang),
      what: [...arr(u.triggers).map(unplannedTrigger), includeNotes ? u.where : ''].filter(Boolean).join(' · ') || '–',
      before: u.before, peak: u.peak, after: u.after, stayed: u.stayed, feared: u.fear, happened: u.happened,
    })),
    hard: hard.map((h) => ({ date: fmtDate(h.date, lang), type: h.type, reason: h.reason, vomited: h.vomited })),
    safety: {
      inUse: arr(safety).filter((s) => s.doing && !s.dropping).map((s) => behaviorLabel(s.id, s.label, lang)),
      dropping: arr(safety).filter((s) => s.dropping).map((s) => behaviorLabel(s.id, s.label, lang)),
      dropped: arr(dropped).filter((d) => inPeriod(d.date)).map((d) => ({ label: behaviorLabel(d.id, d.label, lang), date: fmtDate(d.date, lang) })),
    },
    thoughts: includeNotes
      ? thoughts.map((t) => ({ date: fmtDate(t.date, lang), thought: t.thought || t.situation, balanced: t.balanced, before: t.before, after: t.after }))
      : [],
    talk: opts.talk,
  };
}
