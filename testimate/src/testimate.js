const testimate = {

    state: {},
    restoringFromSave : false,

    theTest: null,

    initialize: async function () {
        console.log(`initializing...`);

        await connect.initialize(this.iFrameDescription, null);
        this.state = await codapInterface.getInteractiveState();    //  get stored state of any
        if (this.state.dataset) {
            await this.restoreState();
            // await this.setDataset(this.state.dataset);  //  register for case changes
        } else {
            Object.assign(this.state, this.constants.defaultState);     //  test
        }

        //  this.strings = strings;      //      todo: fix this, make it robust

        await localize.initialize('en');

        ui.initialize();
        ui.redraw();
    },

    restoreState: async function () {
        await connect.registerForCaseChanges(this.state.dataset.name);
        if (testimate.state.testID) {
            this.restoringFromSave = true;
            await data.updateData();
            this.makeFreshTest(testimate.state.testID);
        }
        this.dirtyData = true;
        // if (this.state.x) {
        //     this.setX(this.state.x);
        // }

    },

    makeFreshTest: function (iID) {
        testimate.state.testID = iID;
        const theConfigs = Test.configs[iID];
        this.theTest = theConfigs.fresh(iID, data.xAttData, data.yAttData);
        this.restoringFromSave = false;
    },

    copeWithAttributeDrop: async function (iDataset, iAttribute, iWhere) {
        //  const titleElement = document.getElementById(`titleDIV`);
        const initialElement = document.elementFromPoint(iWhere.x, iWhere.y);
        const theElement = initialElement.closest('#xDIV, #yDIV');

        if (!this.state.dataset) {
            await this.setDataset(iDataset);
        } else if (this.state.dataset.name !== iDataset.name) {
            await this.setDataset(iDataset);
            this.setX(this.emptyAttribute);
            this.setY(this.emptyAttribute);    //  change of dataset, remove attributes
        }

        if (theElement === ui.xDIV) {
            await this.setX(iAttribute);
        } else if (theElement === ui.yDIV) {
            await this.setY(iAttribute);
        } else if (theElement && !this.state.x.name) {
            await this.setX(iAttribute);      //  set x anywhere if it doesn't exist
        }

        data.dirtyData = true;

        ui.redraw();
    },

    setDataset: async function (iDataset) {
        this.state.dataset = iDataset;
        this.state.testID = null;
        this.setX(this.emptyAttribute);
        this.setY(this.emptyAttribute);    //  change of dataset, remove attributes

        await connect.registerForCaseChanges(this.state.dataset.name);
        await connect.registerForAttributeEvents(this.state.dataset.name);
        //  await connect.getDatasetInfo(iName);
        console.log(`set dataset to ${iDataset.name}`);
    },

    setX: async function (iAtt) {
        data.dirtyData = true;
        this.state.x = iAtt;
        //  this.state.testID = null;
        console.log(`set X to ${iAtt.name}`);
    },

    setNewGroupingValue: async function(iValue) {
        let f = "no formula needed";
        const theConfig = Test.configs[testimate.state.testID];
        const theAxis = theConfig.groupAxis;
        if (theAxis) {
            f = await connect.updateDatasetForLogisticGroups(iValue, theAxis);
        }
        testimate.state.testParams.group = iValue;
        console.log(`changing grouping: new formula : [${f}]`);
    },

    setY: async function (iAtt) {
        data.dirtyData = true;
        if (this.state.x) {
            this.state.y = iAtt;
            //  this.state.testID = null;
            console.log(`set Y to ${iAtt.name}`);
        } else {
            this.setX(iAtt);   //  always fill x first.
        }
    },

    emptyAttribute: {
        name: "",
        title: "",
        id: -1,
    },

    constants: {
        pluginName: `testimate`,
        version: `2023i`,
        dimensions: {height: 555, width: 444},

        emittedDatasetName: `tests and estimates`,     //      for receiving emitted test and estimate results
        logisticGroupAttributeName : `_logisticGroup`,  //  to add to the original dataset
        logisticGraphName : "logistic graph",

        defaultState: {
            lang: `en`,
            dataset: null,     //      whole dataset info, includes .name
            dataTypes: {},     //      {'gender' : 'categorical', 'height' : 'numeric', ...}
            x: null,           //      attribute info, complete
            y: null,
            rrEmitNumber : 10,      //  number of times you re-randomize by default
            testID: null,
            testParams: {},
            mostRecentEmittedTest : null,
        }
    }
}