<?php
include('../includes/varsetup1.php');	//	set up variables
include('../includes/Search.php');		//	define mySQL access functions etc, moved to varsetup

$page_title = "Choose variables: eeps ACS explorer";

unset($_SESSION['theSearch']);		//	debug

$theCheckedVariables = array();			//	which variables will be checked.
$allPostKeys = array();

$checkboxguts = NULL;
$booleanFilterForCases = array();        //  an array of statements that we assemble to be the "filter"
//
//		deal with incoming POST
//
$checkOnlyDefaultVars = false;							//	in general, check those vars who were checked before.

$debug .= "post is " . eeps_printr($_POST,2) . "<br>";
$debug .= "variableList is " . eeps_printr($_SESSION['variableList'], 2) . "<br>";

//	make a list of all possible variable names 

$query = "SELECT * FROM $varTable ORDER BY groupNumber";
$allPossibleVariables	=	eepsACS_getQueryResult( $eepsACS_connection, $query);

$nPossibleVars = count($allPossibleVariables);
$debug .= "($nPossibleVars) possible variables: <br>";

//	did we press the button to restore default variables?

if (array_key_exists("Defaults", $_POST))	{		
	$checkOnlyDefaultVars = true;
}

//	kludge: se're coming in fom the index file, so we pretend we had not post at all.

if (array_key_exists("Choose", $_POST))	{		
	$_POST = array();
}

if (count($_POST) > 0)	{
	//	$postedVariableNames = array_keys($_POST);		//	what are the keys? They will contain the names of variable checkboxes.
	$allPostKeys = array_keys($_POST);		//	what are the keys? They will contain the names of variable checkboxes.
	$debug .= 	"Rich POST array. We'll use the variable info.<br>";
		

	//	find which variables appear in the list of post keys.

	foreach ($allPossibleVariables as $row)	{
		$Name 	= $row['name'];					//	official intenal name
		if (in_array($Name, $allPostKeys))	{
				$theCheckedVariables[] = $Name;
		}
	}
	
	//
	//		assemble the rest of the $$booleanFilterForCases (for the WHERE clause) 
	//

	$AgeLowLimit = $_POST['ageLowLimit'];
	$AgeHiLimit = $_POST['ageHiLimit'];
	
	if (is_numeric($AgeLowLimit))	{
		$booleanFilterForCases[] =	"(AGEP >= $AgeLowLimit)";
	}
	if (is_numeric($AgeHiLimit))	{
		$booleanFilterForCases[] =	"(AGEP <= $AgeHiLimit)";
	}

} 	else	{	//	No POST. We came from outside. We'll use the variables we remember from the SESSION var
	
	$AgeLowLimit = NULL;
	$AgeHiLimit = NULL;
	$debug .= 	"empty POST array. Came in from outside.<br>";
	
	if (isset($_SESSION['variableList']))	{
		$theCheckedVariables = $_SESSION['variableList'];
	} 
	
	$nVars = count($theCheckedVariables);
	$debug .= "We have $nVars posted variables";

	if ($nVars == 0)	{	//	Either way, we don't remember what variables were checked. Better use defaults.
		$checkOnlyDefaultVars = true;
	}
}

//
//	Now adjust for defaults if that's called for

if ($checkOnlyDefaultVars)	{
	
	$debug	.=	"<br>...We are checking default variables";
	//	find which variables appear in the list of post keys.
	
	$theCheckedVariables = array();					//	start fresh
	
	foreach ($allPossibleVariables as $row)	{
		$Name 		= $row['name'];					//	official intenal name
		$defCheck	=	$row['defcheck'];			//	is it checked by default? (1 = yes)
		if ($defCheck) {
			$theCheckedVariables[] = $Name;
		}
	}
	
} else	{
	$debug	.=	"<br>...We are NOT checking default variables";
}

//
//		If the Preview button was pushed, we redirect to the preview page.
//		note that the session variables would have been set before we return here.
//

if (array_key_exists("Preview", $_POST))	{		
	$_SESSION['variableList'] = $theCheckedVariables;
	header('Location: preview.php');
}


//
//	more variable and checkbox setup
//
if (isset($_SESSION['showWholeSetOfVarsFrom']))	{	
    $firstTimeThrough = 0;
    $showWholeSetOfVarsFrom = $_SESSION['showWholeSetOfVarsFrom'];
} else {
    $firstTimeThrough = 1;
}

//      QUERY
$groupRows	=	eepsACS_getQueryResult($eepsACS_connection, "SELECT * FROM $groupTable");

