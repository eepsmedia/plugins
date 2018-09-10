<?php
include('../includes/Search.php');		//	define mySQL access functions etc, moved to varsetup
include('../includes/decoding.php');		//	routines for decoding

$page_title = "Get results: eeps ACS explorer";
$implosionSeparator = "\t";
	
	$modDate =  date("l jS F Y h:i A", getlastmod());	
	
	include('../includes/varsetup1.php');		//	set up variables
//
//	do pre-page calculations
	$theID = $_GET['theID'];
	$theSampleSize = $_GET['sampleSize'];
    //	if ($theSampleSize > 1000) $theSampleSize = 1000;
    
	if (is_numeric($theSampleSize) AND $theSampleSize > 0)	{
		$limitForQuery = " ORDER BY RAND( ) LIMIT $theSampleSize ";
		//	Temp for Josh
		//	$limitForQuery = "";
		}
	
	$row = eepsACS_getOneRow($eepsACS_connection, "SELECT * FROM $searchTable WHERE ID = '".$theID."'");
    
    //
    //		extract the search info.
    //
	$theSearch = unserialize($row['search']);
    
    $theSearch->setUserIP( getUserIP());
    
	$variableDescription = $theSearch->getDescription($eepsACS_connection, $varTable);
	$vararray = $theSearch->variableNameArray;
    $theUserIP = $theSearch->userIP;

	$varListForQuery = $theSearch->GetVariableString( );
	$filterForQuery  = $theSearch->GetFilterString( );
	$tableReferences	=	$theSearch->GetTableReferences( );
    
    //  OK, search info is in hand.
    
    $textVersion = "CSV text for ACS Data.<br>Extracted ". date(DATE_FORMAT) . " <br><br>$variableDescription <br><br>";

	//	start assembling the table
	//	we will set up our decoder and get all possible values as we go through the variables.
	
	$myDecoder = new Decoder();
	$myDecoder->setDB( $eepsACS_connection );
	
	//	begin with the header row (surely we can be more efficient? Get them all at once?)
	
	$tableheader = "\n<tr>";
	foreach($vararray as $v)	{	//	$v is the internal name of the variable
		$variableRow = eepsACS_getOneRow($eepsACS_connection, "SELECT * FROM $varTable WHERE NAME = '".$v."'");
		if ($variableRow)	{	//	it was in the list
			$varLabelArray[$v] = $variableRow['nameout'];      //  was nameout
			$tableheader	.= " <th>$varLabelArray[$v]</th> ";	
			
			$myDecoder->setUpVariable( $v );
        }
	}
	$tableheader	.=	"</tr>";
    $textVersion .= implode($implosionSeparator, $varLabelArray);
    $textVersion .= '<br>';
    
	
	
	//	here is the MySQL query for the data itself, constructed from its components...
	
	$theQuery = "SELECT $varListForQuery FROM $tableReferences $filterForQuery $limitForQuery";
	$r	=	eepsACS_getQueryResult($eepsACS_connection, $theQuery);

//	construct table guts. We evaluate the results of the query one row at a time...

	$tableguts = NULL;
	$rownumber = 0;
    
	foreach ($r as $row)	{
        $varTextArray = array( );
		$rownumber++;
		$tableguts	.=	"\n<tr>";
		foreach($vararray as $v)	{
			$rawval = $row[$v];
            //$val = decodeValue( $eepsACS_connection, $v, $rawval );
			$val = $myDecoder->decode( $v, $rawval );
			$tableguts	.=	"<td>$val</td>";
            $varTextArray[] .= $val;
			}
		$tableguts	.=	"</tr>";
        $textVersion .= implode($implosionSeparator,$varTextArray) . '<br>';        //  make data row for text (implode = put sep between array values)
		}
//	prepare informational message for the footer

//
	$footerGuts = "<h4>Entire MySQL query</h4>";
	$footerGuts	.=	"SELECT $varListForQuery <br> FROM $tableReferences <br> $filterForQuery $limitForQuery";
	$footerGuts	.=	"<br>";
//
//	actual page stuff starts here ---------------------
	include('../includes/header.php');
?>

<!--            MAIN (center) column begins   -->

<article>

<form action="choose.php" method="post" name="ChooseVars">
	<input class='button' type = 'submit' value = 'Back to choose variables' name = 'Choose'> &nbsp;
</form>
<form action="textACS.php" target = "_blank" method="get">
	<input class = "button" type="submit" name="getResults" value="See plain text in new tab">
	<input type="hidden" value="<?php echo $theID ?>" name = "theID">
	<input type="hidden" value="<?php echo $theSampleSize ?>" name = "sampleSize">
</form>

<h3>Data Results</h3>
<?php

	echo    "Extracted ". date(DATE_FORMAT) . " from IP $theUserIP<br><br>";
	echo	$variableDescription;
	
	echo	"\n<br>This sample has a total of $rownumber cases.<br><br>";
	echo	"\n<table> $tableheader $tableguts </table>";
	
?>
</article>

<!-- 		Right column						 -->

<aside id= 'vBox'>

	<h4>Updates!</h4>
	<ul>
		<li>7 March 2015: the plain text now appears in a new tab. Just select all and copy!</li>
		<li>25 February: text at the bottom more reliable for pasting into Fathom. 
			It's now tab-separated instead of comma-separated.</ll>
	</ul>
<script language="Javascript">
	var lastModifiedDate = document.lastModified;
</SCRIPT>
        
</aside>      <!-- end of right column -->

	
<?php   include('../includes/footer.php');      ?>