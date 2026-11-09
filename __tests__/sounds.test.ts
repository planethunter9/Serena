// Sons: cada som tem ficheiro, nome e descrição em todas as línguas.
import { expect, test } from '@jest/globals';
import { SOUNDS, TIMER_TEXT } from '../data/sounds';
import { LANGS } from '../i18n/i18n';

test('há sons para acalmar e para dormir, com ids únicos', () => {
  expect(SOUNDS.filter((s) => s.category === 'calm').length).toBeGreaterThanOrEqual(4);
  expect(SOUNDS.filter((s) => s.category === 'sleep').length).toBeGreaterThanOrEqual(4);
  expect(new Set(SOUNDS.map((s) => s.id)).size).toBe(SOUNDS.length);
  for (const s of SOUNDS) expect(s.source).toBeTruthy();
});

test('nomes, descrições e temporizador traduzidos nas 10 línguas', () => {
  for (const { code } of LANGS) {
    for (const s of SOUNDS) {
      expect(s.title[code]?.length).toBeGreaterThan(0);
      expect(s.desc[code]?.length).toBeGreaterThan(0);
    }
    for (const v of Object.values(TIMER_TEXT[code])) expect(v.length).toBeGreaterThan(0);
  }
});
