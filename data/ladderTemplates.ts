// Escadas de exposição prontas, por subtipo de emetofobia. Cada modelo é uma
// sequência sugerida do mais fácil ao mais difícil (palavra → imagens → vídeos →
// sensações → vida real). São um PONTO DE PARTIDA: ao importar, os degraus são
// acrescentados à escada da pessoa, que os pode editar, remover e reordenar.
// Os ids dos subtipos correspondem aos de SUBTYPE_OPTIONS (data/content.ts).

type L = { pt: string; en: string };

export const LADDER_TEMPLATES: { subtypeId: string; steps: L[] }[] = [
  {
    subtypeId: 'self',
    steps: [
      { pt: 'Dizer a palavra "vomitar" em voz alta', en: 'Say the word "vomit" out loud' },
      { pt: 'Ler relatos de pessoas que vomitaram e ficaram bem', en: 'Read accounts of people who vomited and were fine' },
      { pt: 'Ver um desenho ou emoji de alguém a vomitar', en: 'Look at a cartoon or emoji of someone vomiting' },
      { pt: 'Ver uma foto realista', en: 'Look at a realistic photo' },
      { pt: 'Ver um vídeo curto', en: 'Watch a short video' },
      { pt: 'Fazer um exercício de sensações que imita a náusea', en: 'Do an interoceptive exercise that mimics nausea' },
      { pt: 'Comer algo que evitas por "poder cair mal", sem rituais', en: 'Eat something you avoid as "risky", without rituals' },
    ],
  },
  {
    subtypeId: 'others',
    steps: [
      { pt: 'Dizer "ele/ela vomitou" em voz alta', en: 'Say "they threw up" out loud' },
      { pt: 'Ver um desenho animado com cena de vómito', en: 'Watch a cartoon with a vomit scene' },
      { pt: 'Ouvir o som de alguém a vomitar (áudio)', en: 'Listen to the sound of someone vomiting (audio)' },
      { pt: 'Ver uma foto', en: 'Look at a photo' },
      { pt: 'Ver um vídeo curto', en: 'Watch a short video' },
      { pt: 'Estar numa sala com alguém que diz estar enjoado', en: 'Be in a room with someone who says they feel sick' },
      { pt: 'Ver um vídeo mais longo e realista', en: 'Watch a longer, more realistic video' },
    ],
  },
  {
    subtypeId: 'nausea',
    steps: [
      { pt: 'Ler que a náusea é comum e inofensiva', en: 'Read that nausea is common and harmless' },
      { pt: 'Dizer "sinto enjoo e está tudo bem"', en: 'Say "I feel sick and that\'s okay"' },
      { pt: 'Rodar numa cadeira para sentir leve tontura', en: 'Spin on a chair to feel slightly dizzy' },
      { pt: 'Respirar mais depressa alguns segundos', en: 'Breathe faster for a few seconds' },
      { pt: 'Ficar com uma náusea ligeira sem tomar nada nem verificar', en: 'Stay with mild nausea without taking anything or checking' },
      { pt: 'Comer um pouco a mais para sentir o estômago cheio', en: 'Eat a bit more to feel a full stomach' },
    ],
  },
  {
    subtypeId: 'public',
    steps: [
      { pt: 'Escrever "e se vomitasse aqui?" sem resolver a dúvida', en: 'Write "what if I threw up here?" without resolving the doubt' },
      { pt: 'Sentar-te longe da saída num café', en: 'Sit far from the exit in a café' },
      { pt: 'Ir a um sítio a 10 min de casa sem o "kit"', en: 'Go somewhere 10 min from home without your "kit"' },
      { pt: 'Comer fora num sítio conhecido', en: 'Eat out at a familiar place' },
      { pt: 'Andar de transporte público uma paragem', en: 'Take public transport for one stop' },
      { pt: 'Ir a um sítio novo mais longe de casa', en: 'Go to a new place further from home' },
      { pt: 'Ficar num evento sem plano de fuga', en: 'Stay at an event with no escape plan' },
    ],
  },
  {
    subtypeId: 'illness',
    steps: [
      { pt: 'Ler os factos sobre o norovírus (é curto e passa sozinho)', en: 'Read the facts about norovirus (it is short and self-limiting)' },
      { pt: 'Dizer "posso apanhar um vírus e ficaria bem"', en: 'Say "I could catch a bug and I would be okay"' },
      { pt: 'Tocar num puxador ou corrimão e não lavar logo as mãos', en: 'Touch a handle or rail and not wash your hands right away' },
      { pt: 'Estar perto de alguém constipado', en: 'Be near someone with a cold' },
      { pt: 'Não pesquisar sintomas depois de ouvir falar de um surto', en: 'Not search symptoms after hearing about an outbreak' },
      { pt: 'Partilhar comida ou pratos com alguém', en: 'Share food or plates with someone' },
      { pt: 'Visitar alguém que esteve doente há uns dias', en: 'Visit someone who was ill a few days ago' },
    ],
  },
  {
    subtypeId: 'food',
    steps: [
      { pt: 'Ler a palavra "estragado"', en: 'Read the word "spoiled"' },
      { pt: 'Olhar para uma validade sem a voltar a verificar', en: 'Look at an expiry date without checking it again' },
      { pt: 'Comer algo 1 dia depois da data "preferencial"', en: 'Eat something 1 day past the "best before" date' },
      { pt: 'Comer sem cheirar a comida primeiro', en: 'Eat without smelling the food first' },
      { pt: 'Comer sobras reaquecidas', en: 'Eat reheated leftovers' },
      { pt: 'Comer fora ou num buffet', en: 'Eat out or at a buffet' },
      { pt: 'Experimentar um prato novo', en: 'Try a new dish' },
    ],
  },
  {
    subtypeId: 'family',
    steps: [
      { pt: 'Dizer "um familiar pode vomitar e eu consigo lidar"', en: 'Say "a family member could be sick and I can cope"' },
      { pt: 'Ver uma imagem de uma criança enjoada (desenho → foto)', en: 'Look at an image of a sick child (cartoon → photo)' },
      { pt: 'Limpar algo que imita vómito (ex.: sopa derramada)', en: 'Clean something that mimics vomit (e.g. spilled soup)' },
      { pt: 'Estar perto de crianças mais tempo', en: 'Spend more time around children' },
      { pt: 'Não higienizar em excesso depois', en: 'Not over-sanitise afterwards' },
      { pt: 'Cuidar de alguém com um mal-estar ligeiro', en: 'Care for someone with mild discomfort' },
    ],
  },
  {
    subtypeId: 'travel',
    steps: [
      { pt: 'Dizer "posso enjoar na viagem e aguento"', en: 'Say "I might get motion sick and I can handle it"' },
      { pt: 'Ver imagens ou vídeos de estrada/barco', en: 'Look at images or videos of roads/boats' },
      { pt: 'Baloiçar ou rodar para sentir leve enjoo', en: 'Rock or spin to feel slightly queasy' },
      { pt: 'Andar de carro 10 min sem medicação', en: 'Ride in a car for 10 min without medication' },
      { pt: 'Andar de autocarro uma viagem curta', en: 'Take a bus for a short trip' },
      { pt: 'Ler no carro durante alguns minutos', en: 'Read in the car for a few minutes' },
      { pt: 'Fazer uma viagem mais longa', en: 'Take a longer trip' },
    ],
  },
  {
    subtypeId: 'pregnancy',
    steps: [
      { pt: 'Ler que a maioria das grávidas vomita pouco ou nada', en: 'Read that most pregnant people vomit little or not at all' },
      { pt: 'Dizer "enjoo na gravidez é comum e gerível"', en: 'Say "pregnancy nausea is common and manageable"' },
      { pt: 'Ler ou ver relatos de enjoos matinais', en: 'Read or watch accounts of morning sickness' },
      { pt: 'Falar sobre gravidez sem evitar o tema', en: 'Talk about pregnancy without avoiding the topic' },
      { pt: 'Imaginar lidar com um enjoo matinal, sem resolver a dúvida', en: 'Imagine coping with morning sickness, without resolving the doubt' },
    ],
  },
  {
    subtypeId: 'animals',
    steps: [
      { pt: 'Dizer "o meu animal pode vomitar e eu consigo limpar"', en: 'Say "my pet could be sick and I can clean it up"' },
      { pt: 'Ver uma imagem de um animal a vomitar (desenho → real)', en: 'Look at an image of an animal being sick (cartoon → real)' },
      { pt: 'Limpar algo que imita (ração molhada)', en: 'Clean something that mimics it (wet pet food)' },
      { pt: 'Estar presente quando o animal está agitado', en: 'Be present when the animal is unsettled' },
      { pt: 'Cuidar do animal com um mal-estar ligeiro', en: 'Care for the pet with mild discomfort' },
    ],
  },
  {
    subtypeId: 'parenting',
    steps: [
      { pt: "Dizer \"uma criança pode vomitar e eu consigo cuidar\"", en: "Say \"a child might be sick and I can look after them\"" },
      { pt: "Ler sobre como cuidar de uma criança com uma virose", en: "Read about caring for a child with a stomach bug" },
      { pt: "Preparar o \"kit\" (balde, toalhas, roupa) e deixá-lo à vista", en: "Put together the kit (bucket, towels, clothes) and keep it in sight" },
      { pt: "Ver um vídeo de um bebé a bolsar", en: "Watch a video of a baby spitting up" },
      { pt: "Limpar algo que imita vómito (ex.: papa derramada)", en: "Clean something that mimics vomit (e.g. spilled baby food)" },
      { pt: "Ficar no mesmo espaço quando uma criança diz que está enjoada", en: "Stay in the same room when a child says they feel sick" },
      { pt: "Cuidar de uma criança doente sem desinfetar tudo depois", en: "Care for a sick child without disinfecting everything afterwards" },
    ],
  },
];
