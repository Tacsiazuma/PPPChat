<?php

namespace PPPChat\User;

/**
 * 
 * @author root
 * @param string $name
 * @param int $uid
 * @param string $profilepic
 * @param int $onlinemark
 */

class User {
    public $fristname, $lastname, $profilepic, $uid, $onlinemark;
    
    public function __construct($firstname,$lastname, $uid, $profilepic, $onlinemark) {
        $this->firstname = $firstname;
        $this->lastname = $lastname;
        $this->profilepic = $profilepic;
        $this->uid = $uid;
        $this->onlinemark = $onlinemark;
    }
}