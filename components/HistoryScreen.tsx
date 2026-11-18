// Histórico de sessões — SÓ CONSULTA (não se edita aqui).
// Abre a partir de cada exercício e mostra APENAS os registos desse exercício
// (ex.: na exposição só aparecem sessões de exposição), do mais recente para o
// mais antigo. Cada registo abre para ver o detalhe.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useA11y } from '../lib/a11y';
import { exposureText } from '../data/exposureText';
import { JOURNAL_TAGS, JournalTag, journalText, MOOD_EMOJI } from '../data/journalPrompts';
import { SAFETY_BEHAVIORS } from '../data/safety';
import { tr2, useLang } from '../i18n/i18n';
import {
  isoLocal,
  loadActCommitments,
  loadChallengesDone,
  loadCustomChallenges,
  loadExerciseLog,
  loadExperiments,
  loadExposureSessions,
  loadJournal,
  saveJournal,
  loadMemorySessions,
  loadThoughtRecords,
  loadUnplanned,
} from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { COMMITMENTS } from './AcceptanceScreen';
import { CHALLENGES } from './ChallengesScreen';
import EmptyState from './EmptyState';
import { THOUGHT_TRAPS } from './exercises/ThoughtView';
import { TopBackBar } from './ui';
import { UNPLANNED_TRIGGERS } from './UnplannedScreen';

type Kind = 'journal' | 'exposure' | 'thought' | 'experiments' | 'memory' | 'unplanned' | 'challenges' | 'acceptance' | 'practice';
type Item = { id: string; kind: Kind; sub?: string; tags?: string[]; mood?: number; ts: string; date: string; title: string; summary?: string; details: [string, string][] };

const KIND_ORDER: Kind[] = ['exposure', 'unplanned', 'thought', 'experiments', 'memory', 'challenges', 'acceptance', 'practice'];
const KIND_ICON: Record<Kind, keyof typeof Ionicons.glyphMap> = {
  journal: 'book-outline',
  exposure: 'trending-up-outline',
  unplanned: 'footsteps-outline',
  thought: 'bulb-outline',
  experiments: 'flask-outline',
  memory: 'eye-outline',
  challenges: 'shuffle-outline',
  acceptance: 'compass-outline',
  practice: 'checkmark-done-outline',
};

// Os ecrãs de exercício usam outros nomes no parâmetro "type" — traduz para o filtro.
function toKind(v?: string): Kind | 'all' {
  if (!v) return 'all';
  if ((KIND_ORDER as string[]).includes(v) || v === 'journal') return v as Kind;
  if (v === 'words' || v === 'myth') return 'practice';
  return 'all';
}

