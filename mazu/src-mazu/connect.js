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
        await pluginHelper.initDataSet(this.getMazuDataSetupObject());
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
            const tLocalTurn = this.translateTurnToLocalLanguage(e);
            localTurns.push(tLocalTurn);
        })

        try {
            pluginHelper.createItems(localTurns, mazu.constants.kMazuDatasetName);     //  could be await...
            this.makeCaseTableAppear();
        } catch (msg) {
            alert(`Problem for mazu emitting all turns: ${msg}`);
        }
    },

    translateTurnToLocalLanguage: function (iValues) {
        out = {};
        for (const a in iValues) {
            if (iValues.hasOwnProperty(a)) {
                const index = DG.plugins.mazu.attributeNames[a];
                if (index) {
                    out[index] = iValues[a];
                } else {
                    out[a] = iValues[a];
                }
            }
        }
        return out;
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
                dataContext: mazu.constants.kMazuDatasetName,
                name: mazu.constants.kMazuDatasetTitle,
                cannotClose: true
            }
        };
        codapInterface.sendRequest(theMessage);
    },

    iFrameDescriptor: {
        "version": mazu.constants.version,
        "name": mazu.constants.kiFrameName,           //  DG.plugins.mazu.iFrameName,
        "title": mazu.constants.kiFrameName,       //      will be changed,
        "dimensions": {"width": 533, "height": 500},
        "preventDataContextReorg": false
    },

    getMazuDataSetupObject: function () {
        return {
            name: mazu.constants.kMazuDatasetName,
            title: DG.plugins.mazu.mazuDatasetTitle,
            description: DG.plugins.mazu.mazuDatasetDescription,
            collections: [
                //  single collection; mazu can reorganize as she sees fit :)
                {
                    name: mazu.constants.kMazuCollectionName,
                    title: mazu.constants.kMazuCollectionTitle,
                    labels: {
                        singleCase: "turn record",
                        pluralCase: "turn records",
                        setOfCasesWithArticle: "game records",
                    },
                    attrs: [
                        {name: DG.plugins.mazu.attributeNames.game, type: "categorical", description: "the game code"},
                        {name: DG.plugins.mazu.attributeNames.level, type: 'categorical', description: "game rule set"},
                        {
                            name: DG.plugins.mazu.attributeNames.year,
                            type: "numeric",
                            precision: 0,
                            description: "game year"
                        },
                        {name: DG.plugins.mazu.attributeNames.player, type: 'categorical', description: "player name"},
                        {
                            name: DG.plugins.mazu.attributeNames.pop,
                            type: 'numeric',
                            precision: 0,
                            description: "how many fish are actually in the water (at end of year)"
                        },
                        {
                            name: DG.plugins.mazu.attributeNames.seen,
                            type: 'numeric',
                            precision: 1,
                            description: "how many fish they saw before they started fishing"
                        },
                        {
                            name: DG.plugins.mazu.attributeNames.want,
                            type: 'numeric',
                            precision: 1,
                            description: "how many fish they wanted to catch"
                        },
                        {
                            name: DG.plugins.mazu.attributeNames.caught,
                            type: 'numeric',
                            precision: 1,
                            description: "how many fish they caught"
                        },
                        {
                            name: DG.plugins.mazu.attributeNames.before,
                            type: 'numeric',
                            precision: 0,
                            description: "balance at beginning of the year"
                        },
                        {
                            name: DG.plugins.mazu.attributeNames.expenses,
                            type: 'numeric',
                            precision: 0,
                            description: "their costs"
                        },
                        {
                            name: DG.plugins.mazu.attributeNames.unitPrice,
                            type: 'numeric',
                            precision: 2,
                            description: "price they got per unit of fish"
                        },
                        {
                            name: DG.plugins.mazu.attributeNames.income,
                            type: 'numeric',
                            precision: 0,
                            description: "their income from selling fish"
                        },
                        {
                            name: DG.plugins.mazu.attributeNames.after,
                            type: 'numeric',
                            precision: 0,
                            description: "balance at the end of the year"
                        },
                        {
                            name: DG.plugins.mazu.attributeNames.result,
                            type: 'categorical',
                            description: "state of the game"
                        },
                    ]
                }
            ]
        }

    }
}