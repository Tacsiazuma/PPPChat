<?php

/**
 * Plugin Name: PPP Chat
 * Plugin URI: http://URI_Of_Page_Describing_Plugin_and_Updates
 * Description: A brief description of the plugin.
 * Version: 1.0.0
 * Author: Papp Krisztián
 * Author URI: http://letscode.hu
 * License: GPL2
 */

namespace PPPChat;

use PPPChat\Controller\AjaxController;
use PPPChat\Controller\HTTPController;

// avoid direct script access
defined('ABSPATH') or die("No script kiddies please!");

// get our autoloader
include __DIR__.'/spl_autoload.php';

// check whether the current user seems to be logged in
// if not then we simply pass our workflow
    add_action('init', function() {
        define('PPP_PLUGIN_URL', plugin_dir_url(__FILE__));
        // add action listeners for ajax requests
        $ajax = new AjaxController();
        add_action('wp_ajax_refresh', [$ajax, 'parseRequest']);
        $b = new HTTPController($admin, $chat);
    }); 
  