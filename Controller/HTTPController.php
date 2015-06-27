<?php

namespace PPPChat\Controller;

use PPPChat\UI\Admin;
use PPPChat\UI\ChatFrame;
use PPPChat\UI\SideBar;
use PPPChat\User\UserMapper;
use PPPChat\Message\MessageMapper;


// avoid direct script access
defined('ABSPATH') or die("No script kiddies please!");
    
class HTTPController {
    
    
        public function __construct(Admin $admin, UserMapper $mapper) {
            add_action('init', [$this, "initialize"]);
            
            // If admin page present then register actions for the admin menu
            if (is_admin()) {
            // add an item to the admin menu
            add_action('admin_menu', [ $admin, 'addAdminItem']);
            add_action('admin_init', [ $admin, 'adminPluginInit']);
            }
            // If a user is logged in (and not admin) then register actions for him
            if (is_user_logged_in() && !is_admin()) {
                // add the script
                wp_enqueue_script('pppchat',PPP_PLUGIN_URL."js/chat.js", ["jquery"]);
                $friendlist = $mapper->get();
                // add the initial json
                wp_localize_script('pppchat', 'host', array('url' => admin_url( 'admin-ajax.php'), 'uid' => get_current_user_id(), 'friend' => $friendlist));
                wp_enqueue_style('pppchat', PPP_PLUGIN_URL. "css/style.css");
            }
        } 
        /**
         * Our initializer method
         */
            public function initialize() {
                // register the post type
            register_post_type('message', [
            'labels' => [
                'name'=> 'Message'
                    ],
            'supports' => ['custom-fields'],
            'public' => true,
            'hierarchical' => false,
            'exclude_from_search' => true,
            'publicly_queryable' => false
            ] );
           
            }
}