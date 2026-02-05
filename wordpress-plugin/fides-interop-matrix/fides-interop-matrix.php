<?php
/**
 * Plugin Name: FIDES Interop Profile Matrix
 * Plugin URI: https://fides.community
 * Description: Interactive matrix comparison of interoperability profiles (DIIP, HAIP, EWC, Swiyu)
 * Version: 1.2.5
 * Author: FIDES Labs BV
 * Author URI: https://fides.community
 * License: Apache-2.0
 * License URI: https://www.apache.org/licenses/LICENSE-2.0
 * 
 * © 2026 FIDES Labs BV
 * Developed and maintained by FIDES Labs BV
 */

if (!defined('ABSPATH')) {
    exit;
}

define('FIDES_INTEROP_MATRIX_VERSION', '1.0.0');

class FIDES_Interop_Matrix {
    
    private static $instance = null;
    private $plugin_url;
    private $plugin_path;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->plugin_url = plugin_dir_url(__FILE__);
        $this->plugin_path = plugin_dir_path(__FILE__);
        
        add_action('init', array($this, 'register_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'register_assets'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }
    
    /**
     * Register the shortcode
     */
    public function register_shortcode() {
        add_shortcode('fides_interop_matrix', array($this, 'render_shortcode'));
    }
    
    /**
     * Register CSS and JS assets
     */
    public function register_assets() {
        // Use minified assets in production, full assets in development
        $suffix = (defined('SCRIPT_DEBUG') && SCRIPT_DEBUG) ? '' : '.min';
        
        wp_register_style(
            'fides-interop-matrix',
            $this->plugin_url . 'assets/style' . $suffix . '.css',
            array(),
            FIDES_INTEROP_MATRIX_VERSION
        );
        
        wp_register_script(
            'fides-interop-matrix',
            $this->plugin_url . 'assets/interop-matrix' . $suffix . '.js',
            array(),
            FIDES_INTEROP_MATRIX_VERSION,
            true
        );
        
        // Get configured catalog URLs from settings
        $personal_wallets_url = get_option('fides_interop_personal_wallets_url', 'https://fides.community/community-tools/personal-wallets/?profile={profile}');
        $business_wallets_url = get_option('fides_interop_business_wallets_url', 'https://fides.community/community-tools/organizational-wallets/?profile={profile}');
        $relying_parties_url = get_option('fides_interop_relying_parties_url', 'https://fides.community/community-tools/relying-party-catalog/?profile={profile}');
        
        // Pass data to JavaScript
        wp_localize_script('fides-interop-matrix', 'fidesInteropMatrix', array(
            'pluginUrl' => $this->plugin_url,
            'githubDataUrl' => 'https://raw.githubusercontent.com/FIDEScommunity/fides-interop-profiles/main/data/aggregated.json',
            'dataUrl' => $this->plugin_url . 'assets/aggregated.json',
            'catalogUrls' => array(
                'personalWallets' => $personal_wallets_url,
                'businessWallets' => $business_wallets_url,
                'relyingParties' => $relying_parties_url,
            ),
        ));
    }
    
    /**
     * Render the shortcode
     */
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'profiles' => '', // Comma-separated list: diip-v5,haip-v1
            'theme' => 'fides', // fides, light, or dark
        ), $atts);
        
        // Validate theme against whitelist
        $allowed_themes = array('fides', 'light', 'dark');
        $theme = in_array($atts['theme'], $allowed_themes, true) ? $atts['theme'] : 'fides';
        
        // Sanitize profiles parameter (alphanumeric, hyphens, commas only)
        $profiles = preg_replace('/[^a-z0-9,\-]/i', '', $atts['profiles']);
        
        // Enqueue assets
        wp_enqueue_style('fides-interop-matrix');
        wp_enqueue_script('fides-interop-matrix');
        
        // Data attributes for configuration
        $data_attrs = sprintf(
            'data-profiles="%s" data-theme="%s"',
            esc_attr($profiles),
            esc_attr($theme)
        );
        
