<?php

function reportToFile($message)
{
    file_put_contents("poseidonDebug.txt", $message . "\n", FILE_APPEND);
}

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

/**
 * Actually create a new game and install it in SQL
 * @param $DBH
 * @param $words
 * @return array
 */
function newGame($DBH, $theValues, $words)
{
    $theCode = generateNewGameCode($DBH, $words);
    reportToFile("    ... php new game function, the new code is $theCode");

    //  assemble the query
    $params['gameCode'] = $theCode;
    $params['onTurn'] = $theValues->onTurn;
    $params['pop'] = $theValues->population;
    $params['config'] = $theValues->configuration;
    $params['gameState'] = $theValues->gameState;

    $query = "INSERT into games (gameCode, population, turn, config, gameState) "
        . "VALUES (:gameCode, :pop, :onTurn, :config, :gameState)";

    //  make a new games record
    $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);

    $out = getGameData($DBH, (object)array('gameCode' => $theCode));

    //  $responseArray = array('ok' => true, 'code' => $theCode);
    reportToFile("    ... php in newGame, out is " . print_r($out, true));
    error_log("\nPoseidon: New game $theCode");

    return $out;
}

function updateGame($DBH, $theValues)
{
    reportToFile("updateGame() theValues = " . print_r($theValues, true));
    $tParams = array();
    $tParams['gameCode'] = $theValues->gameCode;
    $tParams['gameState'] = $theValues->gameState;
    $tParams['population'] = $theValues->population;
    $tParams['reason'] = $theValues->reason;
    $tParams['turn'] = $theValues->turn;

    $query = "UPDATE games SET turn = :turn, population = :population, " .
        "gameState = :gameState, reason = :reason WHERE gameCode = :gameCode";
    CODAP_MySQL_doQueryWithoutResult($DBH, $query, $tParams);

    reportToFile("... game updated");
    return true;
}

function updatePlayers($DBH, $theValues)
{
    reportToFile("updatePlayers()");
    foreach ($theValues as $player) {
        $tParams = array();
        $tParams['gameCode'] = $player->gameCode;
        $tParams['playerName'] = $player->playerName;
        $tParams['onTurn'] = $player->onTurn;
        $tParams['balance'] = $player->balance;

        $query = "UPDATE players SET onTurn = :onTurn, balance = :balance " .
            "WHERE gameCode = :gameCode AND playerName = :playerName";
        CODAP_MySQL_doQueryWithoutResult($DBH, $query, $tParams);
    }
    return true;
}

function updateTurns($DBH, $theValues)
{
    reportToFile("updateTurns() theValues = " . print_r($theValues, true));
    foreach ($theValues as $turn) {
        $tParams = array();
        $tParams['gameCode'] = $turn->gameCode;
        $tParams['playerName'] = $turn->playerName;
        $tParams['onTurn'] = $turn->onTurn;
        $tParams['balanceAfter'] = $turn->balanceAfter;
        $tParams['unitPrice'] = $turn->unitPrice;
        $tParams['income'] = $turn->income;

        $query = "UPDATE turns SET ".
            "balanceAfter = :balanceAfter, unitPrice = :unitPrice, income = :income WHERE " .
            "gameCode = :gameCode AND playerName = :playerName AND onTurn = :onTurn";
        CODAP_MySQL_doQueryWithoutResult($DBH, $query, $tParams);
    }
    return true;
}

function getGameData($DBH, $theValues)
{
    //  reportToFile("Getting game data for " . $theValues->gameCode);

    $tParams = array();
    $tParams['gameCode'] = $theValues->gameCode;

    $query = "SELECT * FROM games WHERE gameCode = :gameCode";
    $out = CODAP_MySQL_getQueryResult($DBH, $query, $tParams);
    //  reportToFile("... getGameData() out: " . print_r($out[0], true));
    return $out[0];     // first game
}

