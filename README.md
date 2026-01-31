# FIDES Interoperability Profile Matrix

Een interactieve matrix-weergave voor het vergelijken van interoperability profiles zoals DIIP, HAIP, EWC, en Swiyu.

## Overzicht

Deze repository bevat:
- **JSON Schema** voor interop profile definities
- **Profile Data** in machine-readable formaat
- **Crawler Script** voor aggregatie van profile data
- **WordPress Plugin** voor matrix-weergave op websites

## Project Structuur

```
interop-profiles/
├── profiles/                          # Profile JSON files
│   ├── interop-profile.diip-v4.json
│   ├── interop-profile.diip-v5.json
│   └── interop-profile.haip-v1.json
├── data/
│   └── aggregated.json                # Gegenereerd door crawler
├── schemas/
│   └── interop-profile.schema.json    # JSON Schema definitie
├── src/
│   └── crawler/
│       └── index.ts                   # Data aggregatie script
└── wordpress-plugin/
    └── fides-interop-matrix/          # WordPress plugin
```

## Gebruik

### 1. Profile Data Toevoegen

Plaats een nieuw interop profile in de `profiles/` folder:

```bash
profiles/interop-profile.<profile-id>.json
```

**Naming convention**: `interop-profile.<afkorting>-<versie>.json`

Voorbeelden:
- `interop-profile.diip-v4.json`
- `interop-profile.haip-v1.json`
- `interop-profile.ewc-v3.json`

### 2. Data Aggregeren

```bash
npm install
npm run crawl
```

Dit genereert `data/aggregated.json` met alle profiles.

### 3. WordPress Plugin Installeren

1. Kopieer `wordpress-plugin/fides-interop-matrix/` naar je WordPress `wp-content/plugins/` folder
2. Activeer de plugin in WordPress Admin
3. Gebruik de shortcode op een pagina:

```
[fides_interop_matrix]
```

**Shortcode Opties**:
```
[fides_interop_matrix profiles="diip-v5,haip-v1" theme="fides"]
```

## Schema Validatie

Alle profiles worden automatisch gevalideerd tegen het JSON Schema:

```bash
npm run validate
```

## Matrix Features

- **Desktop**: Side-by-side comparison matrix met sticky columns
- **Mobile**: Tab-based view met swipe gestures
- **Visual Indicators**:
  - ✓ (groen) = Supported
  - ✗ (grijs) = Not supported
  - ⚠ (oranje) = Supported met note (hover voor details)
- **Responsive**: Werkt op desktop, tablet en mobile
- **FIDES Theme**: Consistent met FIDES community branding

## Profile ID Format

Profile IDs volgen het format: `<afkorting>-<versie>`

Voorbeelden:
- `diip-v4`, `diip-v5`
- `haip-v1`
- `ewc-v3`
- `swiyu-v1`

## Design Decisions

Dit project hergebruikt design decisions van de [FIDES Wallet Catalog](https://github.com/FIDEScommunity/fides-wallet-catalog):

- Schema-driven development
- Centralized data management
- Version-based cache busting
- GitHub CDN met local fallback
- Mobile-first responsive design
- FIDES community theme

## Licentie

Apache-2.0 © 2026 FIDES Labs BV

## Contact

**FIDES Labs BV**
- Website: https://fides.community
- GitHub: https://github.com/FIDEScommunity
