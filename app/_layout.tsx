// Camada raiz: providers (tema, idioma, auth, dados) + navegador Stack nativo.
// As rotas dentro de app/ empilham-se com a animação nativa do iOS.

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../auth/AuthContext';
import { DataProvider } from '../store/DataContext';
import { LanguageProvider } from '../i18n/i18n';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <DataProvider>
            <SafeAreaProvider>
              <ThemedStatusBar />
              <Stack screenOptions={{ headerShown: false }} />
            </SafeAreaProvider>
          </DataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
