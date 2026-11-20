import { expect, test } from '@jest/globals';
import { GROUND_TEXT_LANGS, groundText } from '../data/groundText';
import { localizeItems } from '../lib/onbLabels';
import { builtinLines, splitLines } from '../lib/recite';

test('escolhas do catálogo aparecem na língua atual; as escritas pela pessoa ficam iguais', () => {
  const stored = [{ id: 'self', label: 'Fear of vomiting myself' }, { id: 'c1', label: 'O meu medo' }];
  const r = localizeItems(stored, 'subtypes', 'pt');
  expect(r[0].label).toBe('Medo de ser eu a vomitar');
  expect(r[1]).toEqual({ id: 'c1', label: 'O meu medo' });
  expect(localizeItems(null, 'triggers', 'es')).toEqual([]);
});

test('técnicas de atenção: textos nas 10 línguas', () => {
  expect(GROUND_TEXT_LANGS).toHaveLength(10);
  const keys = Object.keys(groundText('pt')).sort();
  for (const l of GROUND_TEXT_LANGS) {
    const t = groundText(l) as unknown as Record<string, unknown>;
    expect(Object.keys(t).sort()).toEqual(keys);
    for (const c of Object.values(groundText(l).colors)) expect(c.name && c.ideas).toBeTruthy();
  }
});

test('recitar: linhas das sugestões e dos textos próprios', () => {
  expect(builtinLines('count', 'pt', '')).toEqual(['100', '93', '86', '79', '72', '65', '58', '51', '44', '37', '30', '23', '16', '9', '2']);
  expect(builtinLines('table', 'en', '')[6]).toBe('7 × 7 = 49');
  expect(builtinLines('alpha', 'ru', '{l}')[0]).toBe('А');
  expect(splitLines('  a \n\n b\n')).toEqual(['a', 'b']);
});
