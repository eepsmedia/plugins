# Scrambler

2021-03-08

Here we describe the current (still early) version of the **Scrambler** plugin, also known as **elmcrabs**.

* Drag the URL for this plugin into your document.
* Prepare your dataset for scrambling--see below
* Make sure the dataset you want to scramble is selected in the menu
* Choose what attribute you want to scramble.
* Click buttons and ajust the number to create as many "scrambles" as you wish.

## Preparing a Dataset for Scrambling

* Make a measure (a new attribute with a formula) that describes the effect you're studying.
* Drag it left so that it's at a higher level in the hierarchy.
* (For now) **Press the Refresh** button (it's a circular arrow). 

## Background

The point of scrambling is to create a _sampling distribution_ of some _measure_. 
For example, suppose that in your dataset it appears that 13-year-old boys are taller than 13-year-old girls.
You want to assess whether it's _plausible_ that the difference in means that you see could happen by chance.

To do that, you will make the "null hypothesis" real: 
you will break any association between `Gender` and `Height` by scrambling the values for one of those attributes.
Then you would look to see how different the boys and girls seem to be when the difference _is_ just chance.

But one trial is not enough. Furthermore, you have to decide what, specifically, to look at to say that the boys are taller.
In this situation, that means coming up with a number that represents how much taller the boys are. 

This is very important, and bears highlighting:

> You must create a _measure_ of the effect you're seeing. It's not enough to say that boys are taller than girls;
> You have to say _how much_ taller.
> 

In this case, a good example of such a number is the difference of means.
In a CODAP formula, that might look like:

```
mean(Height, Gender="Male") - mean(Height, Gender="Female")
```

You will see how much taller they are in the data (in our case, 4.54 cm).
Then you will see how much taller they are when the data have been all scrambled. 
Because the data are randomly assigned, sometimes the difference will be positive, sometimes negative (the "girls" will be taller).

But is it plausible that 4.54 could appear by chance?

Repeat this prcess a few hundred times and see.
In this case, no: even though it's _possible_ that the data could be that extreme
(after all, the real data _could_ come up when you scramble),
it doesn't happen very often.

