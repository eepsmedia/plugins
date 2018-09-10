<?php
    
//	todo: note that this gets called every time we display a value. We could reduce this upstream.
/*
function    decodeValue( $db, $variableName, $code) {
    $result = NULL;
    
	//	See if the "decoder" record has one for this variable and value 
	
	$decodeRow = eepsACS_getOneRow($db, "SELECT * FROM decoder ".
					"WHERE (VARNAME = '".$variableName."') AND (CODE = '".$code."')");
	if($decodeRow)	{
		$result = $decodeRow['result'];
	}	else	{
		$result = $code;
	}
    
    $decodeDBQuery = "SELECT * FROM variables WHERE name = '" . $variableName . "'";
    $decodeDBRow = eepsACS_getOneRow($db, $decodeDBQuery);
    //echo "<br>Decoding $variableName with code $code. Using $decodeDBQuery";

	//	see if the variable record has a TABLE reference for looking up values
	
    if ($decodeDBRow) {
        
        $theTable = $decodeDBRow['decodeTable'];
        if ($theTable) {
            $specificDecodeRow = eepsACS_getOneRow($db, "SELECT * FROM $theTable WHERE code = '".$code."'");
			
			//	if there is a table entry for this code, replace the current $result; otherwise leave what we have.
			
			if ($specificDecodeRow){
				$result = $specificDecodeRow['text'];
			}
        }
    }
    return $result;
}
*/

class Decoder 
{
	//	members
	
	public	$db;				//	what's our db?
	public	$decodeArray;		//	where we store all of our decode information
	
	function __construct( )
	{
		$decodeArray = array( );	//	initialize
	}
	
	function	setDB( $db ) {
		$this->db = $db;
	}
	
	function	setUpVariable( $v ) {
		
		$thisVariableArray = array( );	//	initialize this variable's array
		
		$query = "SELECT * FROM decoder WHERE VARNAME = '" . $v . "'";
		$theCodes = eepsACS_getQueryResult( $this->db, $query );
		if($theCodes)	{
			foreach ($theCodes as $codeRecord) {
				$code = $codeRecord['code'];
				$result = $codeRecord['result'];
				$thisVariableArray[ $code ] = $result;
			}
		}	else	{

		}
    
		//	see if there is a "decode table" entry in the variables table. 
		
	    $decodeDBQuery = "SELECT * FROM variables WHERE name = '" . $v . "'";
	    $decodeDBRow = eepsACS_getOneRow($this->db, $decodeDBQuery);
		
		if ($decodeDBRow ) {
	        $theTable = $decodeDBRow['decodeTable'];
	        if ($theTable) {
	            $decodeRows = eepsACS_getQueryResult($this->db, "SELECT * FROM $theTable");
			
				//	if there are table entries for this code, replace the current $result; otherwise leave what we have.
			
				foreach ($decodeRows as $dRow){
					$thisVariableArray[ $dRow['code']] = $dRow['text'];
				}
	        }
			
		}
		
		$this->decodeArray[ $v ] = $thisVariableArray; 
	}
	
	function	decode( $variable, $code ) {
		$result = "";
		if (array_key_exists($code, $this->decodeArray[$variable])) { 
			$result = $this->decodeArray[$variable][$code];
		}
		else {
			$result = $code;
		}
		
		return $result;
	}
}
?>