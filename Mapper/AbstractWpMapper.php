<?php 

namespace PPPChat\Mapper;


class AbstractWpMapper {
    
    protected $db;
    
    public function __construct() {
        global $wpdb;
        $this->db = $wpdb;
    }
    
    
    
    
    
}



?>