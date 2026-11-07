// Linhas de apoio por país. O país é detetado pela região do telemóvel
// (ex.: "pt-BR" → Brasil); se não houver, pela língua da app; se o país não
// estiver na lista, mostra-se o número de emergência genérico + findahelpline.com.
//
// ⚠️ Números de crise: VERIFICAR periodicamente (mudam). Última revisão: nov. 2026.
// Fontes: sites oficiais de cada linha / findahelpline.com.

import type { Lang } from '../i18n/i18n';

export type LText = { pt: string; en: string } & Partial<Record<Lang, string>>;
export type CrisisLine = { name: string; number: string; dial: string; desc: LText };
export type Country = { code: string; flag: string; name: string; emergency: string; lines: CrisisLine[] };

const EMERGENCY_DESC: LText = {
  pt: 'Emergência (24h). Para perigo imediato.',
  en: 'Emergency (24h). For immediate danger.',
  es: 'Emergencias (24 h). Para peligro inmediato.',
  fr: 'Urgences (24h/24). En cas de danger immédiat.',
  de: 'Notruf (24 h). Bei unmittelbarer Gefahr.',
  it: 'Emergenza (24h). In caso di pericolo immediato.',
  nl: 'Noodnummer (24/7). Bij direct gevaar.',
  pl: 'Numer alarmowy (24h). W bezpośrednim zagrożeniu.',
  ru: 'Экстренная служба (24/7). При непосредственной опасности.',
};

function emergency(number: string): CrisisLine {
  return { name: number, number, dial: number, desc: EMERGENCY_DESC };
}

