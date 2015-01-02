<?php

namespace PPPChat\Message;
use PPPChat\Mapper\AbstractWpMapper;

class MessageMapper extends AbstractWpMapper {
    
    private $results, $id;
    
    
    public function __construct($id) {
        $this->id = $id;
        
        parent::__construct();
    }
    
    public function hasUnRead($receiverId, $lastMessageId) {
        global $wpdb;

        $querystr = "SELECT $wpdb->posts.* 
    FROM $wpdb->posts
    WHERE $wpdb->posts.ID > '$lastMessageId'
    AND $wpdb->posts.post_title = '$receiverId'
    ORDER BY $wpdb->posts.post_date DESC";
        $this->results = $wpdb->get_results($querystr);
        if (empty($this->results)) return false;
        return true;
    }
    
    public function getResults() {
        $messages = array();
        foreach ($this->results as $result) {
            $message = new Message();
            $message->serverid = $result->ID;
            $message->content = $result->post_content;
            $message->sender = $result->post_author;
            $message->receiver = $result->post_title;
            $message->sent = $result->post_date;
            $messages[] = $message;
        }
        return $messages;
    }
    
    
    
    /**
     * We received a request with a message. Though we set up an ajax handler ONLY for logged in users
     * we wont bother autenticate, just simply append the message to the stack.
     */
    public function saveMessage($sender, $receiver, $message) {
        // inserting the post in first place
        $messageId = wp_insert_post([
            'post_content' => $message,
            "post_title" => $receiver,
            'post_type' => 'message'
        ]);
        return $messageId;
    }
        

}
