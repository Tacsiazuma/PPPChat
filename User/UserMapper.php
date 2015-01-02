<?php

namespace PPPChat\User;
use PPPChat\User\User;

/**
 * 
 * @author root
 *
 */
class UserMapper {

    /**
     * Our logged in user ID
     * @var int
     */
    private $id;
    
    /**
     * 
     * @param int $id
     */
    public function __construct($id) {
        $this->id = (int)$id;
    }
    /**
     * Get the users friends as friend objects in an array
     * @return multitype:\PPPChat\FriendList\Friend
     */
    public function get() {
        $this->addFriend($this->id, 1);
      $users = get_user_meta($this->id, 'PPPfriends');
      $userobjects = $this->hydrateUsers($users);
      
       return $userobjects;
        
    }
    /**
     * Add a friend (by id) to the specified user (by its id)
     * @param int $userid
     * @param int $friendid
     */
    public function addFriend($userid, $friendid){
        $friends = get_user_meta($userid, 'PPPfriends');
            if (!in_array($friendid, $friends)) {
                add_user_meta($userid, 'PPPfriends', $friendid);
            }
    }
    
    
    private function hydrateUsers($array) {
        foreach ($array as $user) {
            
            $friends[] = new User(get_user_meta($user, 'last_name', true),get_user_meta($user, 'first_name', true),
                $user, get_avatar($user, 32), get_user_meta($user, 'lastonline', true));
        }
        return $friends;
    }
    
    
    
}