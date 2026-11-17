// Definição das conquistas ("medalhas"). As automáticas desbloqueiam com as
// estatísticas; as manuais (manual: true) são marcadas pelo utilizador.

import { Ionicons } from '@expo/vector-icons';

type L = { pt: string; en: string };

export type AchStats = {
  streakDays: number;
  lessonsDone: number;
  lessonsTotal: number;
  journalDays: number;
  goalsCreated: number;
  goalsDone: number;
  fearDays: number;
  exposureDays: number;    // dias distintos de terapia exposta
  exposureStreak: number;  // dias seguidos de exposição
};

export type Achievement = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: L;
  desc: L;
  // Se true, é marcada à mão pelo utilizador (não depende das estatísticas).
  manual?: boolean;
  // Devolve se está desbloqueada e, opcionalmente, o progresso (têm/faltam).
  check: (s: AchStats) => { unlocked: boolean; have?: number; need?: number };
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'start',
    icon: 'sparkles',
    title: { pt: 'Primeiro passo', en: 'First step' },
    desc: { pt: 'Começaste o teu percurso.', en: 'You started your journey.' },
    check: () => ({ unlocked: true }),
  },
  {
    id: 'streak7',
    icon: 'flame',
    title: { pt: 'Uma semana forte', en: 'A strong week' },
    desc: { pt: '7 dias sem ataques nem comportamentos.', en: '7 days without attacks or behaviors.' },
    check: (s) => ({ unlocked: s.streakDays >= 7, have: s.streakDays, need: 7 }),
  },
  {
    id: 'streak30',
    icon: 'ribbon',
    title: { pt: 'Um mês inteiro', en: 'A whole month' },
    desc: { pt: '30 dias de progresso.', en: '30 days of progress.' },
    check: (s) => ({ unlocked: s.streakDays >= 30, have: s.streakDays, need: 30 }),
  },
  {
    id: 'streak100',
    icon: 'trophy',
    title: { pt: '100 dias', en: '100 days' },
    desc: { pt: 'Cem dias de progresso.', en: 'One hundred days of progress.' },
    check: (s) => ({ unlocked: s.streakDays >= 100, have: s.streakDays, need: 100 }),
  },
  {
    id: 'lesson1',
    icon: 'book',
    title: { pt: 'Primeira lição', en: 'First lesson' },
    desc: { pt: 'Leste a tua primeira lição.', en: 'You read your first lesson.' },
    check: (s) => ({ unlocked: s.lessonsDone >= 1, have: s.lessonsDone, need: 1 }),
  },
  {
    id: 'lessonsAll',
    icon: 'library',
    title: { pt: 'Mente estudiosa', en: 'Scholar' },
    desc: { pt: 'Leste todas as lições.', en: 'You read every lesson.' },
    check: (s) => ({ unlocked: s.lessonsTotal > 0 && s.lessonsDone >= s.lessonsTotal, have: s.lessonsDone, need: s.lessonsTotal }),
  },
  {
    id: 'journal1',
    icon: 'create',
    title: { pt: 'Caro diário', en: 'Dear diary' },
    desc: { pt: 'Escreveste a primeira entrada.', en: 'You wrote your first entry.' },
    check: (s) => ({ unlocked: s.journalDays >= 1, have: s.journalDays, need: 1 }),
  },
  {
    id: 'journal7',
    icon: 'journal',
    title: { pt: 'Hábito de escrever', en: 'Writing habit' },
    desc: { pt: 'Escreveste em 7 dias diferentes.', en: 'You wrote on 7 different days.' },
    check: (s) => ({ unlocked: s.journalDays >= 7, have: s.journalDays, need: 7 }),
  },
  {
    id: 'goal1',
    icon: 'flag',
    title: { pt: 'Com uma meta', en: 'With a goal' },
    desc: { pt: 'Definiste o teu primeiro objetivo.', en: 'You set your first goal.' },
    check: (s) => ({ unlocked: s.goalsCreated >= 1, have: s.goalsCreated, need: 1 }),
  },
  {
    id: 'goalDone',
    icon: 'checkmark-done',
    title: { pt: 'Missão cumprida', en: 'Mission accomplished' },
    desc: { pt: 'Cumpriste um objetivo.', en: 'You completed a goal.' },
    check: (s) => ({ unlocked: s.goalsDone >= 1, have: s.goalsDone, need: 1 }),
  },
  {
    id: 'fear7',
    icon: 'pulse',
    title: { pt: 'Autoconhecimento', en: 'Self-awareness' },
    desc: { pt: 'Registaste o medo em 7 dias.', en: 'You logged your fear on 7 days.' },
    check: (s) => ({ unlocked: s.fearDays >= 7, have: s.fearDays, need: 7 }),
  },

  {
    id: 'fear30',
    icon: 'analytics',
    title: { pt: 'Um mês a registar', en: 'A month of logging' },
    desc: { pt: 'Registaste o medo em 30 dias.', en: 'You logged your fear on 30 days.' },
    check: (s) => ({ unlocked: s.fearDays >= 30, have: s.fearDays, need: 30 }),
  },
  {
    id: 'journal30',
    icon: 'bookmarks',
    title: { pt: 'Diário de um mês', en: 'A month of journaling' },
    desc: { pt: 'Escreveste em 30 dias diferentes.', en: 'You wrote on 30 different days.' },
    check: (s) => ({ unlocked: s.journalDays >= 30, have: s.journalDays, need: 30 }),
  },
  {
    id: 'goalsDone3',
    icon: 'trophy-outline',
    title: { pt: 'Três vitórias', en: 'Three wins' },
    desc: { pt: 'Cumpriste três objetivos.', en: 'You completed three goals.' },
    check: (s) => ({ unlocked: s.goalsDone >= 3, have: s.goalsDone, need: 3 }),
  },

  // --- Terapia exposta ---
  {
    id: 'expoFirst',
    icon: 'walk',
    title: { pt: 'Primeira exposição', en: 'First exposure' },
    desc: { pt: 'Fizeste terapia exposta pela primeira vez.', en: 'You did exposure therapy for the first time.' },
    check: (s) => ({ unlocked: s.exposureDays >= 1, have: s.exposureDays, need: 1 }),
  },
  {
    id: 'expoStreak3',
    icon: 'flame',
    title: { pt: 'Exposição 3 dias seguidos', en: 'Exposure 3 days in a row' },
    desc: { pt: 'Praticaste exposição 3 dias seguidos.', en: 'You practised exposure 3 days in a row.' },
    check: (s) => ({ unlocked: s.exposureStreak >= 3, have: s.exposureStreak, need: 3 }),
  },
  {
    id: 'expoStreak7',
    icon: 'bonfire',
    title: { pt: 'Uma semana de exposição', en: 'A week of exposure' },
    desc: { pt: 'Praticaste exposição 7 dias seguidos.', en: 'You practised exposure 7 days in a row.' },
    check: (s) => ({ unlocked: s.exposureStreak >= 7, have: s.exposureStreak, need: 7 }),
  },
  {
    id: 'expoDays10',
    icon: 'medal',
    title: { pt: '10 dias de exposição', en: '10 days of exposure' },
    desc: { pt: 'Já fizeste exposição em 10 dias.', en: 'You have done exposure on 10 days.' },
    check: (s) => ({ unlocked: s.exposureDays >= 10, have: s.exposureDays, need: 10 }),
  },

  // --- Conquistas manuais (marcadas por ti) ---
  {
    id: 'drink',
    icon: 'water',
    manual: true,
    title: { pt: 'Um gole com confiança', en: 'A confident sip' },
    desc: { pt: 'Beber um pouco com segurança e conforto, sabendo que nada te vai acontecer.', en: 'Drinking a little safely and comfortably, knowing nothing will happen.' },
    check: () => ({ unlocked: false }),
  },
  {
    id: 'aloneAttack',
    icon: 'moon',
    manual: true,
    title: { pt: 'Firme na tempestade', en: 'Alone through the storm' },
    desc: { pt: 'Lidar com um ataque de ansiedade por conta própria, sem chamar ninguém.', en: 'Handling an anxiety attack on your own, without calling anyone.' },
    check: () => ({ unlocked: false }),
  },
];
