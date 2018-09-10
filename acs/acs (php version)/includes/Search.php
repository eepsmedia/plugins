<?php

/*
    this class represents a search on the (ACS) actual-data MySQL database.
*/
class		Search	{


//	members
public	$variableNameArray;
public	$variableQueryArray;		//	what variables are we querying about?
public	$filterArray;				//	what are our filter phrases (tables)?
public	$chooseCasesArray;			//	what are our filter phrases (data restrictions)? (age > 10)
public	$tableReferences;				//
public  $userIP;                    //  user's IP address

//	methods

public	function	__construct( )	{
	$variableNameArray = array( );
	$variableQueryArray = array( );
	$filterArray = array( );
	$chooseCasesArray = array( );
    $userIP = "0.0.0.0";
}

public  function    setUserIP( $ip ) {
    $this->userIP = $ip;
}

public	function	GetVariableString( )	{
	$r = NULL;
	
	foreach	($this->variableQueryArray as $v)	{
		if ($r == NULL)	{
			$r = $v;
		}	else	{
			$r	.=	", ".$v;
		}
	}
	return	$r;
}

	
public	function	GetFilterString( )	{
	$r = NULL;
	$flist = NULL;
	
	foreach($this->filterArray as $f)	{ $flist[] = $f;}		
	foreach($this->chooseCasesArray as $f)	{ $flist[] = $f;}		
//	$flist = array_merge($this->filterArray, $this->chooseCasesArray);
	
	if (count($flist) < 1)	{
		return $r;
		}
		
	foreach($flist as $f)	{
		if ($r == NULL)	{
			$r = " WHERE ".$f;
			}	else	{
			$r .= " AND ".$f;
			}
		}
	return	$r;
	}
	
	
public	function	GetTableReferences( )	{
	return	$this->tableReferences;
}



public	function	GetSearch( )	{
	$r = NULL;
	$r =	"<strong>Variables: </strong>".$this->getVariableString()."<br>";
	$r	.=	"<strong>Filter: </strong>".$this->getFilterString()."<br>";
	return $r;
}


public	function	GetDescription($db, $theTable)	{

	//	assemble a description of the search in the variable $s.			
    $s = NULL;
    
	foreach	($this->variableNameArray as $v)	{
		$row	=	eepsACS_getOneRow($db, "SELECT * FROM $theTable WHERE NAME = '".$v."'");
		$oName = $row['nameout'];          //      was "nameout"
		$Desc = $row['description'];
		$s .= "\n<strong>$oName</strong>: $Desc<br>";
	}	
				
	return	$s;
}

}		//		end of class



?>