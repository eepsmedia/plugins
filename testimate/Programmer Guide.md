# testimate programmer's guide

## Overall design

The user drops attributes onto the "x" and "y" attribute positions. 
The idea is that if there's only one attribute, it's `x`.
The second attribute is `y`.

If there are two attributes, `x` is the outcome and `y` is the predictor.
This is wrong, traditionally, but it's (probably) too late to change!

`testimate` evaluates the variables to see what kind they are.
It judges them to be _numeric_, _categorical_, or _binary_,
that is categorical with only two categories. 

Once the two variables are established, 
`testimate` presents the user with all the tests appropriate to that set of variables.
These appear in a menu.
The moment menu item is changed, `testimate` recalculates everything and displays the results
of that test and/or estimate. 

The user can press buttons to "emit" data into CODAP. 
These are test parameters and results, and go into a separate collection.
If the test has been changed, the dataset is constructed anew.
(If it were not, the attributes would not be the same.)

### Test configurations

Each test (and its associated estimate, if any) is represented 
by a class that inherits from `Test`. 
In that file (`src/Test.js`) is a static menber, `Test.configs`, 
which is an object whose keys are...well, here's one:

```
        NN02: {
            id: `NN02`,
            name: 'two-sample t',
            xType: 'numeric',
            yType: 'numeric',
            paired: false,
            groupAxis : "",
            emitted: `N,P,mean1,mean2,diff,t,conf,CImin,CImax`,
            testing: `diff`,
            makeMenuString: ( ) => {return TwoSampleT.makeMenuString(`NN02`);},
            fresh: (ix) => { return new TwoSampleT(ix, false)  },
        },
```

The key, `NN02`, means that x and y are `N`umeric and that this is the second (of four)
tests that you can do if both your attributes are numeric. 
This particular one is an un-paired, two-sample _t_ procedure, 
testing or estimating the difference of means between two attributes. 
(The other three `NN` are a one-sample _t_ — using only `x` —; 
a paired two-sample _t_;
and linear regression.)

The configuration above also gives you hints about other things.
For example, the class `TwoSampleT` is the subclass of `Test` in which the test is performed.
Its code is in `src/test/two-sample-t.js`.
We also infer that it will have a (`static`) method called `makeMenuString(iConfigID)`, 
and as you might expect it's responsible for creating the text of the menu item
that the user can choose.

Note: in this case, the _paired_ test also refers to the `TwoSampleT` class, but in its configuration,
the `paired` member is set to `true`. 
That way, the test instantiation can know to make the appropriate calculations and 
construct the appropriate output.

### Test subclasses

There are a total of 10 subclasses of `Test` as of this writing (Nov 2023).
All tests, like `TwoSampleT`, have `makeMenuString`. 
Besides `makeMenuString()`, they have several methods in common as well, for example:

#### updateTestResults()
does the actual calculation. 
It adds to an object called `results` that belongs to the instance of the test.
An example for two-sample _t_ is the calculation of standard error. 
Its line is

```
    this.results.SE = this.results.s * Math.sqrt((1 / this.results.N1) + (1 / this.results.N2));
```

which is, of course,different from the corresponding line in the `OneSampleT` class:

```
    this.results.SE = this.results.s / Math.sqrt(this.results.N);
```
#### makeResultsString()
creates a string (HTML) that gets put into the DOM so the user can see it.
It basically takes elements of `this.results` (such as `this.results.SE`)
and inserts them into a big string (called `out`) that the method constructs and returns.

In that method, the results items are first converted into strings:

```agsl
    const SE = ui.numberToString(this.results.SE);
```

The utility `ui.numberToString()` takes an optional argument for the number of places (default: 4). 
It also collapses large numbers (to make, e.g., `3.7602 M` for 3.76 million) and, if necessary,
resorts to scientific notation. 
this is important because the user really doesn't want to see all the available places.

Ultimately, these string elements get substituted into `out`; this shows the 
part that outputs the confidence interval:

```        
    out += `<br>    diff = ${diff},  ${conf}% CI = [${CImin}, ${CImax}] `;
```

#### makeConfigureGuts()
makes the HTM that fills the "configuration" stripe taht appears below the results. 
There, the user specifies important _parameters_ for the test
such as 

* the value you are testing against 
* whether you are doing a one-or two-sided procedure
* the confidence level you want for th eestimate

These are stored not in `results` but in the global `state` variable,
such as `testimate.state.testParams.conf`, which is the confidence level.




## Communicating with CODAP

* User drops attributes into drop-target objects in the UI. 
This lets them specify what variables they are testing. 
This requires working with drop notifications.
* User can ask for test/estimate results to be emitted into a 
CODAP file. 
* In the case of multiple, repeated sampling and testing,
this requires interacting with `rerandomize`. 

## Emitting data into CODAP

