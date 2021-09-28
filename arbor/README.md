# Notes on Arbor

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