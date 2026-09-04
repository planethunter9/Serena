// Comportamentos de segurança/evitação comuns na emetofobia (fontes clínicas).
// Parecem ajudar, mas mantêm o medo — largá-los aos poucos faz parte da recuperação.

type L = { pt: string; en: string };

export const SAFETY_BEHAVIORS: { id: string; label: L }[] = [
  { id: 'bag', label: { pt: 'Levar sempre um saco comigo', en: 'Always carrying a bag with me' } },
  { id: 'mints', label: { pt: 'Andar com mentas ou água "por precaução"', en: 'Carrying mints or water "just in case"' } },
  { id: 'expiry', label: { pt: 'Verificar validades a toda a hora', en: 'Constantly checking expiry dates' } },
  { id: 'avoidfood', label: { pt: 'Evitar certos alimentos ou restaurantes', en: 'Avoiding certain foods or restaurants' } },
  { id: 'avoidsick', label: { pt: 'Evitar pessoas que estiveram doentes', en: 'Avoiding people who were recently sick' } },
  { id: 'temp', label: { pt: 'Medir a temperatura ou vigiar sintomas', en: 'Checking my temperature or monitoring symptoms' } },
  { id: 'ask', label: { pt: 'Perguntar aos outros se se sentem bem', en: 'Asking others if they feel okay' } },
  { id: 'scenes', label: { pt: 'Evitar filmes/séries com cenas de vómito', en: 'Avoiding films/series with vomit scenes' } },
  { id: 'exits', label: { pt: 'Sentar-me perto da saída ou da casa de banho', en: 'Sitting near the exit or bathroom' } },
  { id: 'wash', label: { pt: 'Lavar as mãos em excesso', en: 'Washing my hands excessively' } },
  { id: 'meds', label: { pt: 'Tomar antináuseas por precaução', en: 'Taking anti-nausea meds as a precaution' } },
  { id: 'reassure', label: { pt: 'Procurar que me tranquilizem repetidamente', en: 'Repeatedly seeking reassurance' } },
];
