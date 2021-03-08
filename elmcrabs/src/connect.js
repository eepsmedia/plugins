let connect;

connect = {

    initialize: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);

        this.allowReorg();
    },

    iFrameDescriptor: {
        name: elmcrabs.constants.pluginName,
        title: elmcrabs.constants.pluginName,
        version: elmcrabs.constants.version,
        dimensions: elmcrabs.constants.dimensions,      //      dimensions,
    },


    getListOfDataSetNames: async function () {
        this.listOfDataSetNames = [];
        const tMessage = {
            action: "get",
            resource: "dataContextList"
        };
        const tListResult = await codapInterface.sendRequest(tMessage);
        if (tListResult.success) {
            tListResult.values.forEach((ds) => {
                this.listOfDataSetNames.push({
                    name: ds.name,
                    title: ds.title,
                });
            });
        }
        return this.listOfDataSetNames;
    },

    /**
     * Construct and return the <option> tags in the menu of all datasets
     *
     * @returns {Promise<string>}
     */
    makeDatasetMenuGuts: async function () {
        const theNames = await this.getListOfDataSetNames();
        let out = "";
        let theOptions;

        switch (theNames.length) {
            case 0:
                out = "no datasets";
                break;
            case 1:
                const ds = theNames[0];
                theOptions = `<option value="${ds.name}">${ds.title}</option>`;
                out = `<select id="datasetMenu">${theOptions}</select>`;
                break;
            default:
                theOptions = "";
                theNames.forEach(ds => {
                    theOptions += `<option value="${ds.name}">${ds.title}</option>`;
                });
                out = `<select id="datasetMenu">${theOptions}</select>`;
                break;
        }

        return out;
    },

    needFreshOutputDataset : async function() {
        return false;
    },

    allowReorg : function( ) {
        const tMutabilityMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };

        codapInterface.sendRequest(tMutabilityMessage);
    },

    showTable : function(iName) {
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "dataContext": iName,
            }
        });

    }
}