function getAllPlayers($DBH, $theValues)
{
    $tParams = array();
    $tParams['gameCode'] = $theValues->gameCode;
    $query = "SELECT * FROM players WHERE gameCode = :gameCode";
    $out = CODAP_MySQL_getQueryResult($DBH, $query, $tParams);
    //  reportToFile("... getPlayersData() out: " . print_r($out, true));
    return $out;
}

function getAllTurns($DBH, $theValues)
{
    $tParams = array();
    $tParams['gameCode'] = $theValues->gameCode;
    $tParams['onTurn'] = $theValues->gameTurn;
    $query = "SELECT * FROM turns WHERE gameCode = :gameCode AND onTurn = :onTurn ORDER BY onTurn";
    $out = CODAP_MySQL_getQueryResult($DBH, $query, $tParams);
    //  reportToFile("... getTurnsData() out: " . print_r($out, true));
    return $out;     //  all turns in an array
}

function getGameSituation($DBH, $theValues)
{
    $game = getGameData($DBH, $theValues);
    $players = getAllPlayers($DBH, $theValues);
    $theCurrentGameTurn = $game['turn'];
    $turns = getAllTurns($DBH, $theValues); //  theValues must include the gameTurn

    $missingPlayers = array();
    $allPlayers = array();

    foreach ($players as $p) {
        $innit = false;
        foreach ($turns as $t) {
            if ($t["playerName"] == $p["playerName"]) {
                $innit = true;
            }
        }
        array_push($allPlayers, $p["playerName"]);
        if (!$innit) array_push($missingPlayers, $p["playerName"]);
    }

    $out = array(
        'OK' => (count($players) == count($turns)),
        'gameState' => $game['gameState'],
        'missing' => $missingPlayers,
        'allPlayers' => $allPlayers,
        'gameTurn' => $theCurrentGameTurn,
    );

    return $out;
}

/*      now, what we actually do    */

$responseArray = array();

reportToFile("\n--------------------------------- starting a $theAction $theResource at " . date('h:i:s.v'));
reportToFile("The values are " . print_r($theValues, true));

switch ($theResource) {
    case "game":
        //  reportToFile("\n    ... php: game in switch tree");
        $table = "games";   //  which table we'll be working with

        switch ($theAction) {
            case "create":      //  new game
                reportToFile("    ... php: creating a new game in switch tree");
                $responseArray = newGame($DBH, $theValues, $words);
                break;
            case "update":
                reportToFile("    ... php: updating a game in switch tree");
                $responseArray = updateGame($DBH, $theValues);
                break;
            case "get":
                //  reportToFile("    ... php: getting a single game in switch tree");
                $responseArray = getGameData($DBH, $theValues);
                break;
        }
        break;

    case "situation":
        //  reportToFile("    ... php: getting a situation in the switch tree");
        $responseArray = getGameSituation($DBH, $theValues);
        break;

    case "players":
    case "player":
        //  reportToFile("    ... php: player in switch tree");
        $table = "players";

        switch ($theAction) {
            case "get":
                //  reportToFile("    ... php: getting all players in switch tree");
                $responseArray = getAllPlayers($DBH, $theValues);
                break;
            case "update":
                reportToFile("    ... php: updating all players in switch tree." );
                $responseArray = updatePlayers($DBH, $theValues);
                break;

        }
        break;

    case "turns":
    case "turn":
        //  reportToFile("    ... php: turn/s in switch tree");
        $table = "turns";

        switch ($theAction) {
            case "get":
                //  reportToFile("    ... php: getting all turns in switch tree");
                $responseArray = getAllTurns($DBH, $theValues);
                break;
            case "update":
                reportToFile("    ... php: updating all turns in switch tree");
                $responseArray = updateTurns($DBH, $theValues);
                break;

        }
        break;
}

$encoded = json_encode($responseArray);
reportToFile("    ... php encoded output is  $encoded");
echo $encoded;
?>
