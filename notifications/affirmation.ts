// Lembrete diário com a "afirmação do dia". Reutiliza o módulo de notificações.
// Como uma notificação diária repetida tem texto fixo, escolhemos uma afirmação
// aleatória sempre que é (re)agendada — e voltamos a agendar a cada arranque da
// app (ver app/_layout.tsx), para a frase ir variando.

import { AFFIRMATIONS } from '../data/content';
import { loadAffirmationReminder, saveAffirmationReminder } from '../storage/storage';
import { cancelReminder, ensureNotificationPermission, scheduleDailyReminder } from './notifications';

export async function syncAffirmationReminder(lang: 'pt' | 'en'): Promise<void> {
  const s = await loadAffirmationReminder();
  await cancelReminder(s.notificationId);

  if (!s.enabled) {
    await saveAffirmationReminder({ ...s, notificationId: null });
    return;
  }
  const ok = await ensureNotificationPermission();
  if (!ok) {
    await saveAffirmationReminder({ ...s, enabled: false, notificationId: null });
    return;
  }
  const phrase = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)][lang];
  const title = lang === 'pt' ? 'Afirmação do dia' : 'Affirmation of the day';
  const id = await scheduleDailyReminder(s.hour, s.minute, title, phrase);
  await saveAffirmationReminder({ ...s, notificationId: id });
}
