// Conteúdo: frases por gatilho ligadas aos ids certos e traduções completas
// das lições e escolhas do perfil (incl. gravidez e filhos).
import { expect, test } from '@jest/globals';
import { CHAPTERS, FEEDING_BEHAVIORS, LOSS_OPTIONS, RECOVER_OPTIONS, SUBTYPE_OPTIONS, TRIGGER_PHRASES, TRIGGERS_OPTIONS } from '../data/content';
import { MYTHS } from '../data/games';
import { LADDER_TEMPLATES } from '../data/ladderTemplates';
import { SAFETY_BEHAVIORS } from '../data/safety';
import { CONTENT, tr2 } from '../i18n/i18n';

const OTHER_LANGS = ['pt-BR', 'es', 'fr', 'de', 'it', 'nl', 'pl', 'ru'] as const;

test('cada grupo de frases corresponde a um gatilho que existe', () => {
  const ids = new Set(TRIGGERS_OPTIONS.map((o) => o.id));
  for (const key of Object.keys(TRIGGER_PHRASES)) expect(ids.has(key)).toBe(true);
  expect(TRIGGER_PHRASES.gravidez?.length).toBeGreaterThan(0);
  expect(TRIGGER_PHRASES.filho_doente?.length).toBeGreaterThan(0);
});

test('há um capítulo sobre gravidez e filhos, e uma escada para o novo subtipo', () => {
  const ch = CHAPTERS.find((c) => c.id === 'ch10');
  expect(ch?.lessons.map((l) => l.id)).toEqual(['kids1', 'preg1', 'preg2', 'preg3', 'kids2', 'kids3']);
  expect(LADDER_TEMPLATES.some((t) => t.subtypeId === 'parenting')).toBe(true);
  for (const t of LADDER_TEMPLATES) expect(SUBTYPE_OPTIONS.some((o) => o.id === t.subtypeId)).toBe(true);
});

test('lições e escolhas do perfil traduzidas em todas as línguas', () => {
  const texts: string[] = [];
  for (const ch of CHAPTERS) {
    texts.push(ch.title.en);
    for (const l of ch.lessons) texts.push(l.title.en, l.body.en);
  }
  for (const list of [SUBTYPE_OPTIONS, TRIGGERS_OPTIONS, LOSS_OPTIONS, RECOVER_OPTIONS, SAFETY_BEHAVIORS]) texts.push(...list.map((o) => o.label.en));
  for (const f of FEEDING_BEHAVIORS) texts.push(f.label.en, f.why.en, f.alternative.en);
  for (const m of MYTHS) texts.push(m.text.en, m.explanation.en);
  for (const phrases of Object.values(TRIGGER_PHRASES)) texts.push(...phrases.map((p) => p.en));
  for (const lang of OTHER_LANGS) {
    const missing = texts.filter((en) => !CONTENT[lang]?.[en]);
    expect({ lang, missing }).toEqual({ lang, missing: [] });
  }
});

test('tr2 também encontra traduções de conteúdo (ex.: comportamentos de segurança)', () => {
  const b = SAFETY_BEHAVIORS[0].label;
  expect(tr2('de', b.pt, b.en)).toBe(CONTENT.de?.[b.en]);
});
