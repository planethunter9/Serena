// Ícones alternativos da app (feature paga). A troca de ícone no ecrã inicial usa
// expo-dynamic-app-icon, que só funciona num build NATIVO (iOS/Android via EAS),
// nunca no Expo Go. Onde o módulo nativo não existe, a escolha é guardada à mesma
// mas o ícone só muda no próximo build nativo.
//
// 'default' = ícone atual da app (sempre grátis). As variantes da lótus ficam
// atrás do pack de personalização (unlocked, igual às cores do anel).
// Os ids têm de bater certo com as chaves do plugin em app.json.

import AsyncStorage from '@react-native-async-storage/async-storage';

export type IconLabel = { pt: string; en: string; es?: string; fr?: string; de?: string; it?: string; 'pt-BR'?: string; nl?: string; pl?: string; ru?: string };
export type AppIconDef = { id: string; label: IconLabel; preview: any; free?: boolean };

export const APP_ICONS: AppIconDef[] = [
  { id: 'default', free: true, preview: require('../assets/images/icon.png'),
    label: { pt: 'Predefinido', en: 'Default', es: 'Predeterminado', fr: 'Par défaut', de: 'Standard', it: 'Predefinito', 'pt-BR': 'Padrão', nl: 'Standaard', pl: 'Domyślny', ru: 'По умолчанию' } },
  { id: 'rose', preview: require('../assets/images/lotus-rose.png'),
    label: { pt: 'Rosa', en: 'Rose', es: 'Rosa', fr: 'Rose', de: 'Rosé', it: 'Rosa', 'pt-BR': 'Rosa', nl: 'Roze', pl: 'Różowy', ru: 'Розовый' } },
  { id: 'blue', preview: require('../assets/images/lotus-blue.png'),
    label: { pt: 'Azul', en: 'Blue', es: 'Azul', fr: 'Bleu', de: 'Blau', it: 'Blu', 'pt-BR': 'Azul', nl: 'Blauw', pl: 'Niebieski', ru: 'Синий' } },
  { id: 'green', preview: require('../assets/images/lotus-green.png'),
    label: { pt: 'Verde', en: 'Green', es: 'Verde', fr: 'Vert', de: 'Grün', it: 'Verde', 'pt-BR': 'Verde', nl: 'Groen', pl: 'Zielony', ru: 'Зелёный' } },
  { id: 'violet', preview: require('../assets/images/lotus-violet.png'),
    label: { pt: 'Lilás', en: 'Violet', es: 'Lila', fr: 'Violet', de: 'Violett', it: 'Viola', 'pt-BR': 'Lilás', nl: 'Paars', pl: 'Fioletowy', ru: 'Фиолетовый' } },
  { id: 'amber', preview: require('../assets/images/lotus-amber.png'),
    label: { pt: 'Âmbar', en: 'Amber', es: 'Ámbar', fr: 'Ambre', de: 'Bernstein', it: 'Ambra', 'pt-BR': 'Âmbar', nl: 'Amber', pl: 'Bursztyn', ru: 'Янтарный' } },
  { id: 'noir', preview: require('../assets/images/lotus-noir.png'),
    label: { pt: 'Preto', en: 'Black', es: 'Negro', fr: 'Noir', de: 'Schwarz', it: 'Nero', 'pt-BR': 'Preto', nl: 'Zwart', pl: 'Czarny', ru: 'Чёрный' } },
];

const KEY = 'app:appIcon';

// Lê o ícone escolhido (id). Default se não houver nada guardado.
export async function loadAppIcon(): Promise<string> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v && APP_ICONS.some((i) => i.id === v) ? v : 'default';
  } catch {
    return 'default';
  }
}

// Aplica o ícone: troca nativa (se disponível) + guarda a escolha.
// Devolve { ok } — ok=false quando o módulo nativo não está disponível (ex.: Expo Go).
export async function applyAppIcon(id: string): Promise<{ ok: boolean }> {
  let ok = false;
  try {
    // require dinâmico para não rebentar onde o módulo nativo não existe.
    const mod = require('expo-dynamic-app-icon');
    const setFn: ((name: string | null) => void) | undefined = mod.setAppIcon ?? mod.default?.setAppIcon;
    if (typeof setFn === 'function') {
      setFn(id === 'default' ? null : id);
      ok = true;
    }
  } catch {
    ok = false;
  }
  try { await AsyncStorage.setItem(KEY, id); } catch {}
  return { ok };
}
