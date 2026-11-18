// Transforma o texto corrido de uma lição em blocos com mais "respiração":
// - o 1.º parágrafo é a introdução (letra maior);
// - nos parágrafos do meio, a 1.ª frase fica a negrito (para ler na diagonal);
// - linhas começadas por "•" viram uma lista;
// - o último parágrafo vira o cartão "A reter".
// O conteúdo não muda (continua igual nas 10 línguas): só a apresentação.

export type LessonBlock =
  | { type: 'lead'; text: string }
  | { type: 'para'; head: string; rest: string }
  | { type: 'bullets'; intro?: string; items: string[] }
  | { type: 'takeaway'; text: string };

// Primeira frase (até . ! ? : seguido de espaço), se não for demasiado longa.
export function splitFirstSentence(p: string): { head: string; rest: string } {
  const m = p.match(/^(.{12,160}?[.!?:])\s+(.+)$/s);
  if (!m) return { head: '', rest: p };
  return { head: m[1], rest: m[2] };
}

export function formatLesson(body: string): LessonBlock[] {
  const paras = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const blocks: LessonBlock[] = [];
  paras.forEach((p, i) => {
    const lines = p.split('\n').map((l) => l.trim()).filter(Boolean);
    const bulletLines = lines.filter((l) => /^[•\-–]\s+/.test(l));
    if (bulletLines.length >= 2) {
      const intro = lines.filter((l) => !/^[•\-–]\s+/.test(l)).join(' ');
      blocks.push({ type: 'bullets', intro: intro || undefined, items: bulletLines.map((l) => l.replace(/^[•\-–]\s+/, '')) });
      return;
    }
    const text = lines.join(' ');
    if (i === 0 && paras.length > 1) blocks.push({ type: 'lead', text });
    else if (i === paras.length - 1 && paras.length > 2) blocks.push({ type: 'takeaway', text });
    else blocks.push({ type: 'para', ...splitFirstSentence(text) });
  });
  return blocks;
}

// Divide um texto em pedaços normais e pedaços entre aspas ("…", “…”, «…»),
// para as citações (o que o medo diz) aparecerem em itálico.
export function splitQuotes(t: string): { text: string; quote: boolean }[] {
  const out: { text: string; quote: boolean }[] = [];
  const re = /("[^"]{2,120}"|“[^”]{2,120}”|«[^»]{2,120}»|„[^"“]{2,120}["“])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    if (m.index > last) out.push({ text: t.slice(last, m.index), quote: false });
    out.push({ text: m[0], quote: true });
    last = m.index + m[0].length;
  }
  if (last < t.length) out.push({ text: t.slice(last), quote: false });
  return out;
}

// Minutos de leitura (~200 palavras por minuto, mínimo 1).
export const readMinutes = (t: string) => Math.max(1, Math.round(t.split(/\s+/).length / 200));
