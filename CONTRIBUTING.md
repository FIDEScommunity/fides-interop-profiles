# Contributing to FIDES Interop Profiles

Thank you for your interest in contributing to the FIDES Interop Profile Matrix! This document provides guidelines for adding or updating interoperability profiles.

## Adding a New Profile

### 1. Prepare Your Profile Data

Create a new JSON file following this naming convention:

```
profiles/interop-profile.<profile-id>.json
```

**Profile ID Format**: `<abbreviation>-<version>`

Examples:
- `diip-v4` → `interop-profile.diip-v4.json`
- `haip-v1` → `interop-profile.haip-v1.json`
- `ewc-v3` → `interop-profile.ewc-v3.json`

### 2. Use the Template

Copy the example template:

```bash
cp profiles/EXAMPLE.interop-profile.template.json profiles/interop-profile.<your-id>.json
```

### 3. Fill in the Data

#### Profile Metadata

```json
{
  "schemaVersion": "v2",              // Must be "v2"
  "profile": {
    "id": "your-profile-v1",          // Must match filename
    "name": "Your Profile Name",      // Full display name
    "shortName": "Your Profile v1",   // Short display name for matrix
    "version": "v1",                  // Version string
    "status": "stable",               // stable | draft | deprecated
    "specUrl": "https://...",         // Link to specification
    "publisher": "Organization",      // Optional
    "updated": "2026-01-30T12:00:00Z", // Optional (ISO 8601 date-time)
    "notes": "Additional info"        // Optional
  }
}
```

#### Capabilities

For each capability, specify:

```json
{
  "supported": true,              // REQUIRED: boolean
  "version": "draft-13",          // OPTIONAL: for versioned protocols
  "note": "Additional context"    // OPTIONAL: shown as tooltip
}
```

**Visual Indicators**:
- `supported: true` → ✓ (green checkmark)
- `supported: false` → ✗ (grey cross)
- `note: "..."` → ⚠ (orange warning) with tooltip

### 4. Validate Your Profile

```bash
npm run validate
```

Fix any validation errors before proceeding.

### 5. Generate Aggregated Data

```bash
npm run crawl
```

This updates `data/aggregated.json`.

### 6. Test Locally

If you have access to a local WordPress installation:

1. Copy the aggregated data:
   ```bash
   cp data/aggregated.json wordpress-plugin/fides-interop-matrix/assets/
   ```

2. Test the matrix display with your profile

### 7. Submit a Pull Request

1. Create a new branch:
   ```bash
   git checkout -b add-profile-<your-id>
   ```

2. Add your changes:
   ```bash
   git add profiles/interop-profile.<your-id>.json
   git commit -m "feat: add <Your Profile Name> profile"
   ```

3. Push and create a pull request:
   ```bash
   git push origin add-profile-<your-id>
   ```

## Updating an Existing Profile

### 1. Edit the Profile File

Make changes to the existing JSON file in `profiles/`.

### 2. Update the `updated` Field

```json
{
  "profile": {
    ...
    "updated": "2026-01-30T12:00:00Z"
  }
}
```

### 3. Validate and Test

```bash
npm run validate
npm run crawl
```

### 4. Submit a Pull Request

```bash
git checkout -b update-profile-<profile-id>
git add profiles/interop-profile.<profile-id>.json
git commit -m "chore: update <Profile Name> profile"
git push origin update-profile-<profile-id>
```

## Capability Reference (Schema v2)

### Required Capability Groups

Every profile must include all 8 capability groups:

1. **issuanceProtocol**
   - `oid4vci` (has `version` field)
   - `iso18013_5`

2. **remotePresentationProtocol**
   - `oid4vp` (has `version` field)
   - `iso18013_7`

3. **credentialFormat**
   - `vcdm20`
   - `sdJwtVc`
   - `isoMdoc`

4. **credentialStatus**
   - `jwtValidity`
   - `pkiCertValidity`
   - `ietfTokenStatusList`

5. **identifiers**
   - `didWeb`
   - `didWebvh`
   - `didJwk`
   - `httpsIss`
   - `openidClientId`
   - `x509Certificate`

6. **keyBinding**
   - `keyBindingPop`
   - `hardwareDeviceBinding`

7. **signatureScheme**
   - `joseJws`
   - `cose`

8. **signatureAlgorithm** (singular)
   - `ecdsaEs256`

## Best Practices

### Profile IDs

- Use lowercase only
- Separate abbreviation and version with hyphen: `diip-v5`
- Keep it short and recognizable
- Use the official abbreviation if available

### Version Strings

- Use consistent format: `v1`, `v2`, `v1.0`, etc.
- Match the official specification versioning
- For protocols like OID4VCI, use formats like `draft-13`, `v1.0`

### Notes

- Keep notes concise (1-2 sentences)
- Explain limitations, conditions, or context
- Don't repeat information obvious from the capability name
- Use notes to clarify "partial support" scenarios

Examples:
- ✅ "Limited to specific document types (mDL, EUDIW)"
- ✅ "Planned for v2 release"
- ❌ "This is supported" (obvious from `supported: true`)
- ❌ "OID4VCI is used for issuance" (obvious from context)

### Status Values

- `stable` - Production-ready, widely implemented
- `draft` - Work in progress, not finalized
- `deprecated` - Superseded by newer version

## Code of Conduct

- Be respectful and professional
- Focus on technical accuracy
- Provide citations for claims when possible
- Accept constructive feedback gracefully

## Questions?

- Open a GitHub Issue for questions
- Contact FIDES Labs: https://fides.community

## License

By contributing, you agree that your contributions will be licensed under the Apache-2.0 license.
