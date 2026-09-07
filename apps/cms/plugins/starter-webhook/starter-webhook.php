<?php
/**
 * Plugin Name: Starter Webhook
 * Description: Sends webhook to Next.js on post publish/update/delete
 * Version: 1.0.0
 * Author: nextjs-wordpress-starter
 */

if (!defined('ABSPATH')) exit;

define('STARTER_NEXTJS_URL', getenv('NEXTJS_REVALIDATE_URL') ?: 'http://host.docker.internal:3000/api/revalidate');
define('STARTER_WEBHOOK_SECRET', getenv('REVALIDATION_SECRET') ?: '');

function starter_send_webhook(string $event, int $post_id, string $slug): void {
    if (empty(STARTER_WEBHOOK_SECRET)) {
        error_log('Starter Webhook: REVALIDATION_SECRET not set');
        return;
    }

    $payload = json_encode([
        'event'     => $event,
        'post_id'   => $post_id,
        'slug'      => $slug,
        'type'      => 'post',
        'timestamp' => gmdate('c'),
    ]);

    $response = wp_remote_post(STARTER_NEXTJS_URL, [
        'timeout'     => 5,
        'blocking'    => false,
        'headers'     => [
            'Content-Type'       => 'application/json',
            'X-Webhook-Secret'   => STARTER_WEBHOOK_SECRET,
        ],
        'body'        => $payload,
    ]);

    if (is_wp_error($response)) {
        error_log('Starter Webhook error: ' . $response->get_error_message());
    }
}

// Triggers
add_action('publish_post', function (int $post_id) {
    $post = get_post($post_id);
    if ($post) starter_send_webhook('post.published', $post_id, $post->post_name);
}, 10, 1);

add_action('post_updated', function (int $post_id, WP_Post $post_after) {
    if ($post_after->post_status === 'publish') {
        starter_send_webhook('post.updated', $post_id, $post_after->post_name);
    }
}, 10, 2);

add_action('before_delete_post', function (int $post_id) {
    $post = get_post($post_id);
    if ($post && $post->post_type === 'post') {
        starter_send_webhook('post.deleted', $post_id, $post->post_name);
    }
});
