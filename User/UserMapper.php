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
      $users = get_user_meta($this->id, 'PPPfriends');
      if (is_array($users)){
      $userobjects = $this->hydrateUsers($users);
      return $userobjects;
      } else 
          return false; // we have no friends for now
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
    
    /**
     * Get new friend requests for the given userid
     */
    
    public function getRequests() {
        $requests = get_user_meta($this->id, 'PPPfriendRequests');
        return $this->hydrateUsers($requests);
    }
    
    private function hydrateUsers($array) {
        $friends = array();
        foreach ($array as $user) {
            
            $friends[] = new User(get_user_meta($user, 'last_name', true),get_user_meta($user, 'first_name', true),
                $user, get_avatar($user, 32), get_user_meta($user, 'lastonline', true));
        }
        return $friends;
    }
    
    
    
}
