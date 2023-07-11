

const testimate = {

    state : {},

    initialize : async function() {
        console.log(`initializing...`);

        await this.setUpState();
        await connect.initialize(this.iFrameDescription, null);
        if (this.state.dataset) {
            await this.setDataset(this.state.dataset);  //  register for case changes
        }

        ui.initialize();
        ui.redraw();
    },

    copeWithAttributeDrop : async function(iDatasetName, iAttributeName, iWhere){
        //  const titleElement = document.getElementById(`titleDIV`);
        const theElement = document.elementFromPoint(iWhere.x, iWhere.y);

        if (this.state.dataset !== iDatasetName) {
            this.setDataset(iDatasetName);
            this.setX(null);
            this.setY(null);    //  change of dataset, remove attributes
        }

        if (theElement === ui.xDIV) {
            this.setX(iAttributeName);
        } else if (theElement === ui.yDIV) {
            this.setY(iAttributeName);
        } else if (theElement && !this.state.xName) {
            this.setX(iAttributeName);      //  set x anywhere if it doesn't exist
        }

        data.dirtyData = true;

        ui.redraw();
    },

    setDataset : function(iName) {
        this.state.dataset = iName;
        this.state.test = null;
        connect.registerForCaseChanges(iName);
        console.log(`set dataset to ${iName}`);
    },

    setX : function(iName) {
        data.dirtyData = true;
        this.state.xName = iName;
        this.state.test = null;
        console.log(`set X to ${iName}`);
    },

    setY : function(iName) {
        data.dirtyData = true;
        if (this.state.xName) {
            this.state.yName = iName;
            this.state.test = null;
            console.log(`set Y to ${iName}`);
        } else {
            this.setX(iName);   //  always fill x first.
        }
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
        version : `2023a`,
        dimensions : {height : 333, width : 466},

        defaultState : {
            dataset : null,
            dataTypes : {},     //      {'gender' : 'categorical', 'height' : 'numeric', ...}
            xName : null,
            yName : null,
            test : null,
            lang : `en`,
        }
    }
}