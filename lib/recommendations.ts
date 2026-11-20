// "Recomendado para ti": recomendações por regras (sem IA). Recebe um resumo
// do que a pessoa indicou e do que tem feito, dá pontos a cada sugestão e
// devolve as 3 melhores — cada uma com o motivo, para ser transparente.
// Tudo é calculado no telemóvel; nada sai daqui.

export type RecRoute = { pathname: string; params?: Record<string, string> };
export type RecId =
  | 'breathe' | 'urge' | 'trigger' | 'exposure' | 'template' | 'lesson' | 'lessonFor' | 'kids'
  | 'experiment' | 'words' | 'result' | 'free' | 'pickDrop' | 'thought' | 'journal' | 'myth'
  | 'rainbow' | 'recite';
export type Rec = { id: RecId; score: number; icon: string; route: RecRoute; vars?: Record<string, string>; reasonKey?: string };

export type RecInput = {
  today: string;                       // AAAA-MM-DD
  severity: number | null;             // "Como está a fobia hoje?" (0–5)
  subtypes: string[];                  // ids do onboarding
  lastExposure: string | null;         // data da última sessão
  step: { id: string; label: string } | null; // próximo degrau (marcado ou sugerido)
  hasCustomSteps: boolean;
  templateSubtype: { id: string; label: string } | null; // subtipo com escada pronta
  nextLesson: { id: string; title: string } | null;
  lessonsDone: number;
  forLesson: { id: string; title: string } | null; // lição específica do subtipo, por ler
  pendingExperiment: string | null;
  doingCount: number;
  droppingCount: number;
  droppingNotFreeToday: { id: string; label: string } | null;
  lastThought: string | null;
  lastJournal: string | null;
  mythPlayed: boolean;
  wordsPlayed: boolean;
};

export function daysBetween(a: string, b: string): number {
  const ms = new Date(`${b}T12:00:00`).getTime() - new Date(`${a}T12:00:00`).getTime();
  return Math.round(ms / 86400000);
}

export function recommend(x: RecInput, max = 3): Rec[] {
  const out: Rec[] = [];
  const add = (r: Rec) => out.push(r);
  const sev = x.severity;
  const heavy = sev !== null && sev >= 4;
  const has = (id: string) => x.subtypes.includes(id);

  // Cada número da escala tem a sua sugestão principal (score 99+):
  // 0 subir um degrau · 1 testar uma previsão · 2 desconstruir um pensamento ·
  // 3 Arco-íris (atenção para fora) · 4 respiração · 5 "Estou com um gatilho".
  if (heavy) {
    if (sev === 5) add({ id: 'trigger', score: 100, icon: 'flash-outline', route: { pathname: '/triggerhelp' } });
    add({ id: 'breathe', score: sev === 4 ? 99 : 96, icon: 'pulse-outline', route: { pathname: '/breathing' } });
    add({ id: 'urge', score: 92, icon: 'water-outline', route: { pathname: '/urgesurf' } });
    add({ id: 'recite', score: 90, icon: 'musical-notes-outline', route: { pathname: '/recite' } });
  }
  if (sev === 3) add({ id: 'rainbow', score: 99, icon: 'color-palette-outline', route: { pathname: '/rainbow' } });
  if (sev === 2) add({ id: 'thought', score: 99, icon: 'bulb-outline', route: { pathname: '/exercise', params: { type: 'thought' } } });
  if (sev === 1) add({ id: 'experiment', score: 99, icon: 'flask-outline', route: { pathname: '/exercise', params: { type: 'experiments' } }, reasonKey: 'r_sev1' });

  // Exposição (a peça principal do tratamento).
  if (x.step) {
    const gap = x.lastExposure ? daysBetween(x.lastExposure, x.today) : null;
    const calm = sev === 0;
    if (calm || gap === null || gap >= 2) {
      add({
        id: 'exposure', score: calm ? 99 : heavy ? 40 : 85, icon: 'trending-up-outline',
        route: { pathname: '/exercise', params: { type: 'exposure', step: x.step.id, label: x.step.label } },
        vars: { step: x.step.label, n: String(gap ?? 0) }, reasonKey: calm ? 'r_sev0' : gap === null ? 'r_expNever' : 'r_expDays',
      });
    }
  }
  if (!x.hasCustomSteps && x.templateSubtype) {
    add({ id: 'template', score: sev === 0 && !x.step ? 99 : 70, icon: 'library-outline', route: { pathname: '/exercise', params: { type: 'exposure' } }, vars: { subtype: x.templateSubtype.label } });
  }

  // Coisas por acabar.
  if (x.pendingExperiment) add({ id: 'result', score: 78, icon: 'flask-outline', route: { pathname: '/exercise', params: { type: 'experiments' } }, vars: { x: x.pendingExperiment } });
  if (x.droppingNotFreeToday) add({ id: 'free', score: 62, icon: 'flag-outline', route: { pathname: '/safetyfeeding' }, vars: { b: x.droppingNotFreeToday.label } });
  if (x.doingCount > 0 && x.droppingCount === 0) add({ id: 'pickDrop', score: 58, icon: 'hand-left-outline', route: { pathname: '/safetyfeeding' } });

  // Conforme o tipo de medo.
  if (x.forLesson) add({ id: 'lessonFor', score: 66, icon: 'book-outline', route: { pathname: '/lesson', params: { id: x.forLesson.id } }, vars: { lesson: x.forLesson.title } });
  if (has('family') || has('parenting')) add({ id: 'kids', score: 55, icon: 'people-outline', route: { pathname: '/feedingdet', params: { id: 'kidlimits' } } });
  if (has('illness') || has('food')) add({ id: 'experiment', score: 50, icon: 'flask-outline', route: { pathname: '/exercise', params: { type: 'experiments' } } });
  if ((has('others') || has('animals')) && !x.wordsPlayed) add({ id: 'words', score: 54, icon: 'text-outline', route: { pathname: '/exercise', params: { type: 'words' } } });

  // Aprender.
  if (x.nextLesson) add({ id: 'lesson', score: x.lessonsDone < 5 ? 65 : 28, icon: 'book-outline', route: { pathname: '/lesson', params: { id: x.nextLesson.id } }, vars: { lesson: x.nextLesson.title } });

  // Hábitos de apoio.
  const midDay = sev !== null && sev >= 2 && sev <= 3;
  if (midDay && (!x.lastThought || daysBetween(x.lastThought, x.today) >= 7)) add({ id: 'thought', score: 45, icon: 'bulb-outline', route: { pathname: '/exercise', params: { type: 'thought' } } });
  if (!x.lastJournal || daysBetween(x.lastJournal, x.today) >= 3) add({ id: 'journal', score: 32, icon: 'book-outline', route: { pathname: '/journal' } });
  if (!x.mythPlayed) add({ id: 'myth', score: 30, icon: 'help-circle-outline', route: { pathname: '/exercise', params: { type: 'myth' } } });

  // Mais pontos primeiro; sem repetir o mesmo destino (ex.: duas lições).
  const seen = new Set<string>();
  return out
    .sort((a, b) => b.score - a.score)
    .filter((r) => {
      const key = r.route.pathname + JSON.stringify(r.route.params ?? {});
      const group = r.id === 'lesson' || r.id === 'lessonFor' ? 'lesson' : key;
      if (seen.has(group)) return false;
      seen.add(group);
      return true;
    })
    .slice(0, max);
}
