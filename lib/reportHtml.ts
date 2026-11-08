// HTML do "Resumo para a consulta" (convertido em PDF com expo-print).
// Função pura: recebe os dados já preparados (textos resolvidos na língua da
// app) e devolve o HTML. Os dados vêm de lib/reportData.ts.

import type { ReportText } from '../data/reportText';

export type ReportData = {
  name?: string;
  periodLabel: string;           // ex.: "01/10/2026 – 31/10/2026" ou "Todos os registos"
  createdAt: string;             // data já formatada
  includeNotes: boolean;
  counts: { exposures: number; unplanned: number; thoughts: number; hard: number; exposureDays: number; practice: number };
  avgDiscomfort?: { before: number; after: number } | null;
  severity?: { first: number; last: number } | null;
  profile: { triggers: string[]; symptoms: string[] };
  exposures: { date: string; step: string; before: number; peak: number; after: number; note?: string }[];
  unplanned: { date: string; what: string; before: number; peak?: number; after: number; stayed: boolean; feared?: string; happened?: 'yes' | 'partly' | 'no' }[];
  hard: { date: string; type: 'anxiety' | 'panic' | 'behavior'; reason?: string; vomited?: boolean }[];
  safety: { inUse: string[]; dropping: string[]; dropped: { label: string; date: string }[] };
  thoughts: { date: string; thought: string; balanced: string; before: number; after: number }[];
  talk?: string;
};

const esc = (s: string | number | undefined | null) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const multiline = (s: string) => esc(s).replace(/\n/g, '<br>');

