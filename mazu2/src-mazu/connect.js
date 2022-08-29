/**
 * connect to CODAP
 *
 * All the routines and data for connecting mazu to CODAP
 *
 */

/* global codapInterface, pluginHelper */


const connect = {

    /**
     * Initialize mazu's connection to CODAP.
     * Note that we do not look for a saved `state`.
     * Everything is stored in firebase.
     *
     * @returns {Promise<void>}
     */
    initialize : async function() {

        await codapInterface.init(this.iFrameDescriptor, null);
        let thePromises = [];
        thePromises.push(pluginHelper.initDataSet(DG.plugins.mazu.dataSetupObject));

        const tMutabilityMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };

        thePromises.push(codapInterface.sendRequest(tMutabilityMessage));

        await Promise.all(thePromises);
    },

    /**
     * Take the item values from when the model sells fish and emit them into the CODAP dataset
     *
     * @param iGame         the model's "Game." Includes year and population.
     * @param itemValues    array of item values for each player for this year
     *
     */
    emitAllTurns : function(iGame, itemValues) {
        //  enhance the values array
        let theValues = itemValues;
        theValues.forEach( (v) => {
            v.pop = iGame.truePopulation;
            v.year = v.turn;        //  the year of the user's turn
            v.game = iGame.gameCode;
            v.level = iGame.configuration;
        })

        try {
            pluginHelper.createItems(theValues, mazu.constants.kMazuDatasetName);     //  could be await...
            this.makeCaseTableAppear();
        } catch (msg) {
            alert(`Problem for mazu emitting all turns: ${msg}`);
        }
    },

    /**
     * Make the case table appear. Could be async, but I think it's OK as is.
     */
    makeCaseTableAppear : function() {
        const theMessage = {
            action : "create",
            resource : "component",
            values : {
                type : 'caseTable',
                dataContext : mazu.constants.kMazuDatasetName,
                name : mazu.constants.kMazuDatasetTitle,
                cannotClose : true
            }
        };
        codapInterface.sendRequest( theMessage );
    },

    iFrameDescriptor: {
        version: mazu.constants.version,
        name: mazu.constants.kiFrameName,    //  DG.plugins.mazu.iFrameName,
        title: mazu.constants.kiFrameTitle,       //      DG.plugins.mazu.iFrameTitle,
        dimensions: {width: 500, height: 500},
        preventDataContextReorg: false
    },


}