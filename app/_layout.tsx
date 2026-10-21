// Raiz da app: providers + carregamento das fontes do pack de personalização.
// A fonte escolhida é aplicada globalmente a todo o <Text>/<TextInput> e, ao
// mudar, o Stack é remontado (key) para que o novo tipo de letra apareça já.

import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Fontes (20 mais comuns). Instalar os pacotes — ver nota no fim do ficheiro.
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import { OpenSans_400Regular } from '@expo-google-fonts/open-sans';
import { Lato_400Regular } from '@expo-google-fonts/lato';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { Poppins_400Regular } from '@expo-google-fonts/poppins';
import { Raleway_400Regular } from '@expo-google-fonts/raleway';
import { Nunito_400Regular } from '@expo-google-fonts/nunito';
import { Inter_400Regular } from '@expo-google-fonts/inter';
import { WorkSans_400Regular } from '@expo-google-fonts/work-sans';
import { Merriweather_400Regular } from '@expo-google-fonts/merriweather';
import { PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display';
import { Oswald_400Regular } from '@expo-google-fonts/oswald';
import { SourceSans3_400Regular } from '@expo-google-fonts/source-sans-3';
import { PTSans_400Regular } from '@expo-google-fonts/pt-sans';
import { Rubik_400Regular } from '@expo-google-fonts/rubik';
import { Quicksand_400Regular } from '@expo-google-fonts/quicksand';
import { Mulish_400Regular } from '@expo-google-fonts/mulish';
import { Karla_400Regular } from '@expo-google-fonts/karla';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans';
import { Lora_400Regular } from '@expo-google-fonts/lora';

import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import { LanguageProvider, useLang } from '../i18n/i18n';
import { AuthProvider } from '../auth/AuthContext';
import { DataProvider } from '../store/DataContext';
import { syncAffirmationReminder } from '../notifications/affirmation';

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

// Fonte global: intercetamos o render de <Text>/<TextInput> para juntar a
// fontFamily a QUALQUER style (o defaultProps não chega, porque os componentes
// já passam o seu próprio style). A fonte vem de uma variável mutável e, ao
// mudar, remontamos a árvore para re-renderizar com a nova fonte.
let currentFontFamily: string | undefined;
let fontPatched = false;

// Junta a fontFamily ao style quando o elemento é um Text/TextInput.
function injectFont(type: any, props: any) {
  if ((type === Text || type === TextInput) && currentFontFamily && props) {
    return { ...props, style: [{ fontFamily: currentFontFamily }, props.style] };
  }
  return props;
}

function patchFontOnce() {
  if (fontPatched) return;
  fontPatched = true;

  // 1) Transform automático de JSX (o que o Expo/Metro usa por defeito).
  const patchRuntime = (mod: any, fns: string[]) => {
    try {
      fns.forEach((fn) => {
        if (mod && typeof mod[fn] === 'function') {
          const orig = mod[fn];
          mod[fn] = function (type: any, props: any, ...rest: any[]) {
            return orig(type, injectFont(type, props), ...rest);
          };
        }
      });
    } catch {}
  };
  // @ts-ignore - require existe no runtime do Metro
  try { patchRuntime(require('react/jsx-runtime'), ['jsx', 'jsxs']); } catch {}
  // @ts-ignore
  try { patchRuntime(require('react/jsx-dev-runtime'), ['jsxDEV']); } catch {}

  // 2) React.createElement (transform clássico / chamadas diretas).
  try {
    const orig = (React as any).createElement;
    (React as any).createElement = function (type: any, props: any, ...children: any[]) {
      return orig.apply(React, [type, injectFont(type, props), ...children]);
    };
  } catch {}

  // 3) Fallback: render do forwardRef.
  const patchRender = (Comp: any) => {
    try {
      if (Comp && typeof Comp.render === 'function') {
        const orig = Comp.render;
        Comp.render = function (props: any, ref: any) {
          const el = orig.call(this, props, ref);
          if (el && React.isValidElement(el) && currentFontFamily) {
            return React.cloneElement(el as any, { style: [{ fontFamily: currentFontFamily }, (el as any).props.style] });
          }
          return el;
        };
      }
    } catch {}
  };
  patchRender(Text);
  patchRender(TextInput);
}

// Aplica a fonte escolhida a toda a app e remonta a navegação ao mudar.
function ThemedApp() {
  const { fontFamily } = useTheme();
  const { lang } = useLang();
  const [remountKey, setRemountKey] = useState(0);

  useEffect(() => {
    patchFontOnce();
    currentFontFamily = fontFamily;       // undefined = fonte do sistema
    setRemountKey((k) => k + 1);          // remonta a árvore com a nova fonte
  }, [fontFamily]);

  // Re-agenda a afirmação do dia no arranque (para a frase ir variando).
  useEffect(() => {
    syncAffirmationReminder(lang).catch(() => {});
  }, [lang]);

  return (
    <>
      <ThemedStatusBar />
      <Stack key={remountKey} screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  // Carrega as fontes. Não bloqueamos o arranque — aparecem assim que prontas.
  useFonts({
    Roboto_400Regular, OpenSans_400Regular, Lato_400Regular, Montserrat_400Regular,
    Poppins_400Regular, Raleway_400Regular, Nunito_400Regular, Inter_400Regular,
    WorkSans_400Regular, Merriweather_400Regular, PlayfairDisplay_400Regular,
    Oswald_400Regular, SourceSans3_400Regular, PTSans_400Regular, Rubik_400Regular,
    Quicksand_400Regular, Mulish_400Regular, Karla_400Regular, DMSans_400Regular,
    Lora_400Regular,
  });

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <DataProvider>
            <SafeAreaProvider>
              <ThemedApp />
            </SafeAreaProvider>
          </DataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

// Instalar as fontes uma vez (ver mensagem do assistente):
//   npx expo install @expo-google-fonts/roboto @expo-google-fonts/open-sans \
//     @expo-google-fonts/lato @expo-google-fonts/montserrat @expo-google-fonts/poppins \
//     @expo-google-fonts/raleway @expo-google-fonts/nunito @expo-google-fonts/inter \
//     @expo-google-fonts/work-sans @expo-google-fonts/merriweather \
//     @expo-google-fonts/playfair-display @expo-google-fonts/oswald \
//     @expo-google-fonts/source-sans-3 @expo-google-fonts/pt-sans @expo-google-fonts/rubik \
//     @expo-google-fonts/quicksand @expo-google-fonts/mulish @expo-google-fonts/karla \
//     @expo-google-fonts/dm-sans @expo-google-fonts/lora
