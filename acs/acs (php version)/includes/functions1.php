<?php 

function	eepsACS_getQueryResult($db, $query)	{

    $sth = $db->prepare($query);
    $sth->execute();

    $result = $sth->fetchAll(PDO::FETCH_ASSOC);

	return $result;
}

function    getUserIP() {
    $ip = getenv('HTTP_CLIENT_IP');
	
	/*
	?:
    getenv('HTTP_X_FORWARDED_FOR')?:
    getenv('HTTP_X_FORWARDED')?:
    getenv('HTTP_FORWARDED_FOR')?:
    getenv('HTTP_FORWARDED')?:
    getenv('REMOTE_ADDR');
    */
    return $ip;
}
//
//	
function	eepsACS_getOneRow($db, $query)	{
    $query .= " LIMIT 1";
    $sth = $db->prepare($query);
    $sth->execute();

    $result = $sth->fetch(PDO::FETCH_ASSOC);
    return $result;
	}
//

//	More general variable displayer

function	eeps_printr($a, $level)	{
    $result = "";
    
	if (is_array($a))	{
		$name = key($a);
		$result .=	"<br>";
		for ($i = 0; $i < $level*2; $i++)	$result .= "&nbsp;&nbsp;";	//  indent
		$result .= "<strong>ARRAY $name</strong>";
		foreach ($a as $e)	{
			$result .= eeps_printr($e, $level + 1);
		}
    } else if (is_a($a, "Search")) {
		$result .=	"<br>";
		for ($i = 0; $i < $level * 2; $i++)	$result .= "&nbsp;&nbsp;";	//  indent
		$result .= "Search";
        
	} else {
		if (strlen($a) != 0)	{
			$result .=	"<br>";
			for ($i = 0; $i < $level * 2; $i++)	$result .= "&nbsp;&nbsp;";	//  indent
			$result .= "$a";
		}
	}
	
    return $result;
}
  
?>
