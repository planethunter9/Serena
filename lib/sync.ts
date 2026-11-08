// Sincronização dos dados do utilizador com a cloud (tabela "profiles").
// Guardamos tudo num único campo JSON (data), com a hora da última alteração de
// cada tipo de dado em "_meta". É "offline-first": a app usa sempre os dados
// locais; ao entrar, junta-os com a cloud (fica o mais recente de cada um) e,
// a cada alteração, envia uma cópia passados uns segundos.
//
// Estado da sincronização (para o aviso "sem ligação"):
//   'ok'      — a cloud está em dia
//   'pending' — há alterações por enviar (envio agendado)
//   'offline' — o último envio/receção falhou; volta a tentar sozinho

import { exportUserData, mergeUserData } from '../storage/storage';
import { supabase } from './supabase';

export type SyncStatus = 'ok' | 'pending' | 'offline';

let status: SyncStatus = 'ok';
const listeners = new Set<(s: SyncStatus) => void>();
let lastUserId: string | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryDelay = 15000; // 15 s, a dobrar até 2 min

function setStatus(s: SyncStatus) {
  if (s === status) return;
  status = s;
  listeners.forEach((l) => l(s));
}

export function getSyncStatus(): SyncStatus {
  return status;
}

export function subscribeSyncStatus(cb: (s: SyncStatus) => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

function scheduleRetry() {
  if (retryTimer || !lastUserId) return;
  const uid = lastUserId;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    pushProfile(uid);
  }, retryDelay);
  retryDelay = Math.min(retryDelay * 2, 120000);
}

function markOk() {
  retryDelay = 15000;
  if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
  setStatus('ok');
}

function markOffline() {
  setStatus('offline');
  scheduleRetry();
}

// Junta os dados da cloud com os do telemóvel (ao iniciar sessão / abrir a app).
// Se o telemóvel tiver alterações mais recentes, envia-as de volta.
export async function pullProfile(userId: string) {
  lastUserId = userId;
  try {
    const { data, error } = await supabase.from('profiles').select('data').eq('id', userId).maybeSingle();
    if (error) { markOffline(); return; }
    const localNewer = data?.data ? await mergeUserData(data.data as Record<string, string>) : true;
    if (localNewer) await pushProfile(userId);
    else markOk();
  } catch {
    // sem rede: a app continua a funcionar com os dados locais
    markOffline();
  }
}

// Envia os dados locais para a cloud. Devolve true se correu bem.
export async function pushProfile(userId: string): Promise<boolean> {
  lastUserId = userId;
  try {
    const data = await exportUserData();
    const { error } = await supabase.from('profiles').upsert({ id: userId, data, updated_at: new Date().toISOString() });
    if (error) { markOffline(); return false; }
    markOk();
    return true;
  } catch {
    markOffline();
    return false;
  }
}

// "Tentar agora" (botão do aviso) e regresso da app ao primeiro plano.
export async function retrySyncNow(): Promise<boolean> {
  if (!lastUserId) return false;
  if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
  return pushProfile(lastUserId);
}

// Envio com atraso: várias alterações seguidas resultam num só envio.
let timer: ReturnType<typeof setTimeout> | null = null;
export function schedulePush(userId: string, delayMs = 3000) {
  lastUserId = userId;
  if (status !== 'offline') setStatus('pending');
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    pushProfile(userId);
  }, delayMs);
}

// Ao terminar sessão: esquece o utilizador e limpa tentativas pendentes.
export function resetSync() {
  lastUserId = null;
  if (timer) { clearTimeout(timer); timer = null; }
  if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
  retryDelay = 15000;
  setStatus('ok');
}
