#!/usr/bin/env node
/**
 * Transform data/vocabulary.json into glossary-aggregated.json for the
 * FIDES Vocabulary Glossary WordPress plugin and SSR/sitemap core.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatDisplayName, sortLetter } from './glossary-display-name.mjs';

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

function slugify(key) {
  const slug = String(key)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'term';
}

const raw = JSON.parse(readFileSync(vocabularyPath, 'utf8'));
const termsObj = raw.terms && typeof raw.terms === 'object' ? raw.terms : {};
const slugUsed = new Map();
const terms = [];

for (const [key, value] of Object.entries(termsObj)) {
  if (!value || typeof value !== 'object') continue;
  let id = slugify(key);
  if (slugUsed.has(id)) {
    let n = 2;
    while (slugUsed.has(`${id}-${n}`)) n += 1;
    id = `${id}-${n}`;
  }
  slugUsed.set(id, key);

  const canonicalKey = String(key).trim();
  const explicitTitle = typeof value.title === 'string' ? value.title.trim() : '';
  const name = formatDisplayName(canonicalKey, explicitTitle);
  const description =
    typeof value.description === 'string' ? value.description.trim() : '';
  const url = typeof value.url === 'string' ? value.url.trim() : '';
  const aliases = Array.isArray(value.aliases)
    ? value.aliases.map((a) => String(a).trim()).filter(Boolean)
    : [];

  terms.push({
    id,
    key: canonicalKey,
    name,
    description,
    url,
    aliases,
    letter: sortLetter(name),
  });
}

terms.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

const payload = {
  version: raw.version || '1.0.0',
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
