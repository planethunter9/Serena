// Camada raiz. Envolve tudo nos providers: tema, idioma, autenticação e área segura.

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../auth/AuthContext';
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
          <SafeAreaProvider>
            <ThemedStatusBar />
            <Stack screenOptions={{ headerShown: false }} />
          </SafeAreaProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
