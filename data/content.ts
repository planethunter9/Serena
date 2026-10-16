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

export const TRIGGERS_OPTIONS: { id: string; label: L }[] = [
  { id: 'náusea', label: { pt: 'Sentir náuseas', en: 'Feeling nauseous' } },
  { id: 'outros sintomas', label: { pt: 'Experenciar outros sintomas como refluxo, diarreia ou vertigens', en: 'Experiencing heartburn, acid reflux, diarrhea, or dizziness.' } },
  { id: 'crianças', label: { pt: 'Estar perto de crianças que tenham maior probabilidade de apanhar viroses estomacais', en: 'Being around children who have a higher likelihood of catching stomach bugs' } },
  { id: 'viajar', label: { pt: 'Andar de carro, avião ou barco onde há maior chance de enjoo', en: 'Riding in cars, airplanes, or boats where motion sickness might occur.' } },
  { id: 'comida contaminada', label: { pt: 'Comer comida contaminada e confirmar datas de validade constantemente', en: 'Encountering foods that previously caused illness, checking expiration dates obsessively, or avoiding restaurants and buffets.' } },
  { id: 'ver outros', label: { pt: 'Ver outros vomitar, até mesmo em filmes/séries', en: ' Seeing, hearing, or smelling someone else vomit, or even watching it depicted in movies or on television' } },
];

export const PLANS: { id: string; title: L; subtitle: L; desc: L }[] = [
  { id: 'gentle', title: { pt: 'Suave', en: 'Gentle' }, subtitle: { pt: '5 min/dia', en: '5 min/day' }, desc: { pt: 'Ritmo calmo, sem pressa.', en: 'Calm pace, no rush.' } },
  { id: 'standard', title: { pt: 'Equilibrado', en: 'Balanced' }, subtitle: { pt: '10 min/dia', en: '10 min/day' }, desc: { pt: 'O mais escolhido.', en: 'The most popular.' } },
  { id: 'intensive', title: { pt: 'Intensivo', en: 'Intensive' }, subtitle: { pt: '20 min/dia', en: '20 min/day' }, desc: { pt: 'Progresso mais rápido.', en: 'Faster progress.' } },
];

