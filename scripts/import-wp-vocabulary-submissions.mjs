#!/usr/bin/env node
/**
 * Import published WordPress vocabulary submissions into data/vocabulary.json.
 *
 * Usage:
 *   FIDES_CATALOG_SECRET=... npm run import-wp-vocabulary-submissions
 *   FIDES_CATALOG_SECRET=... npm run import-wp-vocabulary-submissions -- --apply
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const VOCABULARY_PATH = join(root, 'data/vocabulary.json');
const STATE_PATH = join(root, 'data/wp-vocabulary-submission-state.json');
const SECRET_HEADER = 'X-FIDES-Catalog-Secret';
const COMMUNITY_FILENAME = 'vocabulary-term.json';

function parseArgs(argv) {
  const apply = argv.includes('--apply');
  const wpUrl =
    (() => {
      const idx = argv.indexOf('--wp-url');
      if (idx >= 0 && argv[idx + 1]) return argv[idx + 1];
      return (
        process.env.FIDES_WP_EXPORT_URL ??
        process.env.FIDES_WP_VOCABULARY_EXPORT_URL ??
        'http://utrecht-demo.local/wp-json/fides-catalog/v1/export/vocabulary'
      );
    })();
  const secret =
    (() => {
      const idx = argv.indexOf('--secret');
      if (idx >= 0 && argv[idx + 1]) return argv[idx + 1];
      return process.env.FIDES_CATALOG_SECRET ?? process.env.WP_INVALIDATE_SECRET ?? '';
    })();
  return { apply, wpUrl, secret };
}

function wpExportBlockHint(body, status) {
  if (body.includes('sgcaptcha') || body.includes('.well-known/captcha')) {
    return [
      `SiteGround Anti-Bot AI blocked this request (HTTP ${status}).`,
      'GitHub Actions cannot solve the captcha challenge.',
      'Fix: enable GitHub push sync in WP Settings → FIDES Catalog SEO (PAT with repo + workflow scope),',
      'or ask SiteGround support to disable Anti-Bot AI for /wp-json/fides-catalog/.',
    ].join(' ');
  }
  return null;
}

function loadInlineExportPayload() {
  const inline = String(process.env.FIDES_WP_EXPORT_JSON || '').trim();
  if (!inline) return null;
  try {
    const payload = JSON.parse(inline);
    if (!payload?.entries || !Array.isArray(payload.entries)) {
      throw new Error('export_json is missing entries array.');
    }
    return payload;
  } catch (err) {
    throw new Error(
      `Invalid FIDES_WP_EXPORT_JSON: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

async function loadExportPayload(wpUrl, secret) {
  const inline = loadInlineExportPayload();
  if (inline) {
    console.log('Using inline export payload (WordPress push sync).');
    return inline;
  }

  const event = String(process.env.GITHUB_EVENT_NAME || '').trim();
  if (event === 'repository_dispatch') {
    throw new Error(
      'Missing FIDES_WP_EXPORT_JSON on repository_dispatch. ' +
        'Enable GitHub push sync in WP Settings → FIDES Catalog SEO, or run recovery via workflow_dispatch.'
    );
  }

  console.log(
    event === 'workflow_dispatch'
      ? 'Recovery sync: pulling export via HTTP (manual workflow).'
      : 'Pulling export via HTTP.'
  );
  return fetchExport(wpUrl, secret);
}

function isSafeSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

async function fetchExport(wpUrl, secret) {
  if (!secret.trim()) {
    throw new Error('Missing FIDES_CATALOG_SECRET or WP_INVALIDATE_SECRET.');
  }
  const response = await fetch(wpUrl, {
    headers: {
      Accept: 'application/json',
      [SECRET_HEADER]: secret,
      'User-Agent': 'FIDES-Vocabulary-Automation/1.0',
    },
    signal: AbortSignal.timeout(60_000),
  });
  const body = await response.text();
  if (!response.ok) {
    const blocked = wpExportBlockHint(body, response.status);
    throw new Error(blocked || `Export failed (${response.status}): ${body.slice(0, 300)}`);
  }
  return JSON.parse(body);
}

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

function buildPlan(entries, previousState) {
  const plan = { merge: [], skipped: [], prune: [] };
  const currentSlugs = new Set();

  for (const entry of entries) {
    const slug = String(entry.slug || '').trim();
    const itemId = String(entry.itemId || '').trim();
    const document = entry.document && typeof entry.document === 'object' ? entry.document : null;
    const termKey = document && typeof document.termKey === 'string' ? document.termKey.trim() : '';
    const term = document && document.term && typeof document.term === 'object' ? document.term : null;

    if (!slug || !itemId || entry.filename !== COMMUNITY_FILENAME || !termKey || !term) {
      plan.skipped.push({ slug: slug || '(missing)', reason: 'invalid entry metadata' });
      continue;
    }
    if (!isSafeSlug(slug)) {
      plan.skipped.push({ slug, reason: 'unsafe slug' });
      continue;
    }
    currentSlugs.add(slug);
    plan.merge.push({ slug, itemId, termKey, term });
  }

  for (const slug of previousState.managedSlugs || []) {
    if (!currentSlugs.has(slug)) {
      plan.prune.push(slug);
    }
  }

  return plan;
}

async function main() {
  const { apply, wpUrl, secret } = parseArgs(process.argv.slice(2));
  const payload = await loadExportPayload(wpUrl, secret);
  const entries = Array.isArray(payload.entries) ? payload.entries : [];
  const previousState = readJson(STATE_PATH, {
    schemaVersion: '1.0.0',
    catalogType: 'vocabulary',
    lastImportAt: null,
    managedSlugs: [],
    managedKeys: {},
  });

  const plan = buildPlan(entries, previousState);
  console.log(`Vocabulary export: ${entries.length} entries`);
  console.log(`Merge: ${plan.merge.length}, prune slugs: ${plan.prune.length}, skipped: ${plan.skipped.length}`);

  if (!apply) {
    console.log('Dry run only. Re-run with --apply to write vocabulary.json.');
    if (plan.merge.length) {
      console.log('Would merge keys:', plan.merge.map((m) => m.termKey).join(', '));
    }
    return;
  }

  const vocabulary = readJson(VOCABULARY_PATH, {
    $schema: 'https://fides.community/schemas/vocabulary/v1',
    version: '1.0.0',
    terms: {},
  });
  if (!vocabulary.terms || typeof vocabulary.terms !== 'object') {
    vocabulary.terms = {};
  }

  const managedKeys = { ...(previousState.managedKeys || {}) };

  for (const item of plan.merge) {
    vocabulary.terms[item.termKey] = item.term;
    managedKeys[item.slug] = item.termKey;
  }

  for (const slug of plan.prune) {
    const oldKey = managedKeys[slug];
    if (oldKey && vocabulary.terms[oldKey]) {
      delete vocabulary.terms[oldKey];
    }
    delete managedKeys[slug];
  }

  mkdirSync(dirname(VOCABULARY_PATH), { recursive: true });
  writeFileSync(VOCABULARY_PATH, `${JSON.stringify(vocabulary, null, 2)}\n`, 'utf8');

  const nextState = {
    schemaVersion: '1.0.0',
    catalogType: 'vocabulary',
    lastImportAt: new Date().toISOString(),
    managedSlugs: plan.merge.map((m) => m.slug),
    managedKeys,
  };
  writeFileSync(STATE_PATH, `${JSON.stringify(nextState, null, 2)}\n`, 'utf8');

  execSync('node scripts/build-glossary-aggregated.mjs', { cwd: root, stdio: 'inherit' });
  console.log('Updated data/vocabulary.json and regenerated glossary-aggregated.json');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
