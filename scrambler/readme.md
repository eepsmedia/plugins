# Scrambler

![scrambler picture](help/art/scrambler-plugin-basic.png)

2022-08-01

## Overall design

The user has a CODAP dataset they want to scramble.
For the most part, we let CODAP itself take care of that.
Nevertheless, in order to scramble, we have to read everything in at some point and
manipulate the contents, eventually emitting various CODAP datasets.

For this reason, there is a separate class, `CODAPDataset`,
that we use for the _internal_ representation of a CODAP dataset.
Various methods in that class read and write parts of the dataset using the CODAP Plugin API.

* `scrambler.sourceDataset` is a reflection of the user's original dataset.
  We will call this the "source dataset."
* `scrambler.scrambledDataset` is made from the "source," but its data gets scrambled.
* `scrambler.measuresDataset` gets scraped from the "scrambled" dataset.

What is this "scraping"?
Scrambling, in this model, depends on the hierarchical structure of the source dataset.
Suppose you have heights and you want to collect `meanHeight` as a measure.
You should drag `meanHeight` to the left so it's higher in the hierarchy, 
and then scramble. 
Then `meanHeight` will be a _leaf_ attribute in the measures dataset.

That is, anything that's in the "leaf" collection of the source dataset 
will not appear in the (scraped) measures dataset.
We retain only the aggregate values that refer to the dataset, not the "source" values themselves.

## CODAPDataset class

There will be three instantiations of this class: `source`, `scrambled`, and `measures`.
Among the methods in this class, some are appropriate to all. 
Some are for a specific type.
See the comments in the source file.

## The scrambled dataset and gymnastics with IDs

This can only really work because we let CODAP perform any calculations of the measures themselves. 
To make that work, the _scrambled_ dataset has to be a full-fledged dataset in CODAP.
It will be exactly like the source dataset, except that one of its attributes is scrambled. 
CODAP will automatically compute the measures based on that dataset.

(By default, the scrambled dataset is hidden -- but it's still an entire dataset.)

The problem happens when we do the actual scramble. 
We will have made a (hidden) copy of the CODAP dataset.
Now we want to scramble, so we get all the values from all the cases,
make an array of the values we want to scramble,
then scramble that array.

Now we want to put those local values into the appropriate slots in the CODAP dataset itself.
We don't want to alter anything else, so we want to do an update.
Now, in the API, we need case IDs. 
So that means we have had to record those IDs for all (leaf) cases in the dataset. 
That's why we read in `scrambler.scrambledDataset` right after we write it out. 

```
        await theScrambledOne.emitCasesFromDataset();
        await theScrambledOne.retrieveAllDataFromCODAP(); //  redo to get IDs right

```

The method `CODAPDataset.retrieveAllDataFromCODAP()`, gets case information on every case
(eventually), and this info includes the caseID. 
We only need to do this once per _set_ of scrambles, that is, 
each time the user presses a scramble button,
because the scrambled dataset gets preserved.

Another issue is with the measures.
Because there can be more than one case at a higher-level collection
(the user may have an elaborate hierarchy with more than one "measures" case)
we need to know the scrambled caseIDs _and the parentIDs_ so that we 
can correctly construct the measures dataset. 

This is where the "ID dictionary" comes in.
You'll come across it in the code. 
