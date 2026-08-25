<?php
/**
 * Plugin Name: FIDES Vocabulary Glossary
 * Description: Browse the FIDES community glossary with search, alphabetical navigation, and detail modals. When fides_catalog_ssr_enabled is on (FIDES Community Tools Tiles ≥ 1.6.3), emits server-rendered listing and per-term SEO for indexable glossary pages.
 * Version: 1.1.11
 * Author: FIDES Labs BV
 * Author URI: https://fides.community
 * License: Apache-2.0
 * Text Domain: fides-vocabulary-glossary
 */

if (! defined('ABSPATH')) {
    exit;
}

define('FIDES_VOCABULARY_GLOSSARY_VERSION', '1.1.11');

const FIDES_VOCABULARY_GLOSSARY_SETTINGS_GROUP = 'fides_vocabulary_glossary_settings';
const FIDES_VOCABULARY_GLOSSARY_DEFAULT_SUGGEST_EMAIL = 'glossary@fides.community';

require_once plugin_dir_path(__FILE__) . 'includes/class-fides-vocabulary-glossary-ssr.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-fides-vocabulary-glossary-submission-adapter.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-fides-vocabulary-glossary-submission-forms.php';
Fides_Vocabulary_Glossary_SSR::bootstrap();
Fides_Vocabulary_Glossary_Submission_Adapter::bootstrap();
Fides_Vocabulary_Glossary_Submission_Forms::bootstrap();

class Fides_Vocabulary_Glossary {

