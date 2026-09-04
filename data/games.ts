// Conteúdo dos jogos de dessensibilização.

type L = { pt: string; en: string };

// "Palavra a palavra": palavras e depois frases (a base da hierarquia de exposição).
export const FEAR_WORDS: L[] = [
  { pt: 'vomitar', en: 'vomit' },
  { pt: 'náusea', en: 'nausea' },
  { pt: 'enjoo', en: 'queasy' },
  { pt: 'mal-disposto', en: 'sick' },
  { pt: 'gastroenterite', en: 'stomach bug' },
  { pt: 'vírus', en: 'virus' },
  { pt: 'tonturas', en: 'dizziness' },
  { pt: 'azia', en: 'heartburn' },
  { pt: 'Sinto-me um bocado enjoado.', en: 'I feel a bit queasy.' },
  { pt: 'Acho que alguém ali vomitou.', en: 'I think someone was sick over there.' },
  { pt: 'Se calhar comi algo que me caiu mal.', en: 'Maybe I ate something that upset my stomach.' },
  { pt: 'Posso sentir náuseas e mesmo assim ficar bem.', en: 'I can feel nauseous and still be okay.' },
];

// "Verdade ou mito": corrigir crenças catastróficas (parte cognitiva).
// isMyth = true quando a frase é um MITO.
export const MYTHS: { text: L; isMyth: boolean; explanation: L }[] = [
  {
    text: { pt: 'Vomitar é perigoso para a saúde.', en: 'Vomiting is dangerous to your health.' },
    isMyth: true,
    explanation: { pt: 'Na esmagadora maioria dos casos é uma defesa natural do corpo e passa depressa.', en: 'In the vast majority of cases it is a natural defense of the body and passes quickly.' },
  },
  {
    text: { pt: 'Sentir náuseas significa que vou vomitar de certeza.', en: 'Feeling nauseous means I will definitely vomit.' },
    isMyth: true,
    explanation: { pt: 'A maioria das náuseas passa sem chegar a haver vómito.', en: 'Most nausea passes without any vomiting at all.' },
  },
  {
    text: { pt: 'Se ficar com o desconforto, a ansiedade acaba por descer sozinha.', en: 'If I stay with the discomfort, anxiety eventually comes down on its own.' },
    isMyth: false,
    explanation: { pt: 'É a habituação: o corpo não consegue manter o alarme para sempre.', en: 'This is habituation: the body cannot keep the alarm going forever.' },
  },
  {
    text: { pt: 'Evitar o que temo faz o medo diminuir a longo prazo.', en: 'Avoiding what I fear makes the fear shrink long-term.' },
    isMyth: true,
    explanation: { pt: 'É ao contrário: a evitação alimenta o medo. Enfrentar aos poucos é que o reduz.', en: 'It is the opposite: avoidance feeds the fear. Facing it gradually is what reduces it.' },
  },
  {
    text: { pt: 'A maioria dos adultos vomita muito poucas vezes ao longo da vida.', en: 'Most adults vomit very few times over their lifetime.' },
    isMyth: false,
    explanation: { pt: 'É verdade — é bem mais raro do que a fobia nos faz sentir.', en: 'True — it is much rarer than the phobia makes it feel.' },
  },
  {
    text: { pt: 'A ansiedade faz quase sempre uma pessoa vomitar.', en: 'Anxiety almost always makes a person vomit.' },
    isMyth: true,
    explanation: { pt: 'A ansiedade dá náuseas, mas raramente leva mesmo a vomitar.', en: 'Anxiety causes nausea, but rarely actually leads to vomiting.' },
  },
  {
    text: { pt: 'Respirar devagar ajuda o corpo a acalmar.', en: 'Breathing slowly helps the body calm down.' },
    isMyth: false,
    explanation: { pt: 'A expiração mais longa avisa o corpo de que pode baixar o alarme.', en: 'A longer out-breath signals the body it can lower the alarm.' },
  },
  {
    text: { pt: 'Só estou seguro se levar sempre um saco ou comprimidos comigo.', en: 'I am only safe if I always carry a bag or pills with me.' },
    isMyth: true,
    explanation: { pt: 'Isso é um comportamento de segurança — dá alívio momentâneo, mas mantém o medo.', en: 'That is a safety behavior — momentary relief, but it keeps the fear alive.' },
  },
];