export const COUNTRIES: Country[] = [
  {
    code: 'PT', flag: '🇵🇹', name: 'Portugal', emergency: '112',
    lines: [
      emergency('112'),
      { name: '1411 — Linha de Prevenção do Suicídio e Apoio Psicológico', number: '1411', dial: '1411', desc: { pt: 'Apoio psicológico e prevenção do suicídio, 24h/dia (SNS 24).', en: 'Psychological support and suicide prevention, 24h a day (SNS 24).' } },
      { name: 'SNS 24', number: '808 24 24 24', dial: '808242424', desc: { pt: 'Aconselhamento de saúde e psicológico, 24h/dia.', en: 'Health and psychological counselling, 24h a day.' } },
      { name: 'SOS Voz Amiga', number: '213 544 545', dial: '213544545', desc: { pt: 'Apoio emocional por telefone (também 912 802 669 / 963 524 660).', en: 'Emotional support by phone (also 912 802 669 / 963 524 660).' } },
    ],
  },
  {
    code: 'BR', flag: '🇧🇷', name: 'Brasil', emergency: '192',
    lines: [
      { name: 'CVV — Centro de Valorização da Vida', number: '188', dial: '188', desc: { pt: 'Apoio emocional e prevenção do suicídio, 24h, gratuito.', en: 'Emotional support and suicide prevention, 24h, free.' } },
      { name: 'SAMU', number: '192', dial: '192', desc: { pt: 'Emergência médica (24h).', en: 'Medical emergency (24h).' } },
    ],
  },
  {
    code: 'ES', flag: '🇪🇸', name: 'España', emergency: '112',
    lines: [
      emergency('112'),
      { name: 'Línea 024', number: '024', dial: '024', desc: { pt: 'Atenção à conduta suicida, 24h, gratuita.', en: 'Suicide crisis line, 24h, free.', es: 'Atención a la conducta suicida, 24 h, gratuita y confidencial.' } },
      { name: 'Teléfono de la Esperanza', number: '717 003 717', dial: '717003717', desc: { pt: 'Apoio emocional por telefone, 24h.', en: 'Emotional support by phone, 24h.', es: 'Apoyo emocional por teléfono, 24 h.' } },
    ],
  },
  {
    code: 'FR', flag: '🇫🇷', name: 'France', emergency: '112',
    lines: [
      emergency('112'),
      { name: '3114', number: '3114', dial: '3114', desc: { pt: 'Número nacional de prevenção do suicídio, 24h, gratuito.', en: 'National suicide prevention line, 24/7, free.', fr: 'Numéro national de prévention du suicide, 24h/24, gratuit.' } },
      { name: 'SOS Amitié', number: '09 72 39 40 50', dial: '0972394050', desc: { pt: 'Escuta e apoio emocional, 24h.', en: 'Listening and emotional support, 24h.', fr: 'Écoute et soutien émotionnel, 24h/24.' } },
    ],
  },
  {
    code: 'DE', flag: '🇩🇪', name: 'Deutschland', emergency: '112',
    lines: [
      emergency('112'),
      { name: 'TelefonSeelsorge', number: '0800 111 0 111', dial: '08001110111', desc: { pt: 'Apoio emocional, 24h, gratuito (também 0800 111 0 222).', en: 'Emotional support, 24/7, free (also 0800 111 0 222).', de: 'Seelsorge und Krisenhilfe, 24 h, kostenlos (auch 0800 111 0 222).' } },
    ],
  },
  {
    code: 'AT', flag: '🇦🇹', name: 'Österreich', emergency: '112',
    lines: [
      emergency('112'),
      { name: 'Telefonseelsorge', number: '142', dial: '142', desc: { pt: 'Apoio emocional, 24h, gratuito.', en: 'Emotional support, 24/7, free.', de: 'Krisenhilfe, 24 h, kostenlos.' } },
    ],
  },
  {
    code: 'CH', flag: '🇨🇭', name: 'Schweiz / Suisse / Svizzera', emergency: '112',
    lines: [
      emergency('112'),
      { name: 'Die Dargebotene Hand / La Main Tendue', number: '143', dial: '143', desc: { pt: 'Apoio emocional, 24h.', en: 'Emotional support, 24/7.', de: 'Gesprächs- und Krisenhilfe, 24 h.', fr: 'Écoute et aide en situation de crise, 24h/24.', it: 'Ascolto e aiuto in situazioni di crisi, 24 ore su 24.' } },
    ],
  },
  {
    code: 'IT', flag: '🇮🇹', name: 'Italia', emergency: '112',
    lines: [
      emergency('112'),
      { name: 'Telefono Amico Italia', number: '02 2327 2327', dial: '0223272327', desc: { pt: 'Escuta e apoio emocional (todos os dias, das 9h à meia-noite).', en: 'Listening and emotional support (daily, 9am–midnight).', it: 'Ascolto e supporto emotivo (tutti i giorni, dalle 9 alle 24).' } },
    ],
  },
  {
    code: 'NL', flag: '🇳🇱', name: 'Nederland', emergency: '112',
    lines: [
      emergency('112'),
      { name: '113 Zelfmoordpreventie', number: '113', dial: '113', desc: { pt: 'Prevenção do suicídio, 24h (também 0800-0113, gratuito).', en: 'Suicide prevention, 24/7 (also 0800-0113, free).', nl: 'Zelfmoordpreventie, 24/7 (ook 0800-0113, gratis).' } },
    ],
  },
  {
    code: 'BE', flag: '🇧🇪', name: 'België / Belgique', emergency: '112',
    lines: [
      emergency('112'),
      { name: 'Zelfmoordlijn', number: '1813', dial: '1813', desc: { pt: 'Prevenção do suicídio (neerlandês), 24h.', en: 'Suicide prevention (Dutch), 24/7.', nl: 'Zelfmoordpreventie, 24/7.' } },
      { name: 'Centre de Prévention du Suicide', number: '0800 32 123', dial: '080032123', desc: { pt: 'Prevenção do suicídio (francês), 24h.', en: 'Suicide prevention (French), 24/7.', fr: 'Prévention du suicide, 24h/24.' } },
    ],
  },
  {
    code: 'PL', flag: '🇵🇱', name: 'Polska', emergency: '112',
    lines: [
      emergency('112'),
      { name: 'Telefon Zaufania dla Dorosłych', number: '116 123', dial: '116123', desc: { pt: 'Apoio emocional para adultos.', en: 'Emotional support for adults.', pl: 'Wsparcie emocjonalne dla dorosłych.' } },
      { name: 'Centrum Wsparcia', number: '800 70 2222', dial: '800702222', desc: { pt: 'Apoio em crise, 24h, gratuito.', en: 'Crisis support, 24/7, free.', pl: 'Wsparcie w kryzysie, całodobowo, bezpłatnie.' } },
    ],
  },
  {
    code: 'GB', flag: '🇬🇧', name: 'United Kingdom', emergency: '999',
    lines: [
      emergency('999'),
      { name: 'Samaritans', number: '116 123', dial: '116123', desc: { pt: 'Apoio emocional, 24h, gratuito.', en: 'Emotional support, 24/7, free.' } },
      { name: 'NHS 111', number: '111', dial: '111', desc: { pt: 'Ajuda médica e de saúde mental não urgente.', en: 'Non-emergency medical and mental health help.' } },
    ],
  },
  {
    code: 'IE', flag: '🇮🇪', name: 'Ireland', emergency: '112',
    lines: [
      emergency('112'),
      { name: 'Samaritans', number: '116 123', dial: '116123', desc: { pt: 'Apoio emocional, 24h, gratuito.', en: 'Emotional support, 24/7, free.' } },
      { name: 'Pieta', number: '1800 247 247', dial: '1800247247', desc: { pt: 'Prevenção do suicídio e autolesão, 24h.', en: 'Suicide and self-harm crisis support, 24/7.' } },
    ],
  },
  {
    code: 'US', flag: '🇺🇸', name: 'United States', emergency: '911',
    lines: [
      emergency('911'),
      { name: '988 Suicide & Crisis Lifeline', number: '988', dial: '988', desc: { pt: 'Apoio em crise, 24h (chamada ou SMS).', en: 'Crisis support, 24/7 (call or text).' } },
    ],
  },
  {
    code: 'CA', flag: '🇨🇦', name: 'Canada', emergency: '911',
    lines: [
      emergency('911'),
      { name: '9-8-8', number: '988', dial: '988', desc: { pt: 'Apoio em crise e prevenção do suicídio, 24h.', en: 'Suicide crisis helpline, 24/7.', fr: 'Ligne d\'aide en cas de crise suicidaire, 24h/24.' } },
    ],
  },
  {
    code: 'AU', flag: '🇦🇺', name: 'Australia', emergency: '000',
    lines: [
      emergency('000'),
      { name: 'Lifeline', number: '13 11 14', dial: '131114', desc: { pt: 'Apoio em crise, 24h.', en: 'Crisis support, 24/7.' } },
    ],
  },
];

