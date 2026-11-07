// Linhas de apoio: deteção do país e integridade dos dados.
import { expect, test } from '@jest/globals';
import { COUNTRIES, regionFromLocale, resolveCountry } from '../data/crisisLines';

test('lê a região do locale do telemóvel', () => {
  expect(regionFromLocale('pt-BR')).toBe('BR');
  expect(regionFromLocale('en_GB')).toBe('GB');
  expect(regionFromLocale('zh-Hans-CN')).toBe('CN');
  expect(regionFromLocale('pt')).toBeNull();
  expect(regionFromLocale(undefined)).toBeNull();
});

test('ordem: escolha manual > região do telemóvel > língua da app', () => {
  expect(resolveCountry({ saved: 'FR', region: 'BR', lang: 'pt' })?.code).toBe('FR');
  expect(resolveCountry({ region: 'BR', lang: 'pt' })?.code).toBe('BR');
  expect(resolveCountry({ region: null, lang: 'pt-BR' })?.code).toBe('BR');
  expect(resolveCountry({ region: null, lang: 'es' })?.code).toBe('ES');
});

test('país fora da lista ou "outro país" → só o genérico', () => {
  expect(resolveCountry({ region: 'MX', lang: 'es' })).toBeNull();
  expect(resolveCountry({ saved: 'OTHER', region: 'PT', lang: 'pt' })).toBeNull();
});

test('todos os países têm número de emergência e linhas marcáveis', () => {
  const codes = new Set<string>();
  for (const c of COUNTRIES) {
    expect(codes.has(c.code)).toBe(false);
    codes.add(c.code);
    expect(c.emergency).toMatch(/^\d{3}$/);
    expect(c.lines.length).toBeGreaterThan(0);
    for (const l of c.lines) {
      expect(l.dial).toMatch(/^\d+$/);
      expect(l.desc.pt && l.desc.en).toBeTruthy();
    }
  }
});
