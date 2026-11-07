// Recebe o redirect do OAuth (Google/Apple): serena://auth-callback
// Troca o código por sessão e volta ao início. Resolve o "Unmatched route".

import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';

export default function AuthCallback() {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    let done = false;

    async function handle(url: string | null) {
      if (done) return;
      done = true;
      try {
        if (url) {
          const parsed = Linking.parse(url);
          const code = parsed.queryParams?.code as string | undefined;
          if (code) {
            await supabase.auth.exchangeCodeForSession(code);
          } else {
            // Fluxo implícito: #access_token=...&refresh_token=...
            const hash = url.includes('#') ? url.split('#')[1] : '';
            const p = new URLSearchParams(hash);
            const access_token = p.get('access_token');
            const refresh_token = p.get('refresh_token');
            if (access_token && refresh_token) {
              await supabase.auth.setSession({ access_token, refresh_token });
            }
          }
        }
      } catch {
        // se falhar, o gate mostra o ecrã de login outra vez
      } finally {
        router.replace('/'); // onAuthStateChange já terá a sessão → mostra a app
      }
    }

    // link que abriu a app (arranque frio)
    Linking.getInitialURL().then(handle);
    // link recebido com a app já aberta
    const sub = Linking.addEventListener('url', ({ url }) => handle(url));
    return () => sub.remove();
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}