// A página pública da política tem de coincidir com o texto da app.
import { expect, jest, test } from '@jest/globals';
import { buildPrivacyHtml } from '../lib/privacySite';

test('docs/privacy/index.html está atualizado (senão: npm run privacy:site)', () => {
  // O jest corre na raiz do projeto.
  const fs = jest.requireActual<{ readFileSync: (p: string, enc: 'utf8') => string }>('fs');
  const file = fs.readFileSync('docs/privacy/index.html', 'utf8');
  expect(file).toBe(buildPrivacyHtml());
});

test('a página não tem campos por preencher', () => {
  expect(buildPrivacyHtml()).not.toMatch(/\[(nome do responsável|email de contacto|região)/);
});
