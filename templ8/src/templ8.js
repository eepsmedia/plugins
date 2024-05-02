


templ8 = {

    state : {},

    initialize : async function() {
        console.log(`initializing templ8`);
        this.state.lang = localize.figureOutLanguage('en');
        await localize.initialize(this.state.lang);
        await connect.initialize( );        //  initialize the connection with CODAP

        ui.initialize();
        this.state = {...this.constants.defaultState, ...this.state};   //  have all fields in default!
        this.cycle();
    },


    cycle : function() {
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
            buttonCount : 0,
            lang: `en`,
            datasetName : null,     //  the name of the dataset we're working with
        }
    }

}