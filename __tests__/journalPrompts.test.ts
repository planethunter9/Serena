import { expect, test } from '@jest/globals';
import { JOURNAL_LANGS, journalText } from '../data/journalPrompts';

test('perguntas do diário nas 10 línguas, todas com o mesmo número', () => {
  expect(JOURNAL_LANGS).toHaveLength(10);
  const n = journalText('pt').prompts.length;
  for (const l of JOURNAL_LANGS) {
    const x = journalText(l);
    expect(x.prompts).toHaveLength(n);
    for (const s of [x.ideaTitle, x.ideaHint, x.clear, x.freePh, ...x.prompts]) expect(s.trim().length).toBeGreaterThan(0);
  }
});
