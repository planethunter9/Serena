// Aviso "a Serena não substitui um profissional" (exigido pelas lojas em apps
// de saúde mental). Aparece no consentimento (registo), em "Sobre" e no Apoio.
// Linguagem neutra em género em todas as línguas.

import type { Lang } from '../i18n/i18n';

export type DisclaimerText = {
  title: string;
  body: string;        // texto completo (consentimento / Sobre)
  short: string;       // versão curta (separador Apoio)
  crisis: string;      // botão para as linhas de apoio
  ack: string;         // caixa a marcar no consentimento
};

const TXT: Record<Lang, DisclaimerText> = {
  pt: {
    title: 'A Serena não substitui um profissional',
    body: 'A Serena é um apoio psicoeducativo. Não é um dispositivo médico e não faz diagnósticos nem substitui a avaliação ou o tratamento por um psicólogo, psiquiatra ou médico. Se estiveres em crise ou em perigo, liga para o número de emergência ou para uma linha de apoio.',
    short: 'Em crise ou em perigo? Liga já para uma linha de apoio ou para o número de emergência.',
    crisis: 'Linhas de apoio',
    ack: 'Compreendo que a Serena não substitui o acompanhamento de um profissional de saúde.',
  },
  'pt-BR': {
    title: 'O Serena não substitui um profissional',
    body: 'O Serena é um apoio psicoeducativo. Não é um dispositivo médico, não faz diagnósticos e não substitui a avaliação ou o tratamento com psicólogo, psiquiatra ou médico. Se você estiver em crise ou em perigo, ligue para o número de emergência ou para uma linha de apoio.',
    short: 'Em crise ou em perigo? Ligue agora para uma linha de apoio ou para o número de emergência.',
    crisis: 'Linhas de apoio',
    ack: 'Entendo que o Serena não substitui o acompanhamento de um profissional de saúde.',
  },
  en: {
    title: 'Serena is not a substitute for a professional',
    body: 'Serena is psychoeducational support. It is not a medical device, it does not diagnose, and it does not replace assessment or treatment by a psychologist, psychiatrist or doctor. If you are in crisis or in danger, call the emergency number or a helpline.',
    short: 'In crisis or in danger? Call a helpline or the emergency number now.',
    crisis: 'Helplines',
    ack: 'I understand that Serena does not replace care from a health professional.',
  },
  es: {
    title: 'Serena no sustituye a un profesional',
    body: 'Serena es un apoyo psicoeducativo. No es un producto sanitario, no hace diagnósticos y no sustituye la evaluación ni el tratamiento de un psicólogo, psiquiatra o médico. Si estás en crisis o en peligro, llama al número de emergencias o a una línea de ayuda.',
    short: '¿En crisis o en peligro? Llama ya a una línea de ayuda o al número de emergencias.',
    crisis: 'Líneas de ayuda',
    ack: 'Entiendo que Serena no sustituye la atención de un profesional sanitario.',
  },
  fr: {
    title: 'Serena ne remplace pas un professionnel',
    body: 'Serena est un soutien psychoéducatif. Ce n\'est pas un dispositif médical : l\'app ne pose pas de diagnostic et ne remplace pas l\'évaluation ni le traitement par un psychologue, un psychiatre ou un médecin. En cas de crise ou de danger, appelle le numéro d\'urgence ou une ligne d\'écoute.',
    short: 'En crise ou en danger ? Appelle tout de suite une ligne d\'écoute ou le numéro d\'urgence.',
    crisis: 'Lignes d\'écoute',
    ack: 'Je comprends que Serena ne remplace pas le suivi par un professionnel de santé.',
  },
  de: {
    title: 'Serena ersetzt keine Fachperson',
    body: 'Serena ist ein psychoedukatives Angebot. Es ist kein Medizinprodukt, stellt keine Diagnosen und ersetzt keine Abklärung oder Behandlung durch Psychotherapie, Psychiatrie oder Ärztin bzw. Arzt. In einer Krise oder bei Gefahr ruf den Notruf oder ein Hilfetelefon an.',
    short: 'In einer Krise oder in Gefahr? Ruf jetzt ein Hilfetelefon oder den Notruf an.',
    crisis: 'Hilfetelefone',
    ack: 'Ich verstehe, dass Serena keine Begleitung durch eine Fachperson ersetzt.',
  },
  it: {
    title: 'Serena non sostituisce un professionista',
    body: 'Serena è un supporto psicoeducativo. Non è un dispositivo medico, non fa diagnosi e non sostituisce la valutazione o il trattamento da parte di psicologi, psichiatri o medici. In caso di crisi o pericolo, chiama il numero di emergenza o una linea di ascolto.',
    short: 'In crisi o in pericolo? Chiama subito una linea di ascolto o il numero di emergenza.',
    crisis: 'Linee di ascolto',
    ack: 'Capisco che Serena non sostituisce l\'assistenza di un professionista sanitario.',
  },
  nl: {
    title: 'Serena vervangt geen professional',
    body: 'Serena is psycho-educatieve ondersteuning. Het is geen medisch hulpmiddel, stelt geen diagnoses en vervangt geen beoordeling of behandeling door een psycholoog, psychiater of arts. Ben je in crisis of in gevaar, bel dan het noodnummer of een hulplijn.',
    short: 'In crisis of in gevaar? Bel nu een hulplijn of het noodnummer.',
    crisis: 'Hulplijnen',
    ack: 'Ik begrijp dat Serena geen begeleiding door een zorgprofessional vervangt.',
  },
  pl: {
    title: 'Serena nie zastępuje specjalisty',
    body: 'Serena to wsparcie psychoedukacyjne. Nie jest wyrobem medycznym, nie stawia diagnoz i nie zastępuje oceny ani leczenia przez psychologa, psychiatrę lub lekarza. W kryzysie lub zagrożeniu zadzwoń na numer alarmowy lub na telefon zaufania.',
    short: 'Kryzys lub zagrożenie? Zadzwoń teraz na telefon zaufania lub numer alarmowy.',
    crisis: 'Telefony zaufania',
    ack: 'Rozumiem, że Serena nie zastępuje opieki specjalisty.',
  },
  ru: {
    title: 'Serena не заменяет специалиста',
    body: 'Serena — это психообразовательная поддержка. Это не медицинское изделие: приложение не ставит диагнозы и не заменяет оценку или лечение у психолога, психиатра или врача. В кризисе или опасности позвоните по номеру экстренной службы или на линию помощи.',
    short: 'Кризис или опасность? Позвоните на линию помощи или по номеру экстренной службы.',
    crisis: 'Линии помощи',
    ack: 'Я понимаю, что Serena не заменяет помощь специалиста.',
  },
};

export function disclaimer(lang: Lang): DisclaimerText {
  return TXT[lang] ?? TXT.en;
}

export const DISCLAIMER_LANGS = Object.keys(TXT) as Lang[];
