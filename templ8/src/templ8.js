


templ8 = {

    state : {},

    initialize : async function() {
        console.log(`initializing templ8`);

        await connect.initialize( );        //  initialize the connection with CODAP

        this.state = await codapInterface.getInteractiveState();    //  get stored state
        if (this.state.version) {       //  it's an actual saved state
            await this.restoreState();
        } else {
            Object.assign(this.state, this.constants.defaultState);
        }

        //  this.strings = strings;      //      todo: fix this, make it robust

        ui.initialize();
        ui.redraw();

    },

    restoreState : function() {

    },

    copeWithAttributeDrop : function(iDataset, iCollection, iAttribute, iPosition) {
        this.state.datasetName = iDataset.name;
    },

    constants: {
        pluginName: `templ8`,
        version: `0.1a`,
        dimensions: {height: 333, width: 222},

        defaultState: {
            lang: `en`,
            datasetName : null,     //  the name of the dataset we're working with
        }
    }

}