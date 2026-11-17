// Respiração e varrimento corporal: ritmos coerentes e textos nas 10 línguas.
import { expect, test } from '@jest/globals';
import { BREATH_PATTERNS, breathText, scanText } from '../data/techniques';
import { LANGS } from '../i18n/i18n';

test('o ritmo por defeito (calma) tem a expiração mais longa', () => {
  expect(BREATH_PATTERNS.calm.exhale).toBeGreaterThan(BREATH_PATTERNS.calm.inhale);
});

test('textos completos e o mesmo número de zonas em todas as línguas', () => {
  const zones = scanText('pt').areas.length;
  for (const { code } of LANGS) {
    const b = breathText(code);
    for (const v of [b.intro, b.inhale, b.exhale, b.hold, b.start, b.stop, b.doneTitle, b.doneBody, ...Object.values(b.names), ...Object.values(b.descs)]) expect(v.length).toBeGreaterThan(0);
    const s = scanText(code);
    expect(s.areas.length).toBe(zones);
    for (const a of s.areas) { expect(a.name.length).toBeGreaterThan(0); expect(a.text.length).toBeGreaterThan(10); }
  }
});
