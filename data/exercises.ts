// Conteúdo dos exercícios (baseado em técnicas de exposição gradual usadas por
// profissionais). A hierarquia começa no mais fácil (palavras) e sobe devagar.
// Regra de ouro dos terapeutas: NUNCA te forçar a vomitar.

type L = { pt: string; en: string };

// "level" é uma sugestão de dificuldade (0-10), só para ordenar a escada.
export const EXPOSURE_LADDER: { id: string; label: L; level: number }[] = [
  { id: 'word', level: 2, label: { pt: 'Dizer ou escrever a palavra «vomitar»', en: 'Say or write the word "vomit"' } },
  { id: 'sentences', level: 3, label: { pt: 'Ler frases que falam de enjoo e vómito', en: 'Read sentences about nausea and vomiting' } },
  { id: 'cartoons', level: 3, label: { pt: 'Ver desenhos ou emojis relacionados', en: 'Look at cartoons or related emojis' } },
  { id: 'story', level: 4, label: { pt: 'Ler o relato de alguém que vomitou', en: "Read someone's account of being sick" } },
  { id: 'selftalk', level: 4, label: { pt: 'Dizer em voz alta: «posso enjoar e ficar bem»', en: 'Say aloud: "I can feel sick and be okay"' } },
  { id: 'scene', level: 6, label: { pt: 'Ver uma cena representada num filme ou série', en: 'Watch an acted scene in a film or series' } },
  { id: 'nearfood', level: 6, label: { pt: 'Estar perto de um alimento que evitas', en: 'Be near a food you avoid' } },
  { id: 'eatfood', level: 7, label: { pt: 'Comer um pouco de um alimento que evitas', en: 'Eat a little of a food you avoid' } },
  { id: 'eatout', level: 8, label: { pt: 'Comer fora, num restaurante', en: 'Eat out, at a restaurant' } },
];
