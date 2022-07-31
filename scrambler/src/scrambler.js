const scrambler = {
    sourceDataset: null,        //      a CODAPDataset.
    scrambledDataset: null,     //      a CODAPDataset.
    measuresDataset: null,      //      a CODAPDataset.

    nDatasets: 0,
    currentlyScrambling: false,
    currentlyDraggingAnAttribute: false,
    
    datasetExists: false,
    datasetHasMeasure: false,
    scrattributeExists: false,
    scrattributeIsLeaf: false,

    state: {},

    strings: null,

    initialize: async function () {
        await connect.initialize();

        this.state = await codapInterface.getInteractiveState();
        if (Object.keys(this.state).length === 0) {
            Object.assign(this.state, this.constants.defaultState);
            await codapInterface.updateInteractiveState(this.state);
            console.log(`No interactive state retrieved. Got a new one...: 
            ${JSON.stringify(this.state)}`);
        }

        this.state.lang = pluginLang.figureOutLanguage('en', scramblerStrings.languages);
        scrambler.strings = await scramblerStrings.initializeStrings(this.state.lang);

        await this.refreshAllData();
    },

    refreshScramblerStatus: function () {
        let theHTML = ``;

        if (this.datasetExists) {
            const tDSTitle = this.sourceDataset.structure.title;
            const tAttName = scrambler.state.scrambleAttributeName;

            const attReport = (this.scrattributeExists)
                ? scrambler.strings.sfScrambledAttribute(tAttName) //    `${scrambler.strings.sScramble} ${tAttName}`
                : scrambler.strings.sNoAttribute;

            document.getElementById("attributeReport").innerHTML = attReport;

            if (this.datasetHasMeasure) {
                if (this.scrattributeExists) {
                    if (this.scrattributeIsLeaf) {
                        theHTML = scrambler.strings.sfOKtoScramble(tAttName, tDSTitle); //   `OK to scramble "${tAttName}" in dataset "${tDSTitle}"`;
                    } else {
                        const possibles = scrambler.sourceDataset.possibleScrambleAttributeNames(tAttName); //  this is an object
                        const suchAs = (possibles.array.length == 1)    //  possibles.array is the list of suitable attributes
                            ? `${possibles.array[0]}`
                            : `${possibles.array[0]} or ${possibles.array[1]}`;
                        const colls = scrambler.sourceDataset.structure.collections;
                        const lastCollName = colls[colls.length - 1].name;
                        if (possibles.hasFormula) { //  remember: if it has a formula it will not be listed among the leaves
                            theHTML = scrambler.strings.sfFormulaProblem(tAttName, lastCollName, suchAs);
                        } else {
                            theHTML = scrambler.strings.sfNotALeafProblem(tAttName, lastCollName, suchAs);
                        }
                    }

                } else {
                    theHTML = scrambler.strings.sNoScrambleAttribute;
                }
            } else {
                theHTML = scrambler.strings.sfNoMeasure(tDSTitle);
            }
        } else {
            theHTML = scrambler.strings.sNoDataset;
        }

        document.getElementById(`scramblerStatus`).innerHTML = theHTML;
    },

    refreshAllData: async function () {
        const tName = await connect.getSuitableDatasetName(this.state.lastDatasetName);
        console.log(`connect suggests using ${tName} as the dataset name`);
        this.iteration = 0;

        if (this.measuresDataset) {
            await connect.deleteDatasetOnCODAP(this.measuresDataset.datasetName);
            this.measuresDataset = null;
        }
        if (this.scrambledDataset) {
            await connect.deleteDatasetOnCODAP(this.scrambledDataset.datasetName);
            this.scrambledDataset = null;
        }

        if (tName) {
            await this.setSourceDataset(tName);
            if (this.sourceDataset) {
                if (await connect.datasetExistsOnCODAP(tName)) {
                    //  this.dirtyMeasures = false;
                    console.log(`Dataset ${this.sourceDataset.datasetName} already exists. Whew.`)
                }
            }
        }
        this.refreshUIDisplay();
    },


    /**
     * Makes a `CODAPDataset` filled with the information from the CODAP dataset of the given name.
     * This thing will be the root of the scrambling we do.
     *
     * Also sets a good value for the scrambling attribute.
     *
     * @param iName     the name of the dataset
     * @returns {Promise<void>}
     */
    setSourceDataset: async function (iName) {
        //  make the source dataset object!
        this.sourceDataset = await new CODAPDataset(iName);

        await notificatons.registerForDatasetChanges(iName);
        await this.sourceDataset.loadStructureFromCODAP();

        if (this.sourceDataset) {
            this.datasetExists = true;
            this.state.lastDatasetName = this.sourceDataset.datasetName;    //  for restoring
            this.datasetHasMeasure = (this.sourceDataset.structure.collections.length > 1);

            //  cope with the scramble attributes
            const tScrambleName = scrambler.state.scrambleAttributeName;
            this.scrattributeExists = (this.sourceDataset.allAttributeNames().includes(tScrambleName));
            this.scrattributeIsLeaf = this.sourceDataset.possibleScrambleAttributeNames(tScrambleName).check;
            console.log(`SetSourceDataset: ${iName} with ${scrambler.state.scrambleAttributeName}`)
        } else {
            this.state.lastDatasetName = null;    //  for restoring
            this.datasetExists = false;
            this.datasetHasMeasure = false;
            this.scrattributeExists = false;
            this.scrattributeIsLeaf = false;

            scrambler.state.scrambleAttributeName = null;
            console.log(`SetSourceDataset: WE HAVE NO SOURCE!`)
        }

        return this.sourceDataset;
    },

    /**
     * Handler when user clicks the big refresh arrow.
     * todo: fix this procedure; it breaks the measures dataset.
     */
    handleBigRefresh: async function () {
        this.refreshAllData();
        this.dirtyMeasures = true;

        if (this.measuresDataset) {
            await connect.deleteDatasetOnCODAP(this.measuresDataset.datasetName);
            //  this.measuresDataset = null;
            this.state.iteration = 0;
        }

    },

    copeWithAttributeDrop: async function (iDataset, iAttribute) {
        console.log(`Scramble ${iAttribute} in ${iDataset}`);
        this.state.scrambleAttributeName = iAttribute;      //  it has to exist, we just dropped it!

        if (!this.sourceDataset || (iDataset != this.sourceDataset.datasetName)) {
            //  changing the dataset
            scrambler.state.dirtyMeasures = true;
        }

        await scrambler.setSourceDataset(iDataset);
        this.refreshUIDisplay();
    },

    /**
     * Read the controls on the screen and set internal values, i.e., `state` appropriately.
     *
     */
    handleUIChoice: function () {
        this.state.numberOfScrambles = Number(document.getElementById("howManyBox").value) || this.state.numberOfScrambles || 42;
        // this.state.scrambleAttributeName = document.getElementById("attributeMenu").value || null;

        this.refreshUIDisplay();
    },

    /**
     * Handles the notification that the user has chosen something from the dataset menu.
     *
     * @param theMenu       the menu (DOM object) that the user selected from
     * @returns {Promise<void>}
     */
    handleSourceDatasetChange: async function (theMenu) {
        const theName = theMenu.value;
        scrambler.setSourceDataset(theName);
    },

    /**
     * Clone the "source" dataset to make a new one, which will get scrambled.
     * Note: it doesn't get scrambled in this method!
     * (called from `doScramble()`)
     *
     * @returns {Promise<*>}
     */
    setUpLocalScrambledDataset: async function () {

        let theScrambledOne = this.sourceDataset.clone(scrambler.constants.scrambledPrefix);

        if (connect.datasetExistsOnCODAP(theScrambledOne.datasetName)) {
            if (scrambler.state.dirtyMeasures) {
                await connect.deleteDatasetOnCODAP(theScrambledOne.datasetName);
                await theScrambledOne.emitDatasetStructureOnly();
            } else {
                await connect.deleteCasesOnCODAPinCODAPDataset(theScrambledOne);
            }
        } else {
            await theScrambledOne.emitDatasetStructureOnly();
        }

        await theScrambledOne.emitCasesFromDataset();
        await theScrambledOne.retrieveAllDataFromCODAP(); //  redo to get IDs right
        console.log(`cloned to get [${theScrambledOne.datasetName}] for scrambling`);

        return theScrambledOne;
    },

    /**
     * Makes a new "measures" dataset if necessary. If the dataset already exists,
     * get an "internal" object with its information.
     * If not, make a fresh one with the right structure (but no data).
     * (called from `doScramble()`)
     *
     * @returns {Promise<*>}    of a CODAPDataset, which is the Measures dataset
     */
    setUpLocalMeasuresDataset: async function () {

        let theMeasures = this.sourceDataset.clone(scrambler.constants.measuresPrefix);
        theMeasures.makeIntoMeasuresDataset();     //  strips out the "leaf" collection

        if (connect.datasetExistsOnCODAP(theMeasures.datasetName)) {
            if (scrambler.state.dirtyMeasures) {
                //  empty the whole measures dataset
                await connect.deleteDatasetOnCODAP(theMeasures.datasetName);
                await theMeasures.emitDatasetStructureOnly();   //  emit structure into CODAP, creates new dataset
                console.log(`    [${theMeasures.datasetName}] created anew`);
            } else {
                //  not dirty? Get all the old measures into the existing structure, keyed by the name (`theMeasures.datasetName`)
                await theMeasures.retrieveAllDataFromCODAP();   //  get the existing data and put it into the local variable
                console.log(`    [${theMeasures.datasetName}] already exists`);
            }
        } else {
            await theMeasures.emitDatasetStructureOnly();   //  emit structure into CODAP, creates new dataset
        }

        return theMeasures;
    },

    /**
     * Sets UI values for the scramble attribute and the number of scrambles to match the `state`.
     */
    matchUItoState: function () {
        document.getElementById("howManyBox").value = Number(scrambler.state.numberOfScrambles);
        document.getElementById("attributeMenu").value = scrambler.state.scrambleAttributeName;
    },

    /**
     * Handle the command to actually do a scramble
     * @param  iReps    the number of repetitions if it is *not* the number in the box (i.e., ONE.)
     * @returns {Promise<null>}
     */
    doScramble: async function (iReps) {

        this.currentlyScrambling = true;

        this.refreshUIDisplay();

        const nReps = iReps ? iReps : scrambler.state.numberOfScrambles;
        const sAttribute = scrambler.state.scrambleAttributeName;  //  name of the attribute to scramble
        scrambler.state.iteration++;

        await codapInterface.updateInteractiveState(this.state);    //  force storage

        console.log(`*** going to scramble. State: ${JSON.stringify(scrambler.state)}`);
        //  await this.refreshAllData();      //  get a new setup every time we press scramble.
        //  console.log(`    data refreshed. Ready to scramble.`);

        await this.sourceDataset.retrieveAllDataFromCODAP();
        console.log(`    latest data retrieved. Ready to scramble.`);

        this.scrambledDataset = await this.setUpLocalScrambledDataset();
        this.measuresDataset = await this.setUpLocalMeasuresDataset();
        scrambler.state.dirtyMeasures = false;

        let newItems = [];

        //  actual scramble here
        for (let i = 0; i < nReps; i++) {
            await this.scrambledDataset.scrambleInPlace(sAttribute);
            const oneRepItems = await this.measuresDataset.makeMeasuresFrom(this.scrambledDataset);
            if (oneRepItems) {
                newItems = newItems.concat(oneRepItems);
            } else {
                return null;
            }
            this.showProgress(i, nReps);
        }

        await this.measuresDataset.emitItems(true, newItems);
        connect.showTable(this.measuresDataset.datasetName);
        this.showProgress(-1, -1);
        this.currentlyScrambling = false;
        this.refreshUIDisplay();
    },

    /**
     * Display progress text showing how many scrambles have been done out of how many.
     *
     * Called from `scramble.doScramble()`.
     *
     * @param howMany   which scramble we're on
     * @param outOf     how many scrambles we're doing
     */
    showProgress: function (howMany, outOf) {
        theProgressBox = document.getElementById("progress");
        theProgressBox.innerHTML = howMany > 0 ? `${howMany}/${outOf}` : "";
    },
    /**
     * Set the values in the UI (menu choices, number in a box) to match the state.
     * Also sets the text on the scramble button to **42x** or whatever.
     *
     */
    refreshUIDisplay: function () {
        console.log(`    refreshing UI display`);
        //  set the number of scrambles in the box
        document.getElementById("howManyButton").innerHTML = this.state.numberOfScrambles + "x";

        const buttons = document.getElementById("scramble-buttons-stripe-element");
        const progress = document.getElementById("progress");
        const showScrambled = document.getElementById("showScrambledDIV");

        //  visibility; shows appropriate message if scrambling is impossible

        buttons.style.display = this.currentlyScrambling ? "none" : "flex";
        progress.style.display = this.currentlyScrambling ? "flex" : "none";

        const canScramble = this.scrattributeExists && this.scrattributeIsLeaf && this.datasetExists && this.datasetHasMeasure;
        const canDoScrambleStripe = document.getElementById("how-many-stripe");
        const cantDoScrambleStripe = document.getElementById("cantScrambleStripe");

        canDoScrambleStripe.style.display = canScramble ? "flex" : "none";
        cantDoScrambleStripe.style.display = canScramble ? "none" : "flex";
        showScrambled.style.display = canScramble ? "flex" : "none";

        document.getElementById("languageControl").innerHTML = scrambler.pickAFlag();        //  theFlag;

        this.refreshScramblerStatus();
    },

    changeLanguage: async function () {

        const theLanguages = scramblerStrings.languages;
        const nLanguages = theLanguages.length;
        let theIndex = theLanguages.indexOf(scrambler.state.lang) + 1;

        if (theIndex >= nLanguages) {
            theIndex = 0;
        }

        scrambler.state.lang = theLanguages[theIndex];
        scrambler.strings = await scramblerStrings.initializeStrings(this.state.lang);
        scrambler.state.dirtyMeasures = true;

        scramblerStrings.setStrings();
        scrambler.refreshUIDisplay();
    },

    pickAFlag: function () {
        const theFlags = scrambler.strings.flags;
        const theIndex = Math.floor(Math.random() * theFlags.length);
        return theFlags[theIndex];
    },

    openHelp: async function () {
        const theURL = `help/help.${scrambler.state.lang}.html`;
        const response = await fetch(theURL);

        if (response.status == 200) {
            window.open(theURL, `_blank`);
        } else if (response.status === 404) {
            window.open(`help/help.en.html`, `_blank`);     //  default to English
            console.log(`No help file for ${scrambler.state.lang}, defaulting to English.`)
        }
    },

    doAlert: function (iTitle, iText, iIcon = 'info') {
        alert(iText);
        /*  failed to adjust the height.
        Swal.fire({
            className : "scrambler-swal",
            icon: iIcon,
            title: iTitle,
            text: iText,
            height : 166,
        })
        */
    },

    constants: {
        pluginName: "scrambler",
        version: "1.3",
        dimensions: {height: 188, width: 344},      //      dimensions,
        defaultState: {
            lastDatasetName: null,
            scrambleAttributeName: null,
            numberOfScrambles: 10,
            dirtyMeasures: false,
            iteration: 0,
            lang: `en`,
        },
        measuresPrefix: "measures_",
        scrambledPrefix: "scrambled_",
        scrambleSetName: "scrset",
    },
}

/**
 * Scramble the values in the array. Defined at the bottom of `scrambler.js`.
 */
Array.prototype.scramble = function () {
    const N = this.length;

    for (let i = 0; i < N; i++) {
        const other = Math.floor(Math.random() * N);
        const temp = this[i];
        this[i] = this[other];
        this[other] = temp;
    }
};