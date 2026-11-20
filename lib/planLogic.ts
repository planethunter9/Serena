// Lógica do plano (to-do do dia): categoria e exercício de cada tarefa
// sugerida, tarefas que se marcam sozinhas quando o exercício é feito, e o
// estado de cada dia da semana.

export type PlanCat = 'exp' | 'cog' | 'acc' | 'beh' | 'care' | 'custom';
export type PlanRoute = { pathname: string; params?: Record<string, string> };

// Dados de hoje usados para marcar tarefas automaticamente.
export type AutoCtx = {
  exposure: boolean; words: boolean; myth: boolean; thought: boolean;
  experiment: boolean; approach: boolean; journal: boolean; focusFree: boolean;
};

export const TASK_META: Record<string, { cat: PlanCat; route?: PlanRoute; auto?: keyof AutoCtx }> = {
  exp_day: { cat: 'exp', route: { pathname: '/exercise', params: { type: 'exposure' } }, auto: 'exposure' },
  exp_video: { cat: 'exp', route: { pathname: '/exercise', params: { type: 'exposure' } } },
  exp_words: { cat: 'exp', route: { pathname: '/exercise', params: { type: 'words' } }, auto: 'words' },
  exp_senso: { cat: 'exp', route: { pathname: '/exercise', params: { type: 'exposure' } } },
  exp_food: { cat: 'exp', route: { pathname: '/exercise', params: { type: 'exposure' } } },
  exp_read: { cat: 'exp', route: { pathname: '/lessons' } },
  cog_thought: { cat: 'cog', route: { pathname: '/exercise', params: { type: 'thought' } }, auto: 'thought' },
  cog_review: { cat: 'cog', route: { pathname: '/exercise', params: { type: 'experiments' } }, auto: 'experiment' },
  cog_myth: { cat: 'cog', route: { pathname: '/exercise', params: { type: 'myth' } }, auto: 'myth' },
  acc_approach: { cat: 'acc', route: { pathname: '/exercise', params: { type: 'acceptance' } }, auto: 'approach' },
  acc_values: { cat: 'acc', route: { pathname: '/exercise', params: { type: 'acceptance' } } },
  acc_accept: { cat: 'acc', route: { pathname: '/urgesurf' } },
  acc_wave: { cat: 'acc', route: { pathname: '/urgesurf' } },
  beh_drop: { cat: 'beh', route: { pathname: '/safetyfeeding' } },
  beh_expiry: { cat: 'beh', route: { pathname: '/safetyfeeding' } },
  beh_reassure: { cat: 'beh', route: { pathname: '/safetyfeeding' } },
  beh_monitor: { cat: 'beh', route: { pathname: '/safetyfeeding' } },
  care_breath: { cat: 'care', route: { pathname: '/breathing' } },
  care_ground: { cat: 'care' },
  care_journal: { cat: 'care', route: { pathname: '/journal' }, auto: 'journal' },
  care_sounds: { cat: 'care', route: { pathname: '/sounds' } },
  care_affirm: { cat: 'care', route: { pathname: '/affirmation' } },
  care_move: { cat: 'care' },
  care_sleep: { cat: 'care' },
};

export const catOf = (id: string): PlanCat => TASK_META[id]?.cat ?? 'custom';

// A tarefa aplica-se neste dia da semana? (0 = segunda)
export const appliesOn = (days: number[] | undefined, dow: number) => !days || days.length === 0 || days.includes(dow);

export function isAutoDone(id: string, ctx: AutoCtx): boolean {
  if (id === 'focus') return ctx.focusFree;
  const a = TASK_META[id]?.auto;
  return a ? !!ctx[a] : false;
}

// Estado de um dia: 'full' (tudo feito), 'partial', 'none' (nada), 'rest' (sem tarefas), 'future'.
export type DayState = 'full' | 'partial' | 'none' | 'rest' | 'future';
export function dayState(applicable: number, done: number, isFuture: boolean): DayState {
  if (isFuture) return 'future';
  if (applicable === 0) return 'rest';
  if (done >= applicable) return 'full';
  return done > 0 ? 'partial' : 'none';
}
