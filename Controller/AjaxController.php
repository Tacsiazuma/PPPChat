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
        if (isset($_POST['messages'])) {
            $this->normalPoll($user);
        }
        elseif(!empty($_POST['fill'])) {
            $this->normalPoll($user);
        }
        else 
            $this->longPoll($user);
    }
    /**
     * As they sent data we performing a normal poll
     */
    private function normalPoll($user) {
        
        // put the messages to the database then make a key -> value pair with clientid -> serverid
        // to the response ack field
        if (!empty($_POST['messages']))
        foreach ($_POST['messages'] as $message) {
            $serverid = $this->mapper->saveMessage($user->ID, mysql_real_escape_string($message['receiver']), mysql_real_escape_string($message['body']));
            $idsToUpdate[] = $serverid;
            $this->response->ack[] = array('clientid' => $message['clientid'], 'serverid' => $serverid);    
        }
        // update the messages we delivered
        if (!empty($_POST['delivered']))
            $querystr = $this->mapper->updateDeliveredMessages($_POST['delivered']);
        if (!empty($_POST['fill']))
            foreach ($_POST['fill'] as $friend) { 
                $this->mapper->fillRequest($user->ID, $friend);
            }
        // check for new messages too
        $this->mapper->hasUnRead($user->ID);
        // then fill the messages
        $this->response->messages =  $this->mapper->getResults();
        $this->response->code = 200;
        $this->response->send();
    }
    /**
     * 
     */
    private function longPoll($user){
        // make it a long poll
        set_time_limit(20);
        if (!empty($_POST['delivered']))
        $this->mapper->updateDeliveredMessages($_POST['delivered']);
        $tries = 0;
        // try it several times       

        while($tries < 5) {
            $tries++;
            // check whether we got a new message in the database with the given UID
            if ($this->mapper->hasUnRead($user->ID)) {
                // send back the response and die()
                $this->response->code = 200;
                $this->response->messages = $this->mapper->getResults();
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
        $message = $_POST['message'];
        // save the message to the database
        $id = $this->mapper->saveMessage($sender, $receiver, $message); // they are escaped at the mapper
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