// TODO O CONTEÚDO DA APP (PT/EN). Cada texto é um par { pt, en }.

type L = { pt: string; en: string };

export const APP_NAME = 'Serena';

export const PHOBIA = {
  id: 'emetofobia',
  name: { pt: 'Emetofobia', en: 'Emetophobia' } as L,
  description: { pt: 'medo de vomitar', en: 'fear of vomiting' } as L,
};

export const LOSS_OPTIONS: { id: string; label: L }[] = [
  { id: 'restaurantes', label: { pt: 'Comer fora / em restaurantes', en: 'Eating out / at restaurants' } },
  { id: 'viajar', label: { pt: 'Viajar', en: 'Travelling' } },
  { id: 'social', label: { pt: 'Momentos sociais com amigos', en: 'Social time with friends' } },
  { id: 'trabalho', label: { pt: 'Concentração no trabalho ou estudo', en: 'Focus at work or school' } },
  { id: 'relacoes', label: { pt: 'Relações e intimidade', en: 'Relationships and intimacy' } },
  { id: 'comida_nova', label: { pt: 'Experimentar comida nova', en: 'Trying new food' } },
];

export const RECOVER_OPTIONS: { id: string; label: L }[] = [
  { id: 'liberdade', label: { pt: 'Liberdade para sair sem medo', en: 'Freedom to go out without fear' } },
  { id: 'calma', label: { pt: 'Calma no dia a dia', en: 'Calm in daily life' } },
  { id: 'confianca', label: { pt: 'Confiança em mim', en: 'Confidence in myself' } },
  { id: 'sono', label: { pt: 'Dormir descansado', en: 'Sleeping soundly' } },
  { id: 'espontaneidade', label: { pt: 'Ser espontâneo', en: 'Being spontaneous' } },
];

export const SYMPTOM_OPTIONS: { id: string; label: L }[] = [
  { id: 'ansiedade', label: { pt: 'Ataques de ansiedade', en: 'Anxiety attacks' } },
  { id: 'adormecer', label: { pt: 'Dificuldade em adormecer', en: 'Trouble falling asleep' } },
  { id: 'transportes', label: { pt: 'Medo de andar em transportes públicos', en: 'Fear of public transport' } },
  { id: 'evitar_comida', label: { pt: 'Evitar certos alimentos', en: 'Avoiding certain foods' } },
  { id: 'verificar', label: { pt: 'Verificar sinais de doença a toda a hora', en: 'Constantly checking for signs of illness' } },
  { id: 'nausea', label: { pt: 'Sentir náuseas com o stress', en: 'Feeling nauseous when stressed' } },
];

export const PLANS: { id: string; title: L; subtitle: L; desc: L }[] = [
  { id: 'gentle', title: { pt: 'Suave', en: 'Gentle' }, subtitle: { pt: '5 min/dia', en: '5 min/day' }, desc: { pt: 'Ritmo calmo, sem pressa.', en: 'Calm pace, no rush.' } },
  { id: 'standard', title: { pt: 'Equilibrado', en: 'Balanced' }, subtitle: { pt: '10 min/dia', en: '10 min/day' }, desc: { pt: 'O mais escolhido.', en: 'The most popular.' } },
  { id: 'intensive', title: { pt: 'Intensivo', en: 'Intensive' }, subtitle: { pt: '20 min/dia', en: '20 min/day' }, desc: { pt: 'Progresso mais rápido.', en: 'Faster progress.' } },
];

