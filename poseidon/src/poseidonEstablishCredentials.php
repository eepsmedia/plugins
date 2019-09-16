<?php
/**
 * Created by IntelliJ IDEA.
 * User: tim
 * Date: 8/18/18
 * Time: 14:58
 */

//  $whence = $_REQUEST['whence'];

$credentialFileNames = [
    "local" => "/Applications/MAMP/cred/fishCred.php",
    "xyz" => "/home/codapxyz/cred/fishCred.php"
];

$thisFileName = $credentialFileNames[$whence];

//  reportToFile("in credential file named $thisFileName");

try {
    include_once($thisFileName);
} catch (Exception $e) {
    error_log("Error including the credentials file.  $e->getMessage()");
}

$user = $credentials[$whence]["user"];
$pass = $credentials[$whence]["pass"];
$dbname = $credentials[$whence]["dbname"];

//  reportToFile("    ... php pass: $pass");

?>