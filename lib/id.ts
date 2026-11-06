// Identificadores únicos para itens criados pelo utilizador (ex.: 'custom:1730…').
export function newId(prefix = ''): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Hora atual em ms — para usar dentro de handlers (cliques), não na renderização.
export function nowMs(): number {
  return Date.now();
}
