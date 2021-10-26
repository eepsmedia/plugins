let connect;

connect = {

    initialize: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
        await this.allowReorg();
        notificatons.registerForDocumentChanges();
        notificatons.registerForAttributeDrops();
    },

    iFrameDescriptor: {
        name: bootstrap.constants.pluginName,
        title: bootstrap.constants.pluginName,
        version: bootstrap.constants.version,
        dimensions: bootstrap.constants.dimensions,      //      dimensions,
    },

    /**
     * Find a dataset that is not _bootstrapped or _measures, preferably the one we pass in!
     *
     * @param iName     Default name, typically the one we have been using all along or restored from save
     * @returns {Promise<*>}
     */
    getSuitableDatasetName : async function(iName) {
        let tDSNameList = [];
        const tMessage = {
            action: "get",
            resource: "dataContextList"
        };
        const tListResult = await codapInterface.sendRequest(tMessage);
        if (tListResult.success) {
            tListResult.values.forEach((ds) => {
                const theName = ds.name;
                if (theName.startsWith(bootstrap.constants.measuresPrefix) || theName.startsWith(bootstrap.constants.bootstrappedPrefix)) {

                } else {
                    tDSNameList.push(theName);
                }
            });
        }
        return (tDSNameList.includes(iName)) ? iName : tDSNameList[0];
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
            console.log(`    no measures dataset to delete!`);
        }
    },

    emptyCODAPDataset: async function(iDS) {
        if (iDS.datasetName) {
            const aCollectionName = iDS.structure.collections[0].name;
            const tEmptyMessage = {
                action : "delete",
                resource : `dataContext[${iDS.datasetName}].collection[${aCollectionName}].allCases`,
            }

            try {
                const dResult = await codapInterface.sendRequest(tEmptyMessage);
                console.log(`    emptying [${iDS.datasetName}]: (${dResult.success ? "success" : "failure"})`);
            } catch(msg) {
                console.log(`    problem emptying ${iDS.datasetName}: ${msg}`);
            }

        } else {
            console.log(`    no dataset to empty!`);

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