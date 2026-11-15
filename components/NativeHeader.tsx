// Botões no topo do ecrã, desenhados na barra de navegação NATIVA (só iOS).
//
// Porquê: no iPhone (iOS 26), a zona dos botões da direita da barra de
// navegação nativa apanha os toques mesmo com a barra escondida
// (headerShown: false). Um botão nosso desenhado por baixo dessa zona, no
// conteúdo do ecrã, não recebia o toque (era o caso da roda dentada das
// Definições). Pondo o botão DENTRO da barra nativa (transparente, sem título,
// sem a "bolha" de vidro do iOS 26), ele fica por cima de tudo e funciona.
//
// No Android isto não é preciso: o componente não faz nada e os botões
// continuam no conteúdo do ecrã, como sempre.
//
// Notas:
// - A barra nativa transparente apanha os toques em toda a sua área (44 pt),
//   por isso, quando a usamos, os botões que lá ficariam por baixo (ex.: o
//   "Voltar" do TopBackBar) também passam para a barra.
// - Os elementos da barra são desenhados fora da árvore do ecrã (os contextos
//   do ecrã, como o do tutorial, não chegam lá); por isso o conteúdo deixa um
//   espaço reservado no mesmo sítio (NATIVE_HEADER_SLOT) para alinhar e medir.

import { Stack } from 'expo-router';
import { ReactElement } from 'react';
import { Platform } from 'react-native';

export const USE_NATIVE_HEADER = Platform.OS === 'ios';

// Altura da barra de navegação nativa no iPhone (abaixo da barra de estado).
export const NATIVE_BAR_HEIGHT = 44;
// Tamanho de cada botão (área de toque recomendada pela Apple).
export const NATIVE_HEADER_SLOT = 44;

export function NativeHeaderButtons({ left, right }: { left?: ReactElement; right?: ReactElement }) {
  if (!USE_NATIVE_HEADER) return null;
  return (
    <Stack.Screen
      options={{
        headerShown: true,
        headerTransparent: true,
        headerShadowVisible: false,
        headerBackVisible: false,
        title: '',
        headerStyle: { backgroundColor: 'transparent' },
        headerLeft: left ? () => left : () => null,
        headerRight: right ? () => right : undefined,
        // iOS 26: sem a "bolha" de vidro partilhada à volta dos botões.
        unstable_headerLeftItems: left ? () => [{ type: 'custom', element: left, hidesSharedBackground: true }] : undefined,
        unstable_headerRightItems: right ? () => [{ type: 'custom', element: right, hidesSharedBackground: true }] : undefined,
      }}
    />
  );
}

// Para os ecrãs de entrada (login, consentimento, questionário) na mesma rota
// que a app principal: garante que a barra nativa não fica visível.
export function HideNativeHeader() {
  if (!USE_NATIVE_HEADER) return null;
  return <Stack.Screen options={{ headerShown: false }} />;
}
