// O "próximo passo" deixou de ser um bloco do ecrã inicial e passou a ser um
// degrau marcado na Exposição. Quem tinha escrito um próximo passo não o perde:
// - se o texto coincide com um degrau, esse degrau fica marcado como próximo;
// - se não, passa a ser uma tarefa do plano.
// Corre uma vez (depois o texto antigo fica vazio).

import { Lang } from '../i18n/i18n';
import { loadNextStep, loadNextStepId, loadPlanTasks, saveNextStep, saveNextStepId, savePlanTasks } from '../storage/storage';
import { loadLadderSteps } from './ladder';

export async function migrateNextStep(lang: Lang): Promise<void> {
  const text = (await loadNextStep()).trim();
  if (!text) return;
  const norm = (s: string) => s.trim().toLowerCase();
  const [steps, pinned] = await Promise.all([loadLadderSteps(lang), loadNextStepId()]);
  const match = steps.find((st) => norm(st.label) === norm(text));
  if (match && !pinned) {
    await saveNextStepId(match.id);
  } else if (!match) {
    const tasks = await loadPlanTasks();
    if (!tasks.some((t) => t.label && norm(t.label) === norm(text))) {
      await savePlanTasks([...tasks, { id: 'c' + Date.now(), label: text }]);
    }
  }
  await saveNextStep('');
}
