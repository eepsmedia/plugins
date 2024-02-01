/**
 * connect to CODAP
 *
 * All the routines and data for connecting aranyani to CODAP
 *
 */

/* global codapInterface, pluginHelper */


const connect = {

    /**
     * Initialize aranyani's connection to CODAP.
     * Note that we do not look for a saved `state`.
     * Everything is stored in firebase.
     *
     * @returns {Promise<void>}
     */
    initializeFrame: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
        const tMutabilityMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };

        await codapInterface.sendRequest(tMutabilityMessage);
    },

    initializeDataset: async function () {
        await pluginHelper.initDataSet(this.getaranyaniDataSetupObject());
    },


    /**
     * Take the item values from when the model sells fish and emit them into the CODAP dataset
     *
     * @param iGame         the model's "Game." Includes year and population.
     * @param eValues    array of item values for each player for this year, IN ENGLISH
     *
     */
    emitAllTurns: function (iGame, eValues) {
        //  enhance the values array

        let localTurns = [];

        eValues.forEach((e) => {
            //  v.pop = iGame.truePopulation;       //  inserted in model.sellFish()
            e.game = iGame.gameCode;
            e.level = iGame.configuration;
            const tLocalTurn = MFS.translateTurnToLocalLanguage(e);
            localTurns.push(tLocalTurn);
        })

        try {
            pluginHelper.createItems(localTurns, aranyani.constants.karanyaniDatasetName);     //  could be await...
            this.makeCaseTableAppear();
        } catch (msg) {
            alert(`Problem for aranyani emitting all turns: ${msg}`);
        }
    },


    /**
     * Make the case table appear. Could be async, but I think it's OK as is.
     */
    makeCaseTableAppear: function () {
        const theMessage = {
            action: "create",
            resource: "component",
            values: {
                type: 'caseTable',
                dataContext: aranyani.constants.karanyaniDatasetName,
                name: aranyani.constants.karanyaniDatasetTitle,
                cannotClose: true
            }
        };
        codapInterface.sendRequest(theMessage);
    },

    iFrameDescriptor: {
        "version": aranyani.constants.version,
        "name": aranyani.constants.kiFrameName,           //  DG.plugins.aranyani.iFrameName,
        "title": aranyani.constants.kiFrameName,       //      will be changed,
        "dimensions": {"width": 533, "height": 500},
        "preventDataContextReorg": false
    },

    getaranyaniDataSetupObject: function () {
        return {
            name: aranyani.constants.karanyaniDatasetName,
            title: DG.plugins.aranyani.aranyaniDatasetTitle,
            description: DG.plugins.aranyani.aranyaniDatasetDescription,
            collections: [
                //  single collection; aranyani can reorganize as she sees fit :)
                {
                    name: aranyani.constants.karanyaniCollectionName,
                    title: aranyani.constants.karanyaniCollectionTitle,
                    labels: {
                        singleCase: "turn record",
                        pluralCase: "turn records",
                        setOfCasesWithArticle: "game records",
                    },
                    attrs: [
                        {name: DG.plugins.aranyani.attributeNames.game, type: "categorical", description: "the game code"},
                        {name: DG.plugins.aranyani.attributeNames.level, type: 'categorical', description: "game rule set"},
                        {
                            name: DG.plugins.aranyani.attributeNames.year,
                            type: "numeric",
                            precision: 0,
                            description: "game year"
                        },
                        {name: DG.plugins.aranyani.attributeNames.player, type: 'categorical', description: "player name"},
                        {
                            name: DG.plugins.aranyani.attributeNames.pop,
                            type: 'numeric',
                            precision: 0,
                            description: "how many fish are actually in the water (at end of year)"
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.seen,
                            type: 'numeric',
                            precision: 1,
                            description: "how many fish they saw before they started fishing"
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.want,
                            type: 'numeric',
                            precision: 1,
                            description: "how many fish they wanted to catch"
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.caught,
                            type: 'numeric',
                            precision: 1,
                            description: "how many fish they caught"
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.before,
                            type: 'numeric',
                            precision: 0,
                            description: "balance at beginning of the year"
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.expenses,
                            type: 'numeric',
                            precision: 0,
                            description: "their costs"
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.unitPrice,
                            type: 'numeric',
                            precision: 2,
                            description: "price they got per unit of fish"
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.income,
                            type: 'numeric',
                            precision: 0,
                            description: "their income from selling fish"
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.after,
                            type: 'numeric',
                            precision: 0,
                            description: "balance at the end of the year"
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.result,
                            type: 'categorical',
                            description: "state of the game"
                        },
                    ]
                }
            ]
        }

    }
}