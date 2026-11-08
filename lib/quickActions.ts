// Atalhos no ícone da app (pressão longa no ícone, iOS e Android):
// "Estou com um gatilho", "Respirar" e "Linhas de apoio".
//
// Usa expo-quick-actions. No Expo Go o módulo nativo não existe e tudo isto
// simplesmente não faz nada (não há erro); funciona na app compilada (EAS).
// Só é ligado no ecrã principal, ou seja, com sessão iniciada e consentimento dado.

import { useRouter } from 'expo-router';
import * as QuickActions from 'expo-quick-actions';
import { useEffect } from 'react';
import type { Lang } from '../i18n/i18n';

export type QuickId = 'trigger' | 'breathing' | 'crisis';

export const QUICK_ROUTES: Record<QuickId, string> = {
  trigger: '/triggerhelp',
  breathing: '/breathing',
  crisis: '/crisislines',
};

const ICONS: Record<QuickId, string> = {
  trigger: 'symbol:bolt.heart',
  breathing: 'symbol:wind',
  crisis: 'symbol:phone',
};

const TITLES: Record<Lang, Record<QuickId, string>> = {
  pt: { trigger: 'Estou com um gatilho', breathing: 'Respirar', crisis: 'Linhas de apoio' },
  'pt-BR': { trigger: 'Estou com um gatilho', breathing: 'Respirar', crisis: 'Linhas de apoio' },
  en: { trigger: "I'm being triggered", breathing: 'Breathe', crisis: 'Helplines' },
  es: { trigger: 'Tengo un detonante', breathing: 'Respirar', crisis: 'Líneas de ayuda' },
  fr: { trigger: "J'ai un déclencheur", breathing: 'Respirer', crisis: "Lignes d'écoute" },
  de: { trigger: 'Ich habe einen Auslöser', breathing: 'Atmen', crisis: 'Hilfetelefone' },
  it: { trigger: 'Ho un fattore scatenante', breathing: 'Respirare', crisis: 'Linee di ascolto' },
  nl: { trigger: 'Ik heb een trigger', breathing: 'Ademen', crisis: 'Hulplijnen' },
  pl: { trigger: 'Mam wyzwalacz', breathing: 'Oddychaj', crisis: 'Telefony zaufania' },
  ru: { trigger: 'У меня триггер', breathing: 'Дышать', crisis: 'Линии помощи' },
};

export function quickActionItems(lang: Lang): QuickActions.Action[] {
  const t = TITLES[lang] ?? TITLES.en;
  return (Object.keys(QUICK_ROUTES) as QuickId[]).map((id) => ({ id, title: t[id], icon: ICONS[id] }));
}

export function routeForQuickAction(action: { id?: string } | null | undefined): string | null {
  const id = action?.id as QuickId | undefined;
  return id && id in QUICK_ROUTES ? QUICK_ROUTES[id] : null;
}

// A ação que abriu a app (arranque a frio) só é tratada uma vez.
let initialHandled = false;

export function useQuickActions(lang: Lang) {
  const router = useRouter();

  // Títulos na língua da app.
  useEffect(() => {
    QuickActions.setItems(quickActionItems(lang)).catch(() => {});
  }, [lang]);

  useEffect(() => {
    if (!initialHandled) {
      initialHandled = true;
      const route = routeForQuickAction(QuickActions.initial);
      if (route) setTimeout(() => router.push(route as any), 300);
    }
    const sub = QuickActions.addListener((action) => {
      const route = routeForQuickAction(action);
      if (route) router.push(route as any);
    });
    return () => sub.remove();
  }, [router]);
}
