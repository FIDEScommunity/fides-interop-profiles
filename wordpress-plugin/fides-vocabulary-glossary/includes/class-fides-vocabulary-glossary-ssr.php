<?php
/**
 * Vocabulary Glossary SSR — glossary-specific subclass of Fides_Catalog_SSR_Renderer.
 *
 * @package fides-vocabulary-glossary
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('Fides_Vocabulary_Glossary_SSR')) {

    if (! class_exists('Fides_Catalog_SSR_Renderer')) {

        class Fides_Vocabulary_Glossary_SSR {
            const TYPE                 = 'vocabulary';
            const DEFAULT_CATALOG_PATH = '/glossary/';
            const OPTION_CATALOG_URL   = 'fides_vocabulary_glossary_page_url';

            public static function bootstrap() { /* no-op without base */ }
            public static function build_initial_html(array $atts) { return ''; }
        }

    } else {

        class Fides_Vocabulary_Glossary_SSR extends Fides_Catalog_SSR_Renderer {

            const TYPE                 = 'vocabulary';
            const DEFAULT_CATALOG_PATH = '/glossary/';
            const OPTION_CATALOG_URL   = 'fides_vocabulary_glossary_page_url';

            /** @var self|null */
            private static $instance = null;

            public static function bootstrap(): void {
                if (self::$instance === null) {
                    self::$instance = new self();
                    self::$instance->bootstrap_renderer();
                    add_action('admin_init', array(__CLASS__, 'register_settings'));
                }
            }

            public static function build_initial_html(array $atts): string {
                self::bootstrap();
                return self::$instance->render_initial_html($atts);
            }

            protected function type(): string              { return self::TYPE; }
            protected function text_domain(): string       { return 'fides-vocabulary-glossary'; }
            protected function shortcode_root_id(): string { return 'fides-vocabulary-glossary-root'; }
            protected function loading_label(): string     { return __('Loading glossary…', 'fides-vocabulary-glossary'); }
            protected function max_listing_items(): int    { return 2000; }

            public function register_with_core(): void {
                if (! class_exists('Fides_Catalog_Registry')) {
                    return;
                }
                $plugin_dir = dirname(__DIR__);
                Fides_Catalog_Registry::register(self::TYPE, array(
                    'label'             => __('FIDES Glossary', 'fides-vocabulary-glossary'),
                    'json_url'          => 'https://raw.githubusercontent.com/FIDEScommunity/fides-interop-profiles/main/data/glossary-aggregated.json',
                    'local_json_path'   => $plugin_dir . '/data/glossary-aggregated.json',
                    'collection_key'    => 'terms',
                    'id_field'          => 'id',
                    'name_field'        => 'name',
                    'description_field' => 'description',
                    'logo_field'        => null,
                    'detail_param'      => 'term',
                    'pages'             => array(
                        'main' => self::catalog_path(),
                    ),
                    'jsonld_type'       => 'DefinedTerm',
                    'cache_ttl'         => HOUR_IN_SECONDS,
                ));
            }

            public static function register_settings(): void {
                register_setting(FIDES_VOCABULARY_GLOSSARY_SETTINGS_GROUP, self::OPTION_CATALOG_URL, array(
                    'type'              => 'string',
                    'default'           => self::DEFAULT_CATALOG_PATH,
                    'sanitize_callback' => array(__CLASS__, 'sanitize_path'),
                ));
            }

            public static function sanitize_path($value): string {
                $value = is_string($value) ? trim($value) : '';
                if ($value === '') {
                    return '';
                }
                $path = wp_parse_url($value, PHP_URL_PATH);
                if (! is_string($path) || $path === '') {
                    return '';
                }
                if ($path[0] !== '/') {
                    $path = '/' . $path;
                }
                return user_trailingslashit($path);
            }

            public static function catalog_path(): string {
                $stored = (string) get_option(self::OPTION_CATALOG_URL, self::DEFAULT_CATALOG_PATH);
                if ($stored === '') {
                    return self::DEFAULT_CATALOG_PATH;
                }
                return $stored;
            }

            protected function listing_page_name(string $page_slug): string {
                return __('FIDES Glossary', 'fides-vocabulary-glossary');
            }

            protected function listing_page_url(string $page_slug): string {
                return home_url(self::catalog_path());
            }

            protected function enrich_jsonld(array $jsonld, array $item): array {
                $jsonld['@type'] = 'DefinedTerm';
                if (! empty($item['url']) && is_string($item['url'])) {
                    $jsonld['url'] = esc_url_raw($item['url']);
                }
                if (! empty($item['aliases']) && is_array($item['aliases'])) {
                    $jsonld['alternateName'] = array_values(array_filter(array_map('strval', $item['aliases'])));
                }
                if (! empty($item['key']) && is_string($item['key'])) {
                    $jsonld['termCode'] = $item['key'];
                }
                return $jsonld;
            }

            protected function detail_meta_rows(array $item): array {
                $rows = array();
                $td   = 'fides-vocabulary-glossary';

                $aliases = array();
                if (! empty($item['aliases']) && is_array($item['aliases'])) {
                    $aliases = array_values(array_filter(array_map('strval', $item['aliases'])));
                }
                $rows[] = array(
                    'label' => __('Aliases', $td),
                    'html'  => $aliases !== array()
                        ? esc_html(implode(', ', $aliases))
                        : '—',
                );

                $source = isset($item['url']) ? trim((string) $item['url']) : '';
                $rows[] = array(
                    'label' => __('Source', $td),
                    'html'  => $source !== ''
                        ? sprintf(
                            '<a href="%1$s" rel="nofollow noopener" target="_blank">%2$s</a>',
                            esc_url($source),
                            esc_html($source)
                        )
                        : '—',
                );

                return $rows;
            }

            /**
             * Alphabetical multi-column listing for crawlers and no-JS users.
             *
             * @param array<int, array<string, mixed>> $items
             */
            protected function build_listing_block(array $items, int $total_count): string {
                if (empty($items)) {
                    return '';
                }

                $grouped = array();
                foreach ($items as $item) {
                    $letter = ! empty($item['letter']) && is_string($item['letter'])
                        ? strtoupper($item['letter'])
                        : '#';
                    if (! isset($grouped[$letter])) {
                        $grouped[$letter] = array();
                    }
                    $grouped[$letter][] = $item;
                }
                ksort($grouped);

                ob_start();
                ?>
                <section class="fides-ssr-listing fides-ssr-listing--vocabulary">
                    <h2 class="fides-ssr-listing__title">
                        <?php
                        echo esc_html(sprintf(
                            /* translators: %s: total number of glossary terms */
                            _n('%s glossary term', '%s glossary terms', (int) $total_count, 'fides-vocabulary-glossary'),
                            number_format_i18n((int) $total_count)
                        ));
                        ?>
                    </h2>
                    <?php foreach ($grouped as $letter => $letter_items) : ?>
                        <div class="fides-ssr-glossary-letter">
                            <h3 class="fides-ssr-glossary-letter__heading"><?php echo esc_html($letter); ?></h3>
                            <ul class="fides-ssr-glossary-letter__terms">
                                <?php foreach ($letter_items as $item) :
                                    $id   = $this->item_id($item);
                                    $name = $this->item_name($item);
                                    if ($id === '' || $name === '') {
                                        continue;
                                    }
                                    $detail_url = Fides_Catalog_Registry::detail_url_for($this->type(), $item);
                                    if (! $detail_url) {
                                        continue;
                                    }
                                    ?>
                                    <li>
                                        <a href="<?php echo esc_url($detail_url); ?>"><?php echo esc_html($name); ?></a>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    <?php endforeach; ?>
                </section>
                <?php
                return (string) ob_get_clean();
            }
        }
    }
}
