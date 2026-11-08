// Resumo para a consulta (PDF), atalhos do ícone e aviso "não substitui um profissional".
import { expect, test } from '@jest/globals';
import { disclaimer } from '../data/disclaimer';
import { reportText } from '../data/reportText';
import { LANGS } from '../i18n/i18n';
import { buildReportHtml, ReportData } from '../lib/reportHtml';
import { quickActionItems, routeForQuickAction } from '../lib/quickActions';

const base: ReportData = {
  periodLabel: '10/10/2026 – 08/11/2026', createdAt: '08/11/2026', includeNotes: false,
  counts: { exposures: 2, unplanned: 1, thoughts: 1, hard: 1, exposureDays: 2, practice: 3 },
  avgDiscomfort: { before: 7, after: 3.25 }, severity: { first: 4, last: 2 },
  profile: { triggers: ['Hospitais'], symptoms: [] },
  exposures: [{ date: '12/10/2026', step: 'Ver um vídeo <b>', before: 7, peak: 8, after: 3, note: 'nota privada' }],
  unplanned: [{ date: '20/10/2026', what: 'Alguém enjoado', before: 6, after: 4, stayed: true, feared: 'medo privado' }],
  hard: [{ date: '22/10/2026', type: 'panic', reason: 'motivo privado', vomited: false }],
  safety: { inUse: ['Levar um saco'], dropping: [], dropped: [{ label: 'Mentas', date: '01/11/2026' }] },
  thoughts: [],
  talk: 'Quero falar da medicação',
};

test('o PDF tem os números, escapa HTML e não mostra textos escritos por defeito', () => {
  const html = buildReportHtml(base, reportText('pt'), 'pt');
  expect(html).toContain('Resumo de progresso');
  expect(html).toContain('7 → 3.3');
  expect(html).toContain('Ver um vídeo &lt;b&gt;');
  expect(html).toContain('Quero falar da medicação');
  expect(html).not.toContain('nota privada');
  expect(html).not.toContain('medo privado');
  expect(html).not.toContain('motivo privado');
});

test('com "incluir o que escrevi" os textos aparecem', () => {
  const html = buildReportHtml({ ...base, includeNotes: true }, reportText('pt'), 'pt');
  expect(html).toContain('nota privada');
  expect(html).toContain('motivo privado');
});

test('textos do relatório, do aviso e dos atalhos completos nas 10 línguas', () => {
  for (const { code } of LANGS) {
    for (const v of Object.values(reportText(code))) expect(String(v).length).toBeGreaterThan(0);
    for (const v of Object.values(disclaimer(code))) expect(v.length).toBeGreaterThan(0);
    const items = quickActionItems(code);
    expect(items).toHaveLength(3);
    for (const it of items) expect(it.title.length).toBeGreaterThan(0);
  }
});

test('cada atalho abre o ecrã certo', () => {
  expect(routeForQuickAction({ id: 'trigger' })).toBe('/triggerhelp');
  expect(routeForQuickAction({ id: 'crisis' })).toBe('/crisislines');
  expect(routeForQuickAction({ id: 'xpto' })).toBeNull();
  expect(routeForQuickAction(undefined)).toBeNull();
});
