// Gera a página pública da Política de Privacidade (docs/privacy/index.html),
// a partir do MESMO texto que a app mostra (data/legal.ts), nas 10 línguas.
// As lojas (App Store / Google Play) pedem um link público para a política.
//
// Para regenerar depois de mudar data/legal.ts:  npm run privacy:site
// (há um teste que falha se a página estiver desatualizada).

import type { Lang } from '../i18n/i18n';
import { getPrivacyPolicy } from '../data/legal';

const LANG_NAMES: [Lang, string][] = [
  ['pt', 'Português (PT)'], ['pt-BR', 'Português (BR)'], ['en', 'English'], ['es', 'Español'],
  ['fr', 'Français'], ['de', 'Deutsch'], ['it', 'Italiano'], ['nl', 'Nederlands'], ['pl', 'Polski'], ['ru', 'Русский'],
];

const TITLE: Record<Lang, string> = {
  pt: 'Política de Privacidade', 'pt-BR': 'Política de Privacidade', en: 'Privacy Policy', es: 'Política de privacidad',
  fr: 'Politique de confidentialité', de: 'Datenschutzerklärung', it: 'Informativa sulla privacy', nl: 'Privacybeleid',
  pl: 'Polityka prywatności', ru: 'Политика конфиденциальности',
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function body(text: string): string {
  const out: string[] = [];
  let list: string[] = [];
  const flush = () => { if (list.length) { out.push(`<ul>${list.join('')}</ul>`); list = []; } };
  for (const line of text.split('\n')) {
    if (line.startsWith('• ')) list.push(`<li>${esc(line.slice(2))}</li>`);
    else { flush(); if (line.trim()) out.push(`<p>${esc(line)}</p>`); }
  }
  flush();
  return out.join('\n');
}

function section(lang: Lang): string {
  const doc = getPrivacyPolicy(lang);
  const [summary, ...rest] = doc.sections;
  return [
    `<article lang="${lang}" data-lang="${lang}"${lang === 'pt' ? '' : ' hidden'}>`,
    `<h1>Serena — ${esc(TITLE[lang])}</h1>`,
    `<p class="muted">${esc(doc.updated)}</p>`,
    `<p>${esc(doc.intro)}</p>`,
    summary ? `<div class="summary"><h2>${esc(summary.title)}</h2>${body(summary.body)}</div>` : '',
    ...rest.map((s) => `<section><h2>${esc(s.title)}</h2>${body(s.body)}</section>`),
    `</article>`,
  ].join('\n');
}

export function buildPrivacyHtml(): string {
  const options = LANG_NAMES.map(([c, n]) => `<option value="${c}">${esc(n)}</option>`).join('');
  return `<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Serena — Privacy Policy</title>
<meta name="description" content="Serena — Política de Privacidade / Privacy Policy">
<style>
:root { --bg: #f7f9fb; --card: #ffffff; --text: #16212a; --muted: #5d6b78; --primary: #2f7d8c; --soft: #e3f1f3; --border: #dde5ea; }
@media (prefers-color-scheme: dark) { :root { --bg: #0f171d; --card: #16212a; --text: #e8eef2; --muted: #9aaab6; --primary: #6cc3d1; --soft: #1d3138; --border: #263642; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
main { max-width: 760px; margin: 0 auto; padding: 24px 16px 64px; }
header { display: flex; justify-content: flex-end; margin-bottom: 8px; }
select { font: inherit; padding: 6px 10px; border-radius: 10px; border: 1px solid var(--border); background: var(--card); color: var(--text); }
h1 { font-size: 1.6rem; line-height: 1.25; margin: 8px 0 4px; }
h2 { font-size: 1.1rem; margin: 28px 0 6px; }
p { margin: 6px 0; }
ul { margin: 6px 0; padding-left: 22px; }
.muted { color: var(--muted); font-size: .9rem; }
.summary { background: var(--soft); border-radius: 16px; padding: 4px 18px 12px; margin-top: 20px; }
.summary h2 { color: var(--primary); margin-top: 14px; }
</style>
</head>
<body>
<main>
<header><label><span hidden>Language</span><select id="lang" aria-label="Language">${options}</select></label></header>
${LANG_NAMES.map(([c]) => section(c)).join('\n')}
</main>
<script>
(function () {
  var codes = ${JSON.stringify(LANG_NAMES.map(([c]) => c))};
  function pickLang() {
    var q = (location.search.match(/[?&]lang=([^&]+)/) || [])[1];
    if (q && codes.indexOf(q) >= 0) return q;
    var nav = (navigator.languages || [navigator.language || 'pt']);
    for (var i = 0; i < nav.length; i++) {
      var l = String(nav[i]);
      if (/^pt-BR/i.test(l)) return 'pt-BR';
      var base = l.slice(0, 2).toLowerCase();
      if (codes.indexOf(base) >= 0) return base;
    }
    return 'en';
  }
  function show(lang) {
    var arts = document.querySelectorAll('article');
    for (var i = 0; i < arts.length; i++) arts[i].hidden = arts[i].getAttribute('data-lang') !== lang;
    document.documentElement.lang = lang;
    document.getElementById('lang').value = lang;
  }
  document.getElementById('lang').addEventListener('change', function (e) { show(e.target.value); });
  show(pickLang());
})();
</script>
</body>
</html>
`;
}
