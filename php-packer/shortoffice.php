<?php
require 'php-packer/Packer.php';
error_reporting(E_ALL);
$js = file_get_contents('d6office.js');
$packer = new Tholu\Packer\Packer($js, 'Number', true, false, true);
$packed_js = $packer->pack();
echo $packed_js; ?>;
