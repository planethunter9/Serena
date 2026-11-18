import { expect, test } from '@jest/globals';
import { lineChartSvg } from '../lib/reportCharts';
import { REPORT_EXTRA_LANGS, reportExtra } from '../data/reportExtra';

test('gráfico do PDF em SVG', () => {
  const svg = lineChartSvg({ lines: [{ color: '#000', values: [1, null, 3] }], yMax: 5, yTicks: [0, 5], xLabels: ['01/11', '<x>'] });
  expect(svg.startsWith('<svg')).toBe(true);
  expect(svg).toContain('<path');
  expect(svg).toContain('&lt;x&gt;');
  expect((svg.match(/<circle/g) ?? []).length).toBe(2);
});

test('textos do PDF nas 10 línguas', () => {
  expect(REPORT_EXTRA_LANGS).toHaveLength(10);
  for (const l of REPORT_EXTRA_LANGS) for (const v of Object.values(reportExtra(l))) expect(v.length).toBeGreaterThan(0);
});