// Lições: conteúdo teórico (body). Baseado em fontes clínicas sobre a fobia específica
// de vomitar (SPOV) — sobretudo o protocolo de CBT de David Veale (The Cognitive
// Behaviour Therapist, 2009) e abordagens CBT/ERP consistentes com essa literatura.
export const CHAPTERS: { id: string; title: L; lessons: { id: string; title: L; body: L }[] }[] = [
  {
    id: 'ch1',
    title: { pt: 'Começar', en: 'Getting started' },
    lessons: [
      {
        id: 'l1',
        title: { pt: 'A ciência do medo', en: 'The science of fear' },
        body: {
          pt: 'O medo é uma resposta automática do corpo, feita para te proteger. Quando o cérebro deteta uma "ameaça", o sistema nervoso liberta adrenalina e prepara-te para lutar ou fugir: o coração acelera, a respiração muda, os músculos ficam tensos e a digestão abranda — e é isso que sentes na barriga, muitas vezes como náusea.\n\nNada disto é perigoso. É o alarme do corpo a disparar, mesmo quando não há perigo real. O alarme não distingue bem entre uma ameaça verdadeira e um pensamento ("e se eu vomito?"): reage aos dois da mesma forma.\n\nMuitas pessoas com emetofobia sentem exatamente estas sensações e concluem que algo está errado com elas, ou que vão mesmo vomitar. Não está errado nada — é o corpo a funcionar como foi desenhado. Perceber este mecanismo é o primeiro passo para deixar de o temer.',
          en: 'Fear is an automatic body response, built to protect you. When the brain detects a "threat", the nervous system releases adrenaline and gets you ready to fight or flee: your heart races, breathing changes, muscles tense, and digestion slows down — and that is what you feel in your stomach, often as nausea.\n\nNone of this is dangerous. It is your alarm firing, even when there is no real danger. The alarm cannot really tell a true threat from a thought ("what if I vomit?"): it reacts to both the same way.\n\nMany people with emetophobia feel exactly these sensations and conclude that something is wrong with them, or that they are about to vomit. Nothing is wrong — it is the body doing what it was designed to do. Understanding this mechanism is the first step to stop fearing it.',
        },
      },
      {
        id: 'l2',
        title: { pt: 'O que é a emetofobia', en: 'What emetophobia is' },
        body: {
          pt: 'A emetofobia é o medo específico e intenso de vomitar. Na maior parte dos casos, o medo central é o de vomitar a própria pessoa — mais do que ver vómito ou ver outros vomitar, embora esses também possam assustar.\n\nAo contrário do que se pensa, não é uma fobia muito comum enquanto diagnóstico (estudos apontam cerca de 0,1% das pessoas); o que é comum é um certo desconforto com o vómito. A emetofobia a sério costuma começar na infância, pode durar muitos anos se não for tratada e afeta sobretudo mulheres.\n\nÉ frequentemente confundida com outras perturbações — perturbação obsessivo-compulsiva, ansiedade de saúde, perturbação de pânico, fobia social e até anorexia. Um ponto importante: quando há restrição alimentar na emetofobia, o objetivo não é emagrecer, é evitar vomitar. Reconhecer isto ajuda a procurar a ajuda certa.\n\nA melhor notícia, apoiada por estudos, é que a emetofobia responde muito bem a abordagens de exposição gradual (CBT/ERP). É tratável.',
          en: 'Emetophobia is the specific, intense fear of vomiting. In most cases the core fear is of vomiting yourself — more than seeing vomit or seeing others be sick, although those can be frightening too.\n\nContrary to what many think, it is not a very common phobia as a diagnosis (studies suggest around 0.1% of people); what is common is some discomfort around vomit. True emetophobia usually begins in childhood, can last many years if untreated, and affects women far more than men.\n\nIt is often confused with other conditions — obsessive-compulsive disorder, health anxiety, panic disorder, social phobia and even anorexia. One important point: when there is food restriction in emetophobia, the goal is not to lose weight, it is to avoid vomiting. Recognising this helps you find the right kind of help.\n\nThe best news, backed by research, is that emetophobia responds very well to gradual exposure approaches (CBT/ERP). It is treatable.',
        },
      },
      {
        id: 'l3',
        title: { pt: 'Não estás sozinha nisto', en: 'You are not alone in this' },
        body: {
          pt: 'Se a fobia te faz sentir estranha ou "exagerada", é importante saberes: a emetofobia é reconhecida pela psicologia clínica, está descrita na literatura científica e tem tratamentos com evidência. Não é falta de força nem um defeito de carácter.\n\nTambém é comum vir acompanhada de outras dificuldades — ansiedade generalizada, ataques de pânico, humor em baixo — em parte porque viver em alerta constante é exaustivo. Isso não complica a recuperação de forma irreparável; apenas explica porque é tão cansativo.\n\nSaber que há um nome, uma explicação e um caminho já alivia muita gente. Esta app segue esse caminho: perceber o medo, parar de o alimentar e aproximar-te do que evitas, ao teu ritmo.',
          en: 'If the phobia makes you feel strange or "over the top", it helps to know: emetophobia is recognised in clinical psychology, described in the scientific literature, and has treatments with real evidence. It is not weakness or a flaw in your character.\n\nIt also often comes alongside other difficulties — generalised anxiety, panic attacks, low mood — partly because living in constant alert is exhausting. That does not make recovery impossible; it just explains why it is so tiring.\n\nKnowing there is a name, an explanation and a path forward already relieves many people. This app follows that path: understand the fear, stop feeding it, and move closer to what you avoid, at your own pace.',
        },
      },
    ],
  },
  {
    id: 'ch2',
    title: { pt: 'Como o medo se mantém', en: 'How the fear keeps going' },
    lessons: [
      {
        id: 'l4',
        title: { pt: 'O ciclo da emetofobia', en: 'The emetophobia cycle' },
        body: {
          pt: 'A fobia mantém-se através de um ciclo que se repete. Primeiro vem um gatilho: uma náusea, um cheiro, um avião, uma criança, uma cena num filme. Depois vem a interpretação — um pensamento de ameaça: "e se vomito?", "e se não consigo parar?", "e se fico preso?".\n\nEssa interpretação dispara o corpo (ansiedade, mais náusea, tontura, vontade de fugir). Para aliviar, fazes algo: evitas, verificas, procuras tranquilização, levas um "item de segurança". Isso dá alívio imediato — e é exatamente aí que o ciclo se fecha.\n\nO alívio ensina ao cérebro que só ficaste bem porque controlaste a situação. A ameaça continua a parecer real, o medo sai reforçado, e da próxima vez o impulso para fazer o mesmo é ainda mais forte. A tua vida vai encolhendo. Perceber este ciclo é o mapa: é aqui que vamos intervir.',
          en: 'The phobia keeps itself going through a cycle that repeats. First comes a trigger: nausea, a smell, a plane, a child, a scene in a film. Then comes the interpretation — a threat thought: "what if I vomit?", "what if I can\'t stop it?", "what if I\'m trapped?".\n\nThat interpretation sets off the body (anxiety, more nausea, dizziness, an urge to flee). To get relief, you do something: avoid, check, seek reassurance, carry a "safety item". That brings instant relief — and that is exactly where the cycle closes.\n\nThe relief teaches the brain that you were only okay because you controlled the situation. The threat still feels real, the fear comes out stronger, and next time the urge to do the same is even louder. Your life keeps shrinking. Understanding this cycle is the map: this is where we will intervene.',
        },
      },
      {
        id: 'l5',
        title: { pt: 'Os comportamentos de segurança', en: 'Safety behaviours' },
        body: {
          pt: 'Comportamentos de segurança são tudo o que fazes para te sentires mais segura perante o medo. Há os externos — verificar datas de validade, cozinhar demais a comida, levar sempre água, pastilhas ou antináuseas, escolher lugares perto da saída, perguntar aos outros se se sentem bem, sair mais cedo dos sítios.\n\nE há os internos, mais difíceis de notar — vigiar a barriga à procura de náusea, ensaiar mentalmente "o que faço se vomitar", tentar afastar imagens ou pensamentos, repetir a ti mesma que está tudo bem.\n\nTodos parecem ajudar, mas têm o mesmo efeito: o cérebro atribui a segurança ao comportamento, e não a ti. Por isso nunca chega a aprender que estavas bem na mesma sem ele. Largá-los, um a um, é central na recuperação — e não tens de largar todos de uma vez.',
          en: 'Safety behaviours are everything you do to feel safer in the face of the fear. There are external ones — checking expiry dates, overcooking food, always carrying water, mints or anti-nausea tablets, choosing seats near the exit, asking others whether they feel okay, leaving places early.\n\nAnd there are internal ones, harder to spot — monitoring your stomach for nausea, mentally rehearsing "what I\'ll do if I vomit", trying to push away images or thoughts, repeatedly reassuring yourself that everything is fine.\n\nThey all seem to help, but they share the same effect: the brain credits the safety to the behaviour, not to you. So it never gets to learn that you were fine without it anyway. Dropping them, one by one, is central to recovery — and you do not have to drop them all at once.',
        },
      },
      {
        id: 'l6',
        title: { pt: 'A evitação', en: 'Avoidance' },
        body: {
          pt: 'Evitar é o comportamento de segurança mais poderoso de todos. Pode ser óbvio — não andar de barco, não comer fora, não ir a sítios cheios — ou subtil, como não comer certos alimentos, evitar álcool, fugir de filmes com cenas de vómito, ou nunca ficar longe de casa.\n\nCada evitação dá um alívio imediato e genuíno. O problema é o que ensina: que aquilo era mesmo perigoso e que só escapaste porque fugiste. Assim, a lista de coisas "perigosas" só cresce, e o mundo fica cada vez mais pequeno.\n\nA recuperação faz o caminho inverso: reaproximares-te, aos poucos, daquilo que andas a evitar. Não de repente nem tudo ao mesmo tempo — por degraus, do mais fácil para o mais difícil. Cada degrau que enfrentas devolve-te um bocado de vida.',
          en: 'Avoidance is the most powerful safety behaviour of all. It can be obvious — not taking boats, not eating out, not going to crowded places — or subtle, like not eating certain foods, avoiding alcohol, skipping films with vomit scenes, or never being far from home.\n\nEach avoidance gives instant, genuine relief. The problem is what it teaches: that the thing really was dangerous and you only escaped because you ran. So the list of "dangerous" things only grows, and your world keeps getting smaller.\n\nRecovery goes the other way: moving back toward what you have been avoiding, little by little. Not suddenly and not all at once — in steps, from easiest to hardest. Every step you face gives you back a piece of your life.',
        },
      },
      {
        id: 'l7',
        title: { pt: 'Procurar tranquilização', en: 'Seeking reassurance' },
        body: {
          pt: 'Perguntar "achas que estou bem?", "esta comida está boa?", "ele parecia doente?", ou pesquisar sintomas online, são formas de procurar tranquilização. Dão um alívio real — mas de curtíssima duração.\n\nO problema é que a dúvida volta sempre. E cada vez que a acalmas por fora, reforças a ideia de que precisas de ter a certeza absoluta para estar bem. Como essa certeza nunca existe de verdade, a necessidade de perguntar só aumenta.\n\nA alternativa não é "pensar positivo" à força, é tolerar a dúvida sem a resolver. Podes adiar o pedido (espera 10 minutos, depois 20), reduzir o número de perguntas, ou responder a ti mesma: "não preciso de ter a certeza para seguir em frente". A incerteza incomoda, mas não te faz mal.',
          en: 'Asking "do you think I\'m okay?", "is this food fine?", "did he look ill?", or searching symptoms online, are all ways of seeking reassurance. They give real relief — but it lasts a very short time.\n\nThe problem is that the doubt always comes back. And each time you soothe it from outside, you reinforce the idea that you need absolute certainty to be okay. Since that certainty never really exists, the need to ask only grows.\n\nThe alternative is not forced "positive thinking", it is tolerating the doubt without resolving it. You can delay the request (wait 10 minutes, then 20), cut down the number of questions, or answer yourself: "I don\'t need to be certain to carry on". Uncertainty is uncomfortable, but it does not harm you.',
        },
      },
      {
        id: 'l8',
        title: { pt: 'Vigiar o corpo', en: 'Monitoring your body' },
        body: {
          pt: 'Quando temos medo de vomitar, é natural começar a vigiar a barriga o tempo todo, à procura do mais pequeno sinal de náusea. Parece prudente, mas tem um efeito traiçoeiro: aquilo em que focamos a atenção fica maior.\n\nQuanto mais vigias o estômago, mais notas sensações normais — a digestão, a fome, o ar, a tensão — e mais facilmente as interpretas como "vou vomitar". A vigilância cria a prova que depois assusta.\n\nTreinar a atenção para fora ajuda. Quando deres por ti a fazer o "scan" interno, redireciona de propósito para o que te rodeia: o que vês, o que ouves, o que tocas. Não é distração para fugir — é devolver a atenção ao presente, onde ela deixa de alimentar o alarme.',
          en: 'When we fear vomiting, it is natural to start monitoring the stomach all the time, searching for the smallest sign of nausea. It feels sensible, but it has a treacherous effect: whatever we focus attention on grows larger.\n\nThe more you watch your stomach, the more you notice normal sensations — digestion, hunger, gas, tension — and the more easily you read them as "I\'m going to vomit". The watching creates the very evidence that then scares you.\n\nTraining your attention outward helps. When you catch yourself doing the internal "scan", deliberately redirect to what is around you: what you see, hear, touch. It is not distraction to escape — it is returning attention to the present, where it stops feeding the alarm.',
        },
      },
    ],
  },
  {
    id: 'ch3',
    title: { pt: 'O que a fobia diz vs a realidade', en: 'What the phobia says vs reality' },
    lessons: [
      {
        id: 'l9',
        title: { pt: 'Náusea não é vómito', en: 'Nausea is not vomiting' },
        body: {
          pt: 'A fobia trata a náusea como o anúncio certo de que vais vomitar. Na prática, não é. A náusea é uma sensação muito comum e tem mil causas que nada têm a ver com vomitar: ansiedade, stress, fome, cansaço, a própria digestão, uma respiração acelerada.\n\nAliás, a ansiedade sozinha provoca sensações no estômago — e depois, quanto mais te assustas com elas, mais a ansiedade as intensifica. É um ciclo: notas a náusea, interpretas como perigo, ficas mais ansiosa, e a barriga fica pior.\n\nOutra coisa que a fobia esconde: nos adultos, em países desenvolvidos, vomitar é raro. A maioria das pessoas passa anos sem vomitar. Sentir náuseas muitas vezes e vomitar quase nunca são realidades completamente diferentes — e o teu corpo vive quase sempre no primeiro lado.',
          en: 'The phobia treats nausea as a sure announcement that you are about to vomit. In practice, it is not. Nausea is a very common sensation with countless causes that have nothing to do with vomiting: anxiety, stress, hunger, tiredness, digestion itself, fast breathing.\n\nIn fact, anxiety alone produces stomach sensations — and then, the more they scare you, the more anxiety intensifies them. It is a loop: you notice the nausea, read it as danger, get more anxious, and your stomach feels worse.\n\nSomething else the phobia hides: for adults in developed countries, vomiting is rare. Most people go years without it. Feeling nauseous often and almost never vomiting are completely different realities — and your body lives almost entirely on the first side.',
        },
      },
      {
        id: 'l10',
        title: { pt: 'Medo e nojo', en: 'Fear and disgust' },
        body: {
          pt: 'Na emetofobia não há só medo — há também nojo, e muitas vezes o nojo é a emoção mais forte. Estudos mostram que a sensibilidade ao nojo é um dos melhores indicadores da intensidade da fobia.\n\nIsto é importante por dois motivos. Primeiro, explica porque "pensar racionalmente" nem sempre chega: o nojo é uma reação rápida e automática, que não se desliga só com argumentos. Segundo, muda a forma de medir o progresso — numa exposição, faz sentido avaliar o medo e o nojo em separado, porque podem descer a ritmos diferentes.\n\nA boa notícia é que o nojo também habitua. Com exposição repetida e gradual (palavras, imagens, vídeos), a reação vai perdendo força, tal como acontece com o medo.',
          en: 'In emetophobia there is not only fear — there is also disgust, and often disgust is the stronger emotion. Studies show that disgust sensitivity is one of the best predictors of how intense the phobia is.\n\nThis matters for two reasons. First, it explains why "thinking rationally" is not always enough: disgust is a fast, automatic reaction that does not switch off with arguments alone. Second, it changes how you measure progress — in an exposure it makes sense to rate fear and disgust separately, because they can come down at different rates.\n\nThe good news is that disgust habituates too. With repeated, gradual exposure (words, images, videos), the reaction gradually loses its force, just as fear does.',
        },
      },
      {
        id: 'l11',
        title: { pt: 'Os pensamentos catastróficos', en: 'Catastrophic thoughts' },
        body: {
          pt: 'Por baixo do medo há quase sempre previsões catastróficas sobre o que aconteceria se vomitasses: "não ia conseguir parar", "ia durar dias", "ia perder o controlo", "ia sufocar", "ia ser insuportável", "ia acontecer em público e seria humilhante".\n\nVale a pena olhar para estas previsões com honestidade, em vez de as empurrar para longe. Vomitar é desagradável, sim — mas costuma ser breve (segundos a minutos), o corpo fá-lo por uma razão e depois normalmente sentimo-nos aliviados. Não dura dias, não se perde o controlo da mente, não se sufoca.\n\nO objetivo não é prometeres-te que nunca vais vomitar — ninguém pode garantir isso. É reduzir o tamanho da catástrofe: mesmo no pior cenário, é algo que passa e que és capaz de suportar. Quando a consequência deixa de parecer o fim do mundo, o medo perde o combustível.',
          en: 'Underneath the fear there are almost always catastrophic predictions about what would happen if you vomited: "I wouldn\'t be able to stop", "it would last for days", "I\'d lose control", "I\'d choke", "it would be unbearable", "it would happen in public and be humiliating".\n\nIt is worth looking at these predictions honestly, instead of pushing them away. Vomiting is unpleasant, yes — but it is usually brief (seconds to minutes), the body does it for a reason, and afterwards we usually feel relieved. It does not last for days, you do not lose control of your mind, you do not choke.\n\nThe goal is not to promise yourself you will never vomit — no one can guarantee that. It is to shrink the catastrophe: even in the worst case, it is something that passes and that you are able to withstand. When the consequence stops looking like the end of the world, the fear loses its fuel.',
        },
      },
      {
        id: 'l12',
        title: { pt: 'A intolerância à incerteza', en: 'Intolerance of uncertainty' },
        body: {
          pt: 'Grande parte do sofrimento na emetofobia não é o vómito em si — é a incerteza. "E se a comida estava má?", "e se aquela pessoa estava doente?", "e se esta náusea for diferente?". A fobia exige uma certeza que a vida nunca dá.\n\nQuase todos os comportamentos de segurança (verificar, perguntar, pesquisar, evitar) são tentativas de comprar certeza. Funcionam por instantes e depois a dúvida regressa, mais exigente.\n\nO caminho não passa por conseguir a certeza perfeita, mas por aumentar a tua tolerância à dúvida. Treina-se como um músculo: deixar uma pergunta por responder, comer sem verificar, sair sem confirmar. No início é desconfortável; com a prática, o desconforto desce e a liberdade cresce.',
          en: 'Much of the suffering in emetophobia is not the vomiting itself — it is the uncertainty. "What if the food was off?", "what if that person was ill?", "what if this nausea is different?". The phobia demands a certainty that life never gives.\n\nAlmost all safety behaviours (checking, asking, searching, avoiding) are attempts to buy certainty. They work for a moment and then the doubt returns, more demanding than before.\n\nThe way forward is not getting perfect certainty, but increasing your tolerance of doubt. It trains like a muscle: leaving a question unanswered, eating without checking, going out without confirming. At first it is uncomfortable; with practice, the discomfort drops and the freedom grows.',
        },
      },
    ],
  },
  {
    id: 'ch4',
    title: { pt: 'Conceitos base', en: 'Core concepts' },
    lessons: [
      {
        id: 'l13',
        title: { pt: 'A ansiedade ao longo do tempo', en: 'Anxiety over time' },
        body: {
          pt: 'A ansiedade não sobe para sempre. Se ficares com ela sem fugir, atinge um pico e depois desce sozinha — o corpo não consegue manter o alarme indefinidamente. A esta descida natural chama-se habituação.\n\nE a cada vez que ficas, o pico seguinte tende a ser mais baixo e a descer mais depressa. É por isso que a prática repetida funciona: o cérebro vai recolhendo provas de que aguentou e de que nada de catastrófico aconteceu.\n\nMais importante ainda do que a ansiedade descer naquele momento é a aprendizagem nova que fica: "fui capaz de ficar com isto". Por isso, numa exposição, a pergunta útil não é só "a ansiedade baixou?", mas "aprendi que consigo suportar isto?". Essa aprendizagem é o que te acompanha para a próxima vez.',
          en: 'Anxiety does not rise forever. If you stay with it without fleeing, it reaches a peak and then comes down on its own — the body cannot hold the alarm indefinitely. This natural drop is called habituation.\n\nAnd each time you stay, the next peak tends to be lower and to fall faster. That is why repeated practice works: the brain gathers evidence that it coped and that nothing catastrophic happened.\n\nEven more important than the anxiety dropping in the moment is the new learning that stays: "I was able to stay with this". So in an exposure the useful question is not only "did the anxiety come down?", but "did I learn that I can withstand this?". That learning is what travels with you to next time.',
        },
      },
      {
        id: 'l14',
        title: { pt: 'Desconforto "limpo" vs "sujo"', en: 'Clean vs dirty discomfort' },
        body: {
          pt: 'O desconforto "limpo" é a sensação em si: o coração acelerado, a barriga revolta, o nojo. É real, mas é só isso — uma sensação. O desconforto "sujo" é tudo o que acrescentamos por cima: os "e se...", a luta contra a sensação, o julgamento ("não devia estar assim"), o medo do próprio medo.\n\nGrande parte do sofrimento vem do segundo, não do primeiro. A sensação pura passaria; é a camada que lhe pomos por cima que a prende e amplifica.\n\nAprender a deixar o desconforto limpo existir — sem lutar, sem comentar, sem lhe pôr histórias em cima — alivia imenso. Não é resignação; é parar de gastar energia a combater algo que, por si só, já ia passar.',
          en: 'Clean discomfort is the sensation itself: the racing heart, the churning stomach, the disgust. It is real, but it is just that — a sensation. Dirty discomfort is everything we add on top: the "what ifs", the struggle against the sensation, the judgement ("I shouldn\'t be like this"), the fear of the fear itself.\n\nMuch of the suffering comes from the second, not the first. The pure sensation would pass; it is the layer we add on top that traps and amplifies it.\n\nLearning to let the clean discomfort exist — without fighting, without commenting, without stacking stories on it — brings huge relief. It is not resignation; it is choosing to stop spending energy fighting something that, on its own, was already going to pass.',
        },
      },
      {
        id: 'l15',
        title: { pt: 'Respiração e regulação', en: 'Breathing and regulation' },
        body: {
          pt: 'Respirar devagar, com a expiração mais longa do que a inspiração, envia ao corpo o sinal de que pode baixar o alarme. Ativa o lado do sistema nervoso que acalma e ajuda a travar a espiral de ansiedade.\n\nMas atenção a uma armadilha: a respiração não serve para "fazer o medo desaparecer" nem para evitar vomitar. Se a usares como mais um comportamento de segurança ("só não vomitei porque respirei"), reforças a fobia.\n\nUsa-a como uma âncora — algo que te ajuda a ficar com o desconforto, não a fugir dele. Respira devagar e continua a fazer o que estavas a fazer, deixando a sensação existir. Tens a técnica de respiração na página inicial, sempre que precisares.',
          en: 'Breathing slowly, with the out-breath longer than the in-breath, sends the body a signal that it can lower the alarm. It activates the calming side of the nervous system and helps brake the anxiety spiral.\n\nBut watch out for a trap: breathing is not meant to "make the fear disappear" or to prevent vomiting. If you use it as one more safety behaviour ("I only didn\'t vomit because I breathed"), you reinforce the phobia.\n\nUse it as an anchor — something that helps you stay with the discomfort, not flee it. Breathe slowly and keep doing what you were doing, letting the sensation exist. The breathing tool is on the home page, whenever you need it.',
        },
      },
    ],
  },
  {
    id: 'ch5',
    title: { pt: 'Construir competências', en: 'Building skills' },
    lessons: [
      {
        id: 'l16',
        title: { pt: 'Exposição gradual', en: 'Gradual exposure' },
        body: {
          pt: 'A exposição gradual é a abordagem com mais evidência para fobias. Consiste em aproximares-te do que temes por degraus, do mais fácil ao mais difícil, construindo uma "escada". Podes avaliar cada degrau de 0 a 10 — e, como vimos, vale a pena avaliar o medo e o nojo em separado.\n\nEm cada degrau, a ideia é ficares com a sensação até ela descer ou até perceberes que consegues aguentá-la, em vez de fugires no pico. Depois repetes o mesmo degrau várias vezes, até deixar de te assustar, e só então sobes.\n\nDuas chaves para funcionar mesmo: variar (fazer o degrau em dias, horas e contextos diferentes, não sempre igual) e não te apoiares em comportamentos de segurança durante a exposição — senão o cérebro credita o sucesso a eles. Cada pequeno passo conta. Não há passos demasiado pequenos.',
          en: 'Gradual exposure is the most evidence-based approach for phobias. It means approaching what you fear in steps, from easiest to hardest, building a "ladder". You can rate each step from 0 to 10 — and, as we saw, it is worth rating fear and disgust separately.\n\nAt each step, the idea is to stay with the sensation until it comes down, or until you see that you can withstand it, rather than fleeing at the peak. Then you repeat the same step several times, until it no longer scares you, and only then move up.\n\nTwo keys to make it really work: vary it (do the step on different days, times and contexts, not always the same) and do not lean on safety behaviours during the exposure — otherwise the brain credits the success to them. Every small step counts. There are no steps too small.',
        },
      },
      {
        id: 'l17',
        title: { pt: 'Largar os comportamentos de segurança', en: 'Dropping safety behaviours' },
        body: {
          pt: 'A exposição só dá o seu verdadeiro fruto quando largas, ao mesmo tempo, os comportamentos de segurança. A isto chama-se prevenção de resposta: enfrentar o que temes sem as muletas habituais (sem verificar, sem perguntar, sem o saco, sem vigiar a barriga).\n\nNão precisas de largar tudo de uma vez. Escolhe um comportamento e reduz-o aos poucos: por exemplo, adiar um pedido de tranquilização 10 minutos, depois 20, depois 30; ou comer sem cheirar a comida primeiro.\n\nUma forma poderosa é transformar isto numa experiência: antes, escreve o que achas que vai acontecer ("se não verificar a validade, vou passar mal"); depois faz sem verificar e compara com o que aconteceu de verdade. Quase sempre, a realidade é muito menos assustadora do que a previsão — e é isso que ensina o cérebro.',
          en: 'Exposure only bears its true fruit when you drop the safety behaviours at the same time. This is called response prevention: facing what you fear without the usual crutches (no checking, no asking, no bag, no stomach monitoring).\n\nYou do not need to drop everything at once. Pick one behaviour and reduce it gradually: for example, delaying a reassurance request by 10 minutes, then 20, then 30; or eating without smelling the food first.\n\nA powerful way is to turn this into an experiment: beforehand, write down what you think will happen ("if I don\'t check the expiry date, I\'ll get sick"); then do it without checking and compare with what actually happened. Almost always, reality is far less frightening than the prediction — and that is what teaches the brain.',
        },
      },
      {
        id: 'l18',
        title: { pt: 'Exposição às sensações do corpo', en: 'Exposure to body sensations' },
        body: {
          pt: 'Como a emetofobia se agarra muito às sensações internas (náusea, barriga revolta, tontura), ajuda treinar também a tolerância a essas sensações de propósito. Chama-se exposição interocetiva.\n\nSão exercícios simples e seguros que criam sensações parecidas com as temidas, para o corpo aprender que não são perigosas: por exemplo, rodar numa cadeira para ficar ligeiramente tonta, respirar mais depressa durante alguns segundos, ou beber uma bebida com gás depressa para sentir a barriga cheia. Ficas com a sensação até perceberes que passa.\n\nUm ponto essencial de segurança: nunca se provoca o vómito de propósito — não é isso que se treina, e não faz parte do tratamento. O objetivo é apenas habituar-te às sensações, não forçar o que temes. Se tiveres alguma condição de saúde, fala primeiro com um profissional sobre que exercícios são adequados para ti.',
          en: 'Because emetophobia latches strongly onto internal sensations (nausea, churning stomach, dizziness), it helps to also train tolerance of those sensations on purpose. This is called interoceptive exposure.\n\nThese are simple, safe exercises that create sensations similar to the feared ones, so the body learns they are not dangerous: for example, spinning on a chair to feel slightly dizzy, breathing faster for a few seconds, or drinking a fizzy drink quickly to feel a full stomach. You stay with the sensation until you see that it passes.\n\nOne essential safety point: you never make yourself vomit on purpose — that is not what you train, and it is not part of treatment. The aim is only to get used to the sensations, not to force what you fear. If you have any health condition, check first with a professional about which exercises are right for you.',
        },
      },
      {
        id: 'l19',
        title: { pt: 'Palavras, imagens e memórias', en: 'Words, images and memories' },
        body: {
          pt: 'Para muitas pessoas, até a palavra "vomitar" ou uma imagem assustam. Por isso a escada costuma começar aí: dizer e escrever a palavra, ler relatos, ver desenhos, depois fotografias e por fim vídeos, subindo devagar. Com a repetição, a palavra e a imagem vão perdendo o poder — o nojo e o medo habituam.\n\nTambém é comum haver imagens intrusivas a aparecer na cabeça. Tentar afastá-las à força costuma dá-las mais força. Em vez disso, podes só reparar: "isto é uma imagem intrusiva", deixá-la estar, e voltar ao que estavas a fazer.\n\nQuando há uma memória antiga marcante — uma vez em que vomitaste e foi traumático, por exemplo — existem técnicas específicas (como a reescrita de imagens) que ajudam a tirar-lhe a carga. Essas costumam fazer-se melhor com o apoio de um profissional.',
          en: 'For many people, even the word "vomit" or an image is frightening. So the ladder often starts there: saying and writing the word, reading accounts, looking at cartoons, then photos and finally videos, moving up slowly. With repetition, the word and the image lose their power — disgust and fear habituate.\n\nIt is also common to get intrusive images popping into your head. Trying to force them away usually gives them more force. Instead, you can simply notice: "this is an intrusive image", let it be, and return to what you were doing.\n\nWhen there is a vivid old memory — a time you vomited and it was traumatic, say — there are specific techniques (such as imagery rescripting) that help take the charge out of it. Those are usually best done with the support of a professional.',
        },
      },
      {
        id: 'l20',
        title: { pt: 'Comida e comer', en: 'Food and eating' },
        body: {
          pt: 'A emetofobia leva muita gente a restringir a comida — evitar certos alimentos, comer só o que parece "seguro", verificar validades sem parar, não comer fora. Importa repetir: aqui o objetivo não é emagrecer, é não vomitar. Mesmo assim, esta restrição pode ir encolhendo a alimentação e a vida.\n\nA abordagem é a mesma das outras exposições: reintroduzir, um de cada vez, do mais fácil ao mais difícil. Começas por um alimento de baixa ansiedade, come-lo sem rituais (sem cheirar primeiro, sem verificar mil vezes), e repetes até deixar de assustar. Depois sobes para o próximo.\n\nSe a restrição alimentar já for acentuada — perda de peso, lista de alimentos muito curta, impacto grande no dia a dia — é sinal para teres apoio profissional a acompanhar estes passos, com segurança e ao teu ritmo.',
          en: 'Emetophobia leads many people to restrict food — avoiding certain foods, eating only what seems "safe", checking expiry dates endlessly, not eating out. It is worth repeating: here the goal is not to lose weight, it is to avoid vomiting. Even so, this restriction can gradually shrink both your diet and your life.\n\nThe approach is the same as other exposures: reintroduce, one at a time, from easiest to hardest. Start with a low-anxiety food, eat it without rituals (no smelling it first, no checking a thousand times), and repeat until it no longer scares you. Then move up to the next.\n\nIf food restriction is already marked — weight loss, a very short list of foods, a big impact on daily life — that is a sign to have a professional supporting these steps, safely and at your own pace.',
        },
      },
    ],
  },
  {
    id: 'ch6',
    title: { pt: 'Manter o progresso', en: 'Keeping your progress' },
    lessons: [
      {
        id: 'l21',
        title: { pt: 'Avaliar cada exposição', en: 'Reviewing each exposure' },
        body: {
          pt: 'Depois de cada exposição, vale a pena parar um momento para rever — mas com as perguntas certas. A fobia quer saber só uma coisa: "aconteceu a catástrofe?". Como quase nunca acontece, atribui o mérito à sorte ou aos comportamentos de segurança, e não aprende nada.\n\nFaz antes perguntas que consolidam a aprendizagem: "fui capaz de ficar com isto?", "a sensação mudou ao longo do tempo?", "o que aconteceu bateu certo com o que eu tinha previsto?". Estas perguntas ajudam o cérebro a registar que aguentaste e que a previsão estava exagerada.\n\nRegistar isto (na própria app, nos exercícios) cria um histórico de provas a teu favor. Nos dias difíceis, esse histórico vale mais do que qualquer frase — é a tua própria experiência a lembrar-te de que já conseguiste.',
          en: 'After each exposure it is worth pausing a moment to review — but with the right questions. The phobia only wants to know one thing: "did the catastrophe happen?". Since it almost never does, it credits luck or safety behaviours, and learns nothing.\n\nInstead, ask questions that consolidate the learning: "was I able to stay with this?", "did the sensation change over time?", "did what happened match what I predicted?". These questions help the brain record that you coped and that the prediction was exaggerated.\n\nWriting this down (in the app, in the exercises) builds a track record of evidence in your favour. On hard days, that record is worth more than any phrase — it is your own experience reminding you that you have done it before.',
        },
      },
      {
        id: 'l22',
        title: { pt: 'Lidar com recaídas', en: 'Handling setbacks' },
        body: {
          pt: 'Ter um dia mau depois de progresso não apaga o progresso. As recaídas fazem parte de qualquer recuperação e não significam voltar à estaca zero — significam que é um dia mais difícil, nada mais.\n\nMuitas vezes os recuos aparecem com stress, cansaço, doença real ou períodos de maior ansiedade. Reconhecer isso ajuda a não os ler como "afinal não melhorei nada". Melhoraste; só estás num dia em que o medo está mais alto.\n\nO que distingue quem recupera não é nunca recuar — é voltar a tentar no dia seguinte, com gentileza em vez de autocrítica. Retoma o último degrau que já dominavas, ganha confiança aí, e segue. O caminho não é uma linha reta; é uma linha que, no geral, sobe.',
          en: 'Having a bad day after progress does not erase the progress. Setbacks are part of any recovery and do not mean starting from scratch — they mean it is a harder day, nothing more.\n\nSetbacks often show up with stress, tiredness, real illness or periods of higher anxiety. Recognising that helps you not read them as "I haven\'t improved at all after all". You have improved; you are just on a day when the fear is higher.\n\nWhat sets apart the people who recover is not never slipping — it is trying again the next day, with kindness instead of self-criticism. Go back to the last step you had already mastered, regain your confidence there, and carry on. The path is not a straight line; it is a line that, overall, goes up.',
        },
      },
      {
        id: 'l23',
        title: { pt: 'Quando procurar ajuda profissional', en: 'When to seek professional help' },
        body: {
          pt: 'Esta app é um apoio psicoeducativo — ajuda-te a perceber a fobia e a praticar — mas não substitui o acompanhamento de um profissional de saúde. Há situações em que vale mesmo a pena procurar ajuda especializada.\n\nAlguns sinais: a fobia está a limitar muito a tua vida (trabalho, estudos, relações, viagens); há restrição alimentar significativa ou perda de peso; os comportamentos de segurança são muitos e difíceis de largar; há pânico frequente, humor muito em baixo, ou sofres há bastante tempo sem conseguires avançar sozinha.\n\nProcura, de preferência, um psicólogo ou terapeuta com experiência em CBT/ERP e, idealmente, familiarizado com a emetofobia. Pedir ajuda não é um sinal de fracasso — é uma das formas mais eficazes de acelerar a recuperação. Em caso de crise aguda, contacta os serviços de saúde ou uma linha de apoio da tua região.',
          en: 'This app is psychoeducational support — it helps you understand the phobia and practise — but it does not replace care from a health professional. There are situations where it is genuinely worth seeking specialised help.\n\nSome signs: the phobia is heavily limiting your life (work, studies, relationships, travel); there is significant food restriction or weight loss; the safety behaviours are many and hard to drop; there is frequent panic, very low mood, or you have been suffering for a long time without being able to move forward on your own.\n\nLook, ideally, for a psychologist or therapist experienced in CBT/ERP and, if possible, familiar with emetophobia. Asking for help is not a sign of failure — it is one of the most effective ways to speed up recovery. In an acute crisis, contact your health services or a support line in your area.',
        },
      },
    ],
  },
  {
    id: 'ch7',
    title: { pt: 'Saber mais', en: 'Learn more' },
    lessons: [
      {
        id: 'l24',
        title: { pt: 'De onde vem a emetofobia', en: 'Where emetophobia comes from' },
        body: {
          pt: 'Não há uma causa única, mas há um padrão muito claro: a maioria das pessoas aponta um episódio marcante com vómito como o início da fobia — quase sempre na infância. Pode ter sido uma virose longa e assustadora, vomitar em público, ou ter assistido a alguém a vomitar muito (por doença, gravidez ou álcool).\n\nPara uma criança, vomitar pode ser aterrador: é súbito, descontrolado e sente-se como se o corpo a "traísse". O cérebro, a tentar proteger-te, marca aquilo como um grande perigo a evitar a todo o custo. Essa marca pode ficar durante anos, mesmo quando já és adulta e sabes, racionalmente, que não é perigoso.\n\nAlguns especialistas associam a emetofobia a uma necessidade de controlo — e faz sentido, porque o vómito é das coisas mais incontroláveis que existem. Perceber a origem não é para te prenderes ao passado; é para veres que a tua reação tem uma explicação lógica. Não és estranha nem exagerada: o teu alarme aprendeu bem demais uma lição antiga.',
          en: 'There is no single cause, but there is a very clear pattern: most people point to a striking vomiting episode as the start of the phobia — almost always in childhood. It may have been a long, frightening stomach bug, vomiting in public, or witnessing someone vomit a lot (through illness, pregnancy or alcohol).\n\nFor a child, vomiting can be terrifying: it is sudden, uncontrollable, and feels as if the body is "betraying" you. The brain, trying to protect you, marks it as a great danger to be avoided at all costs. That mark can last for years, even once you are an adult and know, rationally, that it is not dangerous.\n\nSome experts link emetophobia to a need for control — which makes sense, because vomiting is one of the most uncontrollable things there is. Understanding the origin is not about clinging to the past; it is about seeing that your reaction has a logical explanation. You are not strange or over the top: your alarm simply learned an old lesson far too well.',
        },
      },
      {
        id: 'l25',
        title: { pt: 'O norovírus, de perto', en: 'Norovirus, up close' },
        body: {
          pt: 'O norovírus — o chamado "vírus do vómito de inverno" — é a causa mais comum de gastroenterite e está na origem de muitíssimos casos de emetofobia, porque quase toda a gente o apanha em criança. Dá sintomas súbitos: náusea, vómitos e diarreia, por vezes com febre, dor de cabeça e dores no corpo.\n\nApesar de ser muito desagradável, há uma coisa importante que a fobia não deixa ver: é curto e passa sozinho. A maioria das pessoas começa a sentir-se melhor em 2 a 3 dias, sem qualquer tratamento especial — só descanso e beber líquidos aos golinhos. O corpo resolve-o por si. Em adultos saudáveis, o principal risco (a desidratação) é pouco frequente e fácil de prevenir.\n\nEspalha-se com facilidade, por isso lavar as mãos com água e sabão ajuda a reduzir o risco (os géis de álcool, curiosamente, não matam este vírus). Mas nota: saber estes factos uma vez é educação; andar a verificar sintomas ou a pesquisar online repetidamente já é um comportamento de segurança que alimenta o medo. A ideia aqui é desmistificar — não te dar uma nova verificação para fazer.',
          en: 'Norovirus — the so-called "winter vomiting bug" — is the most common cause of gastroenteritis and lies behind very many cases of emetophobia, because almost everyone catches it as a child. It causes sudden symptoms: nausea, vomiting and diarrhoea, sometimes with fever, headache and body aches.\n\nAlthough it is very unpleasant, there is an important thing the phobia hides: it is short and passes on its own. Most people start to feel better within 2 to 3 days, with no special treatment — just rest and sipping fluids. The body sorts it out itself. In healthy adults the main risk (dehydration) is uncommon and easy to prevent.\n\nIt spreads easily, so washing your hands with soap and water helps reduce the risk (alcohol gels, interestingly, do not kill this virus). But note: knowing these facts once is education; repeatedly checking symptoms or searching online is a safety behaviour that feeds the fear. The point here is to demystify it — not to give you a new thing to check.',
        },
      },
      {
        id: 'l26',
        title: { pt: 'A memória que ficou', en: 'The memory that stayed' },
        body: {
          pt: 'Quando a fobia nasce de um episódio concreto — uma virose em criança, por exemplo — é comum ficar uma memória muito viva, quase com cheiro, som e imagem. Essa memória pode saltar para a cabeça sozinha e disparar o medo no presente, como se o perigo fosse agora.\n\nNada disto é sinal de fraqueza. É assim que o cérebro guarda experiências que viveu como ameaça: em alta definição e com um "alarme" colado. O problema é que o alarme não foi atualizado — continua a tratar uma memória de há anos como se fosse um aviso de perigo atual.\n\nA boa notícia é que estas memórias podem perder a carga. Com exposição gradual à própria recordação e com técnicas específicas (como a reescrita de imagens, em que se trabalha a memória de forma a dar-lhe outro fecho), o episódio deixa de mandar no presente. Por ser uma memória antiga e sensível, este trabalho costuma correr melhor com o apoio de um profissional — mas começar por nomear a memória, em vez de a empurrar para longe, já tira algum do seu poder.',
          en: 'When the phobia is born from a specific episode — a stomach bug in childhood, for example — it is common to be left with a very vivid memory, almost with smell, sound and image. That memory can jump into your head on its own and set off the fear in the present, as if the danger were happening now.\n\nNone of this is a sign of weakness. It is how the brain stores experiences it lived as a threat: in high definition and with an "alarm" attached. The problem is that the alarm was never updated — it keeps treating a years-old memory as if it were a current danger warning.\n\nThe good news is that these memories can lose their charge. With gradual exposure to the memory itself and with specific techniques (such as imagery rescripting, where the memory is reworked to give it a different ending), the episode stops ruling the present. Because it is an old and sensitive memory, this work usually goes better with the support of a professional — but simply starting to name the memory, instead of pushing it away, already takes some of its power.',
        },
      },
      {
        id: 'l27',
        title: { pt: 'Porque vale a pena', en: 'Why it is worth it' },
        body: {
          pt: 'A emetofobia raramente fica só no medo de vomitar. Vai-se espalhando: faltar a eventos, limitar a vida social, adiar objetivos, evitar certos trabalhos ou viagens, comer cada vez menos variedade. Para alguns, viajar torna-se quase impossível, ou surge o receio de estar sozinho com crianças pequenas.\n\nVer isto preto no branco não é para te assustar — é para dar peso à outra coluna da balança: o que ganhas ao enfrentá-la. Cada degrau de exposição não é só "sentir menos medo"; é recuperar um restaurante, uma viagem, um jantar com amigos, a espontaneidade.\n\nÉ por isso que vale o desconforto temporário da exposição. Não estás a sofrer por sofrer: estás a comprar de volta pedaços da tua vida que o medo tinha levado. Essa é a verdadeira recompensa — e ninguém a sente melhor do que quem passou anos a evitar.',
          en: 'Emetophobia rarely stays only as the fear of vomiting. It gradually spreads: skipping events, limiting your social life, putting goals on hold, avoiding certain jobs or trips, eating less and less variety. For some, travel becomes nearly impossible, or a fear arises of being alone with young children.\n\nSeeing this in black and white is not to scare you — it is to give weight to the other side of the scale: what you gain by facing it. Each exposure step is not just "feeling less fear"; it is getting back a restaurant, a trip, a dinner with friends, spontaneity.\n\nThat is why the temporary discomfort of exposure is worth it. You are not suffering for the sake of it: you are buying back pieces of your life that fear had taken. That is the real reward — and no one feels it more than someone who spent years avoiding.',
        },
      },
      {
        id: 'l28',
        title: { pt: 'Ser gentil contigo', en: 'Being kind to yourself' },
        body: {
          pt: 'A recuperação não acontece mais depressa quando te tratas com dureza. Pelo contrário: a autocrítica ("devia conseguir isto", "sou patética por ter medo disto") acrescenta sofrimento e torna cada degrau mais difícil de enfrentar.\n\nTenta falar contigo como falarias com uma amiga a passar pelo mesmo: com compreensão, paciência e reconhecimento do esforço. Enfrentar aquilo que te aterroriza — mesmo que seja só dizer a palavra "vomitar" em voz alta — exige coragem, por mais pequeno que pareça o passo.\n\nCelebra os pequenos avanços, descansa quando precisas, e lembra-te de que ter um dia mau não apaga o caminho feito. A gentileza não é o oposto da coragem: é o que te permite continuar a tê-la, dia após dia.',
          en: 'Recovery does not happen faster when you treat yourself harshly. Quite the opposite: self-criticism ("I should be able to do this", "I\'m pathetic for fearing this") adds suffering and makes each step harder to face.\n\nTry to talk to yourself the way you would to a friend going through the same thing: with understanding, patience and recognition of the effort. Facing what terrifies you — even if it is just saying the word "vomit" out loud — takes courage, however small the step looks.\n\nCelebrate the small wins, rest when you need to, and remember that having a bad day does not erase the ground you have covered. Kindness is not the opposite of courage: it is what lets you keep having it, day after day.',
        },
      },
      {
        id: 'l29',
        title: { pt: 'Aprender a distinguir sensações', en: 'Learning to tell sensations apart' },
        body: {
          pt: 'O corpo produz imensas sensações ao longo do dia que são completamente normais e inofensivas — mas a emetofobia tende a ler muitas delas como "vou vomitar". Conhecê-las, com curiosidade em vez de alarme, ajuda a entrar menos vezes em pânico.\n\nNo peito e na garganta: a ansiedade pode dar aperto no peito, respiração curta ou a sensação de um "nó" ou bola na garganta (chama-se globus). O globus é muito comum, não há ali bloqueio nenhum real, não é perigoso e não tem consequências a longo prazo; piora com o stress e com emoções contidas, e passa.\n\nTemperatura e pele: ondas de calor, rubor ou arrepios sem febre são típicos da descarga de adrenalina — é o corpo a regular-se, não um sinal de doença.\n\nBarriga e intestinos: gorgolejos, "borboletas", apertos, uma pontada passageira, gases ou azia ligeira — quase tudo isto é digestão e tensão normais. A ansiedade mexe diretamente com o intestino (o eixo intestino-cérebro), por isso é normalíssimo sentir a barriga "esquisita" quando estás nervosa.\n\nO objetivo aqui não é dar-te mais uma coisa para vigiar — é o contrário. É aprenderes que estas sensações fazem parte de um corpo normal, para deixares de precisar de as interpretar sempre como ameaça.',
          en: 'The body produces countless sensations throughout the day that are completely normal and harmless — but emetophobia tends to read many of them as "I\'m going to vomit". Getting to know them, with curiosity instead of alarm, helps you panic less often.\n\nChest and throat: anxiety can cause chest tightness, shallow breathing, or the feeling of a "lump" or ball in the throat (called globus). Globus is very common, there is no real blockage there, it is not dangerous and has no long-term consequences; it worsens with stress and held-in emotions, and it passes.\n\nTemperature and skin: waves of heat, flushing or shivers without a fever are typical of the adrenaline surge — the body regulating itself, not a sign of illness.\n\nStomach and gut: gurgling, "butterflies", cramps, a passing twinge, gas or mild heartburn — almost all of this is normal digestion and tension. Anxiety acts directly on the gut (the gut-brain axis), so it is completely normal to feel your stomach "off" when you are nervous.\n\nThe aim here is not to give you one more thing to monitor — it is the opposite. It is to learn that these sensations are part of a normal body, so you no longer need to read them as a threat every time.',
        },
      },
      {
        id: 'l30',
        title: { pt: 'O que costuma vir mesmo antes de vomitar', en: 'What usually comes right before vomiting' },
        body: {
          pt: 'Uma das razões por que a fobia assusta tanto é não sabermos distinguir "estou nervosa" de "vou mesmo vomitar". Conhecer o que costuma preceder o vómito ajuda a ver que a esmagadora maioria das tuas sensações do dia a dia não se parece nada com isso.\n\nQuando o corpo se prepara mesmo para vomitar, costuma haver um conjunto de sinais ao mesmo tempo, a crescer — e não uma sensação isolada e passageira. Tipicamente: náusea forte e persistente (não um mal-estar que vai e vem), salivação a mais (a boca enche-se de saliva), suor frio, pele pálida, por vezes o coração acelerado e, muitas vezes, ânsia ou engasgo (o reflexo seco) mesmo antes. É um crescendo bastante inconfundível, que se instala e se mantém.\n\nRepara no contraste: um "nó" na garganta sozinho, uma onda de calor, um gorgolejo ou uma pontada que passa não são este quadro. São sensações únicas, que vêm e vão — não o conjunto todo a subir em conjunto.\n\nDois avisos honestos: isto é para aprenderes a distinguir, não para ficares a vigiar a barriga à espera do "conjunto" — isso seria só mais um comportamento de segurança. E, se estiveres mesmo com uma virose, o corpo faz o que tem a fazer e depois passa, como já vimos. Isto é informação para aprenderes, não um diagnóstico nem um substituto de um médico se algo te preocupar a sério.',
          en: 'One reason the phobia is so frightening is not knowing how to tell "I\'m nervous" from "I\'m actually going to vomit". Knowing what usually precedes vomiting helps you see that the vast majority of your day-to-day sensations look nothing like it.\n\nWhen the body is genuinely getting ready to vomit, there is usually a cluster of signs at once, building — not an isolated, passing sensation. Typically: strong, persistent nausea (not an off feeling that comes and goes), excess salivation (the mouth fills with saliva), cold sweat, pale skin, sometimes a racing heart and, often, retching or gagging (the dry reflex) just before. It is a fairly unmistakable crescendo that sets in and stays.\n\nNotice the contrast: a "lump" in the throat on its own, a wave of heat, a gurgle or a twinge that passes are not this picture. They are single sensations that come and go — not the whole cluster rising together.\n\nTwo honest cautions: this is to help you tell things apart, not to sit monitoring your stomach waiting for the "cluster" — that would just be one more safety behaviour. And if you really do have a stomach bug, the body does what it needs to and then it passes, as we have seen. This is information to learn from, not a diagnosis or a substitute for a doctor if something genuinely worries you.',
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

// Frases de coping por gatilho (tom de "consigo lidar", mais eficaz que "não vai acontecer nada").
// As chaves correspondem aos ids em TRIGGERS_OPTIONS.
export const TRIGGER_PHRASES: Record<string, L[]> = {
  'náusea': [
    { pt: 'A náusea é desconfortável, mas passa — quase sempre sem nada acontecer.', en: 'Nausea is uncomfortable, but it passes — almost always with nothing happening.' },
    { pt: 'Sentir náuseas não é o mesmo que vomitar.', en: 'Feeling nauseous is not the same as vomiting.' },
    { pt: 'Já senti isto antes e fiquei bem. Consigo ficar com esta sensação.', en: 'I have felt this before and I was okay. I can stay with this feeling.' },
  ],
  'outros sintomas': [
    { pt: 'Estes sintomas são desagradáveis, não perigosos.', en: 'These symptoms are unpleasant, not dangerous.' },
    { pt: 'O meu corpo sabe regular-se. Isto costuma passar sozinho.', en: 'My body knows how to regulate itself. This usually passes on its own.' },
    { pt: 'Posso deixar a sensação existir sem lutar contra ela.', en: 'I can let the sensation exist without fighting it.' },
  ],
  'crianças': [
    { pt: 'Estar perto de crianças não me faz adoecer automaticamente.', en: 'Being around children does not automatically make me sick.' },
    { pt: 'A maior parte dos dias passa sem qualquer problema.', en: 'Most days pass without any problem.' },
    { pt: 'Sou capaz de lidar com este momento, aconteça o que acontecer.', en: 'I can handle this moment, whatever happens.' },
  ],
  'viajar': [
    { pt: 'O enjoo de viagem é temporário e controlável.', en: 'Travel sickness is temporary and manageable.' },
    { pt: 'Posso respirar devagar e focar-me no horizonte.', en: 'I can breathe slowly and focus on the horizon.' },
    { pt: 'Estou seguro. Isto passa.', en: 'I am safe. This will pass.' },
  ],
  'comida contaminada': [
    { pt: 'A grande maioria das refeições é perfeitamente segura.', en: 'The vast majority of meals are perfectly safe.' },
    { pt: 'Não preciso de verificar tudo para estar bem.', en: 'I do not need to check everything to be okay.' },
    { pt: 'Um mal-estar não significa que vou vomitar.', en: 'Feeling off does not mean I will vomit.' },
  ],
  'ver outros': [
    { pt: 'Ver alguém enjoado é desconfortável, mas não me faz mal a mim.', en: 'Seeing someone sick is uncomfortable, but it does not harm me.' },
    { pt: 'Posso desviar o olhar, respirar, e a sensação desce.', en: 'I can look away, breathe, and the feeling comes down.' },
    { pt: 'Este desconforto é a minha ansiedade, não um perigo real.', en: 'This discomfort is my anxiety, not a real danger.' },
  ],
};

// Frases gerais (para gatilhos personalizados ou sem frases próprias).
export const GENERAL_TRIGGER_PHRASES: L[] = [
  { pt: 'Estou seguro. Consigo lidar com este momento.', en: 'I am safe. I can handle this moment.' },
  { pt: 'Isto é desconfortável, mas não é perigoso.', en: 'This is uncomfortable, but it is not dangerous.' },
  { pt: 'Já passei por isto antes e ficou bem.', en: 'I have been through this before and it was okay.' },
  { pt: 'O medo vem em ondas — e as ondas descem sempre.', en: 'Fear comes in waves — and waves always come down.' },
];

// "Alimentar o medo": comportamentos que mantêm a fobia + a alternativa saudável.
export const FEEDING_BEHAVIORS: { id: string; label: L; why: L; alternative: L }[] = [
  { id: 'avoid', label: { pt: 'Evitar situações ou lugares temidos', en: 'Avoiding feared situations or places' },
    why: { pt: 'A evitação dá alívio imediato, mas ensina o cérebro que aquilo era mesmo perigoso — por isso o medo cresce.', en: 'Avoidance brings instant relief, but it teaches the brain the situation really was dangerous — so the fear grows.' },
    alternative: { pt: 'Aproxima-te aos poucos, por degraus, ficando até a ansiedade descer (exposição gradual).', en: 'Approach it gradually, step by step, staying until anxiety comes down (gradual exposure).' } },
  { id: 'reassurance', label: { pt: 'Procurar que te tranquilizem', en: 'Seeking reassurance' },
    why: { pt: 'A dúvida volta sempre. Cada pedido de tranquilização alivia por minutos, mas reforça que precisas de certeza para estar bem.', en: 'Doubt always returns. Each reassurance soothes for minutes but reinforces that you need certainty to be okay.' },
    alternative: { pt: 'Resiste a perguntar. Tolera a dúvida e usa uma frase de coping ("consigo lidar com a incerteza").', en: 'Resist asking. Tolerate the doubt and use a coping phrase ("I can handle uncertainty").' } },
  { id: 'bodycheck', label: { pt: 'Verificar o corpo e os sintomas', en: 'Checking your body and symptoms' },
    why: { pt: 'Vigiar as sensações mantém a atenção no "perigo" e amplifica cada sinal do corpo.', en: 'Monitoring sensations keeps attention on "danger" and amplifies every bodily signal.' },
    alternative: { pt: 'Adia a verificação e redireciona a atenção para algo à tua volta (ver, ouvir, tocar).', en: 'Delay the check and redirect attention to something around you (see, hear, touch).' } },
  { id: 'expiry', label: { pt: 'Verificar validades e cheirar a comida', en: 'Checking expiry dates and smelling food' },
    why: { pt: 'Dá certeza momentânea, mas alimenta a necessidade de controlo total sobre a comida.', en: 'It gives momentary certainty, but feeds the need for total control over food.' },
    alternative: { pt: 'Come sem verificar, começando por alimentos de baixa ansiedade, um de cada vez.', en: 'Eat without checking, starting with low-anxiety foods, one at a time.' } },
  { id: 'safetyitems', label: { pt: 'Levar "itens de segurança" (saco, antináuseas)', en: 'Carrying "safety items" (bag, anti-nausea)' },
    why: { pt: 'O cérebro atribui a segurança ao item — e não a ti — por isso nunca aprende que estavas bem sem ele.', en: 'The brain credits the safety to the item — not to you — so it never learns you were fine without it.' },
    alternative: { pt: 'Sai sem esses itens, aos poucos, para provares a ti que consegues.', en: 'Go out without those items, gradually, to prove to yourself you can.' } },
  { id: 'avoidfood', label: { pt: 'Evitar comidas, restaurantes ou refeições fora', en: 'Avoiding foods, restaurants or eating out' },
    why: { pt: 'Restringe a tua vida e reforça a ideia de que esses sítios/alimentos são perigosos.', en: 'It restricts your life and reinforces the idea that those places/foods are dangerous.' },
    alternative: { pt: 'Reintroduz um alimento ou sítio de cada vez, do mais fácil ao mais difícil.', en: 'Reintroduce one food or place at a time, from easiest to hardest.' } },
  { id: 'googling', label: { pt: 'Pesquisar sintomas ou doenças online', en: 'Searching symptoms or illnesses online' },
    why: { pt: 'Aumenta a ansiedade e a hipervigilância — quase nunca tranquiliza de verdade.', en: 'It increases anxiety and hypervigilance — it almost never truly reassures.' },
    alternative: { pt: 'Põe um limite (ou pausa total) às pesquisas. Adia e observa a vontade passar.', en: 'Set a limit (or full pause) on searches. Delay and watch the urge pass.' } },
  { id: 'avoidmedia', label: { pt: 'Evitar filmes/conteúdos com vómito', en: 'Avoiding films/content with vomiting' },
    why: { pt: 'Impede a habituação: a palavra e a imagem mantêm todo o seu poder.', en: 'It prevents habituation: the word and image keep all their power.' },
    alternative: { pt: 'Exposição gradual — começa por palavras e desenhos, sobe devagar (vê os Jogos e Exercícios).', en: 'Gradual exposure — start with words and cartoons, move up slowly (see Games and Exercises).' } },
];

// Guia de sensações: distinguir sensações comuns e inofensivas (não é reassurance,
// é aprendizagem). Baseado em fontes clínicas (globus, eixo intestino-cérebro,
// resposta de adrenalia, e o prodromo típico do vómito).
export const SENSATION_GROUPS: { area: L; items: { label: L; body: L }[] }[] = [
  {
    area: { pt: 'Peito e garganta', en: 'Chest and throat' },
    items: [
      { label: { pt: '"Nó" ou bola na garganta', en: '"Lump" or ball in the throat' },
        body: { pt: 'Chama-se globus. É muito comum e não há ali bloqueio nenhum real — é tensão. Liga-se ao stress e a emoções contidas, não é perigoso e não tem consequências a longo prazo. Passa.', en: 'It is called globus. It is very common and there is no real blockage there — it is tension. It is linked to stress and held-in emotions, it is not dangerous and has no long-term consequences. It passes.' } },
      { label: { pt: 'Aperto no peito ou respiração curta', en: 'Chest tightness or shallow breathing' },
        body: { pt: 'Vem da tensão muscular e da respiração rápida da ansiedade. É desconfortável, mas não é o estômago nem um sinal de que vais vomitar. Abrandar a expiração ajuda o corpo a soltar.', en: 'It comes from muscle tension and the fast breathing of anxiety. It is uncomfortable, but it is not your stomach nor a sign you will vomit. Slowing the out-breath helps the body let go.' } },
      { label: { pt: 'Vontade de pigarrear / limpar a garganta', en: 'Urge to clear your throat' },
        body: { pt: 'Anda de mãos dadas com o globus: muco e tensão na garganta. Inofensivo e muito frequente quando estamos ansiosos.', en: 'It goes hand in hand with globus: mucus and tension in the throat. Harmless and very common when we are anxious.' } },
    ],
  },
  {
    area: { pt: 'Pele e temperatura', en: 'Skin and temperature' },
    items: [
      { label: { pt: 'Onda de calor ou rubor (sem febre)', en: 'Wave of heat or flushing (no fever)' },
        body: { pt: 'É a descarga de adrenalia a dilatar os vasos. Sem febre, é só o corpo a regular-se na resposta de alerta — não uma doença a começar.', en: 'It is the adrenaline surge widening your blood vessels. Without a fever, it is just the body regulating itself in the alert response — not an illness starting.' } },
      { label: { pt: 'Arrepios ou mãos suadas', en: 'Shivers or sweaty hands' },
        body: { pt: 'A mesma resposta de alerta. Aparece depressa e regula-se sozinha quando a ansiedade desce.', en: 'The same alert response. It comes on quickly and settles on its own as the anxiety comes down.' } },
      { label: { pt: 'Tontura leve / cabeça "leve"', en: 'Mild dizziness / light-headedness' },
        body: { pt: 'Muitas vezes é respirar depressa demais (hiperventilação), que baixa o CO₂. Não é desmaio iminente; abrandar a respiração costuma resolver.', en: 'Often it is breathing too fast (hyperventilation), which lowers your CO₂. It is not fainting about to happen; slowing your breathing usually resolves it.' } },
    ],
  },
  {
    area: { pt: 'Barriga e intestinos', en: 'Stomach and gut' },
    items: [
      { label: { pt: '"Borboletas" ou frio na barriga', en: '"Butterflies" or a sinking stomach' },
        body: { pt: 'Na resposta de stress, o sangue desvia-se da digestão. Daí a sensação de vazio ou de "borboletas" — normal e passageira.', en: 'In the stress response, blood is diverted away from digestion. Hence the empty or "butterflies" feeling — normal and passing.' } },
      { label: { pt: 'Gorgolejos e ruídos na barriga', en: 'Gurgling and stomach noises' },
        body: { pt: 'Chamam-se borborigmos: é só o movimento normal de gases e líquidos no intestino. Toda a gente os tem; só reparas mais quando estás atenta.', en: 'They are called borborygmi: just the normal movement of gas and fluid in the gut. Everyone has them; you only notice them more when you are paying attention.' } },
      { label: { pt: 'Apertos ou cólicas passageiras', en: 'Cramps or passing twinges' },
        body: { pt: 'O intestino reage diretamente à ansiedade (o eixo intestino-cérebro). Vêm e vão, e não são o mesmo que a náusea forte e contínua de antes de vomitar.', en: 'The gut reacts directly to anxiety (the gut-brain axis). They come and go, and are not the same as the strong, continuous nausea that comes before vomiting.' } },
      { label: { pt: 'Azia ou refluxo ligeiro', en: 'Mild heartburn or reflux' },
        body: { pt: 'Muito comum e ligado a tensão, comida ou postura. Desconfortável, mas não perigoso e não quer dizer vómito.', en: 'Very common and linked to tension, food or posture. Uncomfortable, but not dangerous and not a sign of vomiting.' } },
      { label: { pt: 'Náusea de ansiedade', en: 'Anxiety nausea' },
        body: { pt: 'É real, mas vai e vem conforme a ansiedade sobe e desce. É diferente da náusea forte, persistente e crescente que acompanha mesmo o vómito.', en: 'It is real, but it comes and goes as anxiety rises and falls. It is different from the strong, persistent, building nausea that actually accompanies vomiting.' } },
    ],
  },
];
