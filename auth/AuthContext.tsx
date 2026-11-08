// Autenticação com Supabase (contas reais na cloud) + sincronização dos dados.

import type { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';
import { getSyncStatus, pullProfile, pushProfile, resetSync, retrySyncNow, schedulePush } from '../lib/sync';
import { setOnLocalChange, setStorageUser, wipeLocalUserData } from '../storage/storage';

// Permite que a janela do browser de OAuth se feche e devolva o controlo à app.
WebBrowser.maybeCompleteAuthSession();

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
  deleteAccount: () => Promise<void>;
  resetPassword: (email: string) => Promise<Result>;
  confirmReset: (email: string, token: string, newPassword: string) => Promise<Result>;
  socialSignIn: (provider: 'google' | 'apple') => Promise<Result>;
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
  // Durante a reposição de password não queremos entrar na app (a sessão é
  // temporária, só para trocar a password); este sinal suprime essa entrada.
  const suppressSession = useRef(false);

  // Aplica uma sessão: define o utilizador, prepara o armazenamento e puxa a cloud.
  async function applySession(session: Session | null) {
    if (session?.user && !suppressSession.current) {
      const u: User = {
        id: session.user.id,
        email: session.user.email ?? '',
        name: (session.user.user_metadata?.name as string) ?? '',
      };
      setStorageUser(u.id);
      // Só sincroniza quando o utilizador muda (login / arranque), não em cada
      // refresh do token. A sincronização junta local + cloud (fica o mais
      // recente de cada dado), por isso já não repõe coisas eliminadas.
      if (userRef.current?.id !== u.id) {
        setOnLocalChange(null);   // não enviar enquanto se junta
        await pullProfile(u.id);  // junta com a cloud antes de mostrar a app
      }
      // Cada alteração local envia uma cópia para a cloud (com atraso).
      setOnLocalChange(() => schedulePush(u.id));
      userRef.current = u;
      setUser(u);
    } else if (!session) {
      setOnLocalChange(null);
      resetSync();
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
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
        // Ao voltar à app, se a última sincronização falhou, tenta de novo já.
        if (userRef.current && getSyncStatus() === 'offline') retrySyncNow();
      }
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

  // Envia o email de recuperação (com um código de 6 dígitos, se o template do
  // Supabase incluir {{ .Token }}). Tudo é resolvido dentro da app — sem site.
  async function resetPassword(email: string): Promise<Result> {
    const mail = email.trim().toLowerCase();
    if (!mail) return { ok: false, error: 'empty' };
    const { error } = await supabase.auth.resetPasswordForEmail(mail);
    if (error) return mapError(error.message);
    return { ok: true };
  }

  // Confirma o código do email e define a nova palavra-passe. NÃO entra na app:
  // termina a sessão temporária para o utilizador iniciar sessão com a nova password.
  async function confirmReset(email: string, token: string, newPassword: string): Promise<Result> {
    const mail = email.trim().toLowerCase();
    if (!mail || !token.trim() || !newPassword) return { ok: false, error: 'empty' };
    suppressSession.current = true; // impede a entrada automática enquanto repomos
    try {
      const { error: vErr } = await supabase.auth.verifyOtp({ email: mail, token: token.trim(), type: 'recovery' });
      if (vErr) { suppressSession.current = false; return mapError(vErr.message); }
      const { error: uErr } = await supabase.auth.updateUser({ password: newPassword });
      if (uErr) { suppressSession.current = false; return mapError(uErr.message); }
      await supabase.auth.signOut(); // volta ao ecrã inicial para iniciar sessão
      return { ok: true };
    } finally {
      suppressSession.current = false;
    }
  }

  // Entrar com Google ou Apple (OAuth no browser). Abre a página do provider e,
  // ao voltar, troca o código/token por uma sessão.
  async function socialSignIn(provider: 'google' | 'apple'): Promise<Result> {
    try {
      const redirectTo = Linking.createURL('auth-callback');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data?.url) return mapError(error?.message ?? 'oauth');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success' || !result.url) return { ok: false };

      const url = result.url;
      // Fluxo PKCE: ?code=...
      const code = Linking.parse(url).queryParams?.code as string | undefined;
      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exErr) return mapError(exErr.message);
        return { ok: true };
      }
      // Fluxo implícito: #access_token=...&refresh_token=...
      const hash = url.includes('#') ? url.split('#')[1] : '';
      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        const { error: sErr } = await supabase.auth.setSession({ access_token, refresh_token });
        if (sErr) return mapError(sErr.message);
        return { ok: true };
      }
      return { ok: false };
    } catch (e: any) {
      return mapError(e?.message ?? 'oauth');
    }
  }

  // Elimina a conta: apaga os dados na cloud + a conta de auth (via função no
  // Supabase, porque o cliente não tem privilégios de admin) e limpa o local.
  async function deleteAccount() {
    const { error } = await supabase.rpc('delete_user');
    if (error) throw error;
    await wipeLocalUserData();      // limpa o local enquanto o prefixo ainda é o do utilizador
    await supabase.auth.signOut();  // onAuthStateChange trata de limpar a sessão
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, deleteAccount, resetPassword, confirmReset, socialSignIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth tem de ser usado dentro de <AuthProvider>');
  return ctx;
}