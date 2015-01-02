<?php


namespace PPPChat\UI;

defined('ABSPATH') or die("No script kiddies please!");
/**
 * This file make the options page at the admin panel to setup the plugin options
 * Notice: this file has nothing to do with the user setup page
 * @author root
 *
 */
class Admin {
    
        /**
         * Adds an item to the admin menu and sets $this->ChatOptions as the handler
         */
  public function addAdminItem() {
            add_submenu_page('options-general.php', "PPP Chat", "PPP Chat", 'manage_options', 'ppp-chat-options', [$this, 'ChatOptions']);
        }
        /**
         * This method contains the admin menu options page for this plugin
         */
  public function ChatOptions() {
       ?>
       <div>
       <h2>PPP Chat</h2>
       <form method="post" action="options.php">
       <?php settings_fields($option_group); ?>
       <?php do_settings_sections('plugin_options'); ?>
       <input name="submit" type="submit" value="Save" />
       </form>
       </div>
       
       <?php      
  }  

  public function adminPluginInit() {
 
      register_setting( 'plugin_options', 'plugin_options', [$this,'plugin_options_validate'] );
      add_settings_section('plugin_main', 'Main Settings', [$this,'plugin_section_text'], 'plugin');
      add_settings_field('plugin_text_string', 'Plugin Text Input', 'plugin_setting_string', 'plugin', 'plugin_main');
  }
        
  public function plugin_section_text() {
      ?>
      <p>Section text</p>
      <?php 
  }
  public function plugin_options_validate($input) {
      $options = get_option('plugin_options');
      $options['text_string'] = trim($input['text_string']);
      if(!preg_match('/^[a-z0-9]{32}$/i', $options['text_string'])) {
          $options['text_string'] = '';
      }
      return $options;
  }  
}