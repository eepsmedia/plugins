<?php
include('../includes/varsetup1.php');		//	set up variables, defeine functions
$page_title = "eeps ACS data explorer: PUMA Locator";
    
$PUMAresults = NULL;
$theSearchText = "number or text";

if (count($_POST) > 0)	{
	$postStuff = array_keys($_POST);		//	what are the keys? 
    $theSearchText = $_POST['searchForMe'];
} 

if(ctype_digit(ltrim((string)$theSearchText, '-'))){
    $thePUMAnumber = (int)$theSearchText;
    $searchWithNumber = true;
    $query = "SELECT * FROM pumas WHERE state = '06' AND puma = $thePUMAnumber";
} else {
    $searchWithNumber = false;
    $query = "SELECT * FROM pumas WHERE LOCATE('". $theSearchText."', description) > 0";
}


$PUMArows	=	eepsACS_getQueryResult($eepsACS_connection, $query);

foreach ($PUMArows as $row) {
    $place = $row['description'];
    $pumaNumber = $row['puma'];
    $stateCode = $row['state'];
    $stateInfo = eepsACS_getOneRow($eepsACS_connection, "SELECT * FROM states WHERE code = $stateCode");
    $stateName = $stateInfo['text'];
    
    $PUMAresults .= "<p><strong>$stateName</strong> PUMA $pumaNumber is in $place</p>";
}


//
//	actual page stuff starts here -------------------------
//
	include('../includes/header.php');
?>


<!--            MAIN (center) column begins   -->

<article>


<h3>PUMA Locator</h3>

<p>A PUMA (public use microdata area) has a five-digit code. Type in a code or some text and we'll tell you what matches.</p>

<form action="pumaLocator.php" method="post">
	<input class='textbox' type="text" value="<?php echo $theSearchText ?>" 
			name = 'searchForMe' maxlength="30" size="30"><br>
	<input class = "button" type="submit" name="getResults" value="Get PUMA info">
</form>
<?php
	
	echo	"<h4>Results:</h4><p>$PUMAresults</p>";
	
?>
</article>

<!-- 		Right column						 -->

<aside id= 'vBox'>

</aside>      <!-- end of right column -->

<script language="Javascript">
	var lastModifiedDate = document.lastModified;
</SCRIPT>

	
<?php   include('../includes/footer.php');      ?>