// Lições: agora com "body" (conteúdo). Mistura a ciência com a experiência de outros.
export const CHAPTERS: { id: string; title: L; lessons: { id: string; title: L; body: L }[] }[] = [
  {
    id: 'ch1',
    title: { pt: 'Começar', en: 'Getting started' },
    lessons: [
      {
        id: 'l1',
        title: { pt: 'A ciência do medo', en: 'The science of fear' },
        body: {
          pt: 'O medo é uma resposta automática do corpo, feita para te proteger. Quando o cérebro deteta uma "ameaça", liberta adrenalina: o coração acelera, a respiração muda, a barriga fica revolta. Nada disto é perigoso — é o sistema de alarme a funcionar.\n\nMuitas pessoas com emetofobia descrevem exatamente estas sensações e pensam que algo está errado com elas. Não está. Perceber o mecanismo é o primeiro passo para deixar de o temer.',
          en: 'Fear is an automatic body response, built to protect you. When the brain detects a "threat", it releases adrenaline: your heart races, breathing changes, your stomach turns. None of this is dangerous — it is your alarm system doing its job.\n\nMany people with emetophobia describe exactly these sensations and think something is wrong with them. It is not. Understanding the mechanism is the first step to stop fearing it.',
        },
      },
      {
        id: 'l2',
        title: { pt: 'O que é a emetofobia', en: 'What emetophobia is' },
        body: {
          pt: 'A emetofobia é o medo intenso de vomitar (ou de ver alguém vomitar). É uma das fobias específicas mais comuns e costuma levar a muita evitação: certos alimentos, sítios ou situações.\n\nQuem convive com ela sabe o quanto molda o dia a dia. A boa notícia, apoiada por estudos, é que responde muito bem a abordagens de exposição gradual.',
          en: 'Emetophobia is the intense fear of vomiting (or of seeing someone vomit). It is one of the most common specific phobias and usually leads to a lot of avoidance: certain foods, places or situations.\n\nThose who live with it know how much it shapes daily life. The good news, backed by research, is that it responds very well to gradual exposure approaches.',
        },
      },
      {
        id: 'l3',
        title: { pt: 'Como funciona a evitação', en: 'How avoidance works' },
        body: {
          pt: 'Evitar aquilo que tememos dá alívio imediato — mas ensina ao cérebro que a ameaça era real. Assim, o medo cresce a cada evitação. É o chamado ciclo da evitação.\n\nQuebrar este ciclo, aos poucos, é o coração da recuperação. Muitas pessoas dizem que o momento em que pararam de fugir foi o momento em que começaram a melhorar.',
          en: 'Avoiding what we fear gives instant relief — but it teaches the brain that the threat was real. So the fear grows with every avoidance. This is the avoidance cycle.\n\nBreaking this cycle, little by little, is the heart of recovery. Many people say the moment they stopped running was the moment they started to get better.',
        },
      },
    ],
  },
  {
    id: 'ch2',
    title: { pt: 'Conceitos base', en: 'Core concepts' },
    lessons: [
      {
        id: 'l4',
        title: { pt: 'A ansiedade ao longo do tempo', en: 'Anxiety over time' },
        body: {
          pt: 'A ansiedade não sobe para sempre. Se ficares com ela sem fugir, atinge um pico e depois desce sozinha — o corpo não consegue manter o alarme indefinidamente. Chama-se habituação.\n\nDe a cada vez que ficas, o pico seguinte tende a ser mais baixo. É por isso que a prática repetida funciona.',
          en: 'Anxiety does not rise forever. If you stay with it without fleeing, it reaches a peak and then falls on its own — the body cannot hold the alarm indefinitely. This is called habituation.\n\nAnd each time you stay, the next peak tends to be lower. That is why repeated practice works.',
        },
      },
      {
        id: 'l5',
        title: { pt: 'Desconforto "limpo" vs "sujo"', en: 'Clean vs dirty discomfort' },
        body: {
          pt: 'O desconforto "limpo" é a sensação em si (o coração acelerado, a barriga). O "sujo" é tudo o que acrescentamos por cima: "e se...", lutar contra a sensação, culpar-nos.\n\nGrande parte do sofrimento vem do segundo. Aprender a deixar o desconforto limpo existir, sem alimentar o sujo, alivia imenso.',
          en: 'Clean discomfort is the sensation itself (the racing heart, the stomach). Dirty discomfort is everything we add on top: "what if...", fighting the sensation, blaming ourselves.\n\nMuch of the suffering comes from the second. Learning to let the clean discomfort exist, without feeding the dirty, brings huge relief.',
        },
      },
      {
        id: 'l6',
        title: { pt: 'O ciclo da evitação', en: 'The avoidance cycle' },
        body: {
          pt: 'Comportamentos de segurança — levar sempre um saco, verificar validades, mastigar de certa forma — parecem ajudar, mas mantêm o medo vivo, porque o cérebro nunca aprende que estava seguro sem eles.\n\nIdentificar os teus e largá-los, um a um, é um passo enorme. Não tens de os largar todos de uma vez.',
          en: 'Safety behaviors — always carrying a bag, checking expiry dates, chewing a certain way — seem to help, but they keep the fear alive, because the brain never learns it was safe without them.\n\nSpotting yours and letting them go, one by one, is a huge step. You do not have to drop them all at once.',
        },
      },
    ],
  },
  {
    id: 'ch3',
    title: { pt: 'Construir competências', en: 'Building skills' },
    lessons: [
      {
        id: 'l7',
        title: { pt: 'Respiração e regulação', en: 'Breathing and regulation' },
        body: {
          pt: 'Respirar devagar, com a expiração mais longa, avisa o corpo de que pode baixar o alarme. Não é para "fazer o medo desaparecer" — é uma âncora para ficares com o desconforto.\n\nExperimenta a técnica de respiração na página inicial sempre que precisares.',
          en: 'Breathing slowly, with a longer out-breath, tells the body it can lower the alarm. It is not to "make the fear disappear" — it is an anchor to help you stay with the discomfort.\n\nTry the breathing tool on the home page whenever you need it.',
        },
      },
      {
        id: 'l8',
        title: { pt: 'Exposição gradual', en: 'Gradual exposure' },
        body: {
          pt: 'A exposição gradual é aproximares-te do que temes por degraus, do mais fácil ao mais difícil, ficando em cada degrau até a ansiedade descer. É a abordagem com mais evidência para fobias.\n\nCada pequeno passo conta. Não há passos demasiado pequenos.',
          en: 'Gradual exposure means approaching what you fear in steps, from easiest to hardest, staying at each step until the anxiety comes down. It is the most evidence-based approach for phobias.\n\nEvery small step counts. There are no steps too small.',
        },
      },
      {
        id: 'l9',
        title: { pt: 'Lidar com recaídas', en: 'Handling setbacks' },
        body: {
          pt: 'Ter um dia mau depois de progresso não apaga o progresso. As recaídas fazem parte de qualquer recuperação e não significam voltar à estaca zero.\n\nQuem recupera não é quem nunca recua — é quem volta a tentar no dia seguinte.',
          en: 'Having a bad day after progress does not erase the progress. Setbacks are part of any recovery and do not mean starting from scratch.\n\nThe people who recover are not those who never slip — they are those who try again the next day.',
        },
      },
    ],
  },
];

