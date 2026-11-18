import { expect, test } from '@jest/globals';
import { formatLesson, readMinutes, splitFirstSentence, splitQuotes } from '../lib/lessonFormat';
import { CHAPTERS } from '../data/content';

test('blocos: introdução, parágrafos, lista e "a reter"', () => {
  const b = formatLesson('Intro aqui.\n\nPrimeira frase forte. Resto do texto.\n\nLista:\n• um\n• dois\n\nFecho final.');
  expect(b.map((x) => x.type)).toEqual(['lead', 'para', 'bullets', 'takeaway']);
  expect(b[1]).toEqual({ type: 'para', head: 'Primeira frase forte.', rest: 'Resto do texto.' });
  expect(b[2]).toMatchObject({ intro: 'Lista:', items: ['um', 'dois'] });
});

test('frase inicial, aspas e tempo de leitura', () => {
  expect(splitFirstSentence('Sem ponto final aqui').head).toBe('');
  expect(splitQuotes('o medo diz "vou vomitar" e passa').map((s) => s.quote)).toEqual([false, true, false]);
  expect(readMinutes('a '.repeat(450))).toBe(2);
});

test('todas as lições geram pelo menos um bloco', () => {
  for (const l of CHAPTERS.flatMap((c) => c.lessons)) expect(formatLesson(l.body.pt).length).toBeGreaterThan(0);
});
