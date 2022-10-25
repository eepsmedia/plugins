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
    codap_emit: async function (iValues) {

        //  const theValues = this.makeValueObject(iVars);

        try {
            const res = await pluginHelper.createItems(iValues, simmer.constants.dsName);
        } catch (msg) {
            console.log("Problem emitting items of vars: " + JSON.stringify(iValues));
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

    createSimmerDataset : async function(iVariables) {
        const dataContextSetupObject = this.makeDataContextSetupObject(iVariables);
        await pluginHelper.initDataSet(dataContextSetupObject);
    },

    datasetExists : async function(iName) {
        const aResult = await codapInterface.sendRequest({
            action : "get",
            resource : `dataContext[${iName}]`,
        })

        return aResult.success;
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
            title: simmer.text.en.dsTitle,
            description: simmer.text.en.dsDescription,
            collections: [
                {
                    name: simmer.text.en.collectionName,
                    attrs: iVariables,
                },
            ]
        }
    },


    iFrameDescriptor: {
        version: simmer.constants.version,
        name: 'simmer',
        title: simmer.text.en.frameTitle,
        dimensions: {width: 800, height: 400},
        preventDataContextReorg: false
    },

}
