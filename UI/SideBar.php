<?php

namespace PPPChat\UI;

class SideBar {
    
    public function __construct($array) {
        echo "<div id=\"chatsidebar\">";
        foreach ($array as $friend) {
            
         echo "<div class=\"friend\" uid=\"".$friend->getUid()."\">".$friend->getName()."</div>";   
            
        }
        echo "</div>";
        echo "<div id=\"chatframewrapper\"></div>";
    }
    
}