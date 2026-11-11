#!/usr/bin/env node
/**
 * Fails when data/glossary-aggregated.json is out of date with data/vocabulary.json, or when the vocabulary
 * contains glossary ambiguities (see findVocabularyProblems). Rebuilds in memory; writes nothing.
 * Usage: npm run check:glossary
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGlossaryTerms, findVocabularyProblems } from './glossary-build-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Labels that already resolved to several terms before this check existed; fix in vocabulary.json, then remove here. */
const KNOWN_COLLISIONS = [
  'mdoc', 'other', 'fides', 'eudi wallet', 'gaia-x', 'iso 18013-5', 'iso 18013-7', 'iso mdl', 'sd-jwt-vc', 'un/cefact', 'vcdm 2.0',
];

const vocabulary = JSON.parse(readFileSync(join(root, 'data', 'vocabulary.json'), 'utf8'));
const committed = JSON.parse(readFileSync(join(root, 'data', 'glossary-aggregated.json'), 'utf8'));
const expected = buildGlossaryTerms(vocabulary);

const failures = findVocabularyProblems(vocabulary, KNOWN_COLLISIONS);

if (committed.version !== expected.version) {
  failures.push(`aggregate version ${committed.version} differs from vocabulary version ${expected.version}`);
}
const committedById = new Map(committed.terms.map((t) => [t.id, t]));
const expectedById = new Map(expected.terms.map((t) => [t.id, t]));
for (const id of expectedById.keys()) {
  if (!committedById.has(id)) failures.push(`aggregate is missing term "${id}"`);
  else if (JSON.stringify(committedById.get(id)) !== JSON.stringify(expectedById.get(id))) {
    failures.push(`aggregate term "${id}" differs from vocabulary.json`);
  }
}
for (const id of committedById.keys()) {
  if (!expectedById.has(id)) failures.push(`aggregate has term "${id}" that vocabulary.json no longer produces`);
}

if (failures.length) {
  console.error(`Glossary check FAILED (${failures.length}):`);
  for (const f of failures.slice(0, 40)) console.error(`  - ${f}`);
  if (failures.length > 40) console.error(`  ... and ${failures.length - 40} more`);
  console.error('Fix data/vocabulary.json and run: npm run build:glossary');
  process.exit(1);
}
console.log(`Glossary check OK: ${expected.terms.length} terms, aggregate matches vocabulary.json ${expected.version}.`);
