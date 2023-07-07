

const testimate = {

    attributeDragDropSubscriberIndex : null,

    initialize : async function() {

        console.log(`initializing...`);
        await this.setUpState();
        await connect.initialize(this.iFrameDescription, null);
        if (this.state.dataset) {
            await this.setDataset(this.state.dataset);  //  register for case changes
        }

        ui.redraw();
    },

    copeWithAttributeDrop : async function(iDatasetName, iAttributeName, iWhere){
        const titleElement = document.getElementById(`titleDIV`);
        const theElement = document.elementFromPoint(iWhere.x, iWhere.y);
        const theID = theElement.id;
        if (theID) {
            console.log(`dropping ${iAttributeName} from ${iDatasetName} onto ${theID}`);
        } else {
            console.log(`dropping ${iAttributeName} from ${iDatasetName} (no element ID)`);
        }
        if (this.state.dataset !== iDatasetName) {
            this.setDataset(iDatasetName);
        }
        this.setX(iAttributeName);
        ui.redraw();
    },

    setDataset : function(iName) {
        this.state.dataset = iName;
        connect.registerForCaseChanges(iName);
        console.log(`set dataset to ${iName}`);

    },

    setX : function(iName) {
        data.dirtyData = true;
        this.state.xName = iName;
        console.log(`set X to ${iName}`);
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
        dimenstions : {height : 256, width : 400},

        defaultState : {
            dataset : null,
            xName : null,
            lang : `en`,
        }
    }
}