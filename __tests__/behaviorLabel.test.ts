// Nomes dos comportamentos na língua atual (antes ficavam na língua em que foram marcados).
import { expect, test } from '@jest/globals';
import { SAFETY_BEHAVIORS } from '../data/safety';
import { CONTENT } from '../i18n/i18n';
import { behaviorLabel } from '../lib/behaviorLabel';

test('do catálogo: traduz pelo id, ignorando o texto guardado', () => {
  const b = SAFETY_BEHAVIORS[0];
  expect(behaviorLabel(b.id, b.label.en, 'pt')).toBe(b.label.pt);
  expect(behaviorLabel(b.id, b.label.en, 'de')).toBe(CONTENT.de?.[b.label.en]);
});

test('escritos pela pessoa: ficam como foram escritos', () => {
  expect(behaviorLabel('custom:123', 'Levar o telemóvel carregado', 'en')).toBe('Levar o telemóvel carregado');
});
