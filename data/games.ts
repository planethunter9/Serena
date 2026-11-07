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
  { pt: 'golfar', en: 'throw up' },
  { pt: 'estômago embrulhado', en: 'churning stomach' },
  { pt: 'intoxicação alimentar', en: 'food poisoning' },
  { pt: 'Sinto um bocado de enjoo.', en: 'I feel a bit queasy.' },
  { pt: 'Acho que alguém ali vomitou.', en: 'I think someone was sick over there.' },
  { pt: 'Se calhar comi algo que me caiu mal.', en: 'Maybe I ate something that upset my stomach.' },
  { pt: 'A minha barriga está embrulhada, mas eu estou bem.', en: 'My stomach is churning, but I am okay.' },
  { pt: 'Posso sentir náuseas e mesmo assim ficar bem.', en: 'I can feel nauseous and still be okay.' },
  { pt: 'Mesmo que eu vomitasse, era desagradável mas passava.', en: 'Even if I did vomit, it would be unpleasant but it would pass.' },
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
  {
    text: { pt: 'Se eu vomitar, não vou conseguir parar e vai durar horas.', en: 'If I vomit, I won\'t be able to stop and it will last for hours.' },
    isMyth: true,
    explanation: { pt: 'O vómito costuma ser breve — segundos a minutos. O corpo pára sozinho quando termina.', en: 'Vomiting is usually brief — seconds to minutes. The body stops on its own when it is done.' },
  },
  {
    text: { pt: 'Posso sufocar ou morrer se vomitar.', en: 'I could choke or die if I vomit.' },
    isMyth: true,
    explanation: { pt: 'O corpo tem reflexos que protegem as vias respiratórias. É extremamente improvável.', en: 'The body has reflexes that protect the airway. It is extremely unlikely.' },
  },
  {
    text: { pt: 'Na emetofobia, o nojo pode ser tão forte (ou mais) do que o medo.', en: 'In emetophobia, disgust can be as strong as, or stronger than, the fear.' },
    isMyth: false,
    explanation: { pt: 'Verdade: a sensibilidade ao nojo é um dos melhores indicadores da intensidade da fobia.', en: 'True: disgust sensitivity is one of the best predictors of how intense the phobia is.' },
  },
  {
    text: { pt: 'Verificar validades e cheirar a comida mantém-me mesmo em segurança.', en: 'Checking expiry dates and smelling food really keeps me safe.' },
    isMyth: true,
    explanation: { pt: 'Dá certeza por instantes, mas alimenta a necessidade de controlo total — um comportamento de segurança.', en: 'It gives certainty for a moment, but feeds the need for total control — a safety behavior.' },
  },
  {
    text: { pt: 'Procurar que me tranquilizem resolve o medo de vez.', en: 'Seeking reassurance resolves the fear for good.' },
    isMyth: true,
    explanation: { pt: 'O alívio é curto e a dúvida volta sempre, reforçando que precisas de certeza para estar bem.', en: 'The relief is short and the doubt always returns, reinforcing that you need certainty to be okay.' },
  },
  {
    text: { pt: 'Vigiar a barriga à procura de náusea faz-me notar ainda mais sensações.', en: 'Monitoring my stomach for nausea makes me notice even more sensations.' },
    isMyth: false,
    explanation: { pt: 'Verdade: aquilo em que focamos a atenção fica maior, e sensações normais parecem ameaças.', en: 'True: whatever we focus on grows, and normal sensations start to feel like threats.' },
  },
  {
    text: { pt: 'A emetofobia é só "não gostar" de vómito, uma frescura.', en: 'Emetophobia is just "disliking" vomit, no big deal.' },
    isMyth: true,
    explanation: { pt: 'É uma fobia específica reconhecida, com tratamento baseado em evidência — não é falta de força.', en: 'It is a recognized specific phobia with evidence-based treatment — not weakness.' },
  },
  {
    text: { pt: 'Tenho de ter a certeza absoluta de que não vou vomitar para viver normalmente.', en: 'I need absolute certainty that I won\'t vomit to live normally.' },
    isMyth: true,
    explanation: { pt: 'A recuperação passa por tolerar a incerteza, não por eliminá-la — ela nunca existe por completo.', en: 'Recovery is about tolerating uncertainty, not eliminating it — it never fully exists.' },
  },
  {
    text: { pt: 'A emetofobia trata-se, sobretudo com exposição gradual (CBT/ERP).', en: 'Emetophobia is treatable, mainly with gradual exposure (CBT/ERP).' },
    isMyth: false,
    explanation: { pt: 'Verdade: é a abordagem com mais evidência para fobias específicas.', en: 'True: it is the most evidence-based approach for specific phobias.' },
  },
  {
    text: { pt: 'Afastar à força os pensamentos e imagens de vómito faz o medo diminuir.', en: 'Forcefully pushing away thoughts and images of vomit makes the fear shrink.' },
    isMyth: true,
    explanation: { pt: 'Suprimir costuma dar-lhes mais força. Ajuda mais rotulá-los ("é uma imagem intrusiva") e deixá-los passar.', en: 'Suppression usually gives them more force. It helps more to label them ("this is an intrusive image") and let them pass.' },
  },
  {
    text: { pt: 'Numa exposição, provocar o vómito de propósito ajuda a habituar.', en: 'In an exposure, making yourself vomit on purpose helps you habituate.' },
    isMyth: true,
    explanation: { pt: 'Mito e perigoso: nunca se provoca o vómito. A exposição treina as sensações e os cues, não o ato.', en: 'A myth, and dangerous: you never induce vomiting. Exposure trains the sensations and cues, not the act.' },
  },
  {
    text: { pt: 'Uma recaída significa que voltei à estaca zero.', en: 'A setback means I\'m back to square one.' },
    isMyth: true,
    explanation: { pt: 'As recaídas fazem parte da recuperação e não apagam o progresso — é só um dia mais difícil.', en: 'Setbacks are part of recovery and do not erase progress — it is just a harder day.' },
  },
  {
    text: { pt: 'A náusea pode vir da ansiedade, da fome, do cansaço ou da digestão.', en: 'Nausea can come from anxiety, hunger, tiredness or digestion.' },
    isMyth: false,
    explanation: { pt: 'Verdade: tem muitas causas banais que nada têm a ver com estar doente ou vomitar.', en: 'True: it has many ordinary causes that have nothing to do with being ill or vomiting.' },
  },
  {
    text: { pt: 'Quando há restrição alimentar na emetofobia, o objetivo é emagrecer.', en: 'When there is food restriction in emetophobia, the goal is to lose weight.' },
    isMyth: true,
    explanation: { pt: 'Na emetofobia a restrição serve para evitar vomitar, não para emagrecer — ao contrário da anorexia.', en: 'In emetophobia the restriction aims to avoid vomiting, not to lose weight — unlike anorexia.' },
  },
];
