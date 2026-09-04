// Autenticação com Supabase (contas reais na cloud) + sincronização dos dados.

import type { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../lib/supabase';
import { pullProfile, pushProfile } from '../lib/sync';
import { setStorageUser } from '../storage/storage';

export type User = { id: string; email: string; name: string };

type Result = {
  ok: boolean;
  error?: 'exists' | 'invalid' | 'empty' | 'shortPass';
  message?: string;
  needsConfirm?: boolean;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, name: string, password: string) => Promise<Result>;
  signIn: (email: string, password: string) => Promise<Result>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Traduz os erros do Supabase para os códigos que o ecrã já conhece.
function mapError(message: string): Result {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('already exists')) return { ok: false, error: 'exists' };
  if (m.includes('invalid login')) return { ok: false, error: 'invalid' };
  if (m.includes('password should be')) return { ok: false, error: 'shortPass' };
  if (m.includes('unable to validate email') || m.includes('invalid email')) return { ok: false, error: 'invalid' };
  return { ok: false, message };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<User | null>(null);

  // Aplica uma sessão: define o utilizador, prepara o armazenamento e puxa a cloud.
  async function applySession(session: Session | null) {
    if (session?.user) {
      const u: User = {
        id: session.user.id,
        email: session.user.email ?? '',
        name: (session.user.user_metadata?.name as string) ?? '',
      };
      setStorageUser(u.id);
      await pullProfile(u.id); // traz os dados da cloud antes de mostrar a app
      userRef.current = u;
      setUser(u);
    } else {
      setStorageUser(null);
      userRef.current = null;
      setUser(null);
    }
  }

  useEffect(() => {
    // Sessão inicial (retoma login anterior).
    supabase.auth.getSession().then(async ({ data }) => {
      await applySession(data.session);
      setLoading(false);
    });

    // Reage a login/logout.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    // Gere o refresh do token e faz backup ao ir para segundo plano.
    const appSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else {
        supabase.auth.stopAutoRefresh();
        if (userRef.current) pushProfile(userRef.current.id);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
      appSub.remove();
    };
  }, []);

  async function signUp(email: string, name: string, password: string): Promise<Result> {
    const mail = email.trim().toLowerCase();
    if (!mail || !name.trim() || !password) return { ok: false, error: 'empty' };
    const { data, error } = await supabase.auth.signUp({
      email: mail,
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) return mapError(error.message);
    // Se a confirmação de email estiver ligada, não há sessão até confirmar.
    if (!data.session) return { ok: false, needsConfirm: true };
    return { ok: true }; // onAuthStateChange trata do resto
  }

  async function signIn(email: string, password: string): Promise<Result> {
    const mail = email.trim().toLowerCase();
    if (!mail || !password) return { ok: false, error: 'empty' };
    const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
    if (error) return mapError(error.message);
    return { ok: true };
  }

  async function signOut() {
    if (userRef.current) await pushProfile(userRef.current.id); // backup antes de sair
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth tem de ser usado dentro de <AuthProvider>');
  return ctx;
}
