<?php
include('../includes/Search.php');		//	define mySQL access functions etc, moved to varsetup
include('../includes/decoding.php');		//	routines for decoding
include('../includes/varsetup1.php');		//	set up variables

$page_title = "Get results: eeps ACS explorer";
$implosionSeparator = "\t";
	
$modDate =  date("l jS F Y h:i A", getlastmod());	

//
//	do pre-page calculations
$theID = $_GET['theID'];
$theSampleSize = $_GET['sampleSize'];

if (is_numeric($theSampleSize) AND $theSampleSize > 0)	{
	$limitForQuery = " ORDER BY RAND( ) LIMIT $theSampleSize ";
	//	$limitForQuery = "";	//	temp for Josh
	}

$row = eepsACS_getOneRow($eepsACS_connection, "SELECT * FROM $searchTable WHERE ID = '".$theID."'");

//
//		extract the search info.
//
$theSearch = unserialize($row['search']);
    
$variableDescription = $theSearch->getDescription($eepsACS_connection, $varTable);
$vararray = $theSearch->variableNameArray;
$theUserIP = $theSearch->userIP;

$varListForQuery = $theSearch->GetVariableString( );
$filterForQuery  = $theSearch->GetFilterString( );
$tableReferences	=	$theSearch->GetTableReferences( );

//  OK, search info is in hand.

$textVersion = "Plain text for ACS Data.<br>Extracted " . date(DATE_FORMAT) . "<br><br>";

	//	start assembling the table
	
	//	begin with the header row (surely we can be more efficient? Get them all at once?)
	//	we will set up our decoder and get all possible values as we go through the variables.
	
	$myDecoder = new Decoder();
	$myDecoder->setDB( $eepsACS_connection );
	
	
foreach($vararray as $v)	{
	$row = eepsACS_getOneRow($eepsACS_connection, "SELECT * FROM $varTable WHERE NAME = '".$v."'");
	if ($row)	{	//	it was in the list
		$varLabelArray[$v] = $row['nameout'];      //  was nameout
    }

	$myDecoder->setUpVariable( $v );
}
$textVersion .= implode($implosionSeparator, $varLabelArray);
$textVersion .= '<br>';

//	here is the MySQL query, constructed from its components...

$theQuery = "SELECT $varListForQuery FROM $tableReferences $filterForQuery $limitForQuery";
$r	=	eepsACS_getQueryResult($eepsACS_connection, $theQuery);

//	construct table guts. We evaluate the results of the query one row at a time...

$rownumber = 0;

foreach ($r as $row)	{
    $varTextArray = array( );
	$rownumber++;
	foreach($vararray as $v)	{
		$rawval = $row[$v];
		$val = $myDecoder->decode( $v, $rawval );
        $varTextArray[] = $val;
	}
    $textVersion .= implode($implosionSeparator,$varTextArray) . '<br>';        //  make data row for text (implode = put sep between array values)
	//$textVersion .= eeps_implode_array_with_tabs($varTextArray) . "<br>";
}

//	actual page stuff starts here ---------------------

?>

<!--            MAIN (center) column begins   -->


<?php

echo "<pre>";
echo    "Extracted ". date(DATE_FORMAT) ;
echo	$variableDescription;

echo	"<br>This sample has a total of $rownumber cases.";
echo	"<br>$textVersion";
echo "</pre>";

?>

