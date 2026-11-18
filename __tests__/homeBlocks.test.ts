// Visão geral personalizável: ordem dos blocos e textos nas 10 línguas.
import { expect, test } from '@jest/globals';
import { HOME_BLOCKS, HOME_BLOCK_IDS, HOME_SETTINGS_TEXT, homeEmptyText, normalizeHomeOrder } from '../data/homeBlocks';
import { LANGS } from '../i18n/i18n';

test('quem tinha só pilares/plano guardados fica com a ordem de antes', () => {
  expect(normalizeHomeOrder(['plan', 'hero'])).toEqual(['affirmation', 'plan', 'hero', 'severity']);
  expect(normalizeHomeOrder([])).toEqual(['affirmation', 'hero', 'plan', 'severity']);
});

test('ids desconhecidos ou repetidos saem (incl. o antigo "nextStep"); nenhum bloco se perde', () => {
  const o = normalizeHomeOrder(['nextStep', 'plan', 'xpto', 'plan', 'severity']);
  expect(new Set(o)).toEqual(new Set(HOME_BLOCK_IDS));
  expect(o.length).toBe(HOME_BLOCK_IDS.length);
  expect(o.slice(0, 3)).toEqual(['affirmation', 'plan', 'severity']);
});

test('textos dos blocos e do ecrã nas 10 línguas', () => {
  for (const { code } of LANGS) {
    for (const b of HOME_BLOCKS) {
      expect(b.title[code]?.length).toBeGreaterThan(0);
      expect(b.desc[code]?.length).toBeGreaterThan(0);
    }
    expect(homeEmptyText(code).length).toBeGreaterThan(0);
    for (const v of Object.values(HOME_SETTINGS_TEXT[code])) expect(v.length).toBeGreaterThan(0);
  }
});