$debug .= "<br>Groups: ";
foreach ($groupRows as $row)	{
    
	//$theTable = $row['ID'];       //   in NHANES, variabels were split up into many tables; this was its table
	$theGroupName = $row['name'];
    $theGroupNumber = $row['groupNumber'];
	$theGroupPurpose = $row['purpose'];
	$chooseVarHeading = "<strong>$theGroupPurpose</strong>";
	
	$checkboxguts	.=	"\n\n<h4>$chooseVarHeading";
        
	if ($firstTimeThrough)	{
		$showWholeSetOfVarsFrom[$theGroupName] = false;
	} else	{		//	check to see if THIS table's expand/collapse button was pushed
		if (array_key_exists($theGroupName, $_POST))	{
			$showWholeSetOfVarsFrom[$theGroupName] = !$showWholeSetOfVarsFrom[$theGroupName];		//	reverse the sense
		} else {
		    //  $showWholeSetOfVarsFrom[$theGroupName] = 0;
		}
	}
	
    //          DEBUG
    
    if ($showWholeSetOfVarsFrom[$theGroupName]) {
        $debug .= " <strong>$theGroupName</strong> ";
    } else {
        $debug .= " $theGroupName ";
        
    }
    
	//
	//	put an expand or collapse button at the end of the <h4> header line
	//	depending on whether this table is expanded.
	//
	if ($showWholeSetOfVarsFrom[$theGroupName])	{
		$checkboxguts	.=	"\n\t<input class='xc-button' type='submit' name='".$theGroupName."' value='collapse'>";
		}
	else	{
		$checkboxguts	.=	"\n\t<input class='xc-button' type='submit' name='".$theGroupName."' value='expand'>";
		}
	
	$checkboxguts	.=	"</h4>";			//	done with table's header line, ready to loop over vars.
	
	//	loop over all varioables within each group (groupNumber = $theGroupNumber)
	//
    $query = "SELECT * FROM $varTable WHERE groupNumber = $theGroupNumber.";
	$variablesInThisGroup	=	eepsACS_getQueryResult( $eepsACS_connection, $query);
	$nVarsInThisGroup = count($variablesInThisGroup);
	    
	foreach ($variablesInThisGroup as $row)	{
		$oName	    = $row['nameout'];			//	output (English, header) name for variable
		$Desc		= $row['description'];	//	text comment or description of what it means
		$Name		= $row['name'];					//	internal, MySQL (and ACS) name
		$defCheck	=	$row['defcheck'];		//	is it checked by default? (1 = yes)
		$defShow	=	$row['defshow'];		//	do we show it by default?
		$alwaysShow		= $defShow;							//	we show what is shown by default (to begin with)
		
		
		$checkboxLabel = "<strong>$oName</strong>: ".$Desc;
		
		
		$Check = in_array($Name, $theCheckedVariables);		//	does this var get a checkmark??
		if ($Check)	{
			$checkstring = "checked";
		}	else	{
			$checkstring = "";
        }
		
		if ($alwaysShow or $Check or $showWholeSetOfVarsFrom[$theGroupName])	{
			$checkboxguts	.=	"\n\t".'<p class="varCheck"><input name="'.$Name.'" type = "checkbox" value = "'.$oName.'" '.$checkstring.'>';
			$checkboxguts	.=	"  ".$checkboxLabel."</p>";
			}
		}
		//----------------	end of variable loop
	}
	//------------------	end of table loop
		
//	Save session variables
//			recording the state of expansion....
//			recording the list of post keys (variables that have been checked)

$_SESSION['showWholeSetOfVarsFrom'] =		$showWholeSetOfVarsFrom;
$_SESSION['variableList'] = 	$theCheckedVariables;
$_SESSION['chooseCasesArray'] = $booleanFilterForCases;

	
	
//	--------------------------------------------------------------------------
//	actual page stuff starts here
	include('../includes/header.php');
?>


<!--            MAIN (center) column begins   -->

<article>

<form action="choose.php" method="post" enctype="multipart/form-data" name="ChooseVars">
	<input class='button' type = 'submit' value = 'preview the data' name = 'Preview'> &nbsp;
	<input class='button' type = 'submit' value = 'reset to default variables' name = 'Defaults'>

<h3>Choose Your Variables</h3>

<p>Check the variables you want. Then click "preview the data" above.</p>

    <h4>Which cases?</h4>
    <p>You can limit which cases you get.<br>&nbsp;</p>
	
	<input class="textbox" type="text" value="<?php echo $AgeLowLimit ?>" 
			name = 'ageLowLimit' maxlength="5" size="5">
		&le; AGE &le;
	<input class="textbox"  type="text" value="<?php echo $AgeHiLimit ?>" 
			name = 'ageHiLimit' maxlength="5" size="5"><br>&nbsp;
    
    <hr>
	<?php echo	$checkboxguts; ?>
</form>

</article>

<!-- 		Right column						 -->

<aside>

</aside>      <!-- end of right column -->
</form>
	
	<script language="Javascript">
		var lastModifiedDate = document.lastModified;
	</SCRIPT>
	
	
<?php   include('../includes/footer.php');      ?>