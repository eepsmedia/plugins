# Panzer

This plugin creates samples of serial numbers for exploring the "German tanks problem."

You control 

* the (unknown) true number of tanks (`truth`),
* the number of serial numbers you get (`nSerials`)
* the number of times this process is repeated.

Press **go** to get a sample of serial numbers.

The result is a hierarchical CODAP table. 
The actual serial numbers (`serial`) are at the lower level of the hierarchy.

## Estimating the number of tanks: creating measures

Your goal is to estimate the true number of tanks using only the values of `serial`.

To do that, create a new attribute at the _upper_ level of the hierarchy. 
You get one for free as an example, called `doubleMedian`. Its formula (unsurprisingly) is `2 * median(serial)`. 
Make a new column by clicking the gray circle with the plus sign that appears at the upper right of the high-level table,
above `doubleMedian`.
That circle shows up when you select the table and mouse over the area. 

Click the name of your measure to open its menu; use **Edit formula** to open the formula editor.
