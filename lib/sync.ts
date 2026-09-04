// Sincronização dos dados do utilizador com a cloud (tabela "profiles").
// Guardamos tudo num único campo JSON (data) — simples e suficiente para já.
// É "offline-first": a app usa sempre os dados locais; isto só faz backup/restauro.

import { exportUserData, importUserData } from '../storage/storage';
import { supabase } from './supabase';

// Puxa os dados da cloud para o telemóvel (ao iniciar sessão).
export async function pullProfile(userId: string) {
  try {
    const { data, error } = await supabase.from('profiles').select('data').eq('id', userId).maybeSingle();
    if (error) return;
    if (data?.data) await importUserData(data.data as Record<string, string>);
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
