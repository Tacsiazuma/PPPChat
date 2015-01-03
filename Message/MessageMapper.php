<?php

namespace PPPChat\Message;
use PPPChat\Mapper\AbstractWpMapper;

class MessageMapper extends AbstractWpMapper {
    
    private $results, $id;
    
    
    public function __construct($id) {
        $this->id = $id;
        $this->results = [];
        
        parent::__construct();
    }
    /**
     * Checks whether we got unread messages
     * @param unknown $receiverId
     * @param unknown $lastMessageId
     * @return boolean
     */
    public function hasUnRead($receiverId) {
        global $wpdb;

        $querystr = "SELECT $wpdb->posts.* 
    FROM $wpdb->posts
    WHERE $wpdb->posts.post_status = 'sent'
    AND $wpdb->posts.post_title = '$receiverId'
    ORDER BY $wpdb->posts.ID DESC";
        $this->results = array_merge($this->results, $wpdb->get_results($querystr));
        if (empty($this->results)) return false;
        return true;
    }
    /**
     * Hydrate the resultset into message objects
     * @return multitype:\PPPChat\Message\Message
     */
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
     * Method for the initial messages
     * we gonna get the 50 latest message for the given uid/uid pair
     * @param int $userid
     * @param array $friendid
     */
    public function fillRequest($userid, $friend) {
        global $wpdb;
            // get information regarding to the communication
        $querystr = "SELECT $wpdb->posts.*
        FROM $wpdb->posts
        WHERE $wpdb->posts.post_author IN ('$friend','$userid')
        AND $wpdb->posts.post_title IN ('$friend','$userid')
        ORDER BY $wpdb->posts.ID DESC
        LIMIT 50";
        $this->results = array_merge($this->results, $wpdb->get_results($querystr));
    }
    /**
     * We update the messages to delivered as we send the ack
     * @param array $arrayOfIds
     * @return void
     */
    public function updateDeliveredMessages($arrayOfIds) {
        global $wpdb;
        foreach ($arrayOfIds as $id) {
            $querystr = "UPDATE $wpdb->posts
            SET $wpdb->posts.post_status = 'delivered'
            WHERE $wpdb->posts.ID = '$id'";
            $wpdb->get_results($querystr);
        }
        return;
    }
    
    /**
     * We received a request with a message. Though we set up an ajax handler ONLY for logged in users
     * we wont bother autenticate, just simply append the message to the stack.
     * NOTICE: These messages are SENT, but not READ and so it triggers the hasunread method
     */
    public function saveMessage($sender, $receiver, $message) {
        // inserting the post in first place
        $messageId = wp_insert_post([
            'post_content' => $message, // we store the message in the post_content field
            "post_title" => $receiver, // the receiver ID in the post_title field
            'post_type' => 'message', // set the post type to our custom type
            'post_status' => 'sent' // set the status to sent this means we are     
        ]);
        return $messageId; // return the inserted id for ACK
    }
        

}
