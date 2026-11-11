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

/**
 * Labels that still resolve to two glossary terms; each is an open editorial question, not an accepted state.
 * - 'iso 18013-5', 'iso 18013-7', 'sd-jwt-vc', 'vcdm 2.0': the catalog filter value (iso18013_5, sd_jwt_vc, ...)
 *   and the standard describe the same thing. Both ids are published in the live sitemap (?term=...), so merging
 *   them with duplicateOf would drop a published id until the glossary page and the SEO core can resolve legacy ids.
 * - 'mdoc' (mDL/mDoc vs mdoc), 'other' (credential format vs schema type), 'fides' (FIDES vs FIDES Community):
 *   definitions differ; an editor has to decide whether they are one concept.
 * Remove a label here once its pair is resolved in vocabulary.json.
 */
const KNOWN_COLLISIONS = [
  'iso 18013-5', 'iso 18013-7', 'sd-jwt-vc', 'vcdm 2.0',
  'mdoc', 'other', 'fides',
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
