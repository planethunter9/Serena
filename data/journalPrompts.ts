// Textos do diário nas 10 línguas: pergunta do dia, humor, etiquetas e
// mensagens. As perguntas são opcionais e rodam uma por dia.

import type { Lang } from '../i18n/i18n';

export const JOURNAL_TAGS = ['win', 'trigger', 'exposure', 'symptoms', 'hard'] as const;
export type JournalTag = (typeof JOURNAL_TAGS)[number];
export const MOOD_EMOJI = ['😣', '😕', '😐', '🙂', '😄']; // humor 1 a 5

type T = {
  question: string; promptOfDay: string; otherQ: string; freeWrite: string; usePrompt: string; freePh: string;
  moodQ: string; moods: string[]; moodLabel: string; moodTrend: string;
  tagsQ: string; tagsLabel: string; tags: Record<JournalTag, string>; all: string;
  emptyTitle: string; emptyBody: string;
  prompts: string[];
};

const TXT: Record<Lang, T> = {
  pt: {
    question: 'Pergunta', promptOfDay: 'Pergunta do dia', otherQ: 'Outra pergunta', freeWrite: 'Escrever livremente', usePrompt: 'Usar uma pergunta', freePh: 'Escreve à tua maneira…',
    moodQ: 'Como estás hoje?', moods: ['Muito mal', 'Mal', 'Assim-assim', 'Bem', 'Muito bem'], moodLabel: 'Humor', moodTrend: 'Humor nos últimos 14 dias',
    tagsQ: 'Etiquetas (opcional)', tagsLabel: 'Etiquetas', tags: { win: 'Vitória', trigger: 'Gatilho', exposure: 'Exposição', symptoms: 'Sintomas', hard: 'Dia difícil' }, all: 'Todas',
    emptyTitle: 'Ainda não escreveste hoje', emptyBody: 'Não precisa de ser muito. Uma frase sobre o teu dia já conta.',
    prompts: ['O que me assustou hoje?', 'O que fiz apesar do medo?', 'Que pensamento me apareceu mais vezes?', 'O que correu melhor do que esperava?', 'Do que me orgulho hoje?', 'O que quero tentar amanhã?', 'Que sensação do corpo notei hoje, e o que fiz com ela?', 'Que pequeno passo dei hoje?', 'O que diria a alguém com o mesmo medo?', 'O que me ajudou a acalmar hoje?'],
  },
  'pt-BR': {
    question: 'Pergunta', promptOfDay: 'Pergunta do dia', otherQ: 'Outra pergunta', freeWrite: 'Escrever livremente', usePrompt: 'Usar uma pergunta', freePh: 'Escreva do seu jeito…',
    moodQ: 'Como você está hoje?', moods: ['Muito mal', 'Mal', 'Mais ou menos', 'Bem', 'Muito bem'], moodLabel: 'Humor', moodTrend: 'Humor nos últimos 14 dias',
    tagsQ: 'Etiquetas (opcional)', tagsLabel: 'Etiquetas', tags: { win: 'Vitória', trigger: 'Gatilho', exposure: 'Exposição', symptoms: 'Sintomas', hard: 'Dia difícil' }, all: 'Todas',
    emptyTitle: 'Você ainda não escreveu hoje', emptyBody: 'Não precisa ser muito. Uma frase sobre o seu dia já conta.',
    prompts: ['O que me assustou hoje?', 'O que fiz apesar do medo?', 'Que pensamento apareceu mais vezes?', 'O que deu mais certo do que eu esperava?', 'Do que me orgulho hoje?', 'O que quero tentar amanhã?', 'Que sensação do corpo notei hoje, e o que fiz com ela?', 'Que pequeno passo dei hoje?', 'O que eu diria para alguém com o mesmo medo?', 'O que me ajudou a me acalmar hoje?'],
  },
  en: {
    question: 'Question', promptOfDay: 'Question of the day', otherQ: 'Another question', freeWrite: 'Write freely', usePrompt: 'Use a question', freePh: 'Write it your way…',
    moodQ: 'How are you today?', moods: ['Very bad', 'Bad', 'Okay', 'Good', 'Very good'], moodLabel: 'Mood', moodTrend: 'Mood over the last 14 days',
    tagsQ: 'Tags (optional)', tagsLabel: 'Tags', tags: { win: 'Win', trigger: 'Trigger', exposure: 'Exposure', symptoms: 'Symptoms', hard: 'Hard day' }, all: 'All',
    emptyTitle: "You haven't written today yet", emptyBody: "It doesn't have to be much. One sentence about your day counts.",
    prompts: ['What scared me today?', 'What did I do despite the fear?', 'Which thought came up most often?', 'What went better than I expected?', 'What am I proud of today?', 'What do I want to try tomorrow?', 'What body sensation did I notice today, and what did I do with it?', 'What small step did I take today?', 'What would I tell someone with the same fear?', 'What helped me calm down today?'],
  },
  es: {
    question: 'Pregunta', promptOfDay: 'Pregunta del día', otherQ: 'Otra pregunta', freeWrite: 'Escribir libremente', usePrompt: 'Usar una pregunta', freePh: 'Escribe a tu manera…',
    moodQ: '¿Cómo estás hoy?', moods: ['Muy mal', 'Mal', 'Regular', 'Bien', 'Muy bien'], moodLabel: 'Ánimo', moodTrend: 'Ánimo en los últimos 14 días',
    tagsQ: 'Etiquetas (opcional)', tagsLabel: 'Etiquetas', tags: { win: 'Logro', trigger: 'Desencadenante', exposure: 'Exposición', symptoms: 'Síntomas', hard: 'Día difícil' }, all: 'Todas',
    emptyTitle: 'Aún no has escrito hoy', emptyBody: 'No hace falta mucho. Una frase sobre tu día ya cuenta.',
    prompts: ['¿Qué me asustó hoy?', '¿Qué hice a pesar del miedo?', '¿Qué pensamiento apareció más veces?', '¿Qué salió mejor de lo esperado?', '¿Qué me hace sentir orgullo hoy?', '¿Qué quiero intentar mañana?', '¿Qué sensación del cuerpo noté hoy y qué hice con ella?', '¿Qué pequeño paso di hoy?', '¿Qué le diría a alguien con el mismo miedo?', '¿Qué me ayudó a calmarme hoy?'],
  },
  fr: {
    question: 'Question', promptOfDay: 'Question du jour', otherQ: 'Une autre question', freeWrite: 'Écrire librement', usePrompt: 'Utiliser une question', freePh: 'Écris à ta façon…',
    moodQ: "Comment ça va aujourd'hui ?", moods: ['Très mal', 'Mal', 'Moyen', 'Bien', 'Très bien'], moodLabel: 'Humeur', moodTrend: 'Humeur sur les 14 derniers jours',
    tagsQ: 'Étiquettes (facultatif)', tagsLabel: 'Étiquettes', tags: { win: 'Victoire', trigger: 'Déclencheur', exposure: 'Exposition', symptoms: 'Symptômes', hard: 'Jour difficile' }, all: 'Toutes',
    emptyTitle: "Tu n'as pas encore écrit aujourd'hui", emptyBody: "Pas besoin d'en écrire beaucoup. Une phrase sur ta journée, ça compte déjà.",
    prompts: ["Qu'est-ce qui m'a fait peur aujourd'hui ?", "Qu'ai-je fait malgré la peur ?", 'Quelle pensée est revenue le plus souvent ?', "Qu'est-ce qui s'est mieux passé que prévu ?", "Qu'est-ce qui me donne de la fierté aujourd'hui ?", "Qu'ai-je envie d'essayer demain ?", "Quelle sensation du corps ai-je remarquée aujourd'hui, et qu'en ai-je fait ?", "Quel petit pas ai-je fait aujourd'hui ?", 'Que dirais-je à quelqu\'un qui a la même peur ?', "Qu'est-ce qui m'a apporté du calme aujourd'hui ?"],
  },
  de: {
    question: 'Frage', promptOfDay: 'Frage des Tages', otherQ: 'Andere Frage', freeWrite: 'Frei schreiben', usePrompt: 'Eine Frage nutzen', freePh: 'Schreib, wie du willst…',
    moodQ: 'Wie geht es dir heute?', moods: ['Sehr schlecht', 'Schlecht', 'Geht so', 'Gut', 'Sehr gut'], moodLabel: 'Stimmung', moodTrend: 'Stimmung der letzten 14 Tage',
    tagsQ: 'Schlagwörter (optional)', tagsLabel: 'Schlagwörter', tags: { win: 'Erfolg', trigger: 'Auslöser', exposure: 'Exposition', symptoms: 'Symptome', hard: 'Schwerer Tag' }, all: 'Alle',
    emptyTitle: 'Heute hast du noch nichts geschrieben', emptyBody: 'Es muss nicht viel sein. Ein Satz über deinen Tag zählt schon.',
    prompts: ['Was hat mir heute Angst gemacht?', 'Was habe ich trotz der Angst getan?', 'Welcher Gedanke kam am häufigsten?', 'Was lief besser als erwartet?', 'Worauf bin ich heute stolz?', 'Was möchte ich morgen ausprobieren?', 'Welche Körperempfindung habe ich heute bemerkt, und was habe ich damit gemacht?', 'Welchen kleinen Schritt habe ich heute gemacht?', 'Was würde ich jemandem mit derselben Angst sagen?', 'Was hat mir heute geholfen, ruhiger zu werden?'],
  },
  it: {
    question: 'Domanda', promptOfDay: 'Domanda del giorno', otherQ: "Un'altra domanda", freeWrite: 'Scrivere liberamente', usePrompt: 'Usa una domanda', freePh: 'Scrivi a modo tuo…',
    moodQ: 'Come stai oggi?', moods: ['Molto male', 'Male', 'Così così', 'Bene', 'Molto bene'], moodLabel: 'Umore', moodTrend: 'Umore negli ultimi 14 giorni',
    tagsQ: 'Etichette (facoltative)', tagsLabel: 'Etichette', tags: { win: 'Vittoria', trigger: 'Fattore scatenante', exposure: 'Esposizione', symptoms: 'Sintomi', hard: 'Giornata difficile' }, all: 'Tutte',
    emptyTitle: 'Oggi non hai ancora scritto', emptyBody: 'Non serve molto. Una frase sulla tua giornata conta già.',
    prompts: ['Cosa mi ha spaventato oggi?', 'Cosa ho fatto nonostante la paura?', 'Quale pensiero è tornato più spesso?', 'Cosa è andato meglio del previsto?', 'Cosa mi dà orgoglio oggi?', 'Cosa voglio provare domani?', 'Quale sensazione del corpo ho notato oggi, e cosa ne ho fatto?', 'Quale piccolo passo ho fatto oggi?', 'Cosa direi a chi ha la mia stessa paura?', 'Cosa mi ha aiutato a calmarmi oggi?'],
  },
  nl: {
    question: 'Vraag', promptOfDay: 'Vraag van de dag', otherQ: 'Andere vraag', freeWrite: 'Vrij schrijven', usePrompt: 'Een vraag gebruiken', freePh: 'Schrijf op jouw manier…',
    moodQ: 'Hoe gaat het vandaag?', moods: ['Heel slecht', 'Slecht', 'Gaat wel', 'Goed', 'Heel goed'], moodLabel: 'Stemming', moodTrend: 'Stemming de afgelopen 14 dagen',
    tagsQ: 'Labels (optioneel)', tagsLabel: 'Labels', tags: { win: 'Overwinning', trigger: 'Trigger', exposure: 'Blootstelling', symptoms: 'Symptomen', hard: 'Zware dag' }, all: 'Alle',
    emptyTitle: 'Je hebt vandaag nog niets geschreven', emptyBody: 'Het hoeft niet veel te zijn. Eén zin over je dag telt al.',
    prompts: ['Wat maakte me vandaag bang?', 'Wat deed ik ondanks de angst?', 'Welke gedachte kwam het vaakst terug?', 'Wat ging beter dan verwacht?', 'Waar ben ik vandaag trots op?', 'Wat wil ik morgen proberen?', 'Welk lichamelijk gevoel merkte ik vandaag op, en wat deed ik ermee?', 'Welke kleine stap zette ik vandaag?', 'Wat zou ik zeggen tegen iemand met dezelfde angst?', 'Wat hielp me vandaag om rustiger te worden?'],
  },
  pl: {
    question: 'Pytanie', promptOfDay: 'Pytanie dnia', otherQ: 'Inne pytanie', freeWrite: 'Pisz swobodnie', usePrompt: 'Użyj pytania', freePh: 'Pisz po swojemu…',
    moodQ: 'Jak się dziś czujesz?', moods: ['Bardzo źle', 'Źle', 'Tak sobie', 'Dobrze', 'Bardzo dobrze'], moodLabel: 'Nastrój', moodTrend: 'Nastrój z ostatnich 14 dni',
    tagsQ: 'Etykiety (opcjonalnie)', tagsLabel: 'Etykiety', tags: { win: 'Sukces', trigger: 'Wyzwalacz', exposure: 'Ekspozycja', symptoms: 'Objawy', hard: 'Trudny dzień' }, all: 'Wszystkie',
    emptyTitle: 'Dziś jeszcze bez wpisu', emptyBody: 'Nie musi być długo. Jedno zdanie o dniu już się liczy.',
    prompts: ['Co mnie dziś przestraszyło?', 'Co udało się zrobić mimo strachu?', 'Jaka myśl pojawiała się najczęściej?', 'Co poszło lepiej od oczekiwań?', 'Co dziś daje mi powód do dumy?', 'Czego chcę spróbować jutro?', 'Jakie odczucie w ciele dziś się pojawiło i co pomogło?', 'Jaki mały krok udało się dziś zrobić?', 'Co powiem komuś z tym samym lękiem?', 'Co dziś pomogło się uspokoić?'],
  },
  ru: {
    question: 'Вопрос', promptOfDay: 'Вопрос дня', otherQ: 'Другой вопрос', freeWrite: 'Писать свободно', usePrompt: 'Взять вопрос', freePh: 'Пиши по-своему…',
    moodQ: 'Как ты сегодня?', moods: ['Очень плохо', 'Плохо', 'Так себе', 'Хорошо', 'Очень хорошо'], moodLabel: 'Настроение', moodTrend: 'Настроение за 14 дней',
    tagsQ: 'Метки (необязательно)', tagsLabel: 'Метки', tags: { win: 'Победа', trigger: 'Триггер', exposure: 'Экспозиция', symptoms: 'Симптомы', hard: 'Тяжёлый день' }, all: 'Все',
    emptyTitle: 'Сегодня пока без записей', emptyBody: 'Не нужно много. Одна фраза о дне — уже хорошо.',
    prompts: ['Что меня сегодня напугало?', 'Что удалось сделать вопреки страху?', 'Какая мысль приходила чаще всего?', 'Что прошло лучше, чем ожидалось?', 'Чем я сегодня горжусь?', 'Что хочу попробовать завтра?', 'Какое ощущение в теле появилось сегодня и что помогло?', 'Какой маленький шаг удалось сделать сегодня?', 'Что можно сказать человеку с таким же страхом?', 'Что сегодня помогло успокоиться?'],
  },
};

export function journalText(lang: Lang): T {
  return TXT[lang] ?? TXT.en;
}
export const JOURNAL_LANGS = Object.keys(TXT) as Lang[];

// Índice da pergunta do dia (muda à meia-noite; igual durante o dia todo).
export function promptIndexFor(d: Date, count: number): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const day = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return ((day % count) + count) % count;
}
