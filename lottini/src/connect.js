connect = {

    initialize: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);

        /*
                const tMutabilityMessage = {
                    "action": "update",
                    "resource": "interactiveFrame",
                    "values": {
                        "preventBringToFront": false,
                        "preventDataContextReorg": false
                    }
                };
                await codapInterface.sendRequest(tMutabilityMessage);
        */
        this.setIFrameTitle();
    },

    setNewDataset : async function() {
        await this.deleteDataset();
        const theDSObject = this.getDataSetupObject();
        await pluginHelper.initDataSet(theDSObject);
    },

    codap_emit : async function(theValues) {
        if (lottini.state.optEmitToCODAP) {
            try {
                const res = await pluginHelper.createItems(theValues, lottini.constants.dsName);
                this.makeTableAppear();
            } catch (msg) {
                console.log("Problem emitting items of vars: " + JSON.stringify(theValues));
                console.log(msg);
            }
        }
    },

    getDataSetupObject: function () {

        return {
            name: lottini.constants.dsName,
            title: lottini.scenarioStrings.dsTitle,
            description: lottini.scenarioStrings.dsDescription,
            collections: [
                //  single collection; mazu can reorganize as she sees fit :)
                {
                    name: lottini.constants.collName,
                    title: lottini.scenarioStrings.collTitle,
                    labels: {
                        singleCase: "turn record",
                        pluralCase: "turn records",
                        setOfCasesWithArticle: "game records",
                    },
                    attrs: [
                        {
                            name: localize.getString("attributeNames.choice"),    //  DG.plugins.lotti.attributeNames.choice,
                            description: localize.getString("attributeDescriptions.choice"), //  DG.plugins.lotti.attributeDescriptions.choice,
                        },
                        {
                            name: localize.getString("attributeNames.result"),    //  DG.plugins.lotti.attributeNames.result,
                            description: localize.getString("attributeDescriptions.result"), //  DG.plugins.lotti.attributeDescriptions.result,
                            unit : lottini.scenarioStrings.resultUnitPlural,
                        },
                        {
                            name: localize.getString("attributeNames.scenario"),
                            description: localize.getString("attributeDescriptions.scenario"),   //      DG.plugins.lotti.attributeDescriptions.scenario},
                        },       //      DG.plugins.lotti.attributeNames.scenario, type: 'categorical',
                    ]
                }
            ]
        }

    },

    /**
     * Translate a single turn (object) to the local language.
     *
     * @param iValues
     * @returns {*|{}}
     */
    translateTurnToLocalLanguage: function (iValues) {
        out = {};
        for (const a in iValues) {
            if (iValues.hasOwnProperty(a)) {
                const index = localize.getString(`attributeNames.${a}`);
                if (index) {
                    out[index] = iValues[a];
                } else {
                    out[a] = iValues[a];
                }
            }
        }
        return out;
    },


    makeTableAppear: function () {
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "name": lottini.constants.dsName,
            }
        })
    },


    deleteDataset: async function () {
        codapInterface.sendRequest({
            "action": "delete",
            "resource": `dataContext[${lottini.constants.dsName}]`,
        })
    },

    setIFrameTitle : function() {
        const message = {
            action : "update",
            resource : "interactiveFrame",
            values : {
                "title" : localize.getString("frameTitle")
            }
        }

        try {
            codapInterface.sendRequest(message);
        } catch (msg) {
            alert(`ERROR setting the iFrame's title: ${msg}`);
        }
    },

    iFrameDescriptor: {
        version: lottini.constants.version,
        name: 'lotti',
        title: 'temp title',
        dimensions: {width: 316, height: 388},
        preventDataContextReorg: false
    },


}