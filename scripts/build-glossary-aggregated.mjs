#!/usr/bin/env node
/**
 * Transform data/vocabulary.json into glossary-aggregated.json for the
 * FIDES Vocabulary Glossary WordPress plugin and SSR/sitemap core.
 * Run `npm run check:glossary` to verify the committed aggregate is current.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGlossaryTerms } from './glossary-build-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const vocabularyPath = join(root, 'data', 'vocabulary.json');
const outData = join(root, 'data', 'glossary-aggregated.json');
const outPlugin = join(
  root,
  'wordpress-plugin',
  'fides-vocabulary-glossary',
  'data',
  'glossary-aggregated.json'
);

const raw = JSON.parse(readFileSync(vocabularyPath, 'utf8'));
const { version, terms } = buildGlossaryTerms(raw);

const payload = {
  version,
  generatedAt: new Date().toISOString(),
  terms,
};

for (const path of [outData, outPlugin]) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

console.log(`Wrote ${terms.length} glossary terms to:`);
console.log(`  ${outData}`);
console.log(`  ${outPlugin}`);
