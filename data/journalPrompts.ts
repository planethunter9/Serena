// Perguntas opcionais para inspirar o diário, nas 10 línguas.

import type { Lang } from '../i18n/i18n';

type T = { ideaTitle: string; ideaHint: string; clear: string; freePh: string; prompts: string[] };

const TXT: Record<Lang, T> = {
  pt: { ideaTitle: 'Precisas de uma ideia?', ideaHint: 'Escolhe uma pergunta, se quiseres.', clear: 'Tirar pergunta', freePh: 'Escreve à tua maneira…', prompts: ['O que me assustou hoje?', 'O que fiz apesar do medo?', 'Que pensamento me apareceu mais vezes?', 'O que correu melhor do que esperava?', 'Do que me orgulho hoje?', 'O que quero tentar amanhã?'] },
  'pt-BR': { ideaTitle: 'Precisa de uma ideia?', ideaHint: 'Escolha uma pergunta, se quiser.', clear: 'Tirar pergunta', freePh: 'Escreva do seu jeito…', prompts: ['O que me assustou hoje?', 'O que fiz apesar do medo?', 'Que pensamento apareceu mais vezes?', 'O que deu mais certo do que eu esperava?', 'Do que me orgulho hoje?', 'O que quero tentar amanhã?'] },
  en: { ideaTitle: 'Need an idea?', ideaHint: 'Pick a question, if you like.', clear: 'Remove question', freePh: 'Write it your way…', prompts: ['What scared me today?', 'What did I do despite the fear?', 'Which thought came up most often?', 'What went better than I expected?', 'What am I proud of today?', 'What do I want to try tomorrow?'] },
  es: { ideaTitle: '¿Necesitas una idea?', ideaHint: 'Elige una pregunta, si quieres.', clear: 'Quitar pregunta', freePh: 'Escribe a tu manera…', prompts: ['¿Qué me asustó hoy?', '¿Qué hice a pesar del miedo?', '¿Qué pensamiento apareció más veces?', '¿Qué salió mejor de lo esperado?', '¿Qué me hace sentir orgullo hoy?', '¿Qué quiero intentar mañana?'] },
  fr: { ideaTitle: "Besoin d'une idée ?", ideaHint: 'Choisis une question, si tu veux.', clear: 'Retirer la question', freePh: 'Écris à ta façon…', prompts: ["Qu'est-ce qui m'a fait peur aujourd'hui ?", "Qu'ai-je fait malgré la peur ?", 'Quelle pensée est revenue le plus souvent ?', "Qu'est-ce qui s'est mieux passé que prévu ?", "Qu'est-ce qui me donne de la fierté aujourd'hui ?", "Qu'ai-je envie d'essayer demain ?"] },
  de: { ideaTitle: 'Brauchst du eine Idee?', ideaHint: 'Wähle eine Frage, wenn du magst.', clear: 'Frage entfernen', freePh: 'Schreib, wie du willst…', prompts: ['Was hat mir heute Angst gemacht?', 'Was habe ich trotz der Angst getan?', 'Welcher Gedanke kam am häufigsten?', 'Was lief besser als erwartet?', 'Worauf bin ich heute stolz?', 'Was möchte ich morgen ausprobieren?'] },
  it: { ideaTitle: "Ti serve un'idea?", ideaHint: 'Scegli una domanda, se vuoi.', clear: 'Togli la domanda', freePh: 'Scrivi a modo tuo…', prompts: ['Cosa mi ha spaventato oggi?', 'Cosa ho fatto nonostante la paura?', 'Quale pensiero è tornato più spesso?', 'Cosa è andato meglio del previsto?', 'Cosa mi dà orgoglio oggi?', 'Cosa voglio provare domani?'] },
  nl: { ideaTitle: 'Een idee nodig?', ideaHint: 'Kies een vraag, als je wilt.', clear: 'Vraag weghalen', freePh: 'Schrijf op jouw manier…', prompts: ['Wat maakte me vandaag bang?', 'Wat deed ik ondanks de angst?', 'Welke gedachte kwam het vaakst terug?', 'Wat ging beter dan verwacht?', 'Waar ben ik vandaag trots op?', 'Wat wil ik morgen proberen?'] },
  pl: { ideaTitle: 'Potrzebujesz pomysłu?', ideaHint: 'Wybierz pytanie, jeśli chcesz.', clear: 'Usuń pytanie', freePh: 'Pisz po swojemu…', prompts: ['Co mnie dziś przestraszyło?', 'Co udało się zrobić mimo strachu?', 'Jaka myśl pojawiała się najczęściej?', 'Co poszło lepiej od oczekiwań?', 'Co dziś daje mi powód do dumy?', 'Czego chcę spróbować jutro?'] },
  ru: { ideaTitle: 'Нужна идея?', ideaHint: 'Выбери вопрос, если хочешь.', clear: 'Убрать вопрос', freePh: 'Пиши по-своему…', prompts: ['Что меня сегодня напугало?', 'Что удалось сделать вопреки страху?', 'Какая мысль приходила чаще всего?', 'Что прошло лучше, чем ожидалось?', 'Чем я сегодня горжусь?', 'Что хочу попробовать завтра?'] },
};

export function journalText(lang: Lang): T {
  return TXT[lang] ?? TXT.en;
}
export const JOURNAL_LANGS = Object.keys(TXT) as Lang[];
