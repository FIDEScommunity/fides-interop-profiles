=== FIDES Interop Profile Matrix ===
Contributors: fideslabs
Tags: fides, interoperability, profiles, comparison, matrix, diip, haip
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.0.0
License: Apache-2.0
License URI: https://www.apache.org/licenses/LICENSE-2.0

Interactive matrix comparison of interoperability profiles (DIIP, HAIP, EWC, Swiyu).

== Description ==

The FIDES Interop Profile Matrix plugin provides an interactive comparison matrix for interoperability profiles used in the digital identity ecosystem.

**Features:**

* Side-by-side comparison of multiple interop profiles
* Desktop: Full matrix view with sticky columns
* Mobile: Tab-based responsive view
* Visual indicators for capability support
* Tooltips for additional information
* FIDES community theme integration

**Supported Profiles:**

* DIIP (Digital Identity Interoperability Profile)
* HAIP (High Assurance Interoperability Profile)
* EWC (European Wallet Consortium)
* Swiyu (Swiyu Interoperability Profile)

Data is automatically fetched from the FIDES GitHub repository and cached locally for optimal performance.

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/fides-interop-matrix/`
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Use the shortcode `[fides_interop_matrix]` on any page

== Frequently Asked Questions ==

= How do I display the matrix? =

Simply add the shortcode `[fides_interop_matrix]` to any page or post.

= Can I filter which profiles are shown? =

Yes, use the `profiles` attribute:
`[fides_interop_matrix profiles="diip-v5,haip-v1"]`

= Can I change the theme? =

Yes, use the `theme` attribute with values: fides, light, or dark.
`[fides_interop_matrix theme="dark"]`

= Where does the data come from? =

Profile data is automatically loaded from the FIDES GitHub repository at:
https://github.com/FIDEScommunity/interop-profiles

= Is the data cached? =

Yes, the plugin includes a local fallback for optimal performance and reliability.

== Screenshots ==

1. Desktop matrix view with side-by-side comparison
2. Mobile tab-based view
3. Capability detail with tooltip

== Changelog ==

= 1.0.0 =
* Initial release
* Desktop matrix view with sticky columns
* Mobile responsive tab view
* Support for DIIP, HAIP, EWC, Swiyu profiles
* Visual indicators (✓, ✗, ⚠)
* Tooltip support for notes

== Upgrade Notice ==

= 1.0.0 =
Initial release of the FIDES Interop Profile Matrix plugin.

== About FIDES ==

FIDES Labs BV develops open standards and tools for digital identity interoperability.

Website: https://fides.community
GitHub: https://github.com/FIDEScommunity
