=== FIDES Vocabulary Glossary ===
Contributors: fidescommunity
Tags: fides, glossary, vocabulary, verifiable credentials, eudi
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.1.12
License: Apache-2.0

Browse the FIDES community glossary with search, A–Z navigation, detail modals, and SEO-friendly term pages.

== Description ==

Shortcode: `[fides_vocabulary_glossary]`

Data source: `glossary-aggregated.json` in the fides-interop-profiles repository (derived from `vocabulary.json`).

Requires **FIDES Community Tools Tiles ≥ 1.6.3** for SSR/SEO (master switch `fides_catalog_ssr_enabled`).

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/fides-vocabulary-glossary/`
2. Activate the plugin
3. Add `[fides_vocabulary_glossary]` to a page
4. In Settings → FIDES Glossary, set **Glossary page path** to that page (e.g. `/community-tools/glossary/` or `/glossary/`)
5. Enable catalog SSR in Settings → FIDES Catalog SEO

== Changelog ==

= 1.1.12 =
* Sync shared catalog analytics for uniform wallet and organization detail/outbound events with Matomo outlink deduplication (tiles ≥ 1.13.21).

= 1.1.11 =
* Sync shared modal UI library (tiles ≥ 1.13.18).

= 1.1.10 =
* Sync shared modal UI library (tiles ≥ 1.13.17).

= 1.1.9 =
* Sync shared modal UI library (tiles ≥ 1.13.15).

= 1.1.8 =
* Official listing badge requires explicit catalogTier Pro; curated Community
  can keep full fields via catalogListingDepth (tiles ≥ 1.10.0).

= 1.1.7 =
* After sign-in, Back from the logged-in page reloads a stale guest catalog
  snapshot so the like star sees the session (needs tiles ≥ 1.9.23).

= 1.1.6 =
* Sync shared catalog UI: after magic-link sign-in, Back reloads a cached
  logged-out page so the like star sees the new session.

= 1.1.5 =
* Sync shared catalog UI with 12-hour GitHub outage cache helpers.

= 1.1.4 =
* Settings UI: add Glossary page path (`fides_vocabulary_glossary_page_url`) so sitemap and SEO deeplinks match the real glossary page (avoids 301 from `/glossary/`).

= 1.1.3 =
* Sync shared catalog modal library: fix term modal header share/close button layout (theme styles no longer crush the actions into one block).

= 1.1.2 =
* Fix submit/update form “Sign in to continue” link: use OID4VP login URL with return_to (same as wallet/org submission forms).

= 1.1.1 =
* Fix modal “Sign in to like” link: use OID4VP login URL (same as other FIDES catalogs) with return_to on the term deeplink.

= 1.1.0 =
* Submit and update forms (`[fides_vocabulary_submit_form]`, `[fides_vocabulary_update_form]`) via shared submission core; admin-moderated, no ownership.
* Modal polish: hide empty aliases/source, word-break on URLs, mobile title clamp, suggest-update pencil for signed-in users.

= 1.0.0 =
* Initial release: alphabetical glossary list, search, shared modal UI, likes, deep links (`?term=`), SSR listing + per-term SEO/sitemap via `fidescatalogvocabulary`.
