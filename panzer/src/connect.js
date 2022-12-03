panzer.connect = {

    initialize: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
        await pluginHelper.initDataSet(this.getDataSetupObject());
    },

    emitSerials: function (iValues) {
        this.makeTableAppear();
        const message = {
            "action": "create",
            "resource": `dataContext[${panzer.strings.dsName}].item`,
            "values": iValues
        }

        codapInterface.sendRequest(message);
    },

    makeTableAppear: function () {
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "name": panzer.strings.dsName,
            }
        })
    },

    getDataSetupObject: function () {
        return {
            name: panzer.strings.dsName,
            title: panzer.strings.dsTitle,
            description: panzer.strings.dsDescription,
            collections: [
                //  two collections :)
                {
                    name: panzer.strings.runCollName,
                    title: panzer.strings.runCollTitle,
                    attrs: [
                        {
                            name: "run",
                            description: "experiment run",
                            type : "categorical",
                        },
                        {
                            name: "rep",
                            description: "repetition within the run",
                        },
                        {
                            name: "nSerials",
                            description: "number of serial numbers you got",
                        },
                        {
                            name: "truth",
                            description: "true number of tanks",
                        },
                        {
                            name: "doubleMedian",
                            description: "my estimate for the total number of tanks",
                            formula: "median(serial) * 2",
                        }
                    ]
                },
                //  second collection, the serial numbers
                {
                    name: panzer.strings.serialCollName,
                    title: panzer.strings.serialCollTitle,
                    parent: panzer.strings.runCollName,
                    attrs: [
                        {
                            name: "serial",
                            description: "serial number of a tank",
                        },
                    ]
                },
            ]
        }
    },

    iFrameDescriptor: {
        version: panzer.constants.version,
        name: 'panzer',
        title: 'panzer',
        dimensions: {width: 266, height: 244},
        preventDataContextReorg: false
    },


}