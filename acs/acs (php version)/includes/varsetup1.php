<?php 
	session_start( );
	
// set up mySQL
include('../includes/functions1.php');	//	define mySQL access functions etc, moved to varsetup
//require_once('../connections/acsConnection.php');		//	connect to ACS db. NOTE: be sure path is correct for distribution


require_once('../../../../connections/acsConnection.php');		//	connect to ACS db on eeps site


    $debugging = false;
    $debug = "Debugging: <br>";
    $footerguts = NULL;
    $textVersion = NULL;
	
    $varTable					= 'variables';
	$groupTable					=	'groups';
	$searchTable				=	'searches';
    $peepsTable                 =   'peeps';
    $recodeTable                 =   'decoder';
	
	define("DATE_FORMAT", "d M Y H:i");
    date_default_timezone_set("America/Los_Angeles");

//--------------------------------------------------------
?>
