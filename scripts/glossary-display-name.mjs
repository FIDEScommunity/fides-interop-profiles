/**
 * Derive human-readable glossary display names from vocabulary keys.
 */

/** Explicit overrides where automatic formatting is wrong or domain-specific. */
export const DISPLAY_OVERRIDES = {
  sd_jwt_vc: 'SD-JWT-VC',
  gaia_x: 'Gaia-X',
  iso18013_5: 'ISO 18013-5',
  iso18013_7: 'ISO 18013-7',
  vcdm_1_1: 'VCDM 1.1',
  vcdm_2_0: 'VCDM 2.0',
  vcdm20: 'VCDM 2.0',
  iso_mdl: 'ISO mDL',
  open_badges: 'Open Badges',
  didWeb: 'did:web',
  didWebvh: 'did:webvh',
  didJwk: 'did:jwk',
  didKey: 'did:key',
  didPeer: 'did:peer',
  didEbsi: 'did:ebsi',
  httpsIss: 'HTTPS ISS',
  openidClientId: 'OpenID Client ID',
  joseJws: 'JOSE JWS',
  ecdsaEs256: 'ECDSA ES256',
  secureEnclaveIos: 'Secure Enclave (iOS)',
  strongboxAndroid: 'StrongBox (Android)',
  'mDL/mDoc': 'mDL/mDoc',
  acdc: 'ACDC',
  cose: 'COSE',
  mdoc: 'mdoc',
  x509Certificate: 'X.509 Certificate',
  uncefact: 'UN/CEFACT',
  vlei: 'vLEI',
  eIDAS: 'eIDAS',
  swiyu: 'swiyu',
};

const ACRONYMS = new Set([
  'ai', 'api', 'did', 'jwt', 'vc', 'sd', 'jws', 'jwk', 'jose', 'oid', 'vci', 'vp', 'mdl', 'mdoc',
  'iso', 'ietf', 'pki', 'ecdsa', 'es256', 'ewc', 'arf', 'eudi', 'eu', 'ios', 'hpke', 'qtsp', 'rp',
  'url', 'uri', 'json', 'ld', 'eb', 'si', 'id', 'lsp', 'un', 'untp', 'hsm', 'tee', 'x509', 'oidc',
  'siop', 'haip', 'diip', 'gaia', 'badges', 'iss', 'web', 'vh', 'peer', 'ebsi', 'openid', 'https',
  'jwe', 'jwa', 'acdc', 'cose', 'mdoc',
]);

/**
 * @param {string} key
 * @returns {boolean}
 */
export function isDisplayReady(key) {
  if (DISPLAY_OVERRIDES[key]) return true;
  if (/[\s\-/.:]/.test(key)) return true;
  if (key === 'iOS' || key === 'Android' || key === 'Web') return true;
  // camelCase or snake_case vocabulary keys need formatting.
  if (/^[a-z]+(?:[A-Z][a-z0-9]*)+$/.test(key)) return false;
  if (/_/.test(key)) return false;
  if (/^[a-z0-9]+$/.test(key)) return false;
  // Brand / protocol labels: OpenID4VCI, AnonCreds, SIOPv2.
  if (/^[A-Z]/.test(key)) return true;
  // eIDAS-style embedded acronyms.
  if (/^[a-z]+[A-Z]{2,}[A-Za-z0-9]*$/.test(key)) return true;
  return false;
}

/**
 * @param {string} word
 * @returns {string}
 */
function formatToken(word) {
  if (!word) return '';
  const lower = word.toLowerCase();
  if (lower === 'anoncreds') return 'AnonCreds';
  if (ACRONYMS.has(lower)) {
    if (lower === 'mdoc') return 'mdoc';
    return lower.toUpperCase();
  }
  if (/^v\d+$/i.test(word)) return word.toLowerCase();
  if (/^\d+$/.test(word)) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * @param {string} key Vocabulary term key (canonical identifier in vocabulary.json).
 * @param {string} [explicitTitle] Optional curated title from vocabulary.json.
 * @returns {string}
 */
export function formatDisplayName(key, explicitTitle) {
  const title = typeof explicitTitle === 'string' ? explicitTitle.trim() : '';
  if (title) return title;

  const raw = String(key).trim();
  if (!raw) return '';
  if (DISPLAY_OVERRIDES[raw]) return DISPLAY_OVERRIDES[raw];
  if (isDisplayReady(raw)) return raw;

  const normalized = raw
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\//g, ' / ');

  let out = normalized.split(/\s+/).filter(Boolean).map(formatToken).join(' ');
  out = out.replace(/\b(\d+)\s+(\d+)\b/g, '$1.$2');
  return out.replace(/\s+\/\s+/g, '/');
}

/**
 * @param {string} displayName
 * @returns {string}
 */
export function sortLetter(displayName) {
  const trimmed = String(displayName || '').trim();
  if (!trimmed) return '#';
  const ch = trimmed.charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : '#';
}
