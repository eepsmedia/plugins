/*
==========================================================================

 * Created by tim on 9/29/20.
 
 
 ==========================================================================
connect in gator

Author:   Tim Erickson

Copyright (c) 2018 by The Concord Consortium, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==========================================================================

*/

/* global codapInterface, Swal  */

const connect = {

    initialize : async function() {
        await codapInterface.init(this.iFrameDescriptor, null);

        //
/*
        const tMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };

        const updateIframeResult = await codapInterface.sendRequest(tMessage);
        if (!updateIframeResult.success) {
            Swal.fire({icon: "error", text: `Problem making the interactive frame mutable`});
        }
*/

    },


    /**
     * used by xxx-ui.js to get a list of datasets, so it can make a menu.
     *
     * @returns {Promise<*>}
     */
    getListOfDatasets: async function () {
        const tMessage = {
            "action": "get",
            "resource": "dataContextList"
        }
        const dataContextListResult = await codapInterface.sendRequest(tMessage);
        return dataContextListResult.values;
    },

    /**
     * Ask to be notified about changes in attributes and selections
     * @returns {Promise<void>}
     */
    setUpOtherNotifications: async function () {

        const tResource = `dataContext[${gator.state.datasetName}].attribute`;
        codapInterface.on(
            'notify',
            tResource,
            '*',
            gator.handleAttributeChange
        );
        console.log(`Asked for notify on [${tResource}]`);

        //  register to receive notifications about selection

        const sResource = `dataContextChangeNotice[${gator.state.datasetName}]`;
        codapInterface.on(
            'notify',
            sResource,
            'selectCases',
            gator.handleSelectionChangeFromCODAP
        );

        console.log(`Asked for getting selectCases on [${sResource}]`);
    },


    /**
     * Get "dataset info" for the dataset.
     * This includes all attribute names in all collections, as returned by `get...dataContext`.
     *
     * @param iName         dataset name
     * @returns {Promise<null|*>}
     */
    refreshDatasetInfoFor: async function (iName) {
        console.log(`gator --- connect --- refreshing dataset info for [${iName}]`);
        const tMessage = {
            "action": "get",
            "resource": `dataContext[${iName}]`
        }
        const dsInfoResult = await codapInterface.sendRequest(tMessage);
        if (dsInfoResult.success) {
            return dsInfoResult.values;
        } else {
            Swal.fire({icon: "error", title: "Drat!", text: `Problem getting information for dataset [${iName}]`});
            return null;
        }
    },

    /**
     * Get all of the cases from the named dataset.
     *
     * Note: we get them from the "last" collection in the current hierarchy.
     * We do this partly because we need CASE IDs to cope with selection
     * (because selection does not work with items ...)
     *
     * @param iDatasetName
     * @returns {Promise<{}>}   Object keyed by the (unique) caseIDs
     */
    getAllCasesFrom: async function (iDatasetName) {

        //  figure out the name of the last collection.
        let collectionName = gator.getLastCollectionName();

        const tMessage = {
            action: "get",
            resource: `dataContext[${iDatasetName}].collection[${collectionName}].allCases`,
        };
        const tAllCasesResult = await codapInterface.sendRequest(tMessage);

        let outCases = {};      //  we will return an object

        tAllCasesResult.values.cases.forEach(
            aCase => {
                const theValues = aCase.case.values;
                const theID = aCase.case.id;
                const theCaseIndex = aCase.caseIndex;
                outCases[aCase.case.id] = {
                    id: theID,
                    caseIndex: theCaseIndex,
                    values: theValues,
                }
            }
        );
        return outCases;
    },

    /**
     * Assign the given attribute (by name) to the clump (also by name).
     * This actually updates the dataset, so that the next time we process it,
     * gator will read the clump assignment properly.
     *
     * @param iDSName   the string name of the dataset
     * @param iAttName  the string name of the attribute
     * @param iClump    the string name of the clump
     * @returns {Promise<void>}
     */
    setAttributeClump : async function(iDSName, iAttName, iClump) {
        const theCollection =  this.utilities.collectionNameFromAttributeName(iAttName, gator.datasetInfo);
        let theDescription = this.utilities.descriptionFromAttributeName(iAttName, gator.datasetInfo);

        theDescription = "{" + iClump + "}" + theDescription;

        if (theCollection) {
            const theResource = `dataContext[${iDSName}].collection[${theCollection}].attribute[${iAttName}]`;

            const tMessage = {
                "action": "update",
                "resource": theResource,
                "values": {
                    "description": theDescription,
                }
            }
            const addClumpResult = await codapInterface.sendRequest(tMessage);
            console.log(`    ∂    ${addClumpResult.success ? "success" : "failure"} adding ${iAttName} to clump ${iClump}`);
        } else {
            Swal.fire({icon: "error", title: "Drat!", text: `Could not find a collection for attribute [${iAttName}]`});
        }

    },

    showHideAttribute: async function (iDSName, iAttr, toHide) {
        const theCollection = await this.utilities.collectionNameFromAttributeName(iAttr, gator.datasetInfo);

        if (theCollection) {
            const theResource = `dataContext[${iDSName}].collection[${theCollection}].attribute[${iAttr}]`;

            const tMessage = {
                "action": "update",
                "resource": theResource,
                "values": {
                    "hidden": toHide
                }
            }
            const hideResult = await codapInterface.sendRequest(tMessage);
            console.log(`    ∂    ${hideResult.success ? "success" : "failure"} changing ${iAttr} to ${toHide ? "hidden" : "visible"}`);
        } else {
            Swal.fire({icon: "error", title: "Drat!", text: `Could not find a collection for attribute [${iAttr}]`});
        }
    },

    utilities : {

        collectionNameFromAttributeName : function(iName, info) {
            let out = "";

            info.collections.forEach( coll => {
                coll.attrs.forEach( att => {
                    if (att.name === iName) {
                        out = coll.name;
                    }
                })
            })
            return out;
        },

        descriptionFromAttributeName : function(iName, info) {
            let out = "";

            info.collections.forEach( coll => {
                coll.attrs.forEach( att => {
                    if (att.name === iName) {
                        out = att.description;
                    }
                })
            })
            return out;
        }

    },


    iFrameDescriptor: {
        version: gator.constants.version,
        name: 'gator',
        title: 'gator',
        dimensions: {
            width: 333, height: 444,
        },
    },

}