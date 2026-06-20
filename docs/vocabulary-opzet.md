# Vocabulary: opzet per element (template voor uitleg)

Alle content in het **Engels**. Voor elk term: `description` (1-2 zinnen); optioneel `url` naar spec.

**Richtlijn**
- **Groep**: 1-2 zinnen wat de filter/sectie betekent voor de gebruiker.
- **Optie**: 1-2 zinnen wat het is; eventueel link naar spec.

---

## Wallet catalog (WordPress)

| Vocabulary key | Type | Opzet voor description |
|----------------|------|------------------------|
| `type` | group | What kind of wallet: for individual use (personal) or for organizations (organizational). |
| `personal` | option | Wallet intended for individual users to store and present their own credentials. |
| `organizational` | option | Wallet used by organizations to issue, hold, or verify credentials. |
| `availability` | group | Whether the wallet is generally available or still in development. |
| `available` | option | Wallet is publicly available for use. |
| `development` | option | Wallet is in development; not yet generally available. |
| `provider` | group | Filter by who provides or backs the wallet (government vs private sector). |
| `government` | option | Wallet provided or backed by a government or public sector body. |
| `private` | option | Wallet provided by a private sector organization. |
| `platform` | group | The device or operating system the wallet runs on. |
| `iOS` | option | Apple mobile operating system. |
| `Android` | option | Google mobile operating system. |
| `Web` | option | Wallet accessible via web browser. |
| `capabilities` | group | For organizational wallets: whether they can hold, issue, and/or verify credentials. |
| `holder` | option | Can store and present credentials (holder role). |
| `issuer` | option | Can issue credentials to users (issuer role). |
| `verifier` | option | Can verify credentials presented by users (verifier role). |
| `country` | group | Country of the wallet provider. No per-option vocabulary; list is dynamic. |
| `interopProfile` | group | Interoperability profile the wallet claims to support. |
| `DIIP v4` | option | Digital Identity Interoperability Profile v4. [1 sentence + optional url] |
| `DIIP v5` | option | Digital Identity Interoperability Profile v5. [1 sentence + optional url] |
| `EWC v3` | option | European Wallet Consortium v3. [1 sentence + optional url] |
| `HAIP v1` | option | OpenID4VC High Assurance Interoperability Profile v1. [1 sentence + optional url] |
| `EUDI Wallet ARF` | option | EU Digital Identity Wallet Architecture and Reference Framework. [1 sentence + optional url] |
| `credentialFormat` | group | The technical format in which credentials are encoded. |
| `SD-JWT-VC` | option | Selective Disclosure JWT Verifiable Credential; JWT-based with selective disclosure. Optional: IETF draft url. |
| `mDL/mDoc` | option | ISO 18013-5 mDL/mdoc (mobile driver's license). Optional: spec url. |
| `JWT-VC` | option | JWT Verifiable Credential (W3C-style). Optional: spec url. |
| `AnonCreds` | option | Hyperledger AnonCreds credential format. Optional: spec url. |
| `JSON-LD VC` | option | W3C Verifiable Credential in JSON-LD format. Optional: spec url. |
| `Apple Wallet Pass` | option | Apple Wallet pass (proprietary). |
| `Google Wallet Pass` | option | Google Wallet pass (proprietary). |
| `X.509` | option | X.509 certificate format. Optional: spec url. |
| `issuanceProtocol` | group | Protocol used to receive (issue) credentials into the wallet. |
| `OpenID4VCI` | option | OpenID for Verifiable Credential Issuance. Optional: spec url. |
| `DIDComm Issue Credential v1` | option | DIDComm v1 issue-credential protocol. Optional: spec url. |
| `DIDComm Issue Credential v2` | option | DIDComm v2 issue-credential protocol. Optional: spec url. |
| `presentationProtocol` | group | Protocol used to present credentials from the wallet to a verifier. |
| `OpenID4VP` | option | OpenID for Verifiable Presentations. Optional: spec url. |
| `SIOPv2` | option | Self-Issued OpenID Provider v2. Optional: spec url. |
| `DIDComm Present Proof v2` | option | DIDComm v2 present-proof protocol. Optional: spec url. |
| `ISO 18013-5` | option | ISO 18013-5 (mobile driver's license) presentation. Optional: spec url. |
| `identifiers` | group | Identifier types the wallet supports (e.g. DID methods). |
| `did:web` | option | DID method using web domains. Optional: spec url. |
| `did:key` | option | DID method using public key. Optional: spec url. |
| `did:jwk` | option | DID method using JWK. Optional: spec url. |
| `did:peer` | option | DID method for peer-to-peer. Optional: spec url. |
| `did:ebsi` | option | EBSI DID method. Optional: spec url. |
| `keyStorage` | group | Where cryptographic keys are stored (hardware vs software). |
| `Software` | option | Keys stored in software. |
| `Secure Enclave (iOS)` | option | Apple Secure Enclave (hardware-backed). |
| `StrongBox (Android)` | option | Android StrongBox (hardware-backed). |
| `TEE` | option | Trusted Execution Environment. |
| `HSM` | option | Hardware Security Module. |
| `signingAlgorithm` | group | Signature algorithms used. Options dynamic from data; add terms as needed. |
| `credentialStatus` | group | How the wallet checks credential status. Options dynamic; add terms as needed. |
| `license` | group | Whether the wallet software is open source or proprietary. |
| `Open Source` | option | Source code is openly available. |
| `Proprietary` | option | Source code is not publicly available. |

---

## RP catalog (WordPress)

| Vocabulary key | Type | Opzet voor description |
|----------------|------|------------------------|
| `readiness` | group | How far the relying party is in deployment: from demo to production. |
| `technical-demo` | option | Technical demonstration; not yet a real use case. |
| `use-case-demo` | option | Use case demonstration with real-world scenario. |
| `production-pilot` | option | Pilot in production with limited scope. |
| `production` | option | Live in production. |
| `supportedWallet` | group | Wallets that this relying party explicitly supports. List is dynamic; no fixed option terms. |
| `sector` | group | Industry or sector the relying party operates in. |
| `government` | option | Government or public sector. |
| `finance` | option | Financial services. |
| `healthcare` | option | Healthcare. |
| `education` | option | Education. |
| `retail` | option | Retail. |
| `travel` | option | Travel. |
| `hospitality` | option | Hospitality. |
| `employment` | option | Employment / HR. |
| `telecom` | option | Telecommunications. |
| `utilities` | option | Utilities. |
| `insurance` | option | Insurance. |
| `real-estate` | option | Real estate. |
| `automotive` | option | Automotive. |
| `entertainment` | option | Entertainment. |
| `other` | option | Other sector. |
| `country` | group | Country of the relying party. Dynamic list. |
| `credentialFormat` | group | Same as wallet catalog. Reuse same option keys. |
| `presentationProtocol` | group | Same as wallet catalog. Reuse same option keys. |
| `interopProfile` | group | Same as wallet catalog. Reuse same option keys. |

---

## Interop matrix (WordPress)

| Vocabulary key | Type | Opzet voor description |
|----------------|------|------------------------|
| `issuanceProtocol` | group | Protocol used to issue credentials in this profile. |
| `oid4vci` | option | OpenID for Verifiable Credential Issuance. Optional: spec url. |
| `iso18013_5` | option | ISO 18013-5 (device retrieval). Optional: spec url. |
| `remotePresentationProtocol` | group | Protocol used for remote (online) presentation of credentials. |
| `oid4vp` | option | OpenID for Verifiable Presentations. Optional: spec url. |
| `iso18013_7` | option | ISO 18013-7. Optional: spec url. |
| `credentialFormat` | group | Credential data model / format. |
| `vcdm20` | option | W3C Verifiable Credential Data Model 2.0. Optional: spec url. |
| `sdJwtVc` | option | SD-JWT VC format. Optional: spec url. |
| `isoMdoc` | option | ISO mdoc (18013-5). Optional: spec url. |
| `credentialStatus` | group | How credential status (e.g. revocation) is checked. |
| `jwtValidity` | option | JWT validity used for status. |
| `pkiCertValidity` | option | PKI certificate validity. |
| `ietfTokenStatusList` | option | IETF Token Status List. Optional: spec url. |
| `identifiers` | group | Identifier types in this profile. |
| `didWeb` | option | did:web. Optional: spec url. |
| `didWebvh` | option | did:webvh. Optional: spec url. |
| `didJwk` | option | did:jwk. Optional: spec url. |
| `httpsIss` | option | HTTPS ISS (issuer). |
| `openidClientId` | option | OpenID Client ID. |
| `x509Certificate` | option | X.509 certificate. |
| `signatureScheme` | group | Signature encoding scheme (JOSE vs COSE). |
| `joseJws` | option | JOSE JWS (JSON Web Signature). Optional: spec url. |
| `cose` | option | COSE (CBOR Object Signing and Encryption). Optional: spec url. |
| `signatureAlgorithm` | group | Cryptographic algorithm used for signatures. |
| `ecdsaEs256` | option | ECDSA with P-256 (ES256). Optional: spec url. |

---

**Gebruik bij invullen**: vervang "[1 sentence + optional url]" door de feitelijke Engelse zin en voeg `url` toe waar een spec beschikbaar is.

---

## ARF / EUDI ecosystem terms (glossary + assistant)

Added in vocabulary `v1.3.0`. These terms are not all bound to a single filter
facet; they exist so the `[i]` tooltips and the LLM assistant can explain the
core EUDI Wallet / ARF terminology a visitor encounters. Source: EUDI Wallet
ARF 2.9.0 Annex 1 (Definitions) and the Commission Implementing Regulations.

House style for these terms: **full name as key, abbreviation as alias** (the
alias resolver is case-insensitive, so case/spacing variants are not needed).

| Group | Vocabulary keys (alias) |
|-------|--------------------------|
| Core roles & objects | `Person Identification Data` (PID), `PID Provider`, `Electronic Attestation of Attributes` (EAA), `Qualified Electronic Attestation of Attributes` (QEAA), `Public Sector Body EAA` (PuB-EAA), `Attestation`, `Attestation Provider`, `Wallet Unit`, `Wallet Instance`, `Wallet Solution`, `Wallet Provider`, `Relying Party` (RP) |
| Trust infrastructure | `Trust Anchor`, `Trusted List`, `List of Trusted Entities` (LoTE), `Certificate Authority` (CA), `Access Certificate Authority` (Access CA), `Access Certificate`, `Registrar`, `Authentic Source`, `Intermediary`, `EUDI Wallet Trust Mark` |
| Attestation lifecycle & wallet security | `Wallet Unit Attestation` (WUA), `Wallet Instance Attestation` (WIA), `Key Attestation` (KA), `Wallet Secure Cryptographic Application` (WSCA), `Wallet Secure Cryptographic Device` (WSCD), `Keystore`, `Attestation Rulebook`, `Attestation Type`, `Namespace`, `Attestation Revocation List` (ARL), `Attestation Status List`, `Administrative validity period`, `Technical validity period` |
| Protocols, query languages & APIs | `Digital Credentials Query Language` (DCQL), `Digital Credentials API` (DC API), `Presentation Exchange` (PEX), `Verifiable Credential` (VC), `Verifiable Presentation` (VP), `Credential Offer`, `Decentralized Identifier` (DID), `Verifiable Credentials Data Model` (VCDM), `Key Binding` |
| Privacy & authentication | `Selective Disclosure`, `Embedded Disclosure Policy` (EDP), `Pseudonym`, `Zero-Knowledge Proof` (ZKP), `Attribute`, `Strong User Authentication` (SCA) |
| Regulation & abbreviations | `eIDAS`, `European Digital Identity Regulation` (eIDAS 2), `Implementing Act` (CIR), `Qualified Electronic Signature` (QES), `Qualified Electronic Signature Creation Device` (QSCD), `Electronic Seal`, `Large Scale Pilot` (LSP), `Member State` |

Already present from the certification/governance batch (not re-added):
`Conformity Assessment Body` (CAB), `National Accreditation Body` (NAB),
`Qualified Trust Service Provider` (QTSP), `European Digital Identity Wallet`
(EUDI Wallet), `European Business Wallet` (EUBW).

---

## European Business Wallet (EBW) terms (glossary + assistant)

Added in vocabulary `v1.4.0`. Sources: FIDES Community business wallets page,
COM(2025) 838 EBW proposal, EWC LPID rulebook, EU Business Wallet Initiative,
issuer/credential catalogs (`LPID`, `EBWOID`).

| Group | Vocabulary keys (alias) |
|-------|--------------------------|
| Wallet concepts | `Organizational Wallet` (Organisation Wallet, Business Wallet), updated `European Business Wallet` (+ EBW alias) |
| Organization identity | `Legal Person Identification Data` (LPID), `European Business Wallet Owner Identification Data`, `EBWOID`, `European Unique Identifier` (EUID), `European Digital Directory` (EDD) |
| Roles & delegation | `Economic operator`, `Legal person`, `Mandate`, `Representation rights`, `Power of Attorney` (PoA) |
| Regulation & trust services | `Legal equivalence`, `Core minimum functionalities`, `Qualified Electronic Registered Delivery Service` (QERDS), `Qualified Electronic Seal` (QSeal) |
| Related EU programmes | `WE BUILD` (WeBuild), `APTITUDE`, `Single Digital Gateway` (SDG), `EU Company Certificate`, `Business Registers Interconnection System` (BRIS), `Beneficial Ownership Registers Interconnection System` (BORIS) |

Deferred (not added): architecture/interaction terms (Trust Framework, B2B/B2G,
Data Plane, etc.) and other policy terms (Digital Package, Payment Authenticator,
Verified Employee Credential).

---

## UNTP terms (glossary + assistant)

Added in vocabulary `v1.5.0`. High-priority UNTP terms only; UNVTD trade documents
and other medium-priority items deferred. Source: [UNTP v0.7.0 specifications](https://untp.unece.org/docs/specification/).

| Group | Vocabulary keys (alias) |
|-------|--------------------------|
| Protocol & authority | `UN Transparency Protocol` (UNTP), `UN/CEFACT` (UNECE) |
| Credential types | `Digital Product Passport` (DPP), `Digital Conformity Credential` (DCC), `Digital Traceability Event` (DTE), `Digital Facility Record` (DFR), `Digital Identity Anchor` (DIA) |
| Foundational specs | `Verifiable Credentials Profile` (VCP), `Decentralised Access Control` (DAC), `UNTP Core Vocabulary`, `Identity Resolver` (IDR), `Conformity Vocabulary Catalog` (CVC) |
| Domain classes | `Conformity Attestation`, `Performance Claim`, `Criterion`, `Facility`, `Party`, `Conformity Topic`, `Conformity Scheme`, `Conformity Profile`, `Endorsement`, `Registered Identity` (+ existing `Conformity Assessment` extended for UNTP) |
| Traceability events | `Lifecycle Event`, `Make Event`, `Move Event`, `Modify Event` |

**Attestation disambiguation:** EUDI `Attestation` (EAA/QEAA) and UNTP

---

## ETSI / ESI standards (glossary + assistant)

Added in vocabulary `v1.6.0`. ETSI Electronic Signatures and Infrastructures
(ESI) specs referenced in the EUDI Wallet essential standards list and ARF
bibliography. Source: [EUDI ARF 2.9.0 Essential STS](https://eudi.dev/2.9.0/technical-specifications/essential-standards-and-technical-specifications/).

House style unchanged: **concept name as key, ETSI document number as alias**.

| Group | Vocabulary keys (alias) |
|-------|--------------------------|
| Umbrella | `Electronic Signatures and Infrastructures` (ESI, ETSI ESI) |
| EAA/PID & RP | `EAA and PID Profiles` (ETSI TS 119 472, parts 1–3), `Relying Party Attributes` (ETSI TS 119 475) |
| Certificates & trust | `EUDI Certificate Profiles` (ETSI TS 119 412-6), `RP Access Certificate Policy` (ETSI TS 119 411-8); existing `Trusted List` (+ TS 119 612), `List of Trusted Entities` (+ TS 119 602), `Access Certificate` (description cross-ref) |
| Remote signing | `Remote Signature Protocols` (ETSI TS 119 432, CSC API) |
| AdES formats | `PAdES` (EN 319 142-1), `JAdES` (TS 119 182-1), `XAdES` (EN 319 132-1) |

Deferred (medium priority): TS 119 431-1/2 (remote QSCD/AdES components),
TS 119 471 (EAA provider policy), TS 119 461 (identity proofing), EN 319 401
(general TSP policy), CAdES, ASiC.
`Conformity Attestation` are separate keys with cross-references in their
descriptions; no shared alias on the bare word "attestation".

---

## EU attestation credentials (glossary + assistant)

Added in vocabulary `v1.7.0`. Standardized EUDI Wallet credential types from the
European Commission catalog and Large Scale Pilot schemas. Source:
[fides-credential-catalog EU community catalog](https://github.com/FIDEScommunity/fides-credential-catalog/tree/main/community-catalogs/eu).

House style unchanged: **credential name as key, abbreviation as alias**. Format
variants (SD-JWT VC vs MSO mdoc) are not separate keys.

| Group | Vocabulary keys (alias) |
|-------|--------------------------|
| Umbrella | `EU Attestation Catalog` (EUDI attestation catalog, Commission attestation types) |
| High priority | `European Health Insurance Card` (EHIC), `Portable Document A1` (PDA1, ESSPASS PDA1), `Certificate of Residence` (CoR), `Power of Representation` (PoR), `Health ID` (HIID), `European Diploma` (Diploma, Learning Credential), `Photo ID` (PhotoID), `Age Verification Credential` (Proof of Age) |
| Medium priority | `Portable Document A2` (PDA2), `European Social Security Pass` (ESSPASS), `IBAN Attestation`, `Tax Number Attestation`, `Tax Residency Attestation`, `MSISDN Attestation`, `Employee ID Credential`, `Seafarer Credential` |

**Disambiguation:** `Power of Representation` (PoR) is an EUDI attestation;
`Power of Attorney` (PoA) and `Mandate` are European Business Wallet delegation
terms. `Health ID` (HIID) is the EU health identifier credential; national
registry attestations (for example Dutch BRI/BRP) are out of scope for this batch.

Deferred: EWC pilot-only credentials (vReceipt, loyalty, ferry boarding pass);
deferred issuance patterns; national/FIDES-specific attestations.

---

## OpenID4VC & standards depth (glossary + assistant)

Added in vocabulary `v1.8.0` (batch B). Protocol and securing-spec terms for
assistant questions about how OpenID4VC, SD-JWT, and related standards work.
Sources: OpenID4VCI/VP 1.0, IETF SD-JWT drafts, W3C VC 2.0 securing specs,
EUDI ARF essential STS.

| Group | Vocabulary keys (alias) |
|-------|--------------------------|
| OpenID stack | `OpenID Connect` (OIDC), `OAuth 2.0` (OAuth), existing `OpenID4VCI`, `OpenID4VP` |
| SD-JWT & identifiers | `Selective Disclosure JWT` (SD-JWT); existing `SD-JWT-VC` (SD-JWT alias moved); `Verifiable Credential Type` (vct), `Mobile Document Type` (docType) |
| Issuance & presentation flows | `Deferred Credential Issuance`, `Pre-authorized Code`, `Transaction Code`; existing `Presentation Exchange` (includes Presentation Definition alias) |
| ISO mobile docs | `ISO 18013-7` (remote mDL), `ISO/IEC 23220` |
| W3C securing | `VC-JOSE-COSE`, `Verifiable Credential Data Integrity` |
| Identity & discovery | `OpenID Identity Assurance` (eKYC), `Credential Issuer Metadata` |
| Authentication | `Web Authentication` (WebAuthn), `Client to Authenticator Protocol` (CTAP) |
| Status | existing `ietfTokenStatusList` (+ Token Status List alias) |

---

## Gaia-X & data spaces (glossary + assistant)

Added in vocabulary `v1.8.0` (batch C). Gaia-X trust and credential concepts
from the [Gaia-X credential catalog](https://github.com/FIDEScommunity/fides-credential-catalog/tree/main/community-catalogs/gx).
Existing ecosystem filter `gaia_x` retained; glossary term `Gaia-X` added separately.

| Group | Vocabulary keys (alias) |
|-------|--------------------------|
| Trust & federation | `Gaia-X`, `Gaia-X Trust Framework`, `Gaia-X Federation Services` (GXFS), `Data Space` |
| Credentials (grouped) | `Gaia-X Compliance Credential`, `Gaia-X Participant Credentials`, `Gaia-X Resource Credentials` |

Deferred: Self-Description, Digital Clearing House, SHACL shape details.
National/FIDES-specific attestations remain out of scope.

---

## Community ecosystem catalogs (glossary + assistant)

Added in vocabulary `v1.9.0` (batch D: D1, D2, D3, D4, D7). Terms from community
credential catalogs and organization-catalog trust frameworks. FIDES NL-specific
attestations and UNVTD trade documents remain out of scope.

### D1 — LSP governance & swiyu

| Group | Vocabulary keys (alias) |
|-------|--------------------------|
| LSP & profiles | `European Wallet Consortium` (EWC), `POTENTIAL` (POTENTIAL LSP), existing `EWC v3`, new `swiyu v0` (Swiyu beta) |
| Swiss e-ID | `Beta-ID`, ecosystem filter `swiyu` (Swiss e-ID) |

### D2 — vLEI / GLEIF

| Group | Vocabulary keys (alias) |
|-------|--------------------------|
| Trust & identity | `verifiable LEI` (vLEI), `Global Legal Entity Identifier Foundation` (GLEIF), `Legal Entity Identifier` (LEI), `Qualified vLEI Issuer` (QVI) |
| Credentials | `vLEI Legal Entity Credential`, `Official Organizational Role` (OOR), `Engagement Context Role` (ECR) |
| Ecosystem | filter `vlei`; existing `acdc` description extended for vLEI |

### D3 — Mobility & travel

| Vocabulary keys (alias) |
|--------------------------|
| `IATA Contactless Travel`, `Boarding Pass Credential`, `Booking Order Credential`, `Mobile Driving Licence Credential` (ISO mDL), `Vehicle Registration Certificate` (mVRC), `Reservation Credential` |

EWC pilot-only travel credentials (ferry boarding pass, vReceipt) deferred.

### D4 — India Stack & Open Badges

| Vocabulary keys (alias) |
|--------------------------|
| `Aadhaar`, `Unique Identification Authority of India` (UIDAI), `Open Badges 3.0`, `Comprehensive Learner Record` (CLR) |

Existing filters `india_stack` and `open_badges` cross-reference these terms.

### D7 — Trust frameworks (org catalog)

| Vocabulary keys (alias) |
|--------------------------|
| `Pan-Canadian Trust Framework` (PCTF), `Digital Identification and Authentication Council of Canada` (DIACC), `Peppol` |

Deferred from batch D: Findynet (D5), UNVTD trade documents (D6).
