// Gera docs/privacy/index.html a partir de data/legal.ts (ver lib/privacySite.ts).
// Uso: npm run privacy:site
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Carrega ficheiros .ts diretamente (só transpila; os tipos são verificados pelo tsc).
require.extensions['.ts'] = (module, filename) => {
  const src = fs.readFileSync(filename, 'utf8');
  const out = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019, esModuleInterop: true } });
  module._compile(out.outputText, filename);
};

const { buildPrivacyHtml } = require('../lib/privacySite.ts');
const file = path.join(__dirname, '..', 'docs', 'privacy', 'index.html');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, buildPrivacyHtml());
console.log('Página gerada:', path.relative(process.cwd(), file));
