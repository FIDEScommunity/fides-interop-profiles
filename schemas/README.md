# Interop Profile JSON Schema

This schema defines the structure for interoperability profile definitions.

## Schema Location

- **Schema**: `interop-profile.schema.json`
- **Schema ID**: `https://fides.community/schemas/interop-profiles/v2/interop-profile.schema.json`
- **Schema Version**: v2

## Schema v2 Overview

v2 aligns with the FIDES Interop Profile category set, simplifying and reorganizing capability groups:
- Issuance Protocol
- Remote Presentation Protocol (renamed from Presentation Protocol)
- Credential Format
- Credential Status (simplified)
- Entity Identification (merged from Issuer Identifiers + Verifier Authentication)
- Key Binding (simplified from Holder Binding)
- Signature Scheme (simplified)
- Signature Algorithm (singular, simplified)

## Structure

### Profile Metadata

```json
{
  "profile": {
    "id": "diip-v5",           // Slug format: abbreviation-version
    "name": "DIIP",             // Display name
    "shortName": "DIIP v5",     // Short display name for matrix
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

All capability groups follow the same pattern:

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

## Capability Groups

### 1. Issuance Protocol

- `oid4vci` - OpenID for Verifiable Credential Issuance (has `version` field)
- `iso18013_5` - ISO/IEC 18013-5 issuance protocol

### 2. Remote Presentation Protocol

- `oid4vp` - OpenID for Verifiable Presentations (has `version` field)
- `iso18013_7` - ISO/IEC 18013-7 presentation protocol

### 3. Credential Format

- `vcdm20` - W3C VCDM 2.0 format
- `sdJwtVc` - SD-JWT VC format
- `isoMdoc` - ISO mdoc format

### 4. Credential Status

- `jwtValidity` - JWT validity period (exp/nbf claims)
- `pkiCertValidity` - PKI certificate validity
- `ietfTokenStatusList` - IETF Token Status List

### 5. Entity Identification

Unified identifier support for issuers, holders, and verifiers:

- `didWeb` - did:web method
- `didWebvh` - did:webvh method
- `didJwk` - did:jwk method
- `httpsIss` - HTTPS issuer identifiers
- `openidClientId` - OpenID client_id authentication
- `x509Certificate` - X.509 certificate-based identification

### 6. Key Binding

Credential holder binding mechanisms:

- `keyBindingPop` - Key binding via proof-of-possession (e.g., cnf claim)
- `hardwareDeviceBinding` - Hardware device-bound credentials

### 7. Signature Scheme

- `joseJws` - JOSE JWS (JSON Web Signature)
- `cose` - COSE (CBOR Object Signing and Encryption)

### 8. Signature Algorithm

- `ecdsaEs256` - ECDSA with P-256 and SHA-256

## Example

```json
{
  "schemaVersion": "v2",
  "profile": {
    "id": "diip-v5",
    "name": "Digital Identity Interoperability Profile",
    "shortName": "DIIP v5",
    "version": "v5",
    "status": "stable",
    "specUrl": "https://example.com/diip-v5",
    "publisher": "FIDES.community"
  },
  "capabilities": {
    "issuanceProtocol": {
      "oid4vci": {
        "supported": true,
        "version": "v1.0"
      },
      "iso18013_5": {
        "supported": false
      }
    },
    "remotePresentationProtocol": {
      "oid4vp": {
        "supported": true,
        "version": "v1.0"
      },
      "iso18013_7": {
        "supported": false
      }
    },
    "credentialFormat": {
      "vcdm20": {
        "supported": true
      },
      "sdJwtVc": {
        "supported": true
      },
      "isoMdoc": {
        "supported": false
      }
    },
    "credentialStatus": {
      "jwtValidity": {
        "supported": true,
        "note": "exp, nbf"
      },
      "pkiCertValidity": {
        "supported": false
      },
      "ietfTokenStatusList": {
        "supported": true
      }
    },
    "identifiers": {
      "didWeb": {
        "supported": true
      },
      "didWebvh": {
        "supported": false
      },
      "didJwk": {
        "supported": false
      },
      "httpsIss": {
        "supported": false
      },
      "openidClientId": {
        "supported": false
      },
      "x509Certificate": {
        "supported": false
      }
    },
    "keyBinding": {
      "keyBindingPop": {
        "supported": false
      },
      "hardwareDeviceBinding": {
        "supported": false
      }
    },
    "signatureScheme": {
      "joseJws": {
        "supported": true
      },
      "cose": {
        "supported": false
      }
    },
    "signatureAlgorithm": {
      "ecdsaEs256": {
        "supported": true,
        "note": "ES256 baseline"
      }
    }
  }
}
```

## Validation

Use AJV or another JSON Schema validator to validate profiles:

```bash
npm run validate
```

## Matrix Display

The matrix view displays:

- **✓** (green) when `supported: true`
- **✗** (red) when `supported: false`
- **⚠** (orange) when a `note` field is present
- Version info is shown for protocols with `version` field

## Migration from v1 to v2

Key changes from v1:

- **presentationProtocol** → **remotePresentationProtocol**
- **credentialIssuerIdentifiers** + **verifierAuthentication** → **identifiers** (merged)
- **credentialHolderBinding** → **keyBinding** (simplified)
- **signatureAlgorithms** → **signatureAlgorithm** (singular)
- Removed capability groups with minimal usage (w3cStatusList2021, w3cDataIntegrity, etc.)
- Added ISO 18013-5 and ISO 18013-7 protocol support
