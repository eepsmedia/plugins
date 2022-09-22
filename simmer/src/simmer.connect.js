simmer.connect = {
    initialize: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
        //  await pluginHelper.initDataSet(this.simmerDataContextSetupObject);

    },

    codap_emit: async function (iVars) {
        const dataContextSetupObject = this.makeDataContextSetupObject(iVars);
        await pluginHelper.initDataSet(dataContextSetupObject);

        const theValues = this.makeValueObject(iVars);

        try {
            const res = await pluginHelper.createItems(theValues, simmer.constants.dsName);
            //  console.log("Resolving sendCases with " + JSON.stringify(res));

            this.makeTableAppear();
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
        return out;
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
     * @param iValues   array of objects of form {name : value}, one for each attribute
     * @returns {{collections: {name: string, attrs: *[]}, name: string, description: string, title: string}}
     */
    makeDataContextSetupObject: function (iValues) {

        //  set up all the attributes
        let theAttrGuts = [];
        iValues.forEach(att => {
            theAttrGuts.push({"name": att.name});
        });

        // actual setup object
        return {
            name: simmer.constants.dsName,
            title: simmer.strings.dsTitle,
            description: simmer.strings.dsDescription,
            collections: [
                {
                    name: simmer.strings.collectionName,
                    attrs: theAttrGuts,
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
