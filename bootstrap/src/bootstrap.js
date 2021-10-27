const bootstrap = {
    sourceDataset: null,        //      a CODAPDataset.
    bootstrappedDataset: null,     //      a CODAPDataset.
    measuresDataset: null,      //      a CODAPDataset.

    nDatasets: 0,
    currentlyBootstrapping: false,
    currentlyDraggingAnAttribute: false,

    datasetExists: false,
    datasetHasMeasure: false,
    measureHasFormula : false,

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
        bootstrap.strings = await bootstrapStrings.initializeStrings(this.state.lang);

        await this.refreshAllData();
    },

    refreshBootstrapperStatus: function () {
        let theHTML = ``;

        if (this.datasetExists) {
            const tDSTitle = this.sourceDataset.structure.title;
            const nCollections = this.sourceDataset.structure.collections.length;
            this.datasetHasMeasure = nCollections > 1;
            const lastCollName = this.sourceDataset.structure.collections[nCollections - 1].name;

            const codeStart = "<code>";
            const codeEnd = "</code>";

            const dsReport = (this.sourceDataset)
                ? `${this.sourceDataset.structure.title}`
                : bootstrap.strings.sNoDataset;

            document.getElementById("datasetReport").innerHTML = dsReport;

            if (this.datasetHasMeasure) {
                const formulaSituation = bootstrap.sourceDataset.checkForFormulasInCollections(); //  this is an object
                bootstrap.measureHasFormula = formulaSituation.beforeLeaves.length > 0;
                console.log(`bootstrap status for ${this.sourceDataset.datasetName}: possible meas = ${formulaSituation.beforeLeaves.length} and leafForms = ${formulaSituation.inLeaves.length}`)
                if (formulaSituation.beforeLeaves.length === 0) {
                    if (formulaSituation.inLeaves.length === 0) {
                        theHTML = bootstrap.strings.sfNoFormulaProblem( tDSTitle);
                    } else {
                        const suchAs = (formulaSituation.inLeaves.length == 1)    //  formulaSituation.inLeaves is the list of formula attributes among the leaves
                            ? `${formulaSituation.inLeaves[0]}`
                            : `${formulaSituation.inLeaves[0]} ${bootstrap.strings.sOr} ${formulaSituation.inLeaves[1]}`;
                        theHTML = bootstrap.strings.sfOnlyInLeafProblem(tDSTitle, lastCollName, suchAs);
                    }
                } else {
                    theHTML = bootstrap.strings.sfOKtoBootstrap(tDSTitle); //   `OK to bootstrap dataset "${tDSTitle}"`;
                }
            } else {
                theHTML = bootstrap.strings.sfNoMeasure(tDSTitle);
            }
        } else {
            theHTML = bootstrap.strings.sNoDataset;
        }

        document.getElementById(`bootstrapStatus`).innerHTML = theHTML;
    },

    refreshAllData: async function () {
        const tName = await connect.getSuitableDatasetName(this.state.datasetName);
        this.iteration = 0;

        if (tName) {
            await this.setSourceDataset(tName);
        }
        this.refreshUIDisplay();
    },


    /**
     * Makes a `CODAPDataset` filled with the information from the CODAP dataset of the given name.
     * This thing will be the root of the bootstrapping we do.
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
            this.datasetHasMeasure = (this.sourceDataset.structure.collections.length > 1);

            //  cope with the bootstrap attributes
            console.log(`SetSourceDataset: ${iName} `);
        } else {
            this.datasetExists = false;
            this.datasetHasMeasure = false;

            console.log(`SetSourceDataset: WE HAVE NO SOURCE!`)
        }
    },

    /**
     * Handler when user clicks the big refresh arrow.
     */
    handleBigRefresh: async function () {
        this.refreshAllData();

        if (this.measuresDataset) {
            await connect.deleteDataset(this.measuresDataset.datasetName);
            this.state.iteration = 0;
        }

    },

    copeWithAttributeDrop: async function (iDataset, iAttribute) {
        console.log(`Bootstrap attribute drop from dataset ${iDataset}`);

        await bootstrap.setSourceDataset(iDataset);

        if (this.sourceDataset && (iDataset != this.sourceDataset.datasetName)) {
            //  changing the dataset
            console.log(`    changing dataset from ${this.sourceDataset.datasetName}`)
        }

        this.refreshUIDisplay();
    },

    /**
     * Sets UI values for the bootstrap attribute and the number of bootstraps to match the `state`.
     */
    matchUItoState: function () {
        document.getElementById("howManyBox").value = Number(bootstrap.state.numberOfSamples);
    },

    /**
     * Read the controls on the screen and set internal values, i.e., `state` appropriately.
     *
     */
    handleUIChoice: function () {
        this.state.numberOfSamples = Number(document.getElementById("howManyBox").value) || this.state.numberOfSamples || 42;
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
        bootstrap.setSourceDataset(theName);
    },

    /**
     * Clone the "source" dataset to make a new one, which will get bootstrapped.
     * If the measures are "dirty" (structure changed) this dataset will have been deleted in CODAP
     * Note: it doesn't get bootstrapped in this method!
     * (called from `doBootstrap()`)
     *
     * @returns {Promise<*>}
     */
    prepareBootstrappedDataset: async function () {
        //  the INTERNAL (not CODAP) structure of the dataset (a `CODAPDataset`)
        const theBootstrappedOne = this.sourceDataset.clone(bootstrap.constants.bootstrapPrefix);

        if (bootstrap.state.dirtyMeasures) {
            await theBootstrappedOne.emitDatasetStructureOnly();        //  deletes first. don't need cases; they'll come later
        }
        console.log(`cloned to get [${theBootstrappedOne.datasetName}] for bootstrapping`);

        return theBootstrappedOne;
    },

    /**
     * Makes a new "measures" dataset if necessary. If the dataset already exists,
     * get an "internal" object with its information.
     * If not, make a fresh one with the right structure (but no data).
     *
     * @returns {Promise<*>}    of a CODAPDataset, which is the Measures dataset
     */
    prepareMeasuresDataset: async function () {
        let theMeasures;
        const tMeasuresDatasetName = `${bootstrap.constants.measuresPrefix}${this.sourceDataset.structure.title}`;
        const measuresAlreadyExists = await connect.datasetExists(tMeasuresDatasetName);

        if ( measuresAlreadyExists && !bootstrap.state.dirtyMeasures ) {
            //  the measures setup has not changed, so we don't worry about it
            //  but we do have to fill its information from CODAP
            theMeasures = await new CODAPDataset(tMeasuresDatasetName);
            await theMeasures.retrieveAllDataFromCODAP();
            console.log(`    [${tMeasuresDatasetName}] already exists. Got its info.`);
        } else {
            if (measuresAlreadyExists) {    //  therefore, the measures are dirty and we need to reconstruct them
                connect.deleteDataset(tMeasuresDatasetName);    //  todo: necessary? emitDataset... (below) starts with a delete.
            }
            //  make an entirely new measures dataset
            theMeasures = this.sourceDataset.clone(bootstrap.constants.measuresPrefix);
            theMeasures.makeIntoMeasuresDataset();     //  strips out the "leaf" collection
            await theMeasures.emitDatasetStructureOnly();
            console.log(`    [${theMeasures.datasetName}] created anew`);
        }

        return theMeasures;
    },

    /**
     * Handle the command to actually do a bootstrap
     * @param  iReps    the number of repetitions if it is *not* the number in the box (i.e., ONE.)
     * @returns {Promise<null>}
     */
    doBootstrap: async function (iReps) {

        this.currentlyBootstrapping = true;
        this.refreshUIDisplay();    //  sets progress to visible

        const nReps = iReps ? iReps : bootstrap.state.numberOfSamples;

        bootstrap.state.iteration++;

        await codapInterface.updateInteractiveState(this.state);    //  force storage, so state is remembered

        console.log(`*** going to bootstrap. State: ${JSON.stringify(bootstrap.state)}`);
        //  await this.refreshAllData();      //  get a new setup every time we press bootstrap.
        //  console.log(`    data refreshed. Ready to bootstrap.`);

        await this.sourceDataset.retrieveAllDataFromCODAP();
        console.log(`    data retrieved. Ready to bootstrap.`);

        //  delete the derived datasets in CODAP if dirty
        this.measuresDataset = await this.prepareMeasuresDataset();
        this.bootstrappedDataset = await this.prepareBootstrappedDataset();    // structure, with cases
        bootstrap.state.dirtyMeasures = false;


        //  actual bootstrap here
        let newItems = [];
        for (let i = 0; i < nReps; i++) {
            //  refresh with fresh cases, includes emitting to CODAP so it can calculate measures
            await this.bootstrappedDataset.bootstrapCasesFrom(this.sourceDataset);

            //  now collect the measures
            const oneRepItems = await this.measuresDataset.makeMeasuresFrom(this.bootstrappedDataset);
            if (oneRepItems) {
                newItems = newItems.concat(oneRepItems);
            } else {
                return null;
            }
            this.showProgress(i, nReps);
        }

        this.measuresDataset.emitItems(true, newItems);
        connect.showTable(this.measuresDataset.datasetName);
        this.showProgress(-1, -1);
        this.currentlyBootstrapping = false;
        this.refreshUIDisplay();
    },

    /**
     * Display progress text showing how many bootstraps have been done out of how many.
     *
     * Called from `bootstrap.doBootstrap()`.
     *
     * @param howMany   which bootstrap we're on
     * @param outOf     how many bootstraps we're doing
     */
    showProgress: function (howMany, outOf) {
        theProgressBox = document.getElementById("progress");
        theProgressBox.innerHTML = howMany > 0 ? `${howMany}/${outOf}` : "";
    },
    /**
     * Set the values in the UI (menu choices, number in a box) to match the state.
     * Also sets the text on the bootstrap button to **42x** or whatever.
     *
     * Then, sets visibility of various parts of the UI depending on
     * whether the dataset is appropriate for bootstrapping
     *
     */
    refreshUIDisplay: function () {
        console.log(`    refreshing UI display`);

        //  set the number of bootstraps in the box
        const tNumberInBox = document.getElementById("howManyBox").value;
        document.getElementById("howManyButton").innerHTML = tNumberInBox + "x";

        const buttons = document.getElementById("bootstrap-buttons-stripe-element");
        const progress = document.getElementById("progress");

        //  visibility; shows appropriate message if bootstrapping is impossible

        buttons.style.display = this.currentlyBootstrapping ? "none" : "flex";
        progress.style.display = this.currentlyBootstrapping ? "flex" : "none";

        //  set the language control
        document.getElementById("languageControl").innerHTML = bootstrap.pickAFlag();        //  theFlag;

        this.refreshBootstrapperStatus();

        const canBootstrap = this.datasetExists && this.datasetHasMeasure && this.measureHasFormula;
        const canDoBootstrapStripe = document.getElementById("how-many-stripe");
        const cantDoBootstrapStripe = document.getElementById("cantBootstrapStripe");

        canDoBootstrapStripe.style.display = canBootstrap ? "flex" : "none";
        cantDoBootstrapStripe.style.display = canBootstrap ? "none" : "flex";

    },

    /**
     * Change to a different language.
     * @returns {Promise<void>}
     */
    changeLanguage: async function () {
        bootstrap.state.lang = (bootstrap.state.lang === `en`) ? `es` : `en`;
        bootstrap.strings = await bootstrapStrings.initializeStrings(this.state.lang);
        bootstrap.state.dirtyMeasures = true;
        bootstrap.refreshUIDisplay();
    },

    /**
     * Return the (unicode?) flag, chosen randomly from the list of flags, an array
     * @returns {*}
     */
    pickAFlag: function () {
        const theFlags = bootstrap.strings.flags;
        const theIndex = Math.floor(Math.random() * theFlags.length);
        return theFlags[theIndex];
    },

    doAlert: function (iTitle, iText, iIcon = 'info') {
        alert(iText);
    },

    /**
     * Open the help web page
     * @returns {Promise<void>}
     */
    openHelp : async function() {
        const theURL = `help/help.${bootstrap.state.lang}.html`;
        const response = await fetch(theURL);

        if (response.status == 200) {
            window.open(theURL, `_blank`);
        } else if (response.status === 404) {
            window.open(`help/help.en.html`, `_blank`);     //  default to English
            console.log(`No help file for ${bootstrap.state.lang}, defaulting to English.`)
        }
    },

    constants: {
        pluginName: "bootstrap",
        version: "1.0",
        dimensions: {height: 211, width: 344},      //      dimensions,
        defaultState: {
            bootstrapDatasetName: null,
            numberOfSamples: 10,
            iteration: 0,
            dirtyMeasures: true,
            lang: `en`,
        },
        measuresPrefix: "measures_",
        bootstrapPrefix: "bootstrapSample_",        //  prefix for a bootstrap sample dataset
        bootstrapSetName: "bootset",
    },
}

