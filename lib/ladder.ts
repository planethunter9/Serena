// Os degraus da escada de exposição da pessoa (predefinidos + próprios, sem os
// removidos, pela ordem escolhida) — a mesma lista que aparece na Exposição.

import { EXPOSURE_LADDER } from '../data/exercises';
import { Lang, pick } from '../i18n/i18n';
import { loadExposureHidden, loadExposureOrder, loadExposureSteps } from '../storage/storage';

export async function loadLadderSteps(lang: Lang): Promise<{ id: string; label: string }[]> {
  const [custom, hidden, order] = await Promise.all([loadExposureSteps(), loadExposureHidden(), loadExposureOrder()]);
  const hiddenSet = new Set(hidden ?? []);
  const base = [
    ...EXPOSURE_LADDER.map((s) => ({ id: s.id, label: pick(s.label, lang) })),
    ...(custom ?? []).map((c) => ({ id: c.id, label: c.label })),
  ].filter((s) => !hiddenSet.has(s.id));
  const byId = new Map(base.map((s) => [s.id, s]));
  const ordered = (order ?? []).map((id) => byId.get(id)).filter(Boolean) as { id: string; label: string }[];
  const seen = new Set(order ?? []);
  return [...ordered, ...base.filter((s) => !seen.has(s.id))];
}
