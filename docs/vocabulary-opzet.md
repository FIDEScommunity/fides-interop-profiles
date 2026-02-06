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
