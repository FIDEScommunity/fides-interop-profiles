# Interop Profiles

Deze folder bevat alle interoperability profile definities in JSON formaat.

## Naming Convention

Bestanden moeten de volgende naming convention volgen:

```
interop-profile.<profile-id>.json
```

Waarbij `<profile-id>` het format heeft: `<afkorting>-<versie>`

## Voorbeelden

- `interop-profile.diip-v4.json` - DIIP versie 4
- `interop-profile.diip-v5.json` - DIIP versie 5
- `interop-profile.haip-v1.json` - HAIP versie 1
- `interop-profile.ewc-v3.json` - EWC versie 3
- `interop-profile.swiyu-v1.json` - Swiyu versie 1

## Profile ID Format

Het `id` veld in de JSON moet overeenkomen met de `<profile-id>` in de bestandsnaam:

```json
{
  "profile": {
    "id": "diip-v5",
    "name": "DIIP",
    "version": "v5",
    ...
  }
}
```

## Schema Validatie

Alle profiles worden automatisch gevalideerd tegen het JSON Schema in `schemas/interop-profile.schema.json`.

Valideer handmatig met:

```bash
npm run validate
```

## Nieuw Profile Toevoegen

1. Maak een nieuw bestand met de juiste naming convention
2. Vul alle verplichte velden in volgens het schema
3. Run `npm run validate` om te controleren
4. Run `npm run crawl` om `data/aggregated.json` te updaten

## Verplichte Velden

Zie `schemas/interop-profile.schema.json` voor de volledige schema definitie. De belangrijkste secties:

- `profile`: Metadata (id, name, version, status, specUrl, publisher)
- `capabilities`: Alle capability groepen met `supported` boolean en optionele `note`/`version` velden

## Support Status

- `supported: true` - De capability wordt ondersteund
- `supported: false` - De capability wordt niet ondersteund
- `note: "..."` - Extra informatie over de support (optioneel)
- `version: "..."` - Specifieke versie voor protocols zoals OID4VCI (optioneel)
