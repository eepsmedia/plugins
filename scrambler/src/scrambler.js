const scrambler = {
    sourceDataset: null,        //      a CODAPDataset.
    scrambledDataset: null,     //      a CODAPDataset.
    measuresDataset: null,      //      a CODAPDataset.

    state: {},

    initialize: async function () {
        await connect.initialize();
        this.state = await codapInterface.getInteractiveState();
        if (Object.keys(this.state).length === 0) {
            this.state = this.constants.defaultState;
        }
        await codapInterface.updateInteractiveState(this.state);
        this.matchUItoState();

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
        this.refresh();

    },

    initUI: async function () {
        const theDefaultName = (this.sourceDataset) ? this.sourceDataset.datasetName : "";
        const datasetMenuGuts = await connect.makeDatasetMenuGuts(theDefaultName);
        document.getElementById("datasetMenuBlock").innerHTML = datasetMenuGuts;
        const theDatasetMenu = document.getElementById("datasetMenu");
        const startingName = theDatasetMenu ? theDatasetMenu.value : null;

        return startingName;
    },

    setSourceDataset : async function(iName) {
        this.sourceDataset = await new CODAPDataset(iName);
        await notificatons.registerForDatasetChanges(iName);
        await this.sourceDataset.retrieveAllDataFromCODAP();

        await this.makeNewClone();
        await this.makeNewMeasuresDataset();

    },

    handleSourceDatasetChange : async function() {
        const theName = this.value;
        scrambler.setSourceDataset(theName);
    },

    makeNewClone: async function () {
        this.scrambledDataset = this.sourceDataset.clone(scrambler.constants.scrambledPrefix);
        await this.scrambledDataset.emitDatasetStructureOnly();
        await this.scrambledDataset.emitCasesFromDataset();
        await this.scrambledDataset.retrieveAllDataFromCODAP(); //  redo to get IDs right
        console.log(`cloned to get ${scrambler.scrambledDataset.datasetName}`);
    },

    makeNewMeasuresDataset: async function () {
        const tMeasuresDatasetName = `${scrambler.constants.measuresPrefix}${this.sourceDataset.datasetName}`;
        if (await connect.datasetExists(tMeasuresDatasetName)) {
            this.measuresDataset = await new CODAPDataset(tMeasuresDatasetName);
            await this.measuresDataset.retrieveAllDataFromCODAP();
        } else {
            this.measuresDataset = this.sourceDataset.clone(scrambler.constants.measuresPrefix);
            this.measuresDataset.makeIntoMeasuresDataset();     //  strips out the "leaf" collection
            await this.measuresDataset.emitDatasetStructureOnly();
        }
    },

    matchUItoState : function() {
        document.getElementById("howManyBox").value = Number(scrambler.state.numberOfScrambles);
        document.getElementById("attributeMenu").value = scrambler.state.scrambleAttributeName;
    },

    doScramble: async function (iReps) {
        if (!iReps) {
            iReps = document.getElementById("howManyBox").value;
        }

        const sAttribute = document.getElementById("attributeMenu").value;

        scrambler.state.numberOfScrambles = iReps;
        scrambler.state.scrambleAttributeName = sAttribute;
        scrambler.state.iteration++;
        await codapInterface.updateInteractiveState(this.state);    //  force storage

        this.refreshAllData();      //  get a new setup every time we press scramble.

        let newItems = [];

        for (let i = 0; i < iReps; i++) {
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

    refresh: async function () {
        const domStatus = document.getElementById("status");
        domStatus.innerHTML = this.sourceDataset;

        const howMany = document.getElementById("howManyBox").value || this.state.numberOfScrambles;
        document.getElementById("howManyButton").innerHTML
            = howMany + "x";

        const currentAttName = document.getElementById("attributeMenu").value || this.state.scrambleAttributeName;
        document.getElementById("attributeMenu").innerHTML
            = scrambler.sourceDataset.makeAttributeMenuGuts(currentAttName);

        //  visibility

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
        version: "2021b",
        dimensions: {height: 178, width: 344},      //      dimensions,
        defaultState: {
            scrambleAttributeName: null,
            numberOfScrambles: 10,
            iteration : 0,
        },
        measuresPrefix : "measures_",
        scrambledPrefix : "scrambled_",
        iterationAttName : "scrit",
        scrambledAttAttName : "scratt",
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