// Dados para as técnicas de acalmar.
export const BODY_PARTS: L[] = [
  { pt: 'os pés', en: 'your feet' },
  { pt: 'as pernas', en: 'your legs' },
  { pt: 'a barriga', en: 'your belly' },
  { pt: 'as mãos', en: 'your hands' },
  { pt: 'os braços', en: 'your arms' },
  { pt: 'os ombros', en: 'your shoulders' },
  { pt: 'o pescoço', en: 'your neck' },
  { pt: 'o rosto', en: 'your face' },
];

export const AFFIRMATIONS: L[] = [
  { pt: 'Esta sensação é desconfortável, mas não é perigosa.', en: 'This feeling is uncomfortable, but it is not dangerous.' },
  { pt: 'Já passei por isto antes e passou.', en: 'I have been through this before and it passed.' },
  { pt: 'Não tenho de controlar tudo. Posso deixar isto existir.', en: 'I do not have to control everything. I can let this be.' },
  { pt: 'O meu corpo sabe acalmar-se sozinho.', en: 'My body knows how to calm itself down.' },
  { pt: 'Um passo de cada vez. Estou a fazer o suficiente.', en: 'One step at a time. I am doing enough.' },
  { pt: 'O medo vem em ondas — e as ondas sempre descem.', en: 'Fear comes in waves — and waves always come down.' },
];

// Vertentes/tipos de emetofobia (baseado em relatos reais e fontes clínicas).
// O utilizador pode escolher várias e acrescentar a sua.
export const SUBTYPE_OPTIONS: { id: string; label: L }[] = [
  { id: 'self', label: { pt: 'Medo de eu próprio vomitar', en: 'Fear of vomiting myself' } },
  { id: 'others', label: { pt: 'Medo de ver ou ouvir outros vomitar', en: 'Fear of seeing or hearing others vomit' } },
  { id: 'nausea', label: { pt: 'Medo de sentir náuseas ou enjoo', en: 'Fear of feeling nauseous' } },
  { id: 'public', label: { pt: 'Medo de vomitar em público ou longe de casa', en: 'Fear of vomiting in public or away from home' } },
  { id: 'illness', label: { pt: 'Medo de apanhar um vírus ou gastroenterite', en: 'Fear of catching a stomach bug' } },
  { id: 'food', label: { pt: 'Medo relacionado com comida (estragada, crua)', en: 'Food-related fear (spoiled, undercooked)' } },
  { id: 'family', label: { pt: 'Medo de que familiares ou filhos vomitem', en: 'Fear of family or children being sick' } },
  { id: 'travel', label: { pt: 'Medo de enjoo em viagens ou transportes', en: 'Fear of motion or travel sickness' } },
  { id: 'pregnancy', label: { pt: 'Medo relacionado com enjoos da gravidez', en: 'Fear related to pregnancy sickness' } },
  { id: 'animals', label: { pt: 'Medo de ver animais vomitar', en: 'Fear of seeing animals be sick' } },
  { id: 'general', label: { pt: 'Medo generalizado — praticamente tudo', en: 'Generalized — pretty much everything' } },
];

// "O que te ajuda a lidar com a fobia?" — estratégias de coping.
export const COPING_OPTIONS: { id: string; label: L }[] = [
  { id: 'respirar', label: { pt: 'Respirar fundo e devagar', en: 'Slow, deep breathing' } },
  { id: 'distrair', label: { pt: 'Distrair-me (música, telemóvel, conversa)', en: 'Distracting myself (music, phone, talking)' } },
  { id: 'falar', label: { pt: 'Falar com alguém de confiança', en: 'Talking to someone I trust' } },
  { id: 'arlivre', label: { pt: 'Sair para apanhar ar', en: 'Getting some fresh air' } },
  { id: 'agua', label: { pt: 'Beber água devagar', en: 'Sipping water slowly' } },
  { id: 'mindfulness', label: { pt: 'Focar-me no presente (mindfulness)', en: 'Grounding in the present (mindfulness)' } },
  { id: 'movimento', label: { pt: 'Mexer o corpo / caminhar', en: 'Moving my body / walking' } },
  { id: 'positivo', label: { pt: 'Lembrar-me de frases que acalmam', en: 'Recalling calming phrases' } },
  { id: 'rotina', label: { pt: 'Manter uma rotina previsível', en: 'Keeping a predictable routine' } },
  { id: 'descanso', label: { pt: 'Descansar e dormir bem', en: 'Resting and sleeping well' } },
];
