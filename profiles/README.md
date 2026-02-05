# Interop Profiles

This folder contains all interoperability profile definitions in JSON format.

## Naming Convention

Files must follow this naming convention:

```
interop-profile.<profile-id>.json
```

Where `<profile-id>` has the format: `<abbreviation>-<version>`

## Examples

- `interop-profile.diip-v4.json` - DIIP version 4
- `interop-profile.diip-v5.json` - DIIP version 5
- `interop-profile.haip-v1.json` - HAIP version 1
- `interop-profile.ewc-v3.json` - EWC version 3
- `interop-profile.swiyu-v0.json` - Swiyu version 0

## Profile ID Format

The `id` field in the JSON must match the `<profile-id>` in the filename:

```json
{
  "schemaVersion": "v2",
  "profile": {
    "id": "diip-v5",
    "name": "Digital Identity Interoperability Profile",
    "shortName": "DIIP v5",
    "version": "v5",
    ...
  }
}
```

## Schema Validation

All profiles are automatically validated against the JSON Schema in `schemas/interop-profile.schema.json`.

Validate manually with:

```bash
npm run validate
```

## Adding a New Profile

1. Copy the template:
   ```bash
   cp profiles/EXAMPLE.interop-profile.template.json profiles/interop-profile.<your-id>.json
   ```

2. Fill in all required fields according to the v2 schema

3. Run validation:
   ```bash
   npm run validate
   ```

4. Generate aggregated data:
   ```bash
   npm run build
   ```

## Required Fields (v2)

See `schemas/interop-profile.schema.json` for the complete schema definition. The main capability groups in v2:

- `issuanceProtocol`: Credential issuance protocols (OID4VCI, ISO 18013-5)
- `remotePresentationProtocol`: Credential presentation protocols (OID4VP, ISO 18013-7)
- `credentialFormat`: Supported credential formats (VCDM 2.0, SD-JWT VC, ISO mdoc)
- `credentialStatus`: Status checking mechanisms
- `identifiers`: Identifier methods (DIDs, HTTPS ISS, X.509, OpenID Client ID)
- `keyBinding`: Holder key binding mechanisms
- `signatureScheme`: Digital signature schemes (JOSE JWS, COSE)
- `signatureAlgorithm`: Cryptographic algorithms (ECDSA ES256)

## Support Status

- `supported: true` - The capability is supported
- `supported: false` - The capability is not supported
- `note: "..."` - Additional information about support (optional)
- `version: "..."` - Specific version for protocols like OID4VCI/OID4VP (optional)

## v2 Schema Changes

v2 simplifies and reorganizes capability groups to align with FIDES Interop Profile categories:

**Renamed:**
- `presentationProtocol` → `remotePresentationProtocol`
- `signatureAlgorithms` → `signatureAlgorithm` (singular)

**Merged:**
- `credentialIssuerIdentifiers` + `verifierAuthentication` → `identifiers`

**Simplified:**
- `credentialHolderBinding` → `keyBinding` (2 fields instead of 6)
- `credentialStatus` (3 fields instead of 6)
- `signatureScheme` (2 fields instead of 4)
- `signatureAlgorithm` (1 field instead of 4)

**Added:**
- `iso18013_5` and `iso18013_7` protocol support
