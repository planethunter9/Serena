// Definição das conquistas ("medalhas"). Cada uma sabe dizer se está
// desbloqueada com base nas estatísticas do utilizador.

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
};

export type Achievement = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: L;
  desc: L;
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
    title: { pt: 'Estudioso', en: 'Scholar' },
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
];
