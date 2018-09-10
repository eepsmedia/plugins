<?php
	include('../includes/varsetup1.php');		//	set up variables, defeine functions
	include('../includes/Search.php');		//	define Search class
	include('../includes/decoding.php');		//	routines for decoding

	$page_title = "Preview data: eeps ACS explorer";
	
	$modDate =  date("l jS F Y h:i A", getlastmod());	

//	do pre-page calculations
//
	$debug = NULL;
	$tableReferences = $peepsTable;			//		MySQL table refs, the "from" clause.
	$varQueryArray = array();				//		MySQL variable names with table ID, eg: t1.RIAGENDR
	$varLabelArray = array();				//		English names of variables for headers on tables
	$filterArray = array();					//		relational phrases, e.g., t1.SEQN = t2.SEQN
	//	all of the above get figured out from the variablesNames session variable.
	//	only the next (chooseCasesArray) actually has been figured out in Choose.php

	//	we will set up our decoder and get all possible values as we go through the variables.
	
	$myDecoder = new Decoder();
	$myDecoder->setDB( $eepsACS_connection );
	
	$chooseCasesArray = array( );			//			e.g., AGE > 10 (from the CHOOSE page)
	if (isset($_SESSION['chooseCasesArray']))	{
		$chooseCasesArray = $_SESSION['chooseCasesArray'];
	}
		
	//
	//		assemble an array of the variables that were checked.
	//
	
	$tableheader = "\n<tr>";
	$variablesNames = $_SESSION['variableList'];		//	what are the keys? They will contain the names of variable checkboxes.
	$tableSet = NULL;		//	the set of which tableIDs this query uses.

	//	loop over all the variables in the checkboxes
	foreach($variablesNames as $v)	{
		$row = eepsACS_getOneRow($eepsACS_connection, "SELECT * FROM $varTable WHERE NAME = '".$v."'");
		if ($row)	{	//	it was in the list
			$tableNumber = $row['groupNumber'];				//	the numeric group to which this variable belongs
			$tableSet[$tableNumber] = true;				//	this table is included in the set of tables
			$varQueryArray[] = $v;		                //	the variable names we use in queries, VARNAME.t3, etc.
			$varNameArray[]	=	$v;						//	the raw SQL names without table IDs.
			$varLabelArray[$v] = $row['nameout'];		
                            //	this is the translated "English" name of the variable for output
			$tableheader	.= " <th>$varLabelArray[$v]</th> ";	//	put the "output" name in the table header for display (and export)	
			$myDecoder->setUpVariable( $v );
			}
		}
	
	//	in case nothing was selected, get sex and age.
	if (count($varNameArray) == 0)	{
		$varQueryArray[] = "SEX";
		$varQueryArray[] = "AGEP";
		$varNameArray[]	=	"SEX";
		$varNameArray[]	=	"AGEP";
		$tableheader	.= " <th>Sex</th> <th>Age</th>";
		$tableSet[1] = true;	
		}
	$tableheader	.=	"</tr>";

	$debug	.=	"Table refs: ".$tableReferences;			//	debug
	
//
//	Store the Search
//
	if	(!isset($theSearch))	{
		$theSearch = new Search( );
	}

	$theSearch->variableNameArray = $varNameArray;
	$theSearch->variableQueryArray = $varQueryArray;
	$theSearch->filterArray = $filterArray;
	$theSearch->chooseCasesArray = $chooseCasesArray;
	$theSearch->tableReferences = $tableReferences;

	$debug 	.= 	"<br> FILTER ARRAY STUFF";			//	debug
	foreach($filterArray as $f)	{	$debug 	.= 	"<br>".$f;	}		//	debug
	
	
	$insertQ = "INSERT INTO $searchTable (SEARCH, TIME) VALUES ('"
			. serialize($theSearch) . "', NOW()) ";
		
			
	$r	=	eepsACS_getQueryResult($eepsACS_connection, $insertQ);
	
	$theSearchID = $eepsACS_connection->lastInsertId();
	$_SESSION['theSearch'] = $theSearch;


	$varListForQuery = $theSearch->GetVariableString( );
	$filterForQuery  = $theSearch->GetFilterString( );
	$tableReferences	=	$theSearch->GetTableReferences( );
	
	$Q = "SELECT $varListForQuery ".
				"FROM $tableReferences $filterForQuery";
	$debug	.=	"<br><b>QUERY</b>: $Q<br>";			//	debug
	
    $countQuery = "SELECT COUNT(*) FROM $tableReferences";
    
	$countResult	=	eepsACS_getQueryResult($eepsACS_connection, $countQuery);    //  just so we can count them :)
    $nRows = $countResult[0]["COUNT(*)"];
    
	$r	=	eepsACS_getQueryResult($eepsACS_connection, "$Q ORDER BY RAND() LIMIT 10"); // ORDER BY RAND()

    $debug  .= "<br>   query retrieved ".count($r). " rows.";
    
//	construct table guts 
	$tableguts = NULL;


	foreach ($r as $row)	{
		$tableguts	.=	"\n<tr>";
		foreach($varNameArray as $v)	{
			$rawval = $row[$v];
			$val = $myDecoder->decode( $v, $rawval );

			$tableguts	.=	"<td>$val</td>";
			}
		$tableguts	.=	"</tr>";
		}

//	prepare informational message for the footer
//

	$footerGuts = "<h4>Search specification</h4>";
	$footerGuts .=	$theSearch->GetSearch( );
	$footerGuts	.=	"<br>";
//
//	actual page stuff starts here -------------------------
//
	include('../includes/header.php');
?>

<!--            MAIN (center) column begins   -->

<article>

<form action="choose.php" method="post" name="ChooseVars">
	<input class='button' type = 'submit' value = 'Back to choose variables' name = 'Choose'> &nbsp;
</form>

<form action="results.php" method="get">
	<input class = "button" type="submit" name="getResults" value="Get entire sample">
	<input type="hidden" value="<?php echo $theSearchID ?>" name = "theID">
     Sample size: <input class="textbox" type="text" value="100" name="sampleSize" size="5">
</form>

<h3>Preview data</h3>

<p>This preview page shows ten cases. The whole set has <?php echo $nRows; ?> cases.</p>
<p>Specify a sample size above, and click the button to get your sample.</p>

<?php
	
	echo	"\n<table> $tableheader $tableguts </table>";
	
?>
</article>

<!-- 		Right column						 -->

<aside id= 'vBox'>



</aside>      <!-- end of right column -->

<script language="Javascript">
	var lastModifiedDate = document.lastModified;
</SCRIPT>

	
<?php   include('../includes/footer.php');      ?>