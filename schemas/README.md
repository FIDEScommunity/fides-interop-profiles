# Interop Profile JSON Schema

Dit schema definieert de structuur voor interoperability profile definities.

## Schema Locatie

- **Schema**: `interop-profile.schema.json`
- **Schema ID**: `https://fides.community/schemas/interop-profiles/v1/interop-profile.schema.json`
- **Schema Version**: v1

## Structuur

### Profile Metadata

```json
{
  "profile": {
    "id": "diip-v5",           // Slug format: afkorting-versie
    "name": "DIIP",             // Display name
    "version": "v5",            // Version string
    "status": "stable",         // stable | draft | deprecated
    "specUrl": "https://...",   // Link to specification
    "publisher": "JoinUp",      // Optional: Organization
    "updated": "2026-01-30",    // Optional: Last update date (ISO 8601)
    "notes": "..."              // Optional: Additional notes
  }
}
```

### Capabilities

Alle capability groepen volgen hetzelfde patroon:

```json
{
  "capabilities": {
    "groupName": {
      "capabilityName": {
        "supported": boolean,      // REQUIRED
        "note": "string",          // OPTIONAL
        "version": "string"        // OPTIONAL (for versioned protocols)
      }
    }
  }
}
```

## Capability Groepen

### 1. Issuance Protocol

- `oid4vci` - OpenID for Verifiable Credential Issuance (heeft `version` field)
- `other` - Andere issuance protocols

### 2. Presentation Protocol

- `oid4vp` - OpenID for Verifiable Presentations (heeft `version` field)
- `other` - Andere presentation protocols

### 3. Credential Format

- `sdJwtVc` - SD-JWT VC format
- `isoMdoc` - ISO 18013-5 mDL format
- `vcdm20` - W3C VCDM 2.0 format

### 4. Credential Issuer Identifiers

- `httpsIss` - HTTPS issuer identifiers
- `x509DocumentSigner` - X.509 certificate-based
- `didWeb` - did:web method
- `didWebvh` - did:webvh method
- `didJwk` - did:jwk method
- `other` - Andere identifier methods

### 5. Credential Holder Binding

- `cnfKeyBinding` - Confirmation key binding (cnf claim)
- `deviceBound` - Device-bound credentials
- `didWebOrganisations` - did:web voor organisaties
- `didJwkPersons` - did:jwk voor personen
- `didWebvh` - did:webvh binding
- `other` - Andere binding methods

### 6. Verifier Authentication

- `openidClientIdAuth` - OpenID client_id authentication
- `x509ReaderCertificate` - X.509 reader certificates
- `didWeb` - did:web method
- `didWebvh` - did:webvh method
- `didJwk` - did:jwk method
- `other` - Andere auth methods

### 7. Credential Status

- `jwtValidity` - JWT validity period (exp/nbf claims)
- `pkiCertValidity` - PKI certificate validity
- `ietfTokenStatusList` - IETF Token Status List
- `w3cStatusList2021` - W3C Status List 2021
- `w3cBitstringStatusList` - W3C Bitstring Status List
- `other` - Andere status mechanisms

### 8. Signature Scheme

- `joseJws` - JOSE JWS (JSON Web Signature)
- `cose` - COSE (CBOR Object Signing and Encryption)
- `w3cDataIntegrity` - W3C Data Integrity
- `other` - Andere signature schemes

### 9. Signature Algorithms

- `ecdsaEs256` - ECDSA with P-256 and SHA-256
- `eddsa` - EdDSA (Ed25519)
- `rsa` - RSA signatures
- `pqOther` - Post-quantum or other algorithms

## Voorbeeld

```json
{
  "schemaVersion": "v1",
  "profile": {
    "id": "diip-v5",
    "name": "DIIP",
    "version": "v5",
    "status": "stable",
    "specUrl": "https://example.com/diip-v5",
    "publisher": "JoinUp"
  },
  "capabilities": {
    "issuanceProtocol": {
      "oid4vci": {
        "supported": true,
        "version": "draft-13"
      },
      "other": {
        "supported": false
      }
    },
    "credentialFormat": {
      "sdJwtVc": {
        "supported": true
      },
      "isoMdoc": {
        "supported": true,
        "note": "Limited support for specific document types"
      },
      "vcdm20": {
        "supported": false
      }
    }
    // ... alle andere capability groepen
  }
}
```

## Validatie

Gebruik AJV of een andere JSON Schema validator om profiles te valideren:

```bash
npm run validate
```

## Matrix Display

De matrix view toont:

- **✓** (groen) wanneer `supported: true`
- **✗** (grijs) wanneer `supported: false`
- **⚠** (oranje) wanneer er een `note` field aanwezig is
- Versie info wordt getoond voor protocols met `version` field
