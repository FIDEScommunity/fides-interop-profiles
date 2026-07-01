=== FIDES Vocabulary Glossary ===
Contributors: fidescommunity
Tags: fides, glossary, vocabulary, verifiable credentials, eudi
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.1.1
License: Apache-2.0

Browse the FIDES community glossary with search, A–Z navigation, detail modals, and SEO-friendly term pages.

== Description ==

Shortcode: `[fides_vocabulary_glossary]`

Data source: `glossary-aggregated.json` in the fides-interop-profiles repository (derived from `vocabulary.json`).

Requires **FIDES Community Tools Tiles ≥ 1.6.3** for SSR/SEO (master switch `fides_catalog_ssr_enabled`).

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/fides-vocabulary-glossary/`
2. Activate the plugin
3. Add `[fides_vocabulary_glossary]` to a page (recommended path: `/glossary/`)
4. Enable catalog SSR in Settings → FIDES Catalog SEO

== Changelog ==

= 1.1.1 =
* Fix modal “Sign in to like” link: use OID4VP login URL (same as other FIDES catalogs) with return_to on the term deeplink.

= 1.1.0 =
* Submit and update forms (`[fides_vocabulary_submit_form]`, `[fides_vocabulary_update_form]`) via shared submission core; admin-moderated, no ownership.
* Modal polish: hide empty aliases/source, word-break on URLs, mobile title clamp, suggest-update pencil for signed-in users.

= 1.0.0 =
* Initial release: alphabetical glossary list, search, shared modal UI, likes, deep links (`?term=`), SSR listing + per-term SEO/sitemap via `fidescatalogvocabulary`.
