const scrambler = {
    sourceDataset: null,        //      a CODAPDataset.
    scrambledDataset: null,     //      a CODAPDataset.
    measuresDataset: null,      //      a CODAPDataset.

    nDatasets : 0,
    currentlyScrambling : false,

    state: {},

    initialize: async function () {
        await connect.initialize();
        this.state = await codapInterface.getInteractiveState();
        if (Object.keys(this.state).length === 0) {
            Object.assign(this.state, this.constants.defaultState);
            await codapInterface.updateInteractiveState(this.state);
            console.log(`No interactive state retrieved. Got a new one...: ${this.state}`);
        }

        this.matchUItoState();  //  set the scramble attribute and number of reps to match the state

        await this.refreshAllData();
    },

    refreshAllData: async function () {
        const tName = await this.initDatasetUI();
        this.iteration = 0;

        if (tName) {
            await this.setSourceDataset(tName);
        } else {
            scrambler.doAlert("oops", `You need a dataset name`);
        }
        this.refreshUIDisplay();
    },

    /**
     * Start up the dataset UI correctly by adjusting the dataset menu.
     *
     * Called by `refreshAllData()` and from the document change handler,
     * `handleDocumentChangeNotice()` in `notifications.js`.
     *
     * @returns {Promise<*>}    the name of the current dataset
     */
    initDatasetUI: async function () {
        const theDefaultName = (this.sourceDataset) ? this.sourceDataset.datasetName : "";
        const datasetMenuResult = await connect.makeDatasetMenuGuts(theDefaultName);
        const datasetMenuGuts = datasetMenuResult.guts;
        this.nDatasets = datasetMenuResult.number;

        document.getElementById("datasetMenuBlock").innerHTML = datasetMenuGuts;
        const theDatasetMenu = document.getElementById("datasetMenu");
        const startingName = theDatasetMenu ? theDatasetMenu.value : null;

        return startingName;
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
        await this.sourceDataset.retrieveAllDataFromCODAP();    //  todo need this?

        //  cope with the scramble attributes
        const scrin = scrambler.state.scrambleAttributeName;
        console.log(`Setting source to [${iName}], incoming scrattribute: [${scrin}]`);
        const scrout = this.sourceDataset.findSelectedAttribute(scrambler.state.scrambleAttributeName);
        scrambler.state.scrambleAttributeName = scrout;
        console.log(`    outgoing scrattribute: [${scrout}]`);

        if (scrin !== scrout) {
            this.refreshUIDisplay();    //  fix the displayed scramble attribute
        }
    },

    /**
     * Handler when user clicks the big refresh arrow.
     */
    handleBigRefresh : async function() {
        this.refreshAllData();

        if (this.measuresDataset) {
            await connect.deleteDataset(this.measuresDataset.datasetName);
            this.state.iteration = 0;
        }

    },

    /**
     * Read the controls on the screen and set internal values, i.e., `state` appropriately.
     *
     */
    handleUIChoice: function () {
        this.state.numberOfScrambles = Number(document.getElementById("howManyBox").value) || this.state.numberOfScrambles || 42;
        this.state.scrambleAttributeName = document.getElementById("attributeMenu").value || null;

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
    makeNewScrambledDataset: async function () {
        const theScrambledOne = this.sourceDataset.clone(scrambler.constants.scrambledPrefix);
        await theScrambledOne.emitDatasetStructureOnly();
        await theScrambledOne.emitCasesFromDataset();
        await theScrambledOne.retrieveAllDataFromCODAP(); //  redo to get IDs right
        console.log(`cloned to get [${theScrambledOne.datasetName}] for scrambling`);

        return theScrambledOne;
    },

    /**
     * Makes a new "measures" dataset if necessary. If the dataset already exists,
     * get an "internal" object with its information.
     * If not, make a fresh one with the right structure (but no data).
     *
     * @returns {Promise<*>}    of a CODAPDataset, which is the Measures dataset
     */
    makeNewMeasuresDataset: async function () {

        let theMeasures = null;

        const tMeasuresDatasetName = `${scrambler.constants.measuresPrefix}${this.sourceDataset.structure.title}`;

        if (await connect.datasetExists(tMeasuresDatasetName)) {
            theMeasures = await new CODAPDataset(tMeasuresDatasetName);
            await theMeasures.retrieveAllDataFromCODAP();
            console.log(`    [${tMeasuresDatasetName}] already exists`);
        } else {
            theMeasures = this.sourceDataset.clone(scrambler.constants.measuresPrefix);
            theMeasures.makeIntoMeasuresDataset();     //  strips out the "leaf" collection
            await theMeasures.emitDatasetStructureOnly();
            console.log(`    ${tMeasuresDatasetName}] created anew`);
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
        console.log(`    data retrieved. Ready to scramble.`);

        if (this.measuresDataset && scrambler.state.dirtyMeasures) {
            await connect.deleteDataset(this.measuresDataset.datasetName);
            console.log(`    deleted a dirty measures dataset`);
        }
        this.scrambledDataset = await this.makeNewScrambledDataset();
        this.measuresDataset = await this.makeNewMeasuresDataset();
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

        this.measuresDataset.emitItems(true, newItems);
        connect.showTable(this.measuresDataset.datasetName);
        this.showProgress(-1,-1);
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
    showProgress: function(howMany, outOf) {
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
        //  const domStatus = document.getElementById("status");
        //  domStatus.innerHTML = this.sourceDataset;   //      calls toString(), displays name and number of collections

        //  set the number of scrambles in the box
        document.getElementById("howManyButton").innerHTML = this.state.numberOfScrambles + "x";

        //  set the attribute name in the menu
        const attributeStripe =  document.getElementById("attribute-stripe");

        if (this.nDatasets > 0) {
            document.getElementById("attributeMenu").innerHTML
                = scrambler.sourceDataset.makeAttributeMenuGuts(this.state.scrambleAttributeName);
            attributeStripe.style.display = "flex";
        } else {
            attributeStripe.style.display = "none";
        }

        const buttons = document.getElementById("scramble-buttons-stripe-element");
        const progress = document.getElementById("progress");

        buttons.style.display = this.currentlyScrambling ? "none" : "flex";
        progress.style.display = this.currentlyScrambling ? "flex" : "none";


        //  visibility; shows appropriate message if scrambling is impossible

        const canScramble = this.sourceDataset && this.sourceDataset.structure.collections.length > 1;
        const canDoScrambleStripe = document.getElementById("how-many-stripe");
        const cantDoScrambleStripe = document.getElementById("how-many-stripe-disabled");

        canDoScrambleStripe.style.display = canScramble ? "flex" : "none";
        cantDoScrambleStripe.style.display = canScramble ? "none" : "flex";
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
        version: "1.0",
        dimensions: {height: 178, width: 344},      //      dimensions,
        defaultState: {
            scrambleAttributeName: null,
            numberOfScrambles: 10,
            iteration: 0,
            dirtyMeasures: true,
        },
        measuresPrefix: "measures_",
        scrambledPrefix: "scrambled_",
        scrambleSetName: "scrset",
        iterationAttName: "batch",
        scrambledAttAttName: "scrambled att",
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