// Traduções: nada fica em branco e a política existe em todas as línguas.
import { expect, test } from '@jest/globals';
import { getPrivacyPolicy } from '../data/legal';
import { LANGS, pick, tr2 } from '../i18n/i18n';

test('pick cai em português (pt-BR) ou inglês quando falta a tradução', () => {
  const o = { pt: 'olá', en: 'hello' };
  expect(pick(o, 'pt')).toBe('olá');
  expect(pick(o, 'pt-BR')).toBe('olá');
  expect(pick(o, 'de')).toBe('hello');
  expect(pick({ ...o, de: 'hallo' }, 'de')).toBe('hallo');
  expect(pick(undefined, 'pt')).toBe('');
});

test('tr2 devolve sempre texto', () => {
  for (const { code } of LANGS) expect(tr2(code, 'Guardar', 'Save').length).toBeGreaterThan(0);
});

test('a política de privacidade existe em todas as línguas, sem marcadores por substituir', () => {
  for (const { code } of LANGS) {
    const d = getPrivacyPolicy(code);
    expect(d.sections.length).toBe(14);
    const all = d.intro + d.sections.map((s) => s.title + s.body).join('');
    expect(all).not.toMatch(/\{(CONTROLLER|EMAIL|REGION)\}/);
  }
});

test('o conteúdo em pt-BR vem do ficheiro de traduções', () => {
  expect(pick({ pt: 'O vómito existe — e um dia vai acontecer', en: 'Vomiting exists — and one day it will happen' }, 'pt-BR')).toBe('O vômito existe — e um dia vai acontecer');
});