function table(head: string[], rows: (string | number)[][], x: ReportText): string {
  if (!rows.length) return `<p class="muted">${esc(x.none)}</p>`;
  return `<table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function buildReportHtml(d: ReportData, x: ReportText, lang: string): string {
  const yn = (b: boolean | undefined) => (b == null ? '–' : b ? x.yes : x.no);
  const happened = (h?: 'yes' | 'partly' | 'no') => (h === 'yes' ? x.yes : h === 'partly' ? x.partly : h === 'no' ? x.no : '–');
  const typeLabel = { anxiety: x.anxiety, panic: x.panic, behavior: x.behavior };

  const kpis: [string, number][] = [
    [x.exposures, d.counts.exposures],
    [x.unplanned, d.counts.unplanned],
    [x.exposureDays, d.counts.exposureDays],
    [x.thoughts, d.counts.thoughts],
    [x.practice, d.counts.practice],
    [x.hard, d.counts.hard],
  ];

  const facts: string[] = [];
  if (d.avgDiscomfort) facts.push(`<li>${esc(x.avgDrop)}: <b>${round1(d.avgDiscomfort.before)} → ${round1(d.avgDiscomfort.after)}</b></li>`);
  if (d.severity) facts.push(`<li>${esc(x.severity)}: <b>${d.severity.first} → ${d.severity.last}</b></li>`);

  const profile = [
    d.profile.triggers.length ? `<p><b>${esc(x.triggers)}:</b> ${esc(d.profile.triggers.join(', '))}</p>` : '',
    d.profile.symptoms.length ? `<p><b>${esc(x.symptoms)}:</b> ${esc(d.profile.symptoms.join(', '))}</p>` : '',
  ].join('');

  const expHead = [x.date, x.step, x.bpa, ...(d.includeNotes ? [x.note] : [])];
  const expRows = d.exposures.map((e) => [e.date, e.step, `${e.before} / ${e.peak} / ${e.after}`, ...(d.includeNotes ? [e.note ?? ''] : [])]);

  const unpHead = [x.date, x.what, x.bpa, x.stayed, ...(d.includeNotes ? [x.feared, x.happened] : [])];
  const unpRows = d.unplanned.map((u) => [
    u.date, u.what, `${u.before} / ${u.peak ?? '–'} / ${u.after}`, yn(u.stayed),
    ...(d.includeNotes ? [u.feared ?? '', happened(u.happened)] : []),
  ]);

  const hardHead = [x.date, x.type, x.vomited, ...(d.includeNotes ? [x.reason] : [])];
  const hardRows = d.hard.map((h) => [h.date, typeLabel[h.type] ?? h.type, yn(h.vomited), ...(d.includeNotes ? [h.reason ?? ''] : [])]);

  const safetyList = (title: string, items: string[]) =>
    items.length ? `<p><b>${esc(title)}:</b> ${esc(items.join(', '))}</p>` : '';
  const safety = [
    safetyList(x.inUse, d.safety.inUse),
    safetyList(x.dropping, d.safety.dropping),
    safetyList(x.dropped, d.safety.dropped.map((s) => `${s.label} (${s.date})`)),
  ].join('') || `<p class="muted">${esc(x.none)}</p>`;

  const thoughts = d.includeNotes
    ? table([x.date, x.thought, x.balanced, x.ba], d.thoughts.map((t) => [t.date, t.thought, t.balanced, `${t.before} / ${t.after}`]), x)
    : `<p class="muted">${esc(x.notesHidden)}</p>`;

  return `<!doctype html>
<html lang="${esc(lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Serena — ${esc(x.docTitle)}</title>
<style>
  @page { margin: 18mm 14mm; }
  body { font-family: -apple-system, "Helvetica Neue", Roboto, Arial, sans-serif; color: #16212a; font-size: 11pt; line-height: 1.45; margin: 0; }
  h1 { font-size: 20pt; margin: 0 0 2px; color: #2f7d8c; }
  h2 { font-size: 13pt; margin: 18px 0 6px; padding-bottom: 3px; border-bottom: 1px solid #dde5ea; }
  .meta { color: #5d6b78; font-size: 10pt; margin: 2px 0; }
  .muted { color: #5d6b78; font-size: 10pt; }
  .kpis { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .kpi { flex: 1 1 28%; border: 1px solid #dde5ea; border-radius: 8px; padding: 8px 10px; }
  .kpi b { display: block; font-size: 16pt; color: #2f7d8c; }
  .kpi span { font-size: 9pt; color: #5d6b78; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-top: 4px; }
  th, td { text-align: left; vertical-align: top; padding: 5px 6px; border-bottom: 1px solid #e6ecef; }
  th { background: #f1f6f8; font-weight: 700; }
  tr { page-break-inside: avoid; }
  ul { margin: 6px 0; padding-left: 18px; }
  .talk { background: #f1f6f8; border-radius: 8px; padding: 10px 12px; }
  footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #dde5ea; color: #5d6b78; font-size: 8.5pt; }
</style>
</head>
<body>
<h1>Serena — ${esc(x.docTitle)}</h1>
${d.name ? `<p class="meta"><b>${esc(x.name)}:</b> ${esc(d.name)}</p>` : ''}
<p class="meta"><b>${esc(x.periodLabel)}:</b> ${esc(d.periodLabel)} · <b>${esc(x.generated)}:</b> ${esc(d.createdAt)}</p>

<h2>${esc(x.overview)}</h2>
<div class="kpis">${kpis.map(([l, n]) => `<div class="kpi"><b>${n}</b><span>${esc(l)}</span></div>`).join('')}</div>
${facts.length ? `<ul>${facts.join('')}</ul>` : ''}

${d.talk && d.talk.trim() ? `<h2>${esc(x.talk)}</h2><div class="talk">${multiline(d.talk.trim())}</div>` : ''}

${profile ? `<h2>${esc(x.profile)}</h2>${profile}` : ''}

<h2>${esc(x.exposures)}</h2>
${table(expHead, expRows, x)}

<h2>${esc(x.unplanned)}</h2>
${table(unpHead, unpRows, x)}

<h2>${esc(x.hard)}</h2>
${table(hardHead, hardRows, x)}

<h2>${esc(x.safety)}</h2>
${safety}

<h2>${esc(x.thoughts)}</h2>
${thoughts}

<footer>${esc(x.footer)}</footer>
</body>
</html>`;
}
