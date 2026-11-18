// Blocos da "Visão geral" (ecrã inicial). Nas Definições › Ecrã inicial cada
// pessoa escolhe quais quer ver; a ordem muda-se com "Reordenar" no início.

import type { Ionicons } from '@expo/vector-icons';
import type { Lang } from '../i18n/i18n';

export type HomeBlockId = 'affirmation' | 'hero' | 'plan' | 'severity';
type T = Record<Lang, string>;

export const HOME_BLOCKS: { id: HomeBlockId; icon: keyof typeof Ionicons.glyphMap; title: T; desc: T }[] = [
  {
    id: 'affirmation', icon: 'sunny-outline',
    title: { pt: 'Frase do dia', 'pt-BR': 'Frase do dia', en: 'Phrase of the day', es: 'Frase del día', fr: 'Phrase du jour', de: 'Satz des Tages', it: 'Frase del giorno', nl: 'Zin van de dag', pl: 'Zdanie dnia', ru: 'Фраза дня' },
    desc: { pt: 'Uma frase positiva que muda todos os dias.', 'pt-BR': 'Uma frase positiva que muda todo dia.', en: 'A positive phrase that changes every day.', es: 'Una frase positiva que cambia cada día.', fr: 'Une phrase positive qui change chaque jour.', de: 'Ein positiver Satz, der sich jeden Tag ändert.', it: 'Una frase positiva che cambia ogni giorno.', nl: 'Een positieve zin die elke dag verandert.', pl: 'Pozytywne zdanie, które zmienia się codziennie.', ru: 'Позитивная фраза, которая меняется каждый день.' },
  },
  {
    id: 'hero', icon: 'ellipse-outline',
    title: { pt: 'Os teus pilares', 'pt-BR': 'Seus pilares', en: 'Your pillars', es: 'Tus pilares', fr: 'Tes piliers', de: 'Deine Säulen', it: 'I tuoi pilastri', nl: 'Je pijlers', pl: 'Twoje filary', ru: 'Твои опоры' },
    desc: { pt: 'Prática, Repetição e Aproximação, e os dias seguidos.', 'pt-BR': 'Prática, Repetição e Aproximação, e os dias seguidos.', en: 'Practice, Repetition and Approach, plus your streak.', es: 'Práctica, Repetición y Acercamiento, y los días seguidos.', fr: "Pratique, Répétition et Approche, et les jours d'affilée.", de: 'Übung, Wiederholung und Annäherung sowie deine Serie.', it: 'Pratica, Ripetizione e Avvicinamento, e i giorni di fila.', nl: 'Oefenen, Herhalen en Benaderen, plus je reeks.', pl: 'Praktyka, Powtarzanie i Zbliżanie się oraz seria dni.', ru: 'Практика, Повторение и Приближение, а также серия дней.' },
  },
  {
    id: 'plan', icon: 'list-outline',
    title: { pt: 'O teu plano', 'pt-BR': 'Seu plano', en: 'Your plan', es: 'Tu plan', fr: 'Ton plan', de: 'Dein Plan', it: 'Il tuo piano', nl: 'Je plan', pl: 'Twój plan', ru: 'Твой план' },
    desc: { pt: 'As tarefas da semana.', 'pt-BR': 'As tarefas da semana.', en: 'Your tasks for the week.', es: 'Las tareas de la semana.', fr: 'Les tâches de la semaine.', de: 'Deine Aufgaben für die Woche.', it: 'Le attività della settimana.', nl: 'Je taken voor de week.', pl: 'Zadania na ten tydzień.', ru: 'Задачи на неделю.' },
  },
  {
    id: 'severity', icon: 'pulse-outline',
    title: { pt: 'Como está a fobia hoje?', 'pt-BR': 'Como está a fobia hoje?', en: 'How is the phobia today?', es: '¿Cómo está la fobia hoy?', fr: "Comment va la phobie aujourd'hui ?", de: 'Wie ist die Phobie heute?', it: 'Come va la fobia oggi?', nl: 'Hoe is de fobie vandaag?', pl: 'Jak dziś z fobią?', ru: 'Как фобия сегодня?' },
    desc: { pt: 'Um registo rápido de 0 a 5 (alimenta as Estatísticas).', 'pt-BR': 'Um registro rápido de 0 a 5 (alimenta as Estatísticas).', en: 'A quick 0–5 check-in (feeds your Statistics).', es: 'Un registro rápido de 0 a 5 (alimenta las Estadísticas).', fr: 'Un relevé rapide de 0 à 5 (alimente les Statistiques).', de: 'Ein kurzer Check-in von 0 bis 5 (für die Statistiken).', it: 'Un rapido check-in da 0 a 5 (alimenta le Statistiche).', nl: 'Een snelle check-in van 0 tot 5 (voor je statistieken).', pl: 'Szybka ocena od 0 do 5 (zasila Statystyki).', ru: 'Быстрая отметка от 0 до 5 (для статистики).' },
  },
];

