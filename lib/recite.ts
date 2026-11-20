// Linhas para recitar: sugestões geradas (sem texto de terceiros) e textos
// escritos pela pessoa, uma linha por frase.

import type { Lang } from '../i18n/i18n';

export type Builtin = 'count' | 'table' | 'months' | 'alpha';
const ALPHA_LATIN = 'ABCDEFGHIJLMNOPRSTUVZ'.split('');
const ALPHA_RU = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ'.split('');


function monthNames(lang: Lang): string[] {
  const tag = lang === 'pt' ? 'pt-PT' : lang;
  return Array.from({ length: 12 }, (_, m) => {
    try {
      const s = new Date(2024, m, 15).toLocaleDateString(tag, { month: 'long' });
      return s.charAt(0).toUpperCase() + s.slice(1);
    } catch {
      return String(m + 1);
    }
  });
}

export function builtinLines(b: Builtin, lang: Lang, wordWith: string): string[] {
  if (b === 'count') return Array.from({ length: 15 }, (_, k) => String(100 - 7 * k));
  if (b === 'table') return Array.from({ length: 10 }, (_, k) => `7 × ${k + 1} = ${7 * (k + 1)}`);
  if (b === 'months') return monthNames(lang).reverse();
  return (lang === 'ru' ? ALPHA_RU : ALPHA_LATIN).map((l) => wordWith.replace('{l}', l));
}
export function splitLines(text: string) {
  return text.split('\n').map((l) => l.trim()).filter(Boolean);
}

