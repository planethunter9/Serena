// Nome de um comportamento de segurança na língua atual.
// Os do catálogo (data/safety.ts) traduzem-se pelo id; os escritos pela pessoa
// ("custom:…") mostram-se como foram escritos. Não usar o texto guardado dos do
// catálogo: foi guardado na língua da altura (ex.: aparecia em inglês).

import { SAFETY_BEHAVIORS } from '../data/safety';
import { Lang, pick } from '../i18n/i18n';

export function behaviorLabel(id: string, stored: string | undefined, lang: Lang): string {
  const cat = SAFETY_BEHAVIORS.find((b) => b.id === id);
  return cat ? pick(cat.label, lang) : (stored ?? id);
}
