#!/usr/bin/env node
/**
 * Fill optional `url` on vocabulary terms from external sources (EUDI, UNTP, ETSI, …).
 * Only sets url when missing. Run from repo root: node scripts/enrich-vocabulary-urls.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VOCAB_PATH = join(__dirname, "../data/vocabulary.json");

// Canonical source URLs (stable landing pages; prefer normative specs where known).
const U = {
  eudiArf: "https://eudi.dev/2.9.0/architecture-and-reference-framework-main/",
  eudiArfAnnex1:
    "https://eudi.dev/2.9.0/annexes/annex-1/annex-1-definitions/",
  eudiEssentialSts:
    "https://eudi.dev/2.9.0/technical-specifications/",
  euEudiPolicy: "https://digital-strategy.ec.europa.eu/en/policies/eudi-regulation",
  euLsp: "https://digital-strategy.ec.europa.eu/en/policies/eudi-wallet-implementation",
  eidas2: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202402767",
  eidas1: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R0910",
  euCredCatalog:
    "https://github.com/FIDEScommunity/fides-credential-catalog/tree/main/community-catalogs/eu",
  euCredSchemas:
    "https://github.com/FIDEScommunity/fides-credential-catalog/tree/main/community-catalogs/eu/schemas",
  ebwPolicy:
    "https://digital-strategy.ec.europa.eu/en/policies/business-wallets",
  ewcLsp:
    "https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/920064565/LSP-EWC",
  ewcLpidRulebook:
    "https://github.com/EWC-consortium/eudi-wallet-rulebooks-and-schemas",
  untp: "https://untp.unece.org/docs/specification/",
  untpVcp: "https://untp.unece.org/docs/specification/VerifiableCredentials/",
  untpDac: "https://untp.unece.org/docs/specification/DecentralisedAccessControl/",
  untpDpp: "https://untp.unece.org/docs/specification/DigitalProductPassport/",
  untpDcc: "https://untp.unece.org/docs/specification/ConformityCredential/",
  untpDte: "https://untp.unece.org/docs/specification/DigitalTraceabilityEvents/",
  untpDfr: "https://untp.unece.org/docs/specification/DigitalFacilityRecord/",
  untpDia: "https://untp.unece.org/docs/specification/DigitalIdentityAnchor/",
  untpCore: "https://untp.unece.org/docs/specification/CoreVocabulary//",
  untpIdr: "https://untp.unece.org/docs/specification/IdentityResolver/",
  untpCvc: "https://untp.unece.org/docs/specification/ConformityVocabularyCatalog/",
  etsiEsi: "https://portal.etsi.org/tb.aspx?tbid=826&SubTB=826",
  etsi119612: "https://www.etsi.org/deliver/etsi_ts/119600_119699/119612/",
  etsi119602: "https://www.etsi.org/deliver/etsi_ts/119600_119699/119602/",
  etsi119472: "https://www.etsi.org/deliver/etsi_ts/119400_119499/119472/",
  etsi119475: "https://www.etsi.org/deliver/etsi_ts/119400_119499/119475/",
  etsi1194126: "https://www.etsi.org/deliver/etsi_ts/119400_119499/11941206/01.02.01_60/ts_11941206v010201p.pdf",
  etsi1194118: "https://www.etsi.org/deliver/etsi_ts/119400_119499/11941108/01.01.01_60/ts_11941108v010101p.pdf",
  etsi119432: "https://www.etsi.org/deliver/etsi_ts/119400_119499/119432/01.01.01_60/ts_119432v010101p.pdf",
  etsiPades: "https://www.etsi.org/deliver/etsi_en/319100_319199/31914201/01.02.01_60/en_31914201v010201p.pdf",
  etsiJades: "https://www.etsi.org/deliver/etsi_ts/119100_119199/11918201/01.02.01_60/ts_11918201v010201p.pdf",
  etsiXades: "https://www.etsi.org/deliver/etsi_en/319100_319199/31913201/01.03.01_60/en_31913201v010301p.pdf",
  oid4vci: "https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html",
  oid4vp: "https://openid.net/specs/openid-4-verifiable-presentations-1_0.html",
  oidc: "https://openid.net/specs/openid-connect-core-1_0.html",
  oauth2: "https://datatracker.ietf.org/doc/html/rfc6749",
  haip: "https://openid.net/specs/openid4vc-high-assurance-interoperability-profile-1_0.html",
  diip: "https://fidescommunity.github.io/DIIP/",
  sdJwt: "https://datatracker.ietf.org/doc/draft-ietf-oauth-selective-disclosure-jwt/",
  sdJwtVc: "https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/",
  vcdm2: "https://www.w3.org/TR/vc-data-model-2.0/",
  vcdm11: "https://www.w3.org/TR/vc-data-model/",
  iso180135: "https://www.iso.org/standard/69084.html",
  iso180137: "https://www.iso.org/standard/82772.html",
  iso23220: "https://www.iso.org/standard/74910.html",
  oidcIa: "https://openid.net/specs/openid-connect-4-identity-assurance-1_0.html",
  gxCatalog:
    "https://github.com/FIDEScommunity/fides-credential-catalog/tree/main/community-catalogs/gx",
  gxTrust: "https://docs.gaia-x.eu/",
  potential: "https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/924976339/LSP-POTENTIAL",
  gleifVleiSchemas: "https://github.com/GLEIF-IT/vLEI-schema",
  iataDat: "https://www.iata.org/en/programs/passenger/one-id/",
  isoCatalog:
    "https://github.com/FIDEScommunity/fides-credential-catalog/tree/main/community-catalogs/iso",
};

/** term key -> source url (external batches v1.3–v1.9 + related standards) */
const TERM_URLS = {
  // Interop profiles & EUDI framework
  "EUDI Wallet ARF": U.eudiArf,
  "DIIP v4": U.diip,
  "DIIP v5": U.diip,
  "HAIP v1": U.haip,
  "EWC v3": U.ewcLsp,
  "European Digital Identity Wallet": U.euEudiPolicy,
  "European Digital Identity Regulation": U.eidas2,
  eIDAS: U.eidas2,
  "Implementing Act": U.euEudiPolicy,
  "Member State": U.eudiArfAnnex1,
  "Large Scale Pilot": U.euLsp,
  "Conformity Assessment Body": U.eidas2,
  "National Accreditation Body": U.eidas2,
  "Qualified Trust Service Provider": U.eidas1,
  "Qualified Electronic Signature": U.eidas1,
  "Qualified Electronic Signature Creation Device": U.eidas1,
  "Electronic Seal": U.eidas1,
  "European Wallet Consortium": U.ewcLsp,
  POTENTIAL: U.potential,

  // ARF Annex 1 roles & objects
  "Person Identification Data": U.eudiArfAnnex1,
  "PID Provider": U.eudiArfAnnex1,
  "Electronic Attestation of Attributes": U.eudiArfAnnex1,
  "Qualified Electronic Attestation of Attributes": U.eudiArfAnnex1,
  "Public Sector Body EAA": U.eudiArfAnnex1,
  Attestation: U.eudiArfAnnex1,
  "Attestation Provider": U.eudiArfAnnex1,
  "Wallet Unit": U.eudiArfAnnex1,
  "Wallet Instance": U.eudiArfAnnex1,
  "Wallet Solution": U.eudiArfAnnex1,
  "Wallet Provider": U.eudiArfAnnex1,
  "Relying Party": U.eudiArfAnnex1,
  "Trust Anchor": U.eudiArfAnnex1,
  "Trusted List": U.etsi119612,
  "List of Trusted Entities": U.etsi119602,
  "Certificate Authority": U.eudiArfAnnex1,
  "Access Certificate Authority": U.eudiArfAnnex1,
  "Access Certificate": U.etsi1194118,
  Registrar: U.eudiArfAnnex1,
  "Authentic Source": U.eudiArfAnnex1,
  Intermediary: U.eudiArfAnnex1,
  "EUDI Wallet Trust Mark": U.euEudiPolicy,
  "Wallet Unit Attestation": U.eudiArfAnnex1,
  "Wallet Instance Attestation": U.eudiArfAnnex1,
  "Key Attestation": U.eudiArfAnnex1,
  "Wallet Secure Cryptographic Application": U.eudiArfAnnex1,
  "Wallet Secure Cryptographic Device": U.eudiArfAnnex1,
  Keystore: U.eudiArfAnnex1,
  "Attestation Rulebook": U.eudiArfAnnex1,
  "Attestation Type": U.eudiArfAnnex1,
  Namespace: U.eudiArfAnnex1,
  "Attestation Revocation List": U.eudiArfAnnex1,
  "Attestation Status List": U.eudiArfAnnex1,
  "Administrative validity period": U.eudiArfAnnex1,
  "Technical validity period": U.eudiArfAnnex1,
  "Digital Credentials Query Language": U.oid4vp,
  "Digital Credentials API": U.eudiEssentialSts,
  "Presentation Exchange": "https://identity.foundation/presentation-exchange/",
  "Verifiable Credential": U.vcdm2,
  "Verifiable Presentation": U.vcdm2,
  "Credential Offer": U.oid4vci,
  "Verifiable Credentials Data Model": U.vcdm2,
  "Selective Disclosure": U.sdJwt,
  "Embedded Disclosure Policy": U.eudiArfAnnex1,
  Pseudonym: U.eudiArfAnnex1,
  "Zero-Knowledge Proof": U.eudiEssentialSts,
  "Strong User Authentication": U.eidas2,
  "Key Binding": U.vcdm2,

  // Protocols & formats (catalog filters)
  "SD-JWT-VC": U.sdJwtVc,
  OpenID4VCI: U.oid4vci,
  OpenID4VP: U.oid4vp,
  "ISO 18013-5": U.iso180135,
  "ISO 18013-7": U.iso180137,
  vcdm_1_1: U.vcdm11,
  vcdm_2_0: U.vcdm2,
  sd_jwt_vc: U.sdJwtVc,

  // EBW
  "European Business Wallet": U.ebwPolicy,
  "Organizational Wallet": U.ebwPolicy,
  "Legal Person Identification Data": U.ewcLpidRulebook,
  "European Business Wallet Owner Identification Data": U.ewcLpidRulebook,
  EBWOID: U.ewcLpidRulebook,
  "European Unique Identifier": U.ebwPolicy,
  "European Digital Directory": U.ebwPolicy,
  "Economic operator": U.ebwPolicy,
  "Legal person": U.eudiArfAnnex1,
  Mandate: U.ebwPolicy,
  "Representation rights": U.ebwPolicy,
  "Power of Attorney": U.ebwPolicy,
  "Legal equivalence": U.ebwPolicy,
  "Core minimum functionalities": U.ebwPolicy,
  "Qualified Electronic Registered Delivery Service": U.eidas1,
  "Qualified Electronic Seal": U.eidas1,

  // ETSI batch
  "EAA and PID Profiles": U.etsi119472,
  "Relying Party Attributes": U.etsi119475,
  "EUDI Certificate Profiles": U.etsi1194126,
  "RP Access Certificate Policy": U.etsi1194118,
  "Remote Signature Protocols": U.etsi119432,
  PAdES: U.etsiPades,
  JAdES: U.etsiJades,
  XAdES: U.etsiXades,

  // EU attestation credentials
  "EU Attestation Catalog": U.euCredCatalog,
  "European Health Insurance Card": `${U.euCredSchemas}/ehic-sd-jwt-vc.schema.json`,
  "Portable Document A1": `${U.euCredSchemas}/pda1-sd-jwt-vc.schema.json`,
  "Portable Document A2": U.euCredCatalog,
  "European Social Security Pass": U.euCredCatalog,
  "Certificate of Residence": `${U.euCredSchemas}/cor-mdoc.schema.json`,
  "Power of Representation": `${U.euCredSchemas}/por-sd-jwt-vc.schema.json`,
  "Health ID": `${U.euCredSchemas}/hiid-sd-jwt-vc.schema.json`,
  "European Diploma": `${U.euCredSchemas}/diploma-vc-sd-jwt.schema.json`,
  "Photo ID": U.euCredCatalog,
  "Age Verification Credential": `${U.euCredSchemas}/age-verification-mdoc.schema.json`,
  "IBAN Attestation": `${U.euCredSchemas}/iban-sd-jwt-vc.schema.json`,
  "Tax Number Attestation": `${U.euCredSchemas}/tax-sd-jwt-vc.schema.json`,
  "Tax Residency Attestation": `${U.euCredSchemas}/tax-residency-vc-sd-jwt.schema.json`,
  "MSISDN Attestation": `${U.euCredSchemas}/msisdn-sd-jwt-vc.schema.json`,
  "Employee ID Credential": `${U.euCredSchemas}/employee-mdoc.schema.json`,
  "Seafarer Credential": `${U.euCredSchemas}/seafarer-mdoc.schema.json`,

  // OpenID4VC depth
  "OpenID Connect": U.oidc,
  "OAuth 2.0": U.oauth2,
  "Selective Disclosure JWT": U.sdJwt,
  "Verifiable Credential Type": U.sdJwtVc,
  "Mobile Document Type": U.iso180135,
  "Deferred Credential Issuance": U.oid4vci,
  "Pre-authorized Code": U.oid4vci,
  "Transaction Code": U.oid4vp,
  "OpenID Identity Assurance": U.oidcIa,
  "ISO/IEC 23220": U.iso23220,
  "Credential Issuer Metadata": U.oid4vci,
  "Client to Authenticator Protocol":
    "https://fidoalliance.org/specs/fido-v2.1-ps-20210615/fido-client-to-authenticator-protocol-v2.1-ps-20210615.pdf",

  // Gaia-X
  "Gaia-X Trust Framework": U.gxTrust,
  "Data Space": U.gxTrust,
  "Gaia-X Compliance Credential": U.gxCatalog,
  "Gaia-X Participant Credentials": U.gxCatalog,
  "Gaia-X Resource Credentials": U.gxCatalog,

  // Ecosystem D1–D4, D7
  "Beta-ID": "https://www.eid.admin.ch/",
  "Qualified vLEI Issuer": U.gleifVleiSchemas,
  "vLEI Legal Entity Credential": U.gleifVleiSchemas,
  "Official Organizational Role": U.gleifVleiSchemas,
  "Engagement Context Role": U.gleifVleiSchemas,
  "Boarding Pass Credential": U.iataDat,
  "Booking Order Credential": U.iataDat,
  "Mobile Driving Licence Credential": U.isoCatalog,
  "Vehicle Registration Certificate": U.isoCatalog,
  "Reservation Credential": U.isoCatalog,
  Aadhaar: "https://uidai.gov.in/en/ecosystem/authentication-devices-documents/seeding-documents/aadhaar-paperless-offline-e-kyc-xml.html",

  // UNTP (terms without url yet)
  "Verifiable Credentials Profile": U.untpVcp,
  "Decentralised Access Control": U.untpDac,
  "UNTP Core Vocabulary": U.untpCore,
  "Conformity Attestation": U.untpDcc,
  "Conformity Assessment": U.untpDcc,
  "Performance Claim": U.untpCore,
  Criterion: U.untpCvc,
  Facility: U.untpDfr,
  Party: U.untpCore,
  "Conformity Topic": U.untpCvc,
  "Conformity Scheme": U.untpCvc,
  "Conformity Profile": U.untpCvc,
  Endorsement: U.untpCvc,
  "Registered Identity": U.untpDia,
  "Lifecycle Event": U.untpDte,
  "Make Event": U.untpDte,
  "Move Event": U.untpDte,
  "Modify Event": U.untpDte,
};

const vocab = JSON.parse(readFileSync(VOCAB_PATH, "utf8"));
let added = 0;
let skippedExisting = 0;
let missingKeys = [];

for (const [key, url] of Object.entries(TERM_URLS)) {
  if (!vocab.terms[key]) {
    missingKeys.push(key);
    continue;
  }
  if (vocab.terms[key].url) {
    skippedExisting++;
    continue;
  }
  vocab.terms[key].url = url;
  added++;
}

// Bump minor when urls added
if (added > 0) {
  const [major, minor, patch] = vocab.version.split(".").map(Number);
  vocab.version = `${major}.${minor + 1}.0`;
}

writeFileSync(VOCAB_PATH, JSON.stringify(vocab, null, 2) + "\n");

console.log(`vocabulary ${vocab.version}`);
console.log(`urls added: ${added}`);
console.log(`skipped (already had url): ${skippedExisting}`);
if (missingKeys.length) {
  console.warn("keys not in vocabulary:", missingKeys.join(", "));
}
