simmer.connect = {

    initialize: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
        //  await pluginHelper.initDataSet(this.simmerDataContextSetupObject);

    },

    /**
     * emit ONE case into CODAP
     *
     * @param iVars     array of objects holding name and value of one attribute
     * @returns {Promise<void>}
     */
    codap_emit: async function (iVars) {

        const theValues = this.makeValueObject(iVars);

        try {
            const res = await pluginHelper.createItems(theValues, simmer.constants.dsName);
        } catch (msg) {
            console.log("Problem emitting items of vars: " + JSON.stringify(iVars));
            console.log(msg);
        }

    },

    makeValueObject: function (iValues) {
        let out = {};
        iValues.forEach(att => {
            out[att.name] = att.value;
        })
        out['simmerRun'] = simmer.state.simmerRun;

        return out;
    },

    deleteDataset : function() {
        codapInterface.sendRequest({
            "action": "delete",
            "resource": `dataContext[${simmer.constants.dsName}]`,
        })

    },

    makeTableAppear: function () {
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "name": simmer.constants.dsName,
            }
        })
    },

    /**
     *
     * @returns {{collections: {name: string, attrs: *[]}, name: string, description: string, title: string}}
     */
    makeDataContextSetupObject: function (iVariables) {

        // actual setup object
        return {
            name: simmer.constants.dsName,
            title: simmer.strings.dsTitle,
            description: simmer.strings.dsDescription,
            collections: [
                {
                    name: simmer.strings.collectionName,
                    attrs: iVariables,
                },
            ]
        }
    },


    iFrameDescriptor: {
        version: simmer.constants.version,
        name: 'simmer',
        title: 'Simulation with block programming',
        dimensions: {width: 800, height: 400},
        preventDataContextReorg: false
    },

}
