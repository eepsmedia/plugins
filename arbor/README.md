# Notes on Arbor

## How a tree actually gets started and drawn

### Some basics:
* A `Tree` (`ArborTree`) is a model class. There is one in `arbor.state.tree`. So it gets saved. A tree has a `rootNode`.
* A `Node` (`ArborNode`) is also model. It has a unique `arborNodeId`, a `parent`, and an array of `branches`,
  each of which is a `Node`.
* The `TreePanelView` is a singleton view, which holds the root `NodeZoneView`.
* A `NodeZoneView` is a rectangular area that contains one `NodeBoxView` and up to two sub-`NodeZoneView`s.
* A `NodeBoxView` represents the model Node in the view. It is made of of `Stripe`s that show names and data.

Things get drawn by asking the `TreePanelView` to draw its root `NodeZoneView`, after which everything happens recursively.
This includes figuring out the sizes of the subviews so it knows where to draw them. Très slick.

### Drawing the initial tree

The user drops an attribute into the plugin. This drop carries the dataset name and the attribute name. 
This happens in `dropManager.handleDrop()`, which calls several methods in succession:

```
await arbor.setDataContext(theDropDatasetName); 
await arbor.getAndRestoreModel();
arbor.setDependentVariableByName(iMessage.values.attribute.name);
arbor.redisplay();
```

The method `getAndRestoreModel()` loads a fresh `arbor.state`, and uses the data context to get its struture and data,
so we know all the attribute names. 
Default `AttributeSplit`s have even been created.
Then it calls `arbor.doBaumrestoration()`. This is where the (empty) `Tree` gets created.

This `Tree` has a `rootNode` that's basically empty, except it knows its type is `root`.

`setDependentVariableByName` sets the dependent variable, `arbor.state.dependentVariableName` 
it also sets `arbor.state.dependentVariableSplit`.

Notice that `arbor.state.tree`'s `rootNode` still knows nothing about the attribute we dropped.

Onward! The key step in `redisplay()` is that it instantiates a new `TreePanelView`.
Its constructor sets up some stuff and then calls `redrawEntirePanel()`.

That method creates the panel's node zone view, thus:
```        
this.rootNodeZoneView = new NodeZoneView(arbor.state.tree.rootNode, this);
```
The `rootNode` exists, but is still pretty ignorant. That constructor calls 
the `NodeZoneView`\`s `redrawEntireZone()`, which ends up redrawing everything. 
Importantly, it calls...
```
this.myBoxView = new NodeBoxView(this.myNode, this);    //  create, not draw
```
which is finally getting somewhere, because the `NodeBoxView` is what we actually see. 
This ultimately calls `NodeBoxView`\`s `drawNodeBoxView()` (sounds promising) and then, as if as an aside, 
it calls...
```    
const tParent = this.myNode.parentNode();     //  null if this is the root.
const tParSplit = this.myNode.parentSplit(tParent);  //  the parent's Split. If root, this is the dependant variable split
```
The key here is that, because this is the root node, its `parentNode()` is null. 
Then, when we get `parentSplit(tParent)`, that function returns the "dependent variable split."

Why so arcane? This is because, in every _other_ node, we want to know about the split that was in its 
parent in order to figure out how many cases we have. 

Anyhow, then we do some special casing (remember, this sad, lonely node does know it's a `root`.:
```    
if (this.isRoot()) {
  this.stripes.push(this.makeRootStripe());    //  make root node stripe
}
```











## Opening attribute configuration on split

The Germans want to open the attribute configuration modal dialog when the user drops
an attribute on a node in order to effect a split at that node. 
This is reasonable.

We set it up so that it is an option. 
If you check the box on the options panel, the configuration dialog appears on drop.

This is from `Node.prototype.branchThisNode`:
```
    if (arbor.state.oAlwaysShowConfigurationOnSplit ) {
        focusSplitMgr.showHideAttributeConfigurationSection(true);
    }
```

## Strings and translation

The file `src/strings/strings.js` contains the various text 
strings that appear in the UI, all in a singleton object called `strings`.
This has some useful methods, but also has
a member of each language, i.e., `strings.en`, `strings.de`, etc.

When `arbor` sets the language, it sets
the member `arbor.strings` to point to `strings.en` or whatever language.

There are three main parts to each language's section.

### Static strings
The first is "static strings," as in this snippet:
```    
    en: {
        staticStrings: {
            changeLanguageButton: "English",
            sShowPredictionLeaves: `show prediction "leaves"`,
```
These are strings whose keys match a specific `id` in the HTML, as in:
```        
        <div>
            <input id="showDiagnosisLeaves" type="checkbox" 
                onchange="arbor.handleShowHideDiagnosisLeaves()">
            <label for="showDiagnosisLeaves" 
                id="sShowPredictionLeaves">leaves?</label>
        </div>
```
That is, if the language (`arbor.state.lang`) is `en`, the label 
for the checkbox will be _show prediction "leaves"_.

These substitutions get made automatically every time the language is set, 
in `strings.initializeString()`

### Regular old strings

Not all strings are present in `index.html`.
We can use members of `arbor.strings` to construct various strings
that we make on the fly. For example, using

```
    de: {
        staticStrings: {
            changeLanguageButton: "Deutsch",
            sConfCategoricalOptionText : `kategorisch`,
            ...
        },
        sThenWeAskAbout: `Dann fragen wir über`,
```
we can make the right string when we're constricting a node's 
`<title>` tool tip:
```
if (this.attributeSplit) {
    out += `${arbor.strings.sThenWeAskAbout} ${this.attributeSplit.attName}`;
}
```

### String functions

Some of these strings depend on values; they get implemented as functions.
Where the strings atart with `s`, the functions start with `sf`.

Here is a useful example:

```
        sfIsAre : function(howMany) {
            return (howMany === 1) ? "ist" : "sind";
        },
```
In other places, it's more of a convenience, sending in some numbers 
to be inserted into a single string 
rather than splitting the sentence into a bunch of separate strings.