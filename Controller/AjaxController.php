<?php

namespace PPPChat\Controller;

use PPPChat\Message\MessageMapper;
use PPPChat\Ajax\Response;


class AjaxController {
    
    private $mapper;
    private $response;
    
    public function __construct(MessageMapper $mapper, Response $response) {
        $this->mapper = $mapper;
        $this->response = $response;
        
    }
    /**
     * We got a refresh request so check whether we have anything to send back
     * as it is a long poll request, make it as long as possible
     */
    public function parseRequest() {
        $user = wp_get_current_user();
        $this->updateStatus($user->ID);
        // as the messages array is present they got sent messages so we send respond asap
        if (isset($_POST['messages'])) 
            $this->normalPoll($user);
        else 
            $this->longPoll($user);
    }
    /**
     * As they sent data we performing a normal poll
     */
    private function normalPoll($user) {
        
        // put the messages to the database then make a key -> value pair with clientid -> serverid
        // to the response ack field
        foreach ($_POST['messages'] as $message) {
            $serverid = $this->mapper->saveMessage($user->ID, $message['receiver'], $message['body']);
            $idsToUpdate[] = $serverid;
            $this->response->ack[] = array('clientid' => $message['clientid'], 'serverid' => $serverid);    
        }
        $this->mapper->updateReadmessages($idsToUpdate);
        // check for new messages too
        if ($this->mapper->hasUnRead($user->ID, $_POST['lastMessageId'])) {
            $this->response->messages =  $this->mapper->getResults();
        }
        $this->response->code = 200;
        $this->response->send();
    }
    /**
     * 
     */
    private function longPoll($user){
        // get the current user object
         
        // make it a long poll
        set_time_limit(20);
         
        $tries = 0;
        // try it several times

        while($tries < 5) {
            $tries++;
            // check whether we got a new message in the database with the given UID
            if ($this->mapper->hasUnRead($user->ID, $_POST['lastMessageId'])) {
                // send back the response and die()
                $this->response->code = 200;
                $this->response->messages =  $this->mapper->getResults();
                $this->response->send();
            }
            // wait 2 secs for the next request
            sleep(2);
        }
        // we got no message so send back an empty response
        $this->response->code = 204;
        $this->response->send();
    }
    
    /**
     * We send back the inserted message ID so the js can update its last seen message ID for
     * further refresh requests
     */
    public function sendMessage() {
        $sender = wp_get_current_user()->ID;
        $receiver = (int) $_POST['target'];
        $message = htmlentities($_POST['message']);
        // save the message to the database
        $id = $this->mapper->saveMessage($sender, $receiver, $message);
        // now its time to send back a response
        $this->response->code = 210;
        $this->response->lastMessageId = $id;
        $this->response->send();
    }
    /**
     * Adds/updates lastonline meta field to the current user
     * @param unknown $id
     */
    private function updateStatus($id) {
        update_user_meta($id, 'PPP_lastonline', time());
    }
}