The user can emit test results into CODAP.
This creates a new dataset with attributes that contain 
test or estimate results such as `P` or `CIMax`. 
The user chooses an `emitMode` (a member of `ui`, i.e., it's `ui.emitMode` in `ui.js`)
with one of three values: `single`, `random`, or `hierarchy`.

`single` is self-explanatory: you get one case.

With `random`, you choose a number of iterations.
The plugin re-randomizes the source collection that many times, 
performing the tests and emitting the results.

With `hierarchy`, the plugin performs the test once 
for every case in the top level of the hierarchy. 
This option does not appear if the dataset is flat or of there is only one case at the top.

## Getting and using CODAP data

CODAP data is case-based. 
If you get a set of CODAP *items*, they come as an array of objects,
where each object has a `values` member, an `Object` of key-value pairs 
that correspond to an attribute name and its value.

But to use the stat library we use for computation, we need an attribute-based
data structure, that is, for each attribute we're using, an array 
that contains the values. 
Of course, if we're using two attributes, the cases are connected by having
the indices correspond;
that is, the two arrays have to stay in order.

So here is the process, most of which is the responsibility of the `data` singleton,
located in `src/data.js`.

### Get data from CODAP

We get the whole source dataset at once in the form of items. 
This get triggered in `ui.redraw()`:

```javascript
await data.updateData();        //  make sure we have the current data
```
That method, `data.updateData()`, contains these lines:

```javascript
this.sourceDatasetInfo = await connect.getSourceDatasetInfo(testimate.state.dataset.name);
this.hasRandom = this.sourceDSHasRandomness();
this.isGrouped = this.sourceDSisHierarchical();

this.topCases = (this.isGrouped) ? await connect.retrieveTopLevelCases() : [];

await this.retrieveAllItemsFromCODAP();
```
`this.sourceDatasetInfo` comes from a get-dataContext call, and contains information
on the structure of the dataset, that is, collections and attributes---but no data.
We use that to find whether the dataset is hierarchical,
and (three lines later) to get the top-level cases.

`this.hasRandom` is `true` if any of the attributes has a formula with `"random"` in it.

`this.isGrouped` is true if there is more than one collection.

`this.topCases` is a case-based array of objects containing attributes and values 
of the top-level collection (empty if `isGrouped` is false).

Then, finally, we retrieve all the items, the actual data.
Here is the method, which is full of important side effects:

```javascript
    retrieveAllItemsFromCODAP: async function () {
        if (testimate.state.x) {
            this.dataset = await connect.getAllItems();      //  this.dataset is now set as array of objects (result.values)
            if (this.dataset) {
                this.xAttData = new AttData(testimate.state.x, this.dataset);
                this.yAttData = new AttData(testimate.state.y, this.dataset);
            }
        } else {
            console.log(`no x variable`);
        }
    },
```

If an `x` variable has been specified, we set `this.dataset` to that case-based array of items.
Each item has a `values` member, which is the key-value object with the data.
This has *all* of the attributes.

Then we create these two new objects, `this.xAttData` and `this.yAttData`,
which are attribute-based arrays extracted from `data.dataset`. 

**Key takeaway**: 
The method `data.retrieveAllItemsFromCODAP()` is a model for how to convert
an array of case-based objects into the attribute-based arrays
that you need to perform tests.

### Aside: the AttData class

The class `AttData` is defined in `data.js`, down at the bottom.
Its members are declared in the constructor like this:

```javascript
this.name = iAtt ? iAtt.name : null;
this.theRawArray = [];
this.theArray = [];     //  stays empty in constructor
this.valueSet = new Set();
this.missingCount = 0;
this.numericCount = 0;
this.nonNumericCount = 0;
this.defaultType = "";
```

You can see that an `AttData` has a bunch of useful stuff in it. 
The constructor goes on to process the information from `data.dataset`,
cleaning things up and making numbers out of numeric strings.
At the same time, it creates a `valueSet` that lets us see
the set of values, important for a categorical attribute
that we might use for grouping.
The constructor also counts up missing and numeric values,
and stuffs the clean values into `this.rawArray`. 

Later, we process `this.rawArray` into `this.theArray`, which is what gets used 
when calculating test results. 

### Making AttData.theArray

After some processing used to figure out what test we're doing, 
`ui.redraw()` calls `data.removeInappropriateCases()`.
This method populates the `.theArray` members of the x and y `AttData`s.

This involves several nitty-gritty steps such as, 
if the test requires numeric attributes (e.g., difference of means),
it replaces any non-numeric values with `null`.

### Performing the tests

Every test has an `updateTestResults()` method (also called by `ui.redraw()`).
Those methods use the `theArray` members to get the data. 

Here is a snippet from `regression.js`:

```javascript
for (let i = 0; i < N; i++) {
    //  Note how these definitions are REVERSED.
    //  we want to look at the var in the first position (xAttData) as the dependent variable (Y)
    const X = data.yAttData.theArray[i];
    const Y = data.xAttData.theArray[i];
```

Notice how we use the same indices to enforce the underlying case identities.

(Also, because this is linear regression, the attribute on the LEFT, 
which we call `xAttData`, 
is teh one to be predicted, that is, `Y` in the regression.)

