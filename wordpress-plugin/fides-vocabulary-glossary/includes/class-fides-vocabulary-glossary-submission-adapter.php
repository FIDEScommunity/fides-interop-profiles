<?php
/**
 * Registers the vocabulary glossary with the shared submission core.
 *
 * Vocabulary has no per-item ownership — all submissions are admin-moderated.
 *
 * @package fides-vocabulary-glossary
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('Fides_Vocabulary_Glossary_Submission_Adapter')) {

    class Fides_Vocabulary_Glossary_Submission_Adapter {

        const TYPE = 'vocabulary';

        public static function bootstrap(): void {
            add_action('init', array(__CLASS__, 'register'), 6);
            add_filter('fides_catalog_submission_public_item_url', array(__CLASS__, 'filter_public_item_url'), 10, 4);
        }

        public static function register(): void {
            if (! class_exists('Fides_Catalog_Submission_Registry')) {
                return;
            }

            Fides_Catalog_Submission_Registry::register(
                self::TYPE,
                array(
                    'label'                   => __('Vocabulary', 'fides-vocabulary-glossary'),
                    'catalog_type'            => self::TYPE,
                    'id_pattern'              => '/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                    'community_filename'      => 'vocabulary-term.json',
                    'slug_from_item_id'       => array(__CLASS__, 'slug_from_item_id'),
                    'validate_payload'        => array(__CLASS__, 'validate_payload'),
                    'payload_to_export'       => array(__CLASS__, 'payload_to_export'),
                    'catalog_item_to_payload' => array(__CLASS__, 'catalog_item_to_payload'),
                    'diff_field_labels'       => array(
                        'key'         => 'Term key',
                        'title'       => 'Display title',
                        'description' => 'Description',
                        'url'         => 'Source URL',
                        'aliases'     => 'Aliases',
                    ),
                )
            );
        }

        /**
         * @param string $item_id Stable glossary slug id.
         * @return string
         */
        public static function slug_from_item_id($item_id) {
            return sanitize_title((string) $item_id);
        }

        /**
         * @param string $key Canonical vocabulary key.
         * @return string
         */
        public static function slugify_key($key) {
            $slug = strtolower(trim((string) $key));
            $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
            return trim((string) $slug, '-');
        }

        /**
         * @param mixed $aliases Raw aliases.
         * @return array<int, string>
         */
        public static function normalize_aliases($aliases) {
            if (is_string($aliases)) {
                $aliases = preg_split('/\s*,\s*/', $aliases) ?: array();
            }
            if (! is_array($aliases)) {
                return array();
            }
            $out = array();
            foreach ($aliases as $alias) {
                $alias = sanitize_text_field((string) $alias);
                if ($alias !== '') {
                    $out[] = $alias;
                }
            }
            return array_values(array_unique($out));
        }

        /**
         * @param array<string, mixed> $payload Submission payload.
         * @param array<string, mixed> $context Validation context.
         * @return array<string, mixed>|WP_Error
         */
        public static function validate_payload(array $payload, array $context) {
            $action  = isset($context['action']) ? (string) $context['action'] : 'create';
            $item_id = $action === 'update' ? sanitize_text_field((string) ($context['item_id'] ?? '')) : '';

            $key = sanitize_text_field(trim((string) ($payload['key'] ?? '')));
            if ($key === '') {
                return new WP_Error('fides_vocab_key', __('Term key is required.', 'fides-vocabulary-glossary'));
            }

            $title = sanitize_text_field(trim((string) ($payload['title'] ?? '')));
            $description = sanitize_textarea_field(trim((string) ($payload['description'] ?? '')));
            if ($description === '') {
                return new WP_Error('fides_vocab_description', __('Description is required.', 'fides-vocabulary-glossary'));
            }

            $url = esc_url_raw(trim((string) ($payload['url'] ?? '')));
            $aliases = self::normalize_aliases($payload['aliases'] ?? array());

            if ($action === 'create') {
                $item_id = self::slugify_key($key);
                if ($item_id === '' || ! preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $item_id)) {
                    return new WP_Error(
                        'fides_vocab_item_id',
                        __('Could not derive a valid catalog id from the term key.', 'fides-vocabulary-glossary')
                    );
                }
            } elseif ($item_id === '' || ! Fides_Catalog_Submission_Registry::is_valid_item_id(self::TYPE, $item_id)) {
                return new WP_Error('fides_vocab_item_id', __('Invalid glossary term id.', 'fides-vocabulary-glossary'));
            }

            $normalized = array(
                'item_id'     => $item_id,
                'key'         => $key,
                'description' => $description,
            );

            if ($title !== '') {
                $normalized['title'] = $title;
            }
            if ($url !== '') {
                $normalized['url'] = $url;
            }
            if (! empty($aliases)) {
                $normalized['aliases'] = $aliases;
            }

            return $normalized;
        }

        /**
         * @param array<string, mixed> $payload Normalized payload.
         * @return array<string, mixed>
         */
        public static function payload_to_export(array $payload) {
            if (isset($payload['item_id'])) {
                unset($payload['item_id']);
            }
            if (isset($payload['id'])) {
                unset($payload['id']);
            }

            $key = sanitize_text_field((string) ($payload['key'] ?? ''));
            $term = array(
                'description' => (string) ($payload['description'] ?? ''),
            );
            if (! empty($payload['title'])) {
                $term['title'] = (string) $payload['title'];
            }
            if (! empty($payload['url'])) {
                $term['url'] = esc_url_raw((string) $payload['url']);
            }
            if (! empty($payload['aliases']) && is_array($payload['aliases'])) {
                $term['aliases'] = self::normalize_aliases($payload['aliases']);
            }

            return array(
                'termKey' => $key,
                'term'    => $term,
            );
        }

        /**
         * @param array<string, mixed> $item Glossary aggregated item.
         * @return array<string, mixed>
         */
        public static function catalog_item_to_payload(array $item) {
            $key = sanitize_text_field((string) ($item['key'] ?? $item['name'] ?? ''));
            $payload = array(
                'key'         => $key,
                'description' => sanitize_textarea_field((string) ($item['description'] ?? '')),
            );

            $name = sanitize_text_field((string) ($item['name'] ?? ''));
            if ($name !== '' && $name !== $key) {
                $payload['title'] = $name;
            }
            if (! empty($item['url'])) {
                $payload['url'] = esc_url_raw((string) $item['url']);
            }
            if (! empty($item['aliases']) && is_array($item['aliases'])) {
                $payload['aliases'] = self::normalize_aliases($item['aliases']);
            }

            return $payload;
        }

        /**
         * @param string $url     Default URL.
         * @param string $type    Submission type.
         * @param string $item_id Item id.
         * @param mixed  $item    Catalog item.
         * @return string
         */
        public static function filter_public_item_url($url, $type, $item_id, $item) {
            if ($type !== self::TYPE) {
                return $url;
            }
            $path = Fides_Vocabulary_Glossary_SSR::catalog_path();
            return add_query_arg('term', rawurlencode((string) $item_id), home_url(trailingslashit($path)));
        }
    }
}
