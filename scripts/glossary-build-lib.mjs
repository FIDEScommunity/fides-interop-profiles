/**
 * Shared logic to derive the glossary aggregate from data/vocabulary.json.
 * Used by build-glossary-aggregated.mjs (writes files) and check-glossary-aggregate.mjs (compares in memory).
 *
 * Vocabulary entries may carry an optional `duplicateOf` field (the key of another entry). Such an entry stays in
 * vocabulary.json because catalog [i] popups look terms up by key (for example QEAA), but it is NOT listed as a
 * separate glossary term. Its key and aliases are merged into the target term's aliases instead.
 */
import { formatDisplayName, sortLetter } from './glossary-display-name.mjs';

export function slugify(key) {
  const slug = String(key)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'term';
}

function cleanAliases(value) {
  return Array.isArray(value) ? value.map((a) => String(a).trim()).filter(Boolean) : [];
}

/**
 * @param {{version?: string, terms?: Record<string, any>}} raw parsed vocabulary.json
 * @returns {{version: string, terms: any[]}} aggregate without generatedAt
 */
export function buildGlossaryTerms(raw) {
  const termsObj = raw.terms && typeof raw.terms === 'object' ? raw.terms : {};
  const slugUsed = new Map();
  const byKey = new Map();
  const terms = [];

  for (const [key, value] of Object.entries(termsObj)) {
    if (!value || typeof value !== 'object') continue;
    if (typeof value.duplicateOf === 'string' && value.duplicateOf.trim()) continue;
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
    const term = {
      id,
      key: canonicalKey,
      name,
      description: typeof value.description === 'string' ? value.description.trim() : '',
      url: typeof value.url === 'string' ? value.url.trim() : '',
      aliases: cleanAliases(value.aliases),
      letter: sortLetter(name),
    };
    byKey.set(canonicalKey, term);
    terms.push(term);
  }

  // Merge duplicates into their target so search on the abbreviation still finds the one canonical term.
  for (const [key, value] of Object.entries(termsObj)) {
    if (!value || typeof value.duplicateOf !== 'string' || !value.duplicateOf.trim()) continue;
    const target = byKey.get(value.duplicateOf.trim());
    if (!target) continue;
    const have = new Set([target.name, target.key, ...target.aliases].map((s) => s.toLowerCase()));
    for (const label of [String(key).trim(), ...cleanAliases(value.aliases)]) {
      if (!have.has(label.toLowerCase())) {
        target.aliases.push(label);
        have.add(label.toLowerCase());
      }
    }
  }

  terms.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  return { version: raw.version || '1.0.0', terms };
}

/**
 * Consistency problems in vocabulary.json that would make the glossary ambiguous.
 * @returns {string[]} human-readable problems
 */
export function findVocabularyProblems(raw, knownCollisions = []) {
  const problems = [];
  const termsObj = raw.terms || {};
  const known = new Set(knownCollisions.map((s) => s.toLowerCase()));

  for (const [key, value] of Object.entries(termsObj)) {
    if (!value || typeof value.duplicateOf !== 'string') continue;
    const target = termsObj[value.duplicateOf];
    if (!target) {
      problems.push(`"${key}" is duplicateOf missing term "${value.duplicateOf}"`);
      continue;
    }
    if (typeof target.duplicateOf === 'string') {
      problems.push(`"${key}" points at "${value.duplicateOf}", which is itself a duplicate`);
    }
    if ((value.description || '').trim() !== (target.description || '').trim()) {
      problems.push(`"${key}" and its target "${value.duplicateOf}" have different descriptions`);
    }
  }

  // A label (name, title, key or alias) must not resolve to two different glossary terms.
  const { terms } = buildGlossaryTerms(raw);
  const owners = new Map();
  for (const t of terms) {
    const labels = new Set([t.name, t.key, ...t.aliases].map((s) => s.toLowerCase()));
    for (const label of labels) {
      if (!owners.has(label)) owners.set(label, []);
      owners.get(label).push(t.id);
    }
  }
  for (const [label, ids] of owners) {
    if (ids.length > 1 && !known.has(label)) {
      problems.push(`label "${label}" resolves to several glossary terms: ${ids.join(', ')}`);
    }
  }
  return problems;
}
