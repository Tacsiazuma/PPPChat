<?php

namespace PPPChat\Ajax;

class Response {
    
    public $code, $messages;
    
    /**
     * Fill the response with the basic response data
     */
    public function __construct() {
        $this->code = 204;
        $this->messages = null;
        
    }
    
    /**
     * Send the response itself
     */
    public function send() {
       wp_send_json($this);
        
    }
    
    
}