export const HOME_BLOCK_IDS = HOME_BLOCKS.map((b) => b.id);

// Ordem guardada → ordem completa (ids desconhecidos saem, blocos novos vão para o fim).
export function normalizeHomeOrder(saved: string[]): HomeBlockId[] {
  const valid = saved.filter((k): k is HomeBlockId => (HOME_BLOCK_IDS as string[]).includes(k));
  const uniq = valid.filter((k, i) => valid.indexOf(k) === i);
  // Quem só tinha 'hero'/'plan' guardados: a frase do dia continua no topo, como antes.
  const missing = HOME_BLOCK_IDS.filter((k) => !uniq.includes(k));
  const front = missing.includes('affirmation') ? (['affirmation'] as HomeBlockId[]) : [];
  return [...front, ...uniq, ...missing.filter((k) => k !== 'affirmation')];
}

// Texto quando a pessoa escondeu todos os blocos.
const EMPTY: Record<Lang, string> = {
  pt: 'Escolhe em Definições › Ecrã inicial o que queres ver aqui.',
  'pt-BR': 'Escolha em Configurações › Tela inicial o que quer ver aqui.',
  en: 'Choose what you want to see here in Settings › Home screen.',
  es: 'Elige en Ajustes › Pantalla de inicio lo que quieres ver aquí.',
  fr: "Choisis dans Réglages › Écran d'accueil ce que tu veux voir ici.",
  de: 'Wähle unter Einstellungen › Startbildschirm, was du hier sehen möchtest.',
  it: 'Scegli in Impostazioni › Schermata iniziale cosa vuoi vedere qui.',
  nl: 'Kies in Instellingen › Startscherm wat je hier wilt zien.',
  pl: 'Wybierz w Ustawieniach › Ekran główny, co chcesz tu widzieć.',
  ru: 'Выбери в «Настройки › Главный экран», что показывать здесь.',
};
export function homeEmptyText(lang: Lang): string {
  return EMPTY[lang] ?? EMPTY.en;
}

// Textos do ecrã Definições › Ecrã inicial.
export const HOME_SETTINGS_TEXT: Record<Lang, { title: string; intro: string; reorderHint: string }> = {
  pt: { title: 'Ecrã inicial', intro: 'Escolhe o que aparece na Visão geral.', reorderHint: 'Para mudar a ordem, toca em "Reordenar" no ecrã inicial.' },
  'pt-BR': { title: 'Tela inicial', intro: 'Escolha o que aparece na Visão geral.', reorderHint: 'Para mudar a ordem, toque em "Reordenar" na tela inicial.' },
  en: { title: 'Home screen', intro: 'Choose what appears in the Overview.', reorderHint: 'To change the order, tap "Reorder" on the home screen.' },
  es: { title: 'Pantalla de inicio', intro: 'Elige lo que aparece en el Resumen.', reorderHint: 'Para cambiar el orden, toca "Reordenar" en la pantalla de inicio.' },
  fr: { title: "Écran d'accueil", intro: "Choisis ce qui s'affiche dans l'Aperçu.", reorderHint: "Pour changer l'ordre, touche « Réorganiser » sur l'écran d'accueil." },
  de: { title: 'Startbildschirm', intro: 'Wähle, was im Überblick erscheint.', reorderHint: 'Um die Reihenfolge zu ändern, tippe auf dem Startbildschirm auf „Neu ordnen“.' },
  it: { title: 'Schermata iniziale', intro: 'Scegli cosa compare nella Panoramica.', reorderHint: "Per cambiare l'ordine, tocca \"Riordina\" nella schermata iniziale." },
  nl: { title: 'Startscherm', intro: 'Kies wat er in het Overzicht verschijnt.', reorderHint: 'Tik op het startscherm op "Herschikken" om de volgorde te wijzigen.' },
  pl: { title: 'Ekran główny', intro: 'Wybierz, co ma się pojawiać w Przeglądzie.', reorderHint: 'Aby zmienić kolejność, dotknij „Zmień kolejność” na ekranie głównym.' },
  ru: { title: 'Главный экран', intro: 'Выбери, что показывать в обзоре.', reorderHint: 'Чтобы изменить порядок, нажми «Изменить порядок» на главном экране.' },
};
