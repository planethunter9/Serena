// Comportamentos de segurança/evitação comuns na emetofobia (fontes clínicas +
// relatos de comunidade). Parecem ajudar, mas mantêm o medo — largá-los aos
// poucos faz parte da recuperação.

type L = { pt: string; en: string };

export const SAFETY_BEHAVIORS: { id: string; label: L }[] = [
  { id: 'bag', label: { pt: 'Levar sempre um saco comigo', en: 'Always carrying a bag with me' } },
  { id: 'mints', label: { pt: 'Andar com mentas, gengibre ou água "por precaução"', en: 'Carrying mints, ginger or water "just in case"' } },
  { id: 'expiry', label: { pt: 'Verificar validades a toda a hora', en: 'Constantly checking expiry dates' } },
  { id: 'sniff', label: { pt: 'Cheirar a comida antes de comer', en: 'Smelling food before eating' } },
  { id: 'safeonly', label: { pt: 'Comer só alimentos "seguros"', en: 'Eating only "safe" foods' } },
  { id: 'avoidfood', label: { pt: 'Evitar certos alimentos ou restaurantes', en: 'Avoiding certain foods or restaurants' } },
  { id: 'avoidsick', label: { pt: 'Evitar pessoas que estiveram doentes ou crianças', en: 'Avoiding people who were sick, or children' } },
  { id: 'temp', label: { pt: 'Medir a temperatura ou vigiar sintomas', en: 'Checking my temperature or monitoring symptoms' } },
  { id: 'ask', label: { pt: 'Perguntar aos outros se se sentem bem', en: 'Asking others if they feel okay' } },
  { id: 'scenes', label: { pt: 'Evitar filmes/séries com cenas de vómito', en: 'Avoiding films/series with vomit scenes' } },
  { id: 'exits', label: { pt: 'Sentar-me perto da saída ou da casa de banho', en: 'Sitting near the exit or bathroom' } },
  { id: 'wash', label: { pt: 'Lavar as mãos em excesso ou usar desinfetante a toda a hora', en: 'Washing my hands or using sanitiser excessively' } },
  { id: 'meds', label: { pt: 'Tomar antináuseas ou antiácidos por precaução', en: 'Taking anti-nausea or antacid meds as a precaution' } },
  { id: 'reassure', label: { pt: 'Procurar que me tranquilizem repetidamente', en: 'Repeatedly seeking reassurance' } },
  { id: 'search', label: { pt: 'Pesquisar sintomas ou riscos online', en: 'Searching symptoms or risks online' } },
  { id: 'avoidtravel', label: { pt: 'Evitar viagens, transportes ou sítios sem saída fácil', en: 'Avoiding travel, transport or places without an easy exit' } },
  { id: 'avoidalcohol', label: { pt: 'Evitar álcool, ou comer pouco antes de sair', en: 'Avoiding alcohol, or eating little before going out' } },
  { id: 'countdays', label: { pt: 'Contar os dias desde a última vez que estive doente', en: 'Counting the days since I was last sick' } },
  { id: 'barrier', label: { pt: 'Abrir portas/carregar botões com a manga ou usar máscara', en: 'Using my sleeve on doors/buttons or wearing a mask' } },
];
