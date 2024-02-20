
/**
 *  Singleton that communicates with CODAP
 */


const connect = {

    initialize : async function() {
        //  note: these subscriptions must happen BEFORE `.init` so that the `.on` there does not
        //  override our handlers.
        codapInterface.on('update', 'interactiveState', "", handlers.restorePluginFromStore);
        codapInterface.on('get', 'interactiveState', "", handlers.getPluginState);

        await codapInterface.init(this.iFrameDescriptor, handlers.restorePluginFromStore);
        //  await this.registerForDragDropEvents();     //  if you're acce[ting drops!
        await this.allowReorg();

        await this.makeNewDataset();

    },

    emitTransactions : async function(TT) {

        let allValues = [];
        let theValues;

        TT.forEach( T => {
            theValues = {};
            theValues[localize.getString("attributeNames.gameNumber")]  = god.gameNumber;
            theValues[localize.getString("attributeNames.year")]  = T.date;
            theValues[localize.getString("attributeNames.player")]  = T.pName;
            theValues[localize.getString("attributeNames.balance")]  = T.balance;
            theValues[localize.getString("attributeNames.what")]  = T.reason;
            theValues[
                (T.amount >= 0) ?
                    localize.getString("attributeNames.income") :
                    localize.getString("attributeNames.expense")
                ]  = T.amount;

            allValues.push(theValues);
        })


        try {
            const res = await pluginHelper.createItems(allValues, treePre.constants.datasetName);
            //  this.makeTableAppear();
        } catch (msg) {
            console.log("Problem emitting transaction to CODAP: " + JSON.stringify(theValues));
            console.log(msg);
        }

    },

    makeNewDataset : async function() {
        await this.deleteDataset();
        const theDSObject = this.getDataSetupObject();
        await pluginHelper.initDataSet(theDSObject);
    },

    getDataSetupObject: function () {

        return {
            name: treePre.constants.datasetName,
            title: localize.getString("datasetTitle"),
            description: localize.getString("datasetDescription"),
            collections: [
                //  three collections: game number, years, and data :)
                {
                    name: localize.getString("collectionNames.games"),
                    labels: {
                        singleCase: "game",
                        pluralCase: "games",
                    },
                    attrs: [
                        {
                            name: localize.getString("attributeNames.gameNumber"),
                            description: localize.getString("attributeDescriptions.gameNumber"),
                            type : "categorical"
                        }
                    ]
                },
                {
                    name: localize.getString("collectionNames.years"),
                    parent : localize.getString("collectionNames.games"),
                    labels: {
                        singleCase: "year",
                        pluralCase: "years",
                        type : "numeric"
                    },
                    attrs: [
                        {
                            name: localize.getString("attributeNames.year"),
                            description: localize.getString("attributeDescriptions.year"),
                        }
                    ]
                },
                {
                    name : localize.getString("collectionNames.items"),
                    parent : localize.getString("collectionNames.years"),
                    labels: {
                        singleCase: "item",
                        pluralCase: "items",
                    },
                    attrs: [
                        {
                            name: localize.getString("attributeNames.player"),
                            description: localize.getString("attributeDescriptions.player"),
                            type : "categorical"
                        },
                        {
                            name: localize.getString("attributeNames.what"),
                            description: localize.getString("attributeDescriptions.what"),
                            type : "categorical"
                        },
                        {
                            name: localize.getString("attributeNames.income"),
                            description: localize.getString("attributeDescriptions.income"),
                            type : "numeric",
                            unit : localize.getString("moneySymbol")
                        },
                        {
                            name: localize.getString("attributeNames.expense"),
                            description: localize.getString("attributeDescriptions.expense"),
                            type : "numeric",
                            unit : localize.getString("moneySymbol")
                        },
                        {
                            name: localize.getString("attributeNames.balance"),
                            description: localize.getString("attributeDescriptions.balance"),
                            type : "numeric",
                            unit : localize.getString("moneySymbol")
                        },

                    ]
                }
            ]
        }
    },

    deleteDataset: async function () {
        codapInterface.sendRequest({
            "action": "delete",
            "resource": `dataContext[${treePre.constants.datasetName}]`,
        })
    },


    /**
     * Kludge to ensure that a dataset is reorg-able.
     *
     * @returns {Promise<void>}
     */
    allowReorg: async function () {
        const tMutabilityMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };

        codapInterface.sendRequest(tMutabilityMessage);
    },

    /**
     * Constant descriptor for the iFrame.
     * Find and edit the values in `templ8.constants`
     */
    iFrameDescriptor: {
        name: treePre.constants.pluginName,
        title: treePre.constants.pluginName,
        version: treePre.constants.version,
        dimensions: treePre.constants.dimensions,      //      dimensions,
    },

}