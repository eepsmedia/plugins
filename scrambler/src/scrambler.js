const scrambler = {
    sourceDataset: null,        //      a CODAPDataset.
    scrambledDataset: null,     //      a CODAPDataset.
    measuresDataset: null,      //      a CODAPDataset.

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
        const iName = await this.initUI();
        this.iteration = 0;

        if (iName) {
            await this.setSourceDataset(iName);
        } else {
            scrambler.doAlert("oops", `You need a dataset name`);
        }
        this.refreshUIDisplay();

    },

    initUI: async function () {
        const theDefaultName = (this.sourceDataset) ? this.sourceDataset.datasetName : "";
        const datasetMenuGuts = await connect.makeDatasetMenuGuts(theDefaultName);
        document.getElementById("datasetMenuBlock").innerHTML = datasetMenuGuts;
        const theDatasetMenu = document.getElementById("datasetMenu");
        const startingName = theDatasetMenu ? theDatasetMenu.value : null;

        return startingName;
    },

    setSourceDataset: async function (iName) {
        console.log(`Setting source to [${iName}], incoming scrattribute: [${scrambler.state.scrambleAttributeName}]`);
        this.sourceDataset = await new CODAPDataset(iName);
        await notificatons.registerForDatasetChanges(iName);
        await this.sourceDataset.retrieveAllDataFromCODAP();    //  todo need this?
        scrambler.state.scrambleAttributeName = this.sourceDataset.findSelectedAttribute(scrambler.state.scrambleAttributeName);
        console.log(`    outgoing scrattribute: [${scrambler.state.scrambleAttributeName}]`);

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

    handleSourceDatasetChange: async function () {
        const theName = this.value;
        scrambler.setSourceDataset(theName);
    },

    makeNewClone: async function () {
        const theClone = this.sourceDataset.clone(scrambler.constants.scrambledPrefix);
        await theClone.emitDatasetStructureOnly();
        await theClone.emitCasesFromDataset();
        await theClone.retrieveAllDataFromCODAP(); //  redo to get IDs right
        console.log(`cloned to get [${theClone.datasetName}]`);

        return theClone;
    },

    makeNewMeasuresDataset: async function () {

        let theMeasures = null;

        const tMeasuresDatasetName = `${scrambler.constants.measuresPrefix}${this.sourceDataset.datasetName}`;
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
        this.scrambledDataset = await this.makeNewClone();
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
        }

        this.measuresDataset.emitItems(true, newItems);
        connect.showTable(this.measuresDataset.datasetName);
    },

    /**
     * Set the values in the UI (menu choices, number in a box) to match the state.
     * Also sets the text on the scramble button to **42x** or whatever.
     *
     */
    refreshUIDisplay: function () {
        console.log(`    refreshing UI display`);
        const domStatus = document.getElementById("status");
        domStatus.innerHTML = this.sourceDataset;   //      calls toString(), displays name and number of collections

        //  set the number of scrambles in the box
        document.getElementById("howManyButton").innerHTML = this.state.numberOfScrambles + "x";

        //  set the attribute name in the menu
        document.getElementById("attributeMenu").innerHTML
            = scrambler.sourceDataset.makeAttributeMenuGuts(this.state.scrambleAttributeName);

        //  visibility; shows appropriate message if scrambling is impossible

        const canScramble = this.sourceDataset.structure.collections.length > 1;
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
        version: "2021e",
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
        iterationAttName: "scrit",
        scrambledAttAttName: "scratt",
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