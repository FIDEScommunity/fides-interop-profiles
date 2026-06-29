#!/usr/bin/env node
/**
 * Replace broken vocabulary source URLs with verified working targets.
 * Run from repo root: node scripts/fix-vocabulary-source-urls.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/** @type {Record<string, string>} */
const URL_REPLACEMENTS = {
  "https://digital-strategy.ec.europa.eu/en/policies/eudi-regulation-implementation":
    "https://digital-strategy.ec.europa.eu/en/policies/eudi-wallet-implementation",
  "https://www.gleif.org/en/organizational-identity/introducing-the-verifiable-lei-vlei":
    "https://www.gleif.org/en/organizational-identity/lei-vlei/the-verifiable-lei-vlei",
  "https://eudi.dev/2.9.0/architecture-and-reference-framework-main/annex-1-definitions/":
    "https://eudi.dev/2.9.0/annexes/annex-1/annex-1-definitions/",
  "https://eudi.dev/2.9.0/technical-specifications/essential-standards-and-technical-specifications/":
    "https://eudi.dev/2.9.0/technical-specifications/",
  "https://digital-strategy.ec.europa.eu/en/policies/digital-identity-wallet/large-scale-pilots":
    "https://digital-strategy.ec.europa.eu/en/policies/eudi-wallet-implementation",
  "https://digital-strategy.ec.europa.eu/en/policies/eudi-wallet":
    "https://digital-strategy.ec.europa.eu/en/policies/eudi-regulation",
  "https://digital-strategy.ec.europa.eu/en/policies/european-business-wallets":
    "https://digital-strategy.ec.europa.eu/en/policies/business-wallets",
  "https://github.com/eu-digital-identity-wallet/ewc-rules-and-patterns":
    "https://github.com/EWC-consortium/eudi-wallet-rulebooks-and-schemas",
  "https://potential-project.eu/":
    "https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/924976339/LSP-POTENTIAL",
  "https://swiyu-admin-ch.github.io/specifications/interoperability-profile/":
    "https://swiyu-admin-ch.github.io/specifications/introduction/",
  "https://unece.org/trade/uncefact":
    "https://untp.unece.org/docs/specification/",
  "https://untp.unece.org/docs/specification/VerifiableCredentialsProfile/":
    "https://untp.unece.org/docs/specification/VerifiableCredentials/",
  "https://untp.unece.org/docs/specification/CoreVocabulary":
    "https://untp.unece.org/docs/specification/CoreVocabulary/",
  "https://gaia-x.eu/services/federation-services/":
    "https://gaia-x.eu/services/",
  "https://www.gleif.org/en/about-lei/introducing-the-legal-entity-identifier-lei":
    "https://www.gleif.org/en/organizational-identity/lei-vlei/",
  "https://www.gleif.org/en/vlei/introducing-the-vlei":
    "https://www.gleif.org/en/organizational-identity/lei-vlei/the-verifiable-lei-vlei",
  "https://www.iata.org/en/programs/passenger/contactless-travel/":
    "https://www.iata.org/en/programs/passenger/one-id/",
  "https://www.iso.org/standard/86886.html":
    "https://www.iso.org/standard/74910.html",
  "https://www.etsi.org/deliver/etsi_en/319100_319199/319132/01.01.01_60/en_319132v010101p.pdf":
    "https://www.etsi.org/deliver/etsi_en/319100_319199/31913201/01.03.01_60/en_31913201v010301p.pdf",
  "https://www.etsi.org/deliver/etsi_en/319100_319199/319142/01.01.01_60/en_319142v010101p.pdf":
    "https://www.etsi.org/deliver/etsi_en/319100_319199/31914201/01.02.01_60/en_31914201v010201p.pdf",
  "https://www.etsi.org/deliver/etsi_en/319400_319499/319412/02.03.01_60/en_319412v020301p.pdf":
    "https://www.etsi.org/deliver/etsi_ts/119400_119499/11941206/01.02.01_60/ts_11941206v010201p.pdf",
  "https://www.etsi.org/deliver/etsi_ts/119100_119199/119182/01.01.01_60/ts_119182v010101p.pdf":
    "https://www.etsi.org/deliver/etsi_ts/119100_119199/11918201/01.02.01_60/ts_11918201v010201p.pdf",
  "https://www.etsi.org/deliver/etsi_ts/119400_119499/119411/08.01.01_60/ts_119411v080101p.pdf":
    "https://www.etsi.org/deliver/etsi_ts/119400_119499/11941108/01.01.01_60/ts_11941108v010101p.pdf",
  "https://fidoalliance.org/specifications/download/Client-to-Authenticator-Protocol-v2.1-Implementation-Guide.pdf":
    "https://fidoalliance.org/specs/fido-v2.1-ps-20210615/fido-client-to-authenticator-protocol-v2.1-ps-20210615.pdf",
};

const TARGET_FILES = [
  "data/vocabulary.json",
  "wordpress-plugin/fides-interop-matrix/assets/vocabulary.json",
  "scripts/enrich-vocabulary-urls.mjs",
];

/**
 * @param {string} content
 * @returns {{ content: string, count: number }}
 */
function replaceUrls(content) {
  let count = 0;
  let next = content;
  const entries = Object.entries(URL_REPLACEMENTS).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [from, to] of entries) {
    const parts = next.split(from);
    if (parts.length > 1) {
      count += parts.length - 1;
      next = parts.join(to);
    }
  }
  return { content: next, count };
}

let total = 0;
for (const rel of TARGET_FILES) {
  const path = join(ROOT, rel);
  const original = readFileSync(path, "utf8");
  const { content, count } = replaceUrls(original);
  if (count > 0) {
    writeFileSync(path, content, "utf8");
    console.log(`${rel}: ${count} replacement(s)`);
    total += count;
  } else {
    console.log(`${rel}: no changes`);
  }
}

if (total === 0) {
  console.log("Nothing to update.");
  process.exit(0);
}

console.log(`\nTotal replacements: ${total}`);
