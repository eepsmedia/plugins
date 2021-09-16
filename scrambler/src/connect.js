let connect;

connect = {

    initialize: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
        await this.allowReorg();
        notificatons.registerForDocumentChanges();
    },

    iFrameDescriptor: {
        name: scrambler.constants.pluginName,
        title: scrambler.constants.pluginName,
        version: scrambler.constants.version,
        dimensions: scrambler.constants.dimensions,      //      dimensions,
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
                const theName = ds.name;
                if (theName.startsWith(scrambler.constants.measuresPrefix) || theName.startsWith(scrambler.constants.scrambledPrefix)) {

                } else {
                    this.listOfDataSetNames.push({
                        name: theName,
                        title: ds.title,
                    });
                }
            });
        }
        return this.listOfDataSetNames;
    },

    /**
     * Construct and return the <option> tags in the menu of all datasets
     *
     * @param   If this name is in the list, make it the current (selected) value.
     * @returns {Promise<string>}
     */
    makeDatasetMenuGuts: async function (iDefaultName) {
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
                    const selectedText = (ds.name === iDefaultName) ? "selected" : "";
                    theOptions += `<option value="${ds.name}" ${selectedText}>${ds.title}</option>`;
                });
                out = `<select id="datasetMenu" onchange="scrambler.handleSourceDatasetChange(this)">${theOptions}</select>`;
                break;
        }

        return {number : theNames.length, guts: out};
    },

    /**
     * Does the named dataset already exist?
     * @param iName
     * @returns {Promise<void>}
     */
    datasetExists: async function (iName) {
        let out = false;

        const existMessage = {
            action: "get",
            resource: `dataContextList`,
        }
        const tListResult = await codapInterface.sendRequest(existMessage);
        if (tListResult.success) {
            tListResult.values.forEach((ds) => {
                if (ds.name === iName) {
                    out = true;
                }
            })
        }
        return out;
    },

    needFreshOutputDataset: async function () {
        return false;
    },

    deleteDataset : async function(iName) {
        if (iName) {
            const tDeleteMessage = {
                action: "delete",
                resource: `dataContext[${iName}]`,
            }

            const dResult = await codapInterface.sendRequest(tDeleteMessage);
            console.log(`    deleting [${iName}]: (${dResult.success ? "success" : "failure"})`);
        } else {
            console.log(`    no measures daatset to delete!`);
        }
    },

    allowReorg: async function () {
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

    showTable: function (iName) {
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "dataContext": iName,
            }
        });
    },

    /**
     * Get a list of selected case IDs.
     *
     * @param iCases
     * @returns {Promise<[]>}
     */
    getCODAPSelectedCaseIDs: async function () {
        const theMeasuresName = "";     //  todoi: put in actual name
        const selectionListResource = `dataContext[${theMeasuresName}].selectionList`;
        //  now get all the currently selected caseIDs.
        const gMessage = {
            "action": "get", "resource": selectionListResource
        }
        const getSelectionResult = await codapInterface.sendRequest(gMessage);

        //  the result has the ID but also the collection ID and name,
        //  so we collect just the caseID in `oldIDs`
        let oldIDs = [];
        if (getSelectionResult.success) {

            //  construct an array of the currently-selected cases.
            //  NOTE that `val`
            getSelectionResult.values.forEach(val => {
                oldIDs.push(val.caseID)
            })
        }
        return oldIDs;
    },

}