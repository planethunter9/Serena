// Histórico de sessões — SÓ CONSULTA (não se edita aqui).
// Abre a partir de cada exercício e mostra APENAS os registos desse exercício
// (ex.: na exposição só aparecem sessões de exposição), do mais recente para o
// mais antigo. Cada registo abre para ver o detalhe.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SAFETY_BEHAVIORS } from '../data/safety';
import { tr2, useLang } from '../i18n/i18n';
import {
  loadActCommitments,
  loadChallengesDone,
  loadCustomChallenges,
  loadExerciseLog,
  loadExperiments,
  loadExposureSessions,
  loadMemorySessions,
  loadThoughtRecords,
  loadUnplanned,
} from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { COMMITMENTS } from './AcceptanceScreen';
import { CHALLENGES } from './ChallengesScreen';
import EmptyState from './EmptyState';
import { THOUGHT_TRAPS } from './ExercisesScreen';
import { TopBackBar } from './ui';
import { UNPLANNED_TRIGGERS } from './UnplannedScreen';

type Kind = 'exposure' | 'thought' | 'experiments' | 'memory' | 'unplanned' | 'challenges' | 'acceptance' | 'practice';
type Item = { id: string; kind: Kind; sub?: string; ts: string; date: string; title: string; summary?: string; details: [string, string][] };

const KIND_ORDER: Kind[] = ['exposure', 'unplanned', 'thought', 'experiments', 'memory', 'challenges', 'acceptance', 'practice'];
const KIND_ICON: Record<Kind, keyof typeof Ionicons.glyphMap> = {
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
  if ((KIND_ORDER as string[]).includes(v)) return v as Kind;
  if (v === 'words' || v === 'myth') return 'practice';
  return 'all';
}

export default function HistoryScreen({ onBack, initialKind }: { onBack: () => void; initialKind?: string }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const lx = (o: { pt: string; en: string }) => tr2(lang, o.pt, o.en);

  const [items, setItems] = useState<Item[] | null>(null);
  // Exercício a que este histórico pertence (fixo). Para os "outros exercícios"
  // (ex.: palavra a palavra), filtra também pelo tipo exato.
  const kind = toKind(initialKind);
  const subType = kind === 'practice' ? initialKind : undefined;
  const [open, setOpen] = useState<string | null>(null);

  const kindLabel = (k: Kind) => ({
    exposure: t('exposure.title'),
    unplanned: t('unplanned.title'),
    thought: t('thought.title'),
    experiments: L('Experiências', 'Experiments'),
    memory: t('memory.title'),
    challenges: t('challenges.title'),
    acceptance: L('Compromissos', 'Commitments'),
    practice: L('Outros exercícios', 'Other exercises'),
  }[k]);

  useEffect(() => {
    (async () => {
      const [exp, th, xp, mem, unp, chDone, chMine, act, log] = await Promise.all([
        loadExposureSessions(), loadThoughtRecords(), loadExperiments(), loadMemorySessions(), loadUnplanned(),
        loadChallengesDone(), loadCustomChallenges(), loadActCommitments(), loadExerciseLog(),
      ]);
      const arr = <T,>(x: T[] | null | undefined) => (Array.isArray(x) ? x : []);
      const noon = (d: string) => `${d}T12:00:00`;
      const yesNo = (b: boolean) => (b ? L('Sim', 'Yes') : L('Não', 'No'));
      const out: Item[] = [];
      const push = (it: Item) => out.push({ ...it, details: it.details.filter(([, v]) => v != null && String(v).trim() !== '') });

      for (const s of arr(exp)) push({
        id: 'exp:' + s.id, kind: 'exposure', ts: s.ts || noon(s.date), date: s.date,
        title: s.stepLabel, summary: `${s.before} → ${s.peak} → ${s.after}`,
        details: [
          [L('Antes / pico / depois', 'Before / peak / after'), `${s.before} / ${s.peak} / ${s.after}`],
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
      const practiceName = (type: string) =>
        type === 'words' ? t('games.words') : type === 'myth' ? t('games.myth') : type;
      arr(log).forEach((e, i) => push({ id: `log:${i}`, kind: 'practice', sub: e.type, ts: e.ts || noon(e.date), date: e.date, title: practiceName(e.type), details: [] }));

      out.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0));
      setItems(out);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const shown = (items ?? []).filter((it) => (kind === 'all' || it.kind === kind) && (!subType || it.sub === subType));

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
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800', flex: 1 }}>
              {subType ? (shown[0]?.title ?? kindLabel(kind)) : kindLabel(kind)}
            </Text>
            {items && <Text style={{ color: colors.textMuted, fontSize: 13 }}>{shown.length}</Text>}
          </View>
        )}
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{L('Só para consulta. Toca num registo para ver o detalhe.', 'View only. Tap an entry to see the details.')}</Text>

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
              const canOpen = it.details.length > 0;
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