        // Container where the matrix renders
        return sprintf(
            '<div id="fides-interop-matrix-root" class="fides-interop-matrix" %s>
                <div class="fides-loading">
                    <div class="fides-spinner"></div>
                    <p>Loading interop profiles...</p>
                </div>
            </div>',
            $data_attrs
        );
    }
    
    /**
     * Admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            'FIDES Interop Matrix',
            'FIDES Interop Matrix',
            'manage_options',
            'fides-interop-matrix',
            array($this, 'render_admin_page')
        );
    }
    
    /**
     * Sanitize catalog URL while preserving {profile} placeholder
     */
    public function sanitize_catalog_url($url) {
        // Temporarily replace {profile} placeholder to protect it
        $placeholder = '___PROFILE_PLACEHOLDER___';
        $url = str_replace('{profile}', $placeholder, $url);
        
        // Sanitize the URL
        $url = esc_url_raw($url);
        
        // Restore the placeholder
        $url = str_replace($placeholder, '{profile}', $url);
        
        return $url;
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('fides_interop_matrix_settings', 'fides_interop_personal_wallets_url', array(
            'type' => 'string',
            'sanitize_callback' => array($this, 'sanitize_catalog_url'),
            'default' => 'https://fides.community/community-tools/personal-wallets/?profile={profile}',
        ));
        
        register_setting('fides_interop_matrix_settings', 'fides_interop_business_wallets_url', array(
            'type' => 'string',
            'sanitize_callback' => array($this, 'sanitize_catalog_url'),
            'default' => 'https://fides.community/community-tools/organizational-wallets/?profile={profile}',
        ));
        
        register_setting('fides_interop_matrix_settings', 'fides_interop_relying_parties_url', array(
            'type' => 'string',
            'sanitize_callback' => array($this, 'sanitize_catalog_url'),
            'default' => 'https://fides.community/community-tools/relying-party-catalog/?profile={profile}',
        ));
        
        add_settings_section(
            'fides_interop_catalog_urls',
            'Catalog URLs',
            array($this, 'render_catalog_urls_section'),
            'fides-interop-matrix'
        );
        
        add_settings_field(
            'fides_interop_personal_wallets_url',
            'Personal Wallets URL',
            array($this, 'render_url_field'),
            'fides-interop-matrix',
            'fides_interop_catalog_urls',
            array('field' => 'fides_interop_personal_wallets_url', 'placeholder' => 'https://fides.community/community-tools/personal-wallets/?profile={profile}')
        );
        
        add_settings_field(
            'fides_interop_business_wallets_url',
            'Business Wallets URL',
            array($this, 'render_url_field'),
            'fides-interop-matrix',
            'fides_interop_catalog_urls',
            array('field' => 'fides_interop_business_wallets_url', 'placeholder' => 'https://fides.community/community-tools/organizational-wallets/?profile={profile}')
        );
        
        add_settings_field(
            'fides_interop_relying_parties_url',
            'Relying Party Websites URL',
            array($this, 'render_url_field'),
            'fides-interop-matrix',
            'fides_interop_catalog_urls',
            array('field' => 'fides_interop_relying_parties_url', 'placeholder' => 'https://fides.community/community-tools/relying-party-catalog/?profile={profile}')
        );
    }
    
    /**
     * Render catalog URLs section description
     */
    public function render_catalog_urls_section() {
        echo '<p>Configure the URLs for the wallet and relying party catalogs. Use <code>{profile}</code> as a placeholder for the profile ID (e.g., diip-v5, haip-v1).</p>';
    }
    
    /**
     * Render URL input field
     */
    public function render_url_field($args) {
        $field = $args['field'];
        $value = get_option($field, $args['placeholder']);
        printf(
            '<input type="url" name="%s" value="%s" class="regular-text" placeholder="%s" />',
            esc_attr($field),
            esc_attr($value),
            esc_attr($args['placeholder'])
        );
        echo '<p class="description">The placeholder <code>{profile}</code> will be replaced with the profile ID.</p>';
    }
    
    /**
     * Admin page
     */
    public function render_admin_page() {
        // Check user permissions
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Show settings saved message
        if (isset($_GET['settings-updated'])) {
            add_settings_error('fides_interop_messages', 'fides_interop_message', 'Settings Saved', 'updated');
        }
        
        settings_errors('fides_interop_messages');
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <p>This plugin displays an interactive comparison matrix for interoperability profiles. Data is automatically loaded from the <a href="https://github.com/FIDEScommunity/interop-profiles" target="_blank">FIDES GitHub repository</a>.</p>
            
            <form method="post" action="options.php">
                <?php
                settings_fields('fides_interop_matrix_settings');
                do_settings_sections('fides-interop-matrix');
                submit_button('Save Settings');
                ?>
            </form>
            
            <hr />
            
            <h2>Shortcode Usage</h2>
            <p>Use the following shortcode to display the interop profile matrix:</p>
            <code>[fides_interop_matrix]</code>
            
            <h3>Profile Selection</h3>
            <p>Users can compare up to <strong>3 profiles at a time</strong> using the profile selector on desktop view. The selector allows users to:</p>
            <ul>
                <li>Check/uncheck profiles to compare (maximum 3 selected)</li>
                <li>Use "Reset" to restore the default selection (first 3 profiles)</li>
                <li>Use "Select All" to quickly select the first 3 available profiles</li>
                <li>Their selection is automatically saved and restored on next visit</li>
            </ul>
            <p><strong>Note:</strong> On mobile devices, the matrix uses a tab-based interface to view one profile at a time.</p>
            
            <h3>Shortcode Options</h3>
            <table class="widefat" style="max-width: 800px;">
                <thead>
                    <tr>
                        <th>Attribute</th>
                        <th>Values</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>profiles</code></td>
                        <td>diip-v4,diip-v5,haip-v1</td>
                        <td>Pre-filter specific profiles (comma-separated). Users can still select from these filtered profiles using the selector. Leave empty to show all available profiles.</td>
                    </tr>
                    <tr>
                        <td><code>theme</code></td>
                        <td>fides, light, dark</td>
                        <td>Color theme (default: fides)</td>
                    </tr>
                </tbody>
            </table>
            
            <h3>Examples</h3>
            <p><code>[fides_interop_matrix]</code> - Show all available profiles with profile selector (default: first 3 selected)</p>
            <p><code>[fides_interop_matrix profiles="diip-v5,haip-v1"]</code> - Pre-filter to only show DIIP v5 and HAIP v1 in the selector</p>
            <p><code>[fides_interop_matrix theme="dark"]</code> - Use dark theme variant</p>
            
            <h2>Available Profiles</h2>
            <p>Current profiles in the matrix:</p>
            <ul>
                <li><strong>DIIP v4</strong> - Digital Identity Interoperability Profile v4</li>
                <li><strong>DIIP v5</strong> - Digital Identity Interoperability Profile v5</li>
                <li><strong>HAIP v1</strong> - OpenID4VC High Assurance Interoperability Profile v1</li>
            </ul>
        </div>
        <?php
    }
}

// Initialize plugin
FIDES_Interop_Matrix::get_instance();
