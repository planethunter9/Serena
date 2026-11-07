// Sincronização dos dados do utilizador com a cloud (tabela "profiles").
// Guardamos tudo num único campo JSON (data), com a hora da última alteração de
// cada tipo de dado em "_meta". É "offline-first": a app usa sempre os dados
// locais; ao entrar, junta-os com a cloud (fica o mais recente de cada um) e,
// a cada alteração, envia uma cópia passados uns segundos.

import { exportUserData, mergeUserData } from '../storage/storage';
import { supabase } from './supabase';

// Junta os dados da cloud com os do telemóvel (ao iniciar sessão / abrir a app).
// Se o telemóvel tiver alterações mais recentes, envia-as de volta.
export async function pullProfile(userId: string) {
  try {
    const { data, error } = await supabase.from('profiles').select('data').eq('id', userId).maybeSingle();
    if (error) return;
    const localNewer = data?.data ? await mergeUserData(data.data as Record<string, string>) : true;
    if (localNewer) await pushProfile(userId);
  } catch {
    // sem rede? não faz mal, usa os dados locais
  }
}

// Envia os dados locais para a cloud (em segundo plano / ao sair).
export async function pushProfile(userId: string) {
  try {
    const data = await exportUserData();
    await supabase.from('profiles').upsert({ id: userId, data, updated_at: new Date().toISOString() });
  } catch {
    // sem rede? tenta na próxima
  }
}

// Envio com atraso: várias alterações seguidas resultam num só envio.
let timer: ReturnType<typeof setTimeout> | null = null;
export function schedulePush(userId: string, delayMs = 3000) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    pushProfile(userId);
  }, delayMs);
}
