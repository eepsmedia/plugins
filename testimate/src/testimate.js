

const testimate = {

    state : {},

    theTest : null,

    initialize : async function() {
        console.log(`initializing...`);

        Object.assign(this.state, this.constants.defaultState);     //  test

        //  await this.setUpState();
        await connect.initialize(this.iFrameDescription, null);
        this.state = await codapInterface.getInteractiveState();    //  get stored state of any
        if (this.state.dataset) {
            await this.restoreState();
           // await this.setDataset(this.state.dataset);  //  register for case changes
        }

        this.strings = strings;      //      todo: fix this, make it robust

        ui.initialize();
        ui.redraw();
    },

    restoreState : async function() {
        await connect.registerForCaseChanges(this.state.dataset.name);
        this.dirtyData = true;
        // if (this.state.x) {
        //     this.setX(this.state.x);
        // }

    },

    copeWithAttributeDrop : async function(iDataset, iAttribute, iWhere){
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

    setDataset : async function(iDataset) {
        this.state.dataset = iDataset;
        this.state.testID = null;
        this.setX(this.emptyAttribute);
        this.setY(this.emptyAttribute);    //  change of dataset, remove attributes

        await connect.registerForCaseChanges(this.state.dataset.name);
        //  await connect.getDatasetInfo(iName);
        console.log(`set dataset to ${iDataset.name}`);
    },

    setX : async function(iAtt) {
        data.dirtyData = true;
        this.state.x = iAtt;
        //  this.state.testID = null;
        console.log(`set X to ${iAtt.name}`);
    },

    setY : async function(iAtt) {
        data.dirtyData = true;
        if (this.state.x) {
            this.state.y = iAtt;
            //  this.state.testID = null;
            console.log(`set Y to ${iAtt.name}`);
        } else {
            this.setX(iAtt);   //  always fill x first.
        }
    },

    emptyAttribute : {
        name : "",
        title : "",
        id : -1,
    },

    setUpState : async function() {
        this.state = await codapInterface.getInteractiveState();    //  get stored state of any

        //  but what if there is none? Make a new one...
        if (Object.keys(this.state).length === 0) {
            Object.assign(this.state, this.constants.defaultState);
            await codapInterface.updateInteractiveState(this.state);    //  store this
            console.log(`No interactive state retrieved. Got a new one...: 
            ${JSON.stringify(this.state)}`);
        }
    },

    constants : {
        pluginName : `testimate`,
        version : `2023g`,
        dimensions : {height : 555, width : 444},

        datasetName : `tests and estimates`,

        defaultState : {
            lang : `en`,
            dataset : null,     //      whole dataset info, includes .name
            dataTypes : {},     //      {'gender' : 'categorical', 'height' : 'numeric', ...}
            x : null,           //      attribute info, complete
            y : null,
            testID : null,
            testParams : {},
        }
    }
}