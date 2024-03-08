


ranger = {

    state : {},

    initialize : async function() {
        console.log(`initializing ranger`);
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

    copeWithAttributeDrop : async function(iDataset, iCollection, iAttribute, iPosition) {
        this.state.datasetName = iDataset.name;
        this.state.rangeAttributeCollectionName = iCollection.name;
        this.state.rangeAttributeName = iAttribute.name;
        console.log(`Dropped [${this.state.rangeAttributeName}] from [${this.state.datasetName}]`);

        await connect.createRangeGraph();
        const tGI = await connect.getRangeGraphInfo();
        this.state.rangeMin = Number(tGI.values.xLowerBound);
        this.state.rangeMax = Number(tGI.values.xUpperBound);
        this.state.rangeHalfWidth = (this.state.rangeMax - this.state.rangeMin) / 20;
    },

    constants: {
        pluginName: `ranger`,
        version: `0.1a`,
        dimensions: {height: 111, width: 666},
        rangeGraphName : "_range",

        defaultState: {
            buttonCount : 0,
            lang: `en`,
            datasetName : null,     //  the name of the dataset we're working with
            rangeAttributeName : null,
            rangeAttributeCollectionName : null,
            rangeMax : null,
            rangeMin : null,
            rangeHalfWidth : null,
        }
    }

}