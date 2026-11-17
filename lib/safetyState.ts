// Alterar o estado de um comportamento de segurança ("faço" / "a largar"),
// mantendo o registo da data em que passou a "a largar". Usado no separador
// Comportamentos e no detalhe de "Alimentar o medo".

import { DroppedBehavior, isoLocal, SafetyItem } from '../storage/storage';

export function applyBehavior(
  stored: SafetyItem[], dropped: DroppedBehavior[], id: string, label: string, changes: { doing?: boolean; dropping?: boolean },
): { stored: SafetyItem[]; dropped: DroppedBehavior[] } {
  const existing = stored.find((x) => x.id === id);
  const merged: SafetyItem = { ...(existing ?? { id, label, doing: false, dropping: false }), ...changes };
  if (changes.doing === false) merged.dropping = false; // deixar de fazer tira o "a largar"
  else if (merged.dropping) merged.doing = true;        // só se larga o que se faz
  const nextStored = existing ? stored.map((x) => (x.id === id ? merged : x)) : [...stored, merged];
  let nextDropped = dropped;
  if (merged.dropping && !dropped.some((d) => d.id === id)) nextDropped = [...dropped, { id, label, date: isoLocal() }];
  if (!merged.dropping) nextDropped = dropped.filter((d) => d.id !== id);
  return { stored: nextStored, dropped: nextDropped };
}

// Número de dias marcados como "sem" e se hoje já está marcado.
export function freeInfo(days: string[] | undefined, today = isoLocal()) {
  const list = Array.isArray(days) ? days : [];
  return { count: new Set(list).size, today: list.includes(today) };
}
