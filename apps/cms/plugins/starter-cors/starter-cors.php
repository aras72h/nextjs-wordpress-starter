<?php
/**
 * Plugin Name: Starter CORS Headers
 * Description: Adds CORS headers to WordPress REST API responses for Next.js
 * Version: 1.0.0
 * Author: nextjs-wordpress-starter
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        $allowed_origins = [
            'http://localhost:3000',
            'http://localhost:3001',
            // Add your production/staging domains here, e.g.:
            // 'https://yourdomain.com',
            // 'https://staging.yourdomain.com',
        ];

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }

        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');

        return $value;
    });
}, 15);
