const en = {
    "mazu" : {
        "iFrameName" : "player-data",
        "iFrameTitle" : "player data",

        "dataSetupObject" : {
            name: mazu.constants.kMazuDatasetName,
            title: mazu.constants.kMazuDatasetTitle,
            description: 'record of all player turns',
            collections: [
                //  single collection; mazu can reorganize as she sees fit :)
                {
                    name : mazu.constants.kMazuCollectionName,
                    title : mazu.constants.kMazuCollectionTitle,
                    labels : {
                        singleCase : "turn record",
                        pluralCase : "turn records",
                        setOfCasesWithArticle: "game records",
                    },
                    attrs : [
                        {name : "game", type : "categorical", description : "the game code"},
                        {name: "level", type: 'categorical', description: "game rule set"},
                        {name : "year", type : "numeric", precision : 0, description : "game year"},
                        {name: "playerName", type: 'categorical', description: "player name"},
                        {
                            name: "truePopulation",
                            type: 'numeric',
                            precision: 0,
                            description: "how many fish are actually in the water (at end of year)"
                        },
                        {
                            name: "seen",
                            type: 'numeric',
                            precision: 1,
                            description: "how many fish you saw before you started fishing"
                        },
                        {name: "want", type: 'numeric', precision: 1, description: "how many fish you wanted to catch"},
                        {name: "caught", type: 'numeric', precision: 1, description: "how many fish you caught"},
                        {
                            name: "before",
                            type: 'numeric',
                            precision: 0,
                            description: "balance at beginning of the year"
                        },
                        {name: "expenses", type: 'numeric', precision: 0, description: "your costs"},
                        {
                            name: "unitPrice",
                            type: 'numeric',
                            precision: 2,
                            description: "price you got per unit of fish"
                        },
                        {name: "income", type: 'numeric', precision: 0, description: "your income from selling fish"},
                        {name: "after", type: 'numeric', precision: 0, description: "balance at the end of the year"},
                        {name: "result", type: 'categorical', description: "state of the game"},
                    ]
                }
            ]
        }

    }

}