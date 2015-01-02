<?php

// register it
spl_autoload_register('pppAutoload');

/**
 * Follow the PSR-0 standard
 * @param string $className
 */
function pppAutoload($className) {
    $root = __DIR__."/";
    $segments = explode("\\", $className);
    if ($segments[0] == "PPPChat") array_shift($segments);
    if (file_exists($root. implode("/", $segments) . ".php" )) {
       include_once($root. implode("/", $segments). ".php"); 
    }   
}
