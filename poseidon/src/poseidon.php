<?php

function reportToFile($message)
{
    file_put_contents("poseidonDebug.txt", $message . "\n", FILE_APPEND);
}

reportToFile("    ... php starting with this request " . print_r($_REQUEST, true));

$whence = json_decode($_REQUEST['whence']);
$theAction = json_decode($_REQUEST["action"]);
$theResource = json_decode($_REQUEST["resource"]);
$theValues = json_decode($_REQUEST["values"]);

include 'words.php';

include './poseidonEstablishCredentials.php';   //  sets $user, etc
include '../../common/TE_DBCommon.php';

header('Access-Control-Allow-Origin: *');

/**
 * DBH = Data Base Handle
 */
$DBH = CODAP_MySQL_connect("localhost", $user, $pass, $dbname);     //  works under MAMP....

/*      testing     */


/*      functions       */
function generateNewGameCode($DBH, $words)
{
    reportToFile("    ... php generating new game code");
    $params = array();
    $query = "SELECT MAX(id) AS max FROM games";
    $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
    $theResultArray = $out[0];
    try {
        $theNumber = (int)$theResultArray["max"];
        reportToFile("    ... php the number is $theNumber");
    } catch (Exception $e) {
        $theNumber = 0;
        reportToFile("\tNOTE: the number of records threw an exception and was set to zero: ");
    }
    $theNumber++;

    //  now use the built-in "words" array
    $iNumber = $theNumber;
    $largePrimes = [2347, 2011, 2017];
    reportToFile("\tReady to make the code. ..... the number is $iNumber");

    $N = count($words);

    $extraTens = floor($iNumber / $N);
    $extraHundreds = floor($iNumber / $N / $N);
    $unitsIndex = (100 + $iNumber * $largePrimes[0]) % $N;
    $tensIndex = (300 + $extraTens + $iNumber * $largePrimes[1]) % $N;
    $hundredsIndex = (200 + $extraHundreds + $iNumber * $largePrimes[2]) % $N;

    //  reportToFile("\tmaking new game code: extra10, extra100: $extraTens $extraHundreds");
    //  reportToFile("\tmaking new game code: nwords: $N indices: $unitsIndex $tensIndex $hundredsIndex");

    $c = $words[$unitsIndex];
    $c .= "." . $words[$tensIndex];
    $c .= "." . $words[$hundredsIndex];

    $theCode = $c;      //          newGameCode($theNumber);
    reportToFile("\tnew game code just made: " . print_r($theCode, true));
    return $theCode;
}

function newGame($DBH, $words) {
    reportToFile("    ... php in the NewGame function");
    $theCode = generateNewGameCode($DBH, $words);
    reportToFile("    ... php the new code is $theCode");
    $responseArray = array('ok' => true, 'code' => $theCode);
    reportToFile("    ... php in newGame, response array is ".print_r($responseArray, true));
    return $responseArray;
}
/*      now, what we actually do    */

$responseArray = array();

reportToFile("The resource is $theResource and the action is $theAction");
reportToFile("The values are " . print_r($theValues, true));
switch ($theResource) {
    case "game":
        reportToFile("    ... php: game in switch tree");
        $table = "games";   //  which table we'll be working with

        switch ($theAction) {
            case "create":      //  new game
                reportToFile("    ... php: creating a new game in switch tree");
                $responseArray = newGame($DBH, $words);
                break;
            case "get":
                reportToFile("    ... php: getting a game in switch tree");
                break;
        }
        break;

    case "player":
        reportToFile("    ... php: player in switch tree");
        $table = "players";
        break;
}

$encoded = json_encode($responseArray);
reportToFile("    ... php encoded is  $encoded");
echo $encoded;
?>
