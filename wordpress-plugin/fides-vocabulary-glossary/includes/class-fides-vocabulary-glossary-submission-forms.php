<?php
/**
 * Public submission forms (propose new term / suggest update).
 *
 * No ownership checks — all logged-in users may submit; admins publish.
 *
 * @package fides-vocabulary-glossary
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('Fides_Vocabulary_Glossary_Submission_Forms')) {

    class Fides_Vocabulary_Glossary_Submission_Forms {

        const VERSION = '1.0.0';
        const DEFAULT_SUBMIT_PATH = '/glossary-submit/';
        const DEFAULT_UPDATE_PATH = '/glossary-update/';

        /** @var array<string, string> */
        const FIELD_HELP = array(
            'termSearch'  => 'Search by display name, key, or alias, then select the term to update.',
            'key'         => 'Canonical vocabulary key as stored in vocabulary.json (e.g. agentic_ai or Large Scale Pilot).',
            'title'       => 'Optional display title shown in the glossary. Leave empty to auto-format from the key.',
            'description' => 'Short explanation of the term (1–2 sentences).',
            'url'         => 'Optional link to the authoritative source (spec, policy page, catalog schema).',
            'aliases'     => 'Comma-separated synonyms or abbreviations (e.g. LSP, Large Scale Pilot).',
            'contactEmail' => 'Taken from your FIDES account; used for submission review only.',
        );

        public static function bootstrap(): void {
            add_action('wp_enqueue_scripts', array(__CLASS__, 'register_assets'));
            add_shortcode('fides_vocabulary_submit_form', array(__CLASS__, 'render_submit_shortcode'));
            add_shortcode('fides_vocabulary_update_form', array(__CLASS__, 'render_update_shortcode'));
        }

        public static function register_assets(): void {
            $base = plugin_dir_path(dirname(__FILE__));
            $url  = plugin_dir_url(dirname(__FILE__));

            $css_path = $base . 'assets/vocabulary-form.css';
            $js_path  = $base . 'assets/vocabulary-form.js';
            $css_ver  = file_exists($css_path) ? (string) filemtime($css_path) : self::VERSION;
            $js_ver   = file_exists($js_path) ? (string) filemtime($js_path) : self::VERSION;

            wp_register_style('fides-vocabulary-form', $url . 'assets/vocabulary-form.css', array(), $css_ver);
            wp_register_script('fides-vocabulary-form', $url . 'assets/vocabulary-form.js', array(), $js_ver, true);
        }

        /**
         * @param array<string, mixed> $atts Shortcode attributes.
         */
        public static function render_submit_shortcode($atts = array()): string {
            return self::render_form_shortcode('create', $atts);
        }

        /**
         * @param array<string, mixed> $atts Shortcode attributes.
         */
        public static function render_update_shortcode($atts = array()): string {
            $atts = shortcode_atts(
                array('term' => ''),
                $atts,
                'fides_vocabulary_update_form'
            );
            $preselect = sanitize_text_field((string) $atts['term']);
            if ($preselect === '' && isset($_GET['term'])) {
                // phpcs:ignore WordPress.Security.NonceVerification.Recommended
                $preselect = sanitize_text_field((string) wp_unslash($_GET['term']));
            }
            return self::render_form_shortcode('update', array('preselectTermId' => $preselect));
        }

        /**
         * @param string               $mode create|update.
         * @param array<string, mixed> $extra Extra config.
         */
        private static function render_form_shortcode($mode, array $extra = array()): string {
            if (! class_exists('Fides_Catalog_Submission_Registry')
                || ! Fides_Catalog_Submission_Registry::exists('vocabulary')) {
                return '<div class="fides-use-case-card"><p>' . esc_html__(
                    'Vocabulary submissions are unavailable (missing submission core or adapter).',
                    'fides-vocabulary-glossary'
                ) . '</p></div>';
            }

            if (! is_user_logged_in()) {
                wp_enqueue_style('fides-vocabulary-form');
                return sprintf(
                    '<div class="fides-use-case-card"><p>%s</p><p><a class="fides-org-form-login-link" href="%s">%s</a></p></div>',
                    esc_html__('You must be signed in to propose vocabulary changes.', 'fides-vocabulary-glossary'),
                    esc_url(self::form_login_url()),
                    esc_html__('Sign in to continue', 'fides-vocabulary-glossary')
                );
            }

            wp_enqueue_style('fides-vocabulary-form');
            wp_enqueue_script('fides-vocabulary-form');

            $user = wp_get_current_user();
            $config = array_merge(
                array(
                    'mode'            => $mode === 'update' ? 'update' : 'create',
                    'apiBase'         => esc_url_raw(rest_url('fides-catalog/v1')),
                    'restNonce'       => wp_create_nonce('wp_rest'),
                    'contactEmail'    => sanitize_email((string) $user->user_email),
                    'fieldHelp'       => self::FIELD_HELP,
                    'sectionIntro'    => $mode === 'update'
                        ? __('Search for a term, then suggest changes. All proposals are reviewed by the FIDES team before publication.', 'fides-vocabulary-glossary')
                        : __('Propose a new glossary term. All proposals are reviewed by the FIDES team before publication.', 'fides-vocabulary-glossary'),
                    'preselectTermId' => '',
                    'glossaryUrl'     => home_url(Fides_Vocabulary_Glossary_SSR::catalog_path()),
                ),
                $extra
            );

            wp_add_inline_script(
                'fides-vocabulary-form',
                'window.FIDES_VOCABULARY_FORM_CONFIG = ' . wp_json_encode($config) . ';',
                'before'
            );

            $root_id = $mode === 'update' ? 'fides-vocabulary-update-form-root' : 'fides-vocabulary-submit-form-root';
            return '<div id="' . esc_attr($root_id) . '" class="fides-vocabulary-submission-root fides-org-submission-root"></div>';
        }

        /**
         * Login URL with return_to current page (OID4VP or WP login).
         */
        public static function form_login_url(): string {
            $current_request_uri = isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '';
            $current_host        = isset($_SERVER['HTTP_HOST']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_HOST'])) : '';
            $current_url         = $current_host !== ''
                ? ((is_ssl() ? 'https://' : 'http://') . $current_host . $current_request_uri)
                : home_url('/');

            $oid4vp_options = get_option('universal_openid4vp_options', array());
            if (is_array($oid4vp_options) && ! empty($oid4vp_options['loginUrl'])) {
                return esc_url_raw(
                    add_query_arg('return_to', $current_url, (string) $oid4vp_options['loginUrl'])
                );
            }

            return wp_login_url($current_url);
        }
    }
}
