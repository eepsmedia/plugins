let connect;

connect = {

    initialize: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
        await this.allowReorg();
        notificatons.registerForDocumentChanges();
        notificatons.registerForAttributeDrops();
    },

    iFrameDescriptor: {
        name: scrambler.constants.pluginName,
        title: scrambler.constants.pluginName,
        version: scrambler.constants.version,
        dimensions: scrambler.constants.dimensions,      //      dimensions,
    },

    /**
     * Find a dataset that is not _scrambled or _measures, preferably the one we pass in!
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
                if (theName.startsWith(scrambler.constants.measuresPrefix) || theName.startsWith(scrambler.constants.scrambledPrefix)) {

                } else {
                    tDSNameList.push(theName);
                }
            });
        }
        return (tDSNameList.includes(iName)) ? iName : tDSNameList[0];
    },

    /**
     * Does the named dataset already exist in CODAP's list of data contexts?
     * @param iName
     * @returns {Promise<void>}
     */
    datasetExistsOnCODAP: async function (iName) {
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

    /**
     * Ask CODAP to delete the named dataset
     * @param iName     the name
     * @returns {Promise<void>}
     */
    deleteDatasetOnCODAP : async function(iName) {
        if (iName) {
            const tDeleteMessage = {
                action: "delete",
                resource: `dataContext[${iName}]`,
            }
            const dResult = await codapInterface.sendRequest(tDeleteMessage);
            console.log(`    deleting [${iName}]: (${dResult.success ? "success" : "failure"})`);
        } else {
            console.log(`    no dataset name passed in to delete!`);
        }
    },

    deleteCasesOnCODAPinCODAPDataset : async function(iDS) {
        const tCollName = iDS.structure.collections[0].name;
        const tResource = `dataContext[${iDS.datasetName}].collection[${tCollName}].allCases`;
        const dResult = await codapInterface.sendRequest({
            action : "delete",
            resource : tResource,
        })
        console.log(`    flushing [${iDS.datasetName}]: (${dResult.success ? "success" : "failure"})`);

    },
/*
    needFreshOutputDataset: async function () {
        return false;
    },
*/


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
     * todo: delete if unused
     *
     * @param iCases
     * @returns {Promise<[]>}
     */
/*    getCODAPSelectedCaseIDs: async function () {
        const theMeasuresName = "";     //  todo: put in actual name
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
    },*/

}