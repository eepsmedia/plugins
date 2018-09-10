<?php
# FileName="Connection_php_mysql.htm"
# Type="MYSQL"
# HTTP="true"
DEFINE ('DB_HOST', 'localhost');
DEFINE ('DB_USER', 'root');
DEFINE ('DB_PASS', 'root');
DEFINE ('DB_NAME', 'acs');
$dbname = 'acs';

try {
    $eepsACS_connection = new PDO('mysql:host=localhost;dbname=acs;charset=utf8', DB_USER, DB_PASS);
    $stmt = $eepsACS_connection->query('SELECT * FROM peeps');
    $row_count = $stmt->rowCount();
    //$eepsACS_connection = null;
} catch (PDOException $e) {
    print "Error connecting to the eeps ACS database!: " . $e->getMessage() . "<br/>";
    die();
}

/*
$nosConnection 
		= mysql_connect(DB_HOST, DB_USER, DB_PASS) 
		or die ('Could not connect to mySQL: '.mysql_error());
		
@mysql_select_db(DB_NAME, $nosConnection) 
		or die ('Could not select the database '.$database_nosConnection.'<br>'.mysql_error());
*/
		// nb: the @ sign suppresses error messages (but not from "die")

?>