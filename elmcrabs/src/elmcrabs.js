const elmcrabs = {
    constants: {},
    sourceDataset: null,
    cloneDataset: null,
    scrambledDataset: null,
    iteration : 0,

    initialize: async function () {
        connect.initialize();

        this.refreshAllData();
    },

    refreshAllData: async function () {
        const iName = await this.initUI();
        this.iteration = 0;

        if (iName) {
            await this.setSourceDataset(iName);
            await this.sourceDataset.retrieveAllDataFromCODAP();

            await this.makeNewClone();
            await this.makeNewScrambledDataset();
        } else {
            console.log(`need a dataset name`);
        }
        this.refresh();

    },

    makeNewClone: async function () {
        this.cloneDataset = this.sourceDataset.clone("cloned_");
        await this.cloneDataset.emitDatasetStructureOnly();
        await this.cloneDataset.emitCasesFromDataset();
        await this.cloneDataset.retrieveAllDataFromCODAP(); //  redo to get IDs right
    },

    makeNewScrambledDataset: async function () {
        this.scrambledDataset = this.sourceDataset.clone("scrambled_");
        this.scrambledDataset.makeScrambled();
        await this.scrambledDataset.emitDatasetStructureOnly();
    },

    doScramble: async function (iReps) {
        this.iteration++;

        if (!iReps) {
            iReps = document.getElementById("howManyBox").value;
        }
        if (await connect.needFreshOutputDataset()) {

        }
        const sAttribute = document.getElementById("attributeMenu").value;

        let newItems = [];

        for (let i = 0; i < iReps; i++) {
            await this.cloneDataset.scrambleInPlace(sAttribute);
            const oneRepItems = await this.scrambledDataset.makeMeasuresFrom(this.cloneDataset);
            if (oneRepItems) {
                newItems = newItems.concat(oneRepItems);
            } else {
                return null;
            }
        }

        this.scrambledDataset.emitItems(true, newItems);
        connect.showTable(this.scrambledDataset.datasetName);
    },

    initUI: async function () {
        const datasetMenuGuts = await connect.makeDatasetMenuGuts(this.datasetName);
        document.getElementById("datasetMenuBlock").innerHTML = datasetMenuGuts;
        const theDatasetMenu = document.getElementById("datasetMenu");
        const startingName = theDatasetMenu ? theDatasetMenu.value : null;

        return startingName;
    },

    refresh: async function () {
        const domStatus = document.getElementById("status");
        domStatus.innerHTML = this.sourceDataset;

        const howMany = document.getElementById("howManyBox").value;
        document.getElementById("howManyButton").innerHTML
            = howMany + "x";

        const currentAttName = document.getElementById("attributeMenu").value;
        document.getElementById("attributeMenu").innerHTML
            = elmcrabs.sourceDataset.makeAttributeMenuGuts(currentAttName);
    },

    setSourceDataset: async function (iName) {
        this.sourceDataset = new CODAPDataset(iName);
    },

    constants: {
        pluginName: "scrambler",
        version: "2021a",
        dimensions: {height: 178, width: 344},      //      dimensions,

    },
}

Array.prototype.scramble = function () {
    const N = this.length;

    for (let i = 0; i < N; i++) {
        const other = Math.floor(Math.random() * N);
        const temp = this[i];
        this[i] = this[other];
        this[other] = temp;
    }
};