export default function HistoryScreen({ onBack, initialKind }: { onBack: () => void; initialKind?: string }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const a11y = useA11y();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const lx = (o: { pt: string; en: string }) => tr2(lang, o.pt, o.en);

  const [items, setItems] = useState<Item[] | null>(null);
  // Exercício a que este histórico pertence (fixo). Para os "outros exercícios"
  // (ex.: palavra a palavra), filtra também pelo tipo exato.
  const kind = toKind(initialKind);
  const subType = kind === 'practice' ? initialKind : undefined;
  const [open, setOpen] = useState<string | null>(null);

  const kindLabel = (k: Kind) => ({
    journal: t('journal.title'),
    exposure: t('exposure.title'),
    unplanned: t('unplanned.title'),
    thought: t('thought.title'),
    experiments: L('Experiências', 'Experiments'),
    memory: t('memory.title'),
    challenges: t('challenges.title'),
    acceptance: L('Compromissos', 'Commitments'),
    practice: L('Outros exercícios', 'Other exercises'),
  }[k]);

  const practiceName = (type: string) =>
    type === 'words' ? t('games.words') : type === 'myth' ? t('games.myth') : type;

  useEffect(() => {
    (async () => {
      const [exp, th, xp, mem, unp, chDone, chMine, act, log] = await Promise.all([
        loadExposureSessions(), loadThoughtRecords(), loadExperiments(), loadMemorySessions(), loadUnplanned(),
        loadChallengesDone(), loadCustomChallenges(), loadActCommitments(), loadExerciseLog(),
      ]);
      // O diário é privado: só aparece no histórico do próprio diário.
      const jr = kind === 'journal' ? await loadJournal() : [];
      const arr = <T,>(x: T[] | null | undefined) => (Array.isArray(x) ? x : []);
      const noon = (d: string) => `${d}T12:00:00`;
      const yesNo = (b: boolean) => (b ? L('Sim', 'Yes') : L('Não', 'No'));
      const ex = exposureText(lang);
      const out: Item[] = [];
      const push = (it: Item) => out.push({ ...it, details: it.details.filter(([, v]) => v != null && String(v).trim() !== '') });

      const jx = journalText(lang);
      for (const j of arr(jr)) push({
        id: 'jr:' + j.id, kind: 'journal', ts: j.ts || noon(j.date), date: j.date,
        title: j.text || (j.mood ? jx.moods[j.mood - 1] : ''),
        summary: j.mood ? MOOD_EMOJI[j.mood - 1] : undefined,
        tags: j.tags, mood: j.mood,
        details: [
          [jx.question, j.prompt ?? ''],
          [jx.moodLabel, j.mood ? jx.moods[j.mood - 1] : ''],
          [jx.tagsLabel, (j.tags ?? []).map((tg) => jx.tags[tg as JournalTag] ?? tg).join(', ')],
        ],
      });
      for (const s of arr(exp)) push({
        id: 'exp:' + s.id, kind: 'exposure', ts: s.ts || noon(s.date), date: s.date,
        title: s.stepLabel, summary: `${s.before} → ${s.peak} → ${s.after}`,
        details: [
          [ex.fear, s.fear ?? ''],
          [ex.probQ, typeof s.prob === 'number' ? `${s.prob}%${typeof s.probAfter === 'number' ? ` → ${s.probAfter}%` : ''}` : ''],
          [ex.happened, s.happened ? (s.happened === 'yes' ? ex.yes : s.happened === 'partly' ? ex.partly : ex.no) : ''],
          [L('Antes / pico / depois', 'Before / peak / after'), `${s.before} / ${s.peak} / ${s.after}`],
          [ex.duration, s.minutes ? `${s.minutes} ${ex.min}` : ''],
          [ex.learnedQ, s.learned ?? ''],
          [L('Nota', 'Note'), s.note],
        ],
      });
      for (const r of arr(th)) push({
        id: 'th:' + r.id, kind: 'thought', ts: r.ts || noon(r.date), date: r.date,
        title: r.thought || r.situation, summary: `${r.before} → ${r.after}`,
        details: [
          [t('thought.situation'), r.situation],
          [t('thought.thought'), r.thought],
          [L('Armadilhas', 'Traps'), (r.traps ?? []).map((id) => { const f = THOUGHT_TRAPS.find((x) => x.pt === id); return f ? lx(f) : id; }).join(', ')],
          [t('thought.evidenceFor'), r.evidenceFor],
          [t('thought.evidenceAgainst'), r.evidenceAgainst],
          [t('thought.balanced'), r.balanced],
          [L('Antes / depois', 'Before / after'), `${r.before} / ${r.after}`],
        ],
      });
      for (const x of arr(xp)) push({
        id: 'xp:' + x.id, kind: 'experiments', ts: x.ts || noon(x.date), date: x.date,
        title: x.experiment, summary: x.done ? L('feita', 'done') : L('por fazer', 'to do'),
        details: [
          [L('Previsão', 'Prediction'), x.prediction],
          [L('Quanto acreditava (0–10)', 'Belief (0–10)'), String(x.belief)],
          [L('Resultado', 'Outcome'), x.outcome],
          [L('O que aprendi', 'What I learned'), x.learned],
          [L('Feita', 'Done'), yesNo(x.done)],
        ],
      });
      for (const m of arr(mem)) push({
        id: 'mem:' + m.id, kind: 'memory', ts: m.ts || noon(m.date), date: m.date,
        title: t('memory.title'), summary: `${m.before} → ${m.after}`,
        details: [
          [L('Antes / depois', 'Before / after'), `${m.before} / ${m.after}`],
          [L('Nota', 'Note'), m.note],
        ],
      });
      for (const u of arr(unp)) {
        const trig = (u.triggers ?? []).map((id) => { const f = UNPLANNED_TRIGGERS.find((x) => x.id === id); return f ? lx(f.label) : id; });
        const happened = u.happened === 'yes' ? L('Sim', 'Yes') : u.happened === 'partly' ? L('Em parte', 'Partly') : u.happened === 'no' ? L('Não', 'No') : '';
        push({
          id: 'unp:' + u.id, kind: 'unplanned', ts: u.ts || noon(u.date), date: u.date,
          title: trig.length ? trig.join(', ') : t('unplanned.title'),
          summary: `${u.before}${u.peak != null ? ' → ' + u.peak : ''} → ${u.after}`,
          details: [
            [L('Onde', 'Where'), u.where ?? ''],
            [L('Temia', 'Feared'), u.fear ?? ''],
            [L('Aconteceu?', 'Did it happen?'), happened],
            [L('Antes / pico / depois', 'Before / peak / after'), `${u.before} / ${u.peak ?? '–'} / ${u.after}`],
            [L('Fiquei', 'Stayed'), yesNo(u.stayed)],
            [L('Segurança usada', 'Safety used'), (u.safety ?? []).map((id) => { const f = SAFETY_BEHAVIORS.find((x) => x.id === id); return f ? lx(f.label) : id; }).join(', ')],
            [L('Aprendi', 'Learned'), u.learned ?? ''],
            [L('Nota', 'Note'), u.note],
          ],
        });
      }
      const mine = arr(chMine);
      for (const key of arr(chDone)) {
        const [date, id] = key.split(':');
        if (!date || !id) continue;
        const cat = CHALLENGES.find((c) => c.id === id);
        const label = cat ? lx(cat.text) : mine.find((m) => m.id === id)?.text;
        if (!label) continue; // desafio próprio que entretanto foi apagado
        push({ id: 'ch:' + key, kind: 'challenges', ts: noon(date), date, title: label, details: [] });
      }
      for (const c of arr(act)) {
        const label = c.key ? (COMMITMENTS.find((x) => x.key === c.key)?.label ? lx(COMMITMENTS.find((x) => x.key === c.key)!.label) : c.label ?? '') : (c.label ?? '');
        (c.logs ?? []).forEach((d, i) => push({ id: `act:${c.id}:${i}`, kind: 'acceptance', ts: noon(d), date: d, title: label, details: [] }));
      }
      arr(log).forEach((e, i) => push({ id: `log:${i}`, kind: 'practice', sub: e.type, ts: e.ts || noon(e.date), date: e.date, title: practiceName(e.type), summary: e.detail, details: [] }));

      out.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0));
      setItems(out);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Só as entradas do diário se podem apagar daqui (o resto é só consulta).
  function removeJournal(it: Item) {
    Alert.alert(a11y.delete, it.title.slice(0, 80), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.remove'), style: 'destructive', onPress: async () => {
          const id = it.id.slice(3);
          const list = await loadJournal();
          await saveJournal((Array.isArray(list) ? list : []).filter((e) => e.id !== id));
          setItems((prev) => (prev ?? []).filter((x) => x.id !== it.id));
        },
      },
    ]);
  }

  const [tagFilter, setTagFilter] = useState<JournalTag | null>(null);
  const jx = journalText(lang);
  const shown = (items ?? []).filter((it) =>
    (kind === 'all' || it.kind === kind) && (!subType || it.sub === subType) && (!tagFilter || (it.tags ?? []).includes(tagFilter)));

  // Diário: humor médio por dia nos últimos 14 dias (null = sem registo).
  const moodDays: { date: string; v: number | null }[] = [];
  if (kind === 'journal') {
    const byDay = new Map<string, number[]>();
    for (const it of items ?? []) if (it.mood) byDay.set(it.date, [...(byDay.get(it.date) ?? []), it.mood]);
    const d = new Date();
    d.setDate(d.getDate() - 13);
    for (let i = 0; i < 14; i++) {
      const iso = isoLocal(d);
      const vs = byDay.get(iso);
      moodDays.push({ date: iso, v: vs ? vs.reduce((a, b) => a + b, 0) / vs.length : null });
      d.setDate(d.getDate() + 1);
    }
  }
  const hasMood = moodDays.some((m) => m.v !== null);
  const moodColor = (v: number) => (v < 2.5 ? colors.chartHigh : v < 3.5 ? colors.chartMid : colors.chartLow);

  // Agrupa por dia.
  const groups: { date: string; list: Item[] }[] = [];
  for (const it of shown) {
    const g = groups[groups.length - 1];
    if (g && g.date === it.date) g.list.push(it);
    else groups.push({ date: it.date, list: [it] });
  }
  const fmtDate = (d: string) => d.split('-').reverse().join('/');
  const fmtTime = (ts: string) => (ts.endsWith('T12:00:00') ? '' : new Date(ts).toTimeString().slice(0, 5));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={L('Histórico de sessões', 'Session history')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.sm, gap: spacing.md, paddingBottom: 120 }}>
        {kind !== 'all' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={KIND_ICON[kind]} size={18} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', flex: 1 }}>
              {subType ? practiceName(subType) : kindLabel(kind)}
            </Text>
            {items && (
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                {kind === 'journal' ? t('journal.daysWritten', { n: new Set(shown.map((it) => it.date)).size }) : shown.length}
              </Text>
            )}
          </View>
        )}
        {kind === 'journal' ? (
          <>
            {hasMood && (
              <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: 10 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{jx.moodTrend}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 64 }}>
                  {moodDays.map((m) => (
                    <View key={m.date} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                      {m.v === null ? (
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.track }} />
                      ) : (
                        <View style={{ width: '100%', maxWidth: 16, height: 8 + (m.v - 1) * 14, borderRadius: 4, backgroundColor: moodColor(m.v) }} />
                      )}
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>{moodDays[0].date.slice(8, 10)}/{moodDays[0].date.slice(5, 7)}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>{moodDays[13].date.slice(8, 10)}/{moodDays[13].date.slice(5, 7)}</Text>
                </View>
              </View>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.xl }} contentContainerStyle={{ gap: 8, paddingHorizontal: spacing.xl }}>
              {([null, ...JOURNAL_TAGS] as (JournalTag | null)[]).map((tg) => {
                const on = tagFilter === tg;
                return (
                  <Pressable key={tg ?? 'all'} onPress={() => setTagFilter(tg)} accessibilityRole="button" accessibilityState={{ selected: on }} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primary : colors.card }}>
                    <Text style={{ color: on ? colors.onPrimary : colors.text, fontSize: 13, fontWeight: '600' }}>{tg ? jx.tags[tg] : jx.all}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        ) : (
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{L('Só para consulta. Toca num registo para ver o detalhe.', 'View only. Tap an entry to see the details.')}</Text>
        )}

        {items && shown.length === 0 && (
          <EmptyState
            icon="time-outline"
            title={L('Ainda sem registos', 'No entries yet')}
            subtitle={L('Quando fizeres e guardares sessões, aparecem aqui.', 'When you do and save sessions, they show up here.')}
          />
        )}

        {groups.map((g) => (
          <View key={g.date} style={{ gap: 8 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{fmtDate(g.date)}</Text>
            {g.list.map((it) => {
              const isOpen = open === it.id;
              const canOpen = it.details.length > 0 || it.kind === 'journal';
              const time = fmtTime(it.ts);
              return (
                <View key={it.id} style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
                  <Pressable disabled={!canOpen} onPress={() => setOpen(isOpen ? null : it.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.lg }}>
                    <View style={{ width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={KIND_ICON[it.kind]} size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      {(kind === 'all' || time) ? (
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{[kind === 'all' ? kindLabel(it.kind) : '', time].filter(Boolean).join(' · ')}</Text>
                      ) : null}
                      <Text numberOfLines={isOpen ? undefined : 2} style={{ color: colors.text, fontSize: 15 }}>{it.title}</Text>
                    </View>
                    {it.summary ? <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>{it.summary}</Text> : null}
                    {canOpen && <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />}
                  </Pressable>
                  {isOpen && (
                    <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: 6 }}>
                      {it.details.map(([k, v]) => (
                        <Text key={k} style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
                          <Text style={{ color: colors.textMuted }}>{k}: </Text>{v}
                        </Text>
                      ))}
                      {it.kind === 'journal' && (
                        <Pressable onPress={() => removeJournal(it)} hitSlop={8} accessibilityRole="button" accessibilityLabel={a11y.delete} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 }}>
                          <Ionicons name="trash-outline" size={16} color={colors.danger} />
                          <Text style={{ color: colors.danger, fontSize: 13, fontWeight: '600' }}>{a11y.delete}</Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
