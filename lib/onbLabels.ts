// As escolhas do onboarding (subtipos, gatilhos, sintomas…) ficam guardadas
// com o texto da língua em que foram feitas. Para as mostrar sempre na língua
// atual da app, as que vêm do catálogo são traduzidas pelo id; as escritas pela
// pessoa ficam como estão.

import { COPING_OPTIONS, LOSS_OPTIONS, RECOVER_OPTIONS, SUBTYPE_OPTIONS, SYMPTOM_OPTIONS, TRIGGERS_OPTIONS } from '../data/content';
import { Lang, pick } from '../i18n/i18n';

export type OnbItem = { id: string; label: string };
export type OnbKind = 'subtypes' | 'triggers' | 'symptoms' | 'losses' | 'recover' | 'coping';

const CATALOG: Record<OnbKind, { id: string; label: any }[]> = {
  subtypes: SUBTYPE_OPTIONS, triggers: TRIGGERS_OPTIONS, symptoms: SYMPTOM_OPTIONS,
  losses: LOSS_OPTIONS, recover: RECOVER_OPTIONS, coping: COPING_OPTIONS,
};

export function localizeItems(arr: unknown, kind: OnbKind, lang: Lang): OnbItem[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((it: any, i) => {
    const item = typeof it === 'string' ? { id: 'x' + i, label: it } : { id: it?.id ?? 'x' + i, label: it?.label ?? '' };
    const opt = CATALOG[kind].find((o) => o.id === item.id);
    return opt ? { id: item.id, label: pick(opt.label, lang) || item.label } : item;
  });
}
