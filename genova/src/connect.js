const connect = {

    state: null,

    init: async function () {
        await codapInterface.init(this.iFrameDescription, null);
        await pluginHelper.initDataSet(this.getGenovaDataSetupObject());

        //  restore the state if possible

        this.state = await codapInterface.getInteractiveState();

        this.makeIframeMutable();
        this.renameIFrame(localize.getString("frameTitle"));
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

    makeCaseTableAppear :  async function(context, name) {
        const theMessage = {
            action : "create",
            resource : "component",
            values : {
                type : 'caseTable',
                dataContext : context,
                name : name,
                cannotClose : true
            }
        };
        await codapInterface.sendRequest( theMessage );
    },

    renameIFrame : async function(iName){
        const theMessage = {
            action : "update",
            resource : "interactiveFrame",
            values : {
                title : iName,
            }
        };
        await codapInterface.sendRequest( theMessage );
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
        version: k.kVersion,
        name: 'Genova',
        title: 'Genova insurance simulation',
        dimensions: {width: 444, height: 555},
        preventDataContextReorg: false,
    },

    getGenovaDataSetupObject: function() {

        return {
            name: k.kGenovaDatasetName,
            title: localize.getString("datasetTitle"),
            description: 'Genova Data',
            collections: [
                {
                    name: localize.getString("gamesCollectionName"),
                    labels: {
                        singleCase: "game",
                        pluralCase: "games",
                        setOfCasesWithArticle: "a set of games"
                    },

                    attrs: [ // note how this is an array of objects.
                        {
                            name: localize.getString("attributeNames.gameNumber"),
                            type: 'categorical',
                            description: localize.getString("attributeDescriptions.gameNumber")
                        },
                    ]
                },
                {
                    name: localize.getString("yearsCollectionName"),
                    parent: localize.getString("gamesCollectionName"),
                    labels: {
                        singleCase: "year",
                        pluralCase: "years",
                        setOfCasesWithArticle: "a set of years"
                    },
                    attrs: [ // note how this is an array of objects.
                        {
                            name: localize.getString("attributeNames.year"),
                            type: 'numeric', precision: 0,
                            description: localize.getString("attributeDescriptions.year")
                        },
                        {
                            name: localize.getString("attributeNames.price"),
                            type: 'numeric', precision: 0,
                            unit: localize.getString("currency"),
                            description: localize.getString("attributeDescriptions.price")
                        },
                        {
                            name: localize.getString("attributeNames.before"),
                            type: 'numeric',
                            precision: 0,
                            unit: localize.getString("currency"),
                            description: localize.getString("attributeDescriptions.before")                        },
                        {
                            name: localize.getString("attributeNames.after"),
                            type: 'numeric',
                            precision: 0,
                            unit: localize.getString("currency"),
                            description: localize.getString("attributeDescriptions.after")
                        },
                        {
                            name: localize.getString("attributeNames.ships"),
                            type: 'numeric',
                            precision: 0,
                            unit: localize.getString("ships"),
                            description: localize.getString("attributeDescriptions.ships")
                        },
                        {
                            name: localize.getString("attributeNames.sank"),
                            type: 'numeric',
                            precision: 0,
                            unit: localize.getString("ships"),
                            description: localize.getString("attributeDescriptions.sank")
                        },
                    ]

                }
            ]
        }
    },

}