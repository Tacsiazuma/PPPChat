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

error_reporting(E_ALL);

use PPPChat\Controller\AjaxController;
use PPPChat\Controller\HTTPController;
use PPPChat\Message\MessageMapper;
use PPPChat\Ajax\Response;
use PPPChat\UI\Admin;
use PPPChat\User\UserMapper;

// avoid direct script access
defined('ABSPATH') or die("No script kiddies please!");

// get our autoloader
include __DIR__.'/spl_autoload.php';

// check whether the current user seems to be logged in
// if not then we simply pass our workflow
    add_action('init', function() {
        define('PPP_PLUGIN_URL', plugin_dir_url(__FILE__));
        // instantiate the ajax controller and inject its dependencies
        $ajax = new AjaxController(new MessageMapper(get_current_user_id()), new Response());
        add_action('wp_ajax_refresh', [$ajax, 'parseRequest']);
        // create the http controller and inject its dependencies
        $b = new HTTPController(new Admin(), new UserMapper(get_current_user_id()));
    }); 
  