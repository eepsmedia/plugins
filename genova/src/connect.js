const connect = {

    state: null,

    init: async function () {
        await codapInterface.init(this.iFrameDescription, null);
        await pluginHelper.initDataSet(this.genovaDataSetupObject);

        //  restore the state if possible

        this.state = await codapInterface.getInteractiveState();

        this.makeIframeMutable();
    },

    emitData: function (iValues) {
        const tMessage = {
            action: 'create',
            resource: `dataContext[${k.kGenovaDatasetName}].item`,
            values: iValues,
        }
        codapInterface.sendRequest(tMessage);
    },

    dataSent: function () {
        console.log(`record set to CODAP`);
    },

    makeIframeMutable: function () {
        //  now update the iframe to be mutable...
        const tMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };

        const updateResult = codapInterface.sendRequest(tMessage);
    },

    iFrameDescription: {
        version: '2022b',
        name: 'Genova',
        title: 'Genova insurance simulation',
        dimensions: {width: 444, height: 555},
        preventDataContextReorg: false,
    },

    genovaDataSetupObject: {
        name: k.kGenovaDatasetName,
        title: k.kGenovaDatasetTitle,
        description: 'Genova Data',
        collections: [
            {
                name: k.kGenovaTopLevelCollectionName,
                labels: {
                    singleCase: "game",
                    pluralCase: "games",
                    setOfCasesWithArticle: "a set of games"
                },

                attrs: [ // note how this is an array of objects.
                    {name: "num", type: 'categorical', precision: 0, description: "game number"},
                ]
            },
            {
                name: k.kGenovaBottomLevelCollectionName,
                parent: k.kGenovaTopLevelCollectionName,
                labels: {
                    singleCase: "year",
                    pluralCase: "years",
                    setOfCasesWithArticle: "a set of years"
                },
                attrs: [ // note how this is an array of objects.
                    {name: "year", type: 'numeric', precision: 0, description: "year"},
                    {name: "price", type: 'numeric', precision: 0, unit: "lira", description: "price for a policy"},
                    {
                        name: "bank-before",
                        type: 'numeric',
                        precision: 0,
                        unit: "lira",
                        description: "balance at the beginning of the year"
                    },
                    {
                        name: "bank-after",
                        type: 'numeric',
                        precision: 0,
                        unit: "lira",
                        description: "balance at the end of the year"
                    },
                    {
                        name: "boats",
                        type: 'numeric',
                        precision: 0,
                        unit: "boats",
                        description: "number of boats that bought your policy"
                    },
                    {
                        name: "sank",
                        type: 'numeric',
                        precision: 0,
                        unit: "boats",
                        description: "number of boats that sank"
                    },
                ]

            }
        ]
    },

}