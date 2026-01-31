<?php
/**
 * Plugin Name: FIDES Interop Profile Matrix
 * Plugin URI: https://fides.community
 * Description: Interactive matrix comparison of interoperability profiles (DIIP, HAIP, EWC, Swiyu)
 * Version: 1.0.0
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
        wp_register_style(
            'fides-interop-matrix',
            $this->plugin_url . 'assets/style.css',
            array(),
            FIDES_INTEROP_MATRIX_VERSION
        );
        
        wp_register_script(
            'fides-interop-matrix',
            $this->plugin_url . 'assets/interop-matrix.js',
            array(),
            FIDES_INTEROP_MATRIX_VERSION,
            true
        );
        
        // Pass data to JavaScript
        wp_localize_script('fides-interop-matrix', 'fidesInteropMatrix', array(
            'pluginUrl' => $this->plugin_url,
            'githubDataUrl' => 'https://raw.githubusercontent.com/FIDEScommunity/interop-profiles/main/data/aggregated.json',
            'dataUrl' => $this->plugin_url . 'assets/aggregated.json',
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
        
        // Enqueue assets
        wp_enqueue_style('fides-interop-matrix');
        wp_enqueue_script('fides-interop-matrix');
        
        // Data attributes for configuration
        $data_attrs = sprintf(
            'data-profiles="%s" data-theme="%s"',
            esc_attr($atts['profiles']),
            esc_attr($atts['theme'])
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
     * Admin page
     */
    public function render_admin_page() {
        ?>
        <div class="wrap">
            <h1>FIDES Interop Profile Matrix</h1>
            
            <p>This plugin displays an interactive comparison matrix for interoperability profiles. Data is automatically loaded from the <a href="https://github.com/FIDEScommunity/interop-profiles" target="_blank">FIDES GitHub repository</a>.</p>
            
            <h2>Shortcode Usage</h2>
            <p>Use the following shortcode to display the interop profile matrix:</p>
            <code>[fides_interop_matrix]</code>
            
            <h3>Options</h3>
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
                        <td>diip-v5,haip-v1,ewc-v3</td>
                        <td>Filter specific profiles (comma-separated). Leave empty for all.</td>
                    </tr>
                    <tr>
                        <td><code>theme</code></td>
                        <td>fides, light, dark</td>
                        <td>Color theme (default: fides)</td>
                    </tr>
                </tbody>
            </table>
            
            <h3>Examples</h3>
            <p><code>[fides_interop_matrix]</code> - Show all profiles with FIDES theme</p>
            <p><code>[fides_interop_matrix profiles="diip-v5,haip-v1"]</code> - Compare only DIIP v5 and HAIP v1</p>
            <p><code>[fides_interop_matrix theme="dark"]</code> - Dark theme variant</p>
            
            <h2>Available Profiles</h2>
            <p>Current profiles in the matrix:</p>
            <ul>
                <li><strong>DIIP</strong> - Digital Identity Interoperability Profile</li>
                <li><strong>HAIP</strong> - High Assurance Interoperability Profile</li>
                <li><strong>EWC</strong> - European Wallet Consortium</li>
                <li><strong>Swiyu</strong> - Swiyu Interoperability Profile</li>
            </ul>
        </div>
        <?php
    }
}

// Initialize plugin
FIDES_Interop_Matrix::get_instance();
