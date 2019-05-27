<?php

$pass = "";
$user = "";
$dbname = "";

include 'blodgett.establishCredentials.php';     //  defines the credentials we need for mySQL

header('Access-Control-Allow-Origin: *');

function reportToFile($message)
{
    file_put_contents("blodgettDebug.txt", $message . "\n", FILE_APPEND);
}

//  ------------    Connect to database ------------
include '../common/TE_DBCommon.php';
//  ------------    Connected ------------

reportToFile('      .. ');
error_log('CRED TEST: whence '. $whence ." | user ". $user . " | pass ".$pass." | dbname ".$dbname);

$DBH = CODAP_MySQL_connect("localhost", $user, $pass, $dbname);     //  works under MAMP....

$params = array();  //  accumulate parameters for query
$query = "SELECT * FROM blodgett LIMIT 10";

$command = $_REQUEST["c"];     //  this is the overall command, the only required part of the POST

$out = "{ Unhandled command : " . $command . "}";

switch ($command) {

    case 'getCases':
        reportToFile("[$command]............" . date("Y-m-d H:i:s (T)"));
        $startDate = $_REQUEST['d0'];       //  ISO string of date
        $theVariables = $_REQUEST['atts'];

        //  construct the parameters
        $params['d0'] = $startDate;
        $params['d1'] = $_REQUEST['d1'];
        reportToFile("Get cases params : " . print_r($params, true));

        $dateRange = " ( Date BETWEEN :d0 AND :d1 ) ";

        $query = "SELECT $theVariables FROM blodgett WHERE " . $dateRange;
        reportToFile("Get cases query : $query");

        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);

        break;
}

echo json_encode($out);;

?>