    private static $instance = null;
    private $plugin_url;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->plugin_url = plugin_dir_url(__FILE__);
        add_shortcode('fides_vocabulary_glossary', array($this, 'render_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'register_assets'));
        add_action('admin_menu', array($this, 'register_admin_menu'));
        add_action('admin_init', array($this, 'register_plugin_settings'));
    }

    public function register_admin_menu() {
        add_options_page(
            __('FIDES Vocabulary Glossary Settings', 'fides-vocabulary-glossary'),
            __('FIDES Glossary', 'fides-vocabulary-glossary'),
            'manage_options',
            'fides-vocabulary-glossary',
            array($this, 'render_settings_page')
        );
    }

    public function register_plugin_settings() {
        register_setting(FIDES_VOCABULARY_GLOSSARY_SETTINGS_GROUP, Fides_Vocabulary_Glossary_SSR::OPTION_CATALOG_URL, array(
            'type'              => 'string',
            'default'           => Fides_Vocabulary_Glossary_SSR::DEFAULT_CATALOG_PATH,
            'sanitize_callback' => array('Fides_Vocabulary_Glossary_SSR', 'sanitize_path'),
        ));
        register_setting(FIDES_VOCABULARY_GLOSSARY_SETTINGS_GROUP, 'fides_vocabulary_glossary_github_data_url', array(
            'type'              => 'string',
            'sanitize_callback' => array($this, 'sanitize_optional_url'),
        ));
        register_setting(FIDES_VOCABULARY_GLOSSARY_SETTINGS_GROUP, 'fides_vocabulary_glossary_suggest_email', array(
            'type'              => 'string',
            'default'           => FIDES_VOCABULARY_GLOSSARY_DEFAULT_SUGGEST_EMAIL,
            'sanitize_callback' => array($this, 'sanitize_email'),
        ));
        register_setting(FIDES_VOCABULARY_GLOSSARY_SETTINGS_GROUP, 'fides_vocabulary_glossary_columns', array(
            'type'              => 'integer',
            'default'           => 3,
            'sanitize_callback' => array($this, 'sanitize_columns'),
        ));
        register_setting(FIDES_VOCABULARY_GLOSSARY_SETTINGS_GROUP, 'fides_vocabulary_glossary_submit_form_url', array(
            'type'              => 'string',
            'sanitize_callback' => array($this, 'sanitize_optional_url'),
        ));
        register_setting(FIDES_VOCABULARY_GLOSSARY_SETTINGS_GROUP, 'fides_vocabulary_glossary_update_form_url', array(
            'type'              => 'string',
            'sanitize_callback' => array($this, 'sanitize_optional_url'),
        ));
    }

    public function sanitize_optional_url($value) {
        $value = is_string($value) ? trim($value) : '';
        return $value === '' ? '' : esc_url_raw($value);
    }

    public function sanitize_email($value) {
        $value = is_string($value) ? sanitize_email(trim($value)) : '';
        return $value !== '' ? $value : FIDES_VOCABULARY_GLOSSARY_DEFAULT_SUGGEST_EMAIL;
    }

    public function sanitize_columns($value) {
        $n = (int) $value;
        if ($n < 1) {
            return 1;
        }
        if ($n > 4) {
            return 4;
        }
        return $n;
    }

    public function render_settings_page() {
        if (! current_user_can('manage_options')) {
            return;
        }
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('FIDES Vocabulary Glossary', 'fides-vocabulary-glossary'); ?></h1>
            <form method="post" action="options.php">
                <?php
                settings_fields(FIDES_VOCABULARY_GLOSSARY_SETTINGS_GROUP);
                do_settings_sections(FIDES_VOCABULARY_GLOSSARY_SETTINGS_GROUP);
                ?>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row">
                            <label for="<?php echo esc_attr(Fides_Vocabulary_Glossary_SSR::OPTION_CATALOG_URL); ?>"><?php esc_html_e('Glossary page path', 'fides-vocabulary-glossary'); ?></label>
                        </th>
                        <td>
                            <?php
                            $catalog_path_option = Fides_Vocabulary_Glossary_SSR::OPTION_CATALOG_URL;
                            $catalog_path_value  = (string) get_option(
                                $catalog_path_option,
                                Fides_Vocabulary_Glossary_SSR::DEFAULT_CATALOG_PATH
                            );
                            if ($catalog_path_value === '') {
                                $catalog_path_value = Fides_Vocabulary_Glossary_SSR::DEFAULT_CATALOG_PATH;
                            }
                            ?>
                            <input
                                type="text"
                                class="regular-text"
                                id="<?php echo esc_attr($catalog_path_option); ?>"
                                name="<?php echo esc_attr($catalog_path_option); ?>"
                                value="<?php echo esc_attr($catalog_path_value); ?>"
                                placeholder="<?php echo esc_attr(Fides_Vocabulary_Glossary_SSR::DEFAULT_CATALOG_PATH); ?>"
                            />
                            <p class="description">
                                <?php
                                esc_html_e(
                                    'Path of the page with [fides_vocabulary_glossary]. Used for sitemap, SEO deeplinks (?term=), and SSR links. Accepts a path or full URL (path is stored). Example: /community-tools/glossary/',
                                    'fides-vocabulary-glossary'
                                );
                                ?>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="fides_vocabulary_glossary_github_data_url"><?php esc_html_e('Glossary JSON URL', 'fides-vocabulary-glossary'); ?></label>
                        </th>
                        <td>
                            <input type="url" class="regular-text" id="fides_vocabulary_glossary_github_data_url" name="fides_vocabulary_glossary_github_data_url" value="<?php echo esc_attr(get_option('fides_vocabulary_glossary_github_data_url', 'https://raw.githubusercontent.com/FIDEScommunity/fides-interop-profiles/main/data/glossary-aggregated.json')); ?>" />
                            <p class="description"><?php esc_html_e('Leave empty to use the bundled glossary-aggregated.json.', 'fides-vocabulary-glossary'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="fides_vocabulary_glossary_suggest_email"><?php esc_html_e('Suggestion email', 'fides-vocabulary-glossary'); ?></label>
                        </th>
                        <td>
                            <input type="email" class="regular-text" id="fides_vocabulary_glossary_suggest_email" name="fides_vocabulary_glossary_suggest_email" value="<?php echo esc_attr(get_option('fides_vocabulary_glossary_suggest_email', FIDES_VOCABULARY_GLOSSARY_DEFAULT_SUGGEST_EMAIL)); ?>" />
                            <p class="description"><?php esc_html_e('Used for “Suggest an edit” mailto links in the term modal.', 'fides-vocabulary-glossary'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="fides_vocabulary_glossary_columns"><?php esc_html_e('Default columns', 'fides-vocabulary-glossary'); ?></label>
                        </th>
                        <td>
                            <input type="number" min="1" max="4" id="fides_vocabulary_glossary_columns" name="fides_vocabulary_glossary_columns" value="<?php echo esc_attr((string) get_option('fides_vocabulary_glossary_columns', 3)); ?>" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="fides_vocabulary_glossary_submit_form_url"><?php esc_html_e('Submit form page URL', 'fides-vocabulary-glossary'); ?></label>
                        </th>
                        <td>
                            <input type="url" class="regular-text" id="fides_vocabulary_glossary_submit_form_url" name="fides_vocabulary_glossary_submit_form_url" value="<?php echo esc_attr(get_option('fides_vocabulary_glossary_submit_form_url', home_url(Fides_Vocabulary_Glossary_Submission_Forms::DEFAULT_SUBMIT_PATH))); ?>" />
                            <p class="description"><?php esc_html_e('Page with [fides_vocabulary_submit_form].', 'fides-vocabulary-glossary'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="fides_vocabulary_glossary_update_form_url"><?php esc_html_e('Update form page URL', 'fides-vocabulary-glossary'); ?></label>
                        </th>
                        <td>
                            <input type="url" class="regular-text" id="fides_vocabulary_glossary_update_form_url" name="fides_vocabulary_glossary_update_form_url" value="<?php echo esc_attr(get_option('fides_vocabulary_glossary_update_form_url', home_url(Fides_Vocabulary_Glossary_Submission_Forms::DEFAULT_UPDATE_PATH))); ?>" />
                            <p class="description"><?php esc_html_e('Page with [fides_vocabulary_update_form]. Logged-in users see a suggest-update icon in the glossary modal.', 'fides-vocabulary-glossary'); ?></p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            <p><?php esc_html_e('Shortcodes:', 'fides-vocabulary-glossary'); ?></p>
            <ul>
                <li><code>[fides_vocabulary_glossary]</code></li>
                <li><code>[fides_vocabulary_submit_form]</code></li>
                <li><code>[fides_vocabulary_update_form]</code></li>
            </ul>
        </div>
        <?php
    }

    public function register_assets() {
        wp_register_style(
            'fides-vocabulary-glossary-ui-lib',
            $this->plugin_url . 'assets/lib/fides-catalog-ui.css',
            array(),
            FIDES_VOCABULARY_GLOSSARY_VERSION
        );
        wp_register_style(
            'fides-vocabulary-glossary',
            $this->plugin_url . 'assets/style.css',
            array('fides-vocabulary-glossary-ui-lib'),
            FIDES_VOCABULARY_GLOSSARY_VERSION
        );
        wp_register_script(
            'fides-vocabulary-glossary-ui-lib',
            $this->plugin_url . 'assets/lib/fides-catalog-ui.js',
            array(),
            FIDES_VOCABULARY_GLOSSARY_VERSION,
            true
        );
        wp_register_script(
            'fides-vocabulary-glossary',
            $this->plugin_url . 'assets/vocabulary-glossary.js',
            array('fides-vocabulary-glossary-ui-lib'),
            FIDES_VOCABULARY_GLOSSARY_VERSION,
            true
        );

        wp_localize_script('fides-vocabulary-glossary', 'fidesVocabularyGlossary', $this->script_config());
    }

    /**
     * Same login target as other FIDES catalogs (OID4VP when configured).
     */
    private function resolve_ratings_login_url(): string {
        $current_request_uri = isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '';
        $current_host        = isset($_SERVER['HTTP_HOST']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_HOST'])) : '';
        $current_url         = $current_host !== ''
            ? ((is_ssl() ? 'https://' : 'http://') . $current_host . $current_request_uri)
            : home_url('/');

        $oid4vp_options = get_option('universal_openid4vp_options', array());
        $oid4vp_login_url = '';
        if (is_array($oid4vp_options) && ! empty($oid4vp_options['loginUrl'])) {
            $oid4vp_login_url = esc_url_raw((string) $oid4vp_options['loginUrl']);
        }

        return $oid4vp_login_url !== '' ? $oid4vp_login_url : wp_login_url($current_url);
    }

    /**
     * @param array<string, mixed> $overrides
     * @return array<string, mixed>
     */
    private function script_config(array $overrides = array()) {
        $data_path = plugin_dir_path(__FILE__) . 'data/glossary-aggregated.json';
        $data_version = file_exists($data_path) ? (string) filemtime($data_path) : '';

        $github_default = 'https://raw.githubusercontent.com/FIDEScommunity/fides-interop-profiles/main/data/glossary-aggregated.json';
        $github_url = get_option('fides_vocabulary_glossary_github_data_url', $github_default);
        if (! is_string($github_url) || trim($github_url) === '') {
            $github_url = $github_default;
        }

        $update_opt = trim((string) get_option('fides_vocabulary_glossary_update_form_url', ''));
        $update_form_url = $update_opt !== ''
            ? esc_url_raw($update_opt)
            : home_url(Fides_Vocabulary_Glossary_Submission_Forms::DEFAULT_UPDATE_PATH);

        $ratings_login_url = $this->resolve_ratings_login_url();

        $base = array(
            'pluginUrl'           => $this->plugin_url,
            'githubDataUrl'       => esc_url_raw($github_url),
            'localDataUrl'        => $this->plugin_url . 'data/glossary-aggregated.json',
            'aggregatedDataVersion' => $data_version,
            'ratingsApiBase'      => rest_url('fides-catalog/v1/ratings'),
            'ratingsNonce'        => wp_create_nonce('wp_rest'),
            'isLoggedIn'          => is_user_logged_in(),
            'loginUrl'            => $ratings_login_url,
            'ratingsLoginUrl'     => $ratings_login_url,
            'suggestEmail'        => get_option('fides_vocabulary_glossary_suggest_email', FIDES_VOCABULARY_GLOSSARY_DEFAULT_SUGGEST_EMAIL),
            'updateFormUrl'       => $update_form_url,
            'submitFormUrl'       => (function () {
                $submit_opt = trim((string) get_option('fides_vocabulary_glossary_submit_form_url', ''));
                return $submit_opt !== ''
                    ? esc_url_raw($submit_opt)
                    : home_url(Fides_Vocabulary_Glossary_Submission_Forms::DEFAULT_SUBMIT_PATH);
            })(),
            'columns'             => (int) get_option('fides_vocabulary_glossary_columns', 3),
        );

        return array_merge($base, $overrides);
    }

    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'theme'           => 'fides',
            'columns'         => (string) get_option('fides_vocabulary_glossary_columns', 3),
            'github_data_url' => get_option(
                'fides_vocabulary_glossary_github_data_url',
                'https://raw.githubusercontent.com/FIDEScommunity/fides-interop-profiles/main/data/glossary-aggregated.json'
            ),
            'suggest_email'   => get_option('fides_vocabulary_glossary_suggest_email', FIDES_VOCABULARY_GLOSSARY_DEFAULT_SUGGEST_EMAIL),
        ), $atts, 'fides_vocabulary_glossary');

        $allowed_themes = array('fides', 'light', 'dark');
        $theme = in_array($atts['theme'], $allowed_themes, true) ? $atts['theme'] : 'fides';
        $columns = max(1, min(4, (int) $atts['columns']));

        wp_enqueue_style('fides-vocabulary-glossary-ui-lib');
        wp_enqueue_style('fides-vocabulary-glossary');
        wp_enqueue_script('fides-vocabulary-glossary-ui-lib');
        wp_enqueue_script('fides-vocabulary-glossary');

        $github = trim((string) $atts['github_data_url']);
        wp_localize_script(
            'fides-vocabulary-glossary',
            'fidesVocabularyGlossary',
            $this->script_config(array(
                'githubDataUrl' => $github !== '' ? esc_url_raw($github) : '',
                'suggestEmail'  => sanitize_email((string) $atts['suggest_email']),
                'columns'       => $columns,
            ))
        );

        $initial_html = '';
        if (class_exists('Fides_Vocabulary_Glossary_SSR')) {
            $initial_html = Fides_Vocabulary_Glossary_SSR::build_initial_html(array(
                'theme'   => $theme,
                'columns' => (string) $columns,
            ));
        }
        if ($initial_html === '') {
            $initial_html = '<div class="fides-loading" data-fides-ssr-spinner="1"><div class="fides-spinner"></div><p>' . esc_html__('Loading glossary…', 'fides-vocabulary-glossary') . '</p></div>';
        }

        return sprintf(
            '<div id="fides-vocabulary-glossary-root" data-theme="%s" data-columns="%d">%s</div>',
            esc_attr($theme),
            $columns,
            $initial_html
        );
    }
}

Fides_Vocabulary_Glossary::get_instance();