// País por defeito para cada língua da app (quando a região do telemóvel não ajuda).
const LANG_COUNTRY: Partial<Record<Lang, string>> = {
  pt: 'PT', 'pt-BR': 'BR', es: 'ES', fr: 'FR', de: 'DE', it: 'IT', nl: 'NL', pl: 'PL',
};

// Região do telemóvel a partir do locale (ex.: "pt-BR" → "BR", "en_GB" → "GB").
export function regionFromLocale(locale: string | undefined | null): string | null {
  if (!locale) return null;
  const m = locale.match(/[-_]([A-Za-z]{2})(?:$|[-_@])/);
  return m ? m[1].toUpperCase() : null;
}

export function deviceRegion(): string | null {
  try {
    return regionFromLocale(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch {
    return null;
  }
}

// Escolhe o país: (1) escolhido pela pessoa; (2) região do telemóvel; (3) língua da app.
// Devolve null se nenhum estiver na lista (→ mostra-se só o genérico).
export function resolveCountry(opts: { saved?: string | null; region?: string | null; lang: Lang }): Country | null {
  const find = (c?: string | null) => (c ? COUNTRIES.find((x) => x.code === c) ?? null : null);
  if (opts.saved) return find(opts.saved);
  if (opts.region) return find(opts.region);
  return find(LANG_COUNTRY[opts.lang]);
}
