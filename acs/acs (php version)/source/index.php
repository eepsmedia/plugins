<?php
include('../includes/varsetup1.php');			//	set up variables

$page_title = "eeps ACS data explorer";

//	--------------------------------------------------------------------------
//	actual page stuff starts here
	include('../includes/header.php');
	
	$debug .= "choosePostKeys is " . eeps_printr($_SESSION['choosePostKeys'], 3) . "<br>";
	
?>

<!--            MAIN (center) column begins   -->

<article>

<form action="choose.php" method="post" enctype="multipart/form-data" name="ChooseVars">
	<input class='button' type = 'submit' value = 'choose variables' name = 'Choose'> &nbsp;

</form>

<h3>How to use this site</h3>
<ul>
	<li>Choose what variables you want to see (press the button above or choose "start a search" at left)</li>
	<li>Preview the data. You'll see 10 sample cases with the variables you chose.</li>
	<li>Tell how many cases you want and see the full sample. Currently limited to 1000.</li>
	<li>Optionally, display those cases as plain text so you can copy and paste into your data-analysis program.</li>
</ul>


<h3>Tech Notes and Limitations</h3>
<ul>
	<li>Best in Chrome. Weird-looking in Safari.</li>
	<li>Currently 2013 only and California only.</li>
	<li>Only 20,000-ish cases in the "population." This is for speed at the moment.</li>
	<li>Sample size currently limited to 1000.</li>
</ul>
<p>This is a relatively low-tech and extremely low-budget project. If you want improvements, please ask, and I will do my best, but can make no guarantees.</p>
<p>For example, these pages look much better in Chrome than in Safari. In a "real" web site, the developers would jump through the relevant cross-browser hoops.</p>
<p>More importantly, the ACS raw data are numbers: often indecipherable codes. I have deciphered a lot of them, but for various reasons, there is no easy way to do so automatically. It requires judgment about what variables are worth the time, and how to make the text values short yet descriptive. If you want something new decoded, or want a change in my codes, let me know and I'll do what I can in the time available.</p>

<h3>More about the Data</h3>
<p>This is Public Use Microdata from the American Community Survey. 
	"Microdata" means it's data about individuals.</p>
<p>There are a lot of variables. 
	You can learn about the detailed codes (some of which I have translated into English) 
	<a href="../docs/ACS-PUMS-DataDict-2013.pdf" target="_blank">In this PDF.</a></p>
<p>A "PUMA" is a Public Use Microdata Area. The US is divided into PUMAs. Each one has at least 100,000 people in it. 
	You can find out where the PUMAs are, and their numerical codes, on the "Puma Locator" page. There's a link on the left.</p> 

</article>

<!-- 		Right column						 -->

<aside>

</aside>      <!-- end of right column -->

<script language="Javascript">
	var lastModifiedDate = document.lastModified;
</SCRIPT>
	
<!-- PAGE ENDS -->
<?php
	include('../includes/footer.php');
?>