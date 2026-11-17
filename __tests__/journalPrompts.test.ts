import { expect, test } from '@jest/globals';
import { JOURNAL_LANGS, JOURNAL_TAGS, journalText, promptIndexFor } from '../data/journalPrompts';

test('textos do diário nas 10 línguas, com o mesmo número de perguntas', () => {
  expect(JOURNAL_LANGS).toHaveLength(10);
  const n = journalText('pt').prompts.length;
  for (const l of JOURNAL_LANGS) {
    const x = journalText(l);
    expect(x.prompts).toHaveLength(n);
    expect(x.moods).toHaveLength(5);
    for (const tg of JOURNAL_TAGS) expect(x.tags[tg].trim().length).toBeGreaterThan(0);
    for (const v of Object.values(x)) if (typeof v === 'string') expect(v.trim().length).toBeGreaterThan(0);
  }
});

test('pergunta do dia: estável no mesmo dia e dentro dos limites', () => {
  const a = promptIndexFor(new Date(2026, 10, 17, 8), 10);
  expect(promptIndexFor(new Date(2026, 10, 17, 23), 10)).toBe(a);
  expect(promptIndexFor(new Date(2026, 10, 18, 8), 10)).toBe((a + 1) % 10);
  expect(a).toBeGreaterThanOrEqual(0);
});
