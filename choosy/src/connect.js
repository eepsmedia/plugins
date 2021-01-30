/*
==========================================================================

 * Created by tim on 9/29/20.
 
 
 ==========================================================================
connect in choosy

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

    initialize: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
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

        const tResource = `dataContext[${choosy.state.datasetName}].attribute`;
        codapInterface.on(
            'notify',
            tResource,
            '*',
            choosy.handleAttributeChange
        );
        console.log(`Asked for notify on [${tResource}]`);

        //  register to receive notifications about selection

        const sResource = `dataContextChangeNotice[${choosy.state.datasetName}]`;
        codapInterface.on(
            'notify',
            sResource,
            'selectCases',
            choosy.handlers.handleSelectionChangeFromCODAP
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
        //  console.log(`choosy --- connect --- refreshing dataset info for [${iName}]`);
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
        let collectionName = choosy.getLastCollectionName();

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
     * Produces an object that's going to be appended to the
     * dataset info.
     * {
     *     indexCollection : <index (ZIP) collection name>,
     *     filterCollection : <filter collection name>,
     *     tagsCollection : <tags collection name>,
     * }
     * @param theInfo
     */
    processDatasetInfoForAttributeLocations: function (theInfo) {
        let out = {
            "indexCollection": null,
            "filterCollection": null,
            "tagsCollection": null,
        };

        theInfo.collections.forEach(coll => {
            coll.attrs.forEach(att => {
                switch (att.name) {
                    case choosy.constants.indexAttributeName:
                        out.indexCollection = coll.name;
                        break;
                    case choosy.constants.filterAttributeName:
                        out.filterCollection = coll.name;
                        break;
                    case choosy.constants.tagsAttributeName:
                        out.tagsCollection = coll.name;
                        console.log(`¬   Found [${choosy.constants.tagsAttributeName}] in [${coll.name}]`);
                        break;
                }
            })
        });

        return out;
    },

    /**
     * Assign the given attribute (by name) to the clump (also by name).
     * This actually updates the dataset, so that the next time we process it,
     * choosy will read the clump assignment properly.
     *
     * @param iDSName   the string name of the dataset
     * @param iAttName  the string name of the attribute
     * @param iClump    the string name of the clump
     * @returns {Promise<void>}
     */
    setAttributeClump: async function (iDSName, iAttName, iClump) {
        const theCollection = this.utilities.collectionNameFromAttributeName(iAttName, choosy.datasetInfo);
        let theDescription = this.utilities.descriptionFromAttributeName(iAttName, choosy.datasetInfo);

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
        const theCollection = await this.utilities.collectionNameFromAttributeName(iAttr, choosy.datasetInfo);

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

    /**
     * Selection methods: interacting with CODAP selection, applying tags, etc.
     */
    tagging: {

        /**
         *
         * @returns {Promise<string>} the name of the "Tags" collection
         */
        ensureTagsAttributeExists: async function () {

            await connect.refreshDatasetInfoFor(choosy.state.datasetName);
            let theTagsCollectionName = connect.utilities.collectionNameFromAttributeName(
                choosy.constants.tagsAttributeName,
                choosy.datasetInfo
            );

            if (choosy.state.datasetName) {
                if (!theTagsCollectionName) {       //  we don't have this attribute yet
                    //  for new tags attributes, we'll make it at the bottom level.
                    const bottomLevel = choosy.datasetInfo.collections.length - 1;
                    const theFirstCollection = choosy.datasetInfo.collections[bottomLevel];
                    theTagsCollectionName = theFirstCollection.name;
                    const tResource = `dataContext[${choosy.state.datasetName}].collection[${theTagsCollectionName}].attribute`;
                    const tValues = {
                        "name": choosy.constants.tagsAttributeName,
                        "type": "nominal",
                        "title": "Tags",
                        "description": "user-made tags for sets of ZIP codes",
                        "editable": false,
                        //  "hidden" : "true",
                    }

                    const tMessage = {
                        "action": "create", "resource": tResource, "values": [tValues],
                    }

                    const makeTagsAttResult = await codapInterface.sendRequest(tMessage);

                    if (makeTagsAttResult.success) {
                        //  choosy.state.datasetInfo.attLocations.tagsCollection = theTagsCollectionName;
                        console.log(`µ   Yay! Made [${choosy.constants.tagsAttributeName}] in collection [${theTagsCollectionName}]!`);
                        Swal.fire({
                            icon: "success",
                            title: "Yay!",
                            text: `The new [${choosy.constants.tagsAttributeName}] attribute 
                            is in collection [${theTagsCollectionName}]!`,
                        });
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Dagnabbit!",
                            text: `Trouble making the Tags attribute in ${iDSname}|${theTagsCollectionName}:`
                                + ` ${makeTagsAttResult.values.error}.`,
                        });
                    }
                } else {
                    console.log(`Hmm. The tags attribute already existed in ${theTagsCollectionName}.`);
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Dagnabbit!",
                    text: `we apparently don't have a dataset defined: ${makeTagsAttResult.values.error}.`,
                })
            }

            return theTagsCollectionName;
        },

        getCODAPSelectedCaseIDs: async function () {
            const selectionListResource = `dataContext[${choosy.state.datasetName}].selectionList`;
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

        setCODAPSelectionToCaseIDs: async function (iList) {
            const selectionListResource = `dataContext[${choosy.state.datasetName}].selectionList`;
            const tMessage = {
                "action": "create",
                "resource": selectionListResource,
                "values": iList,
            }

            const makeSelectionResult = await codapInterface.sendRequest(tMessage);
            if (!makeSelectionResult.success) {
                Swal.fire({
                    icon: 'error',
                    title: "Curses!",
                    text: `Trouble making the new selection`,
                });
            }
        },

        doBinaryTag: async function () {
            const yesTag = document.getElementById(choosy.constants.tagValueSelectedElementID).value;
            const noTag = document.getElementById(choosy.constants.tagValueNotSelectedElementID).value;

            const tTagAttributeName = choosy.constants.tagsAttributeName;     //      probably "Tags"
            const selectedCases = await connect.tagging.getCODAPSelectedCaseIDs();

            let valuesArray = [];

            const allData = await connect.getAllCasesFrom(choosy.state.datasetName);

            Object.keys(allData).forEach(caseID => {
                let valuesObject = {};
                const isSelected = selectedCases.includes(Number(caseID));
                valuesObject[tTagAttributeName] = isSelected ? yesTag : noTag;
                const oneCase = {
                    "id": caseID,
                    "values": valuesObject,
                }
                valuesArray.push(oneCase);
            });

            await connect.updateTagValues(tTagAttributeName, valuesArray);

        },

        doRandomTag: async function () {
            const aTag = document.getElementById(choosy.constants.tagValueGroupAElementID).value;
            const bTag = document.getElementById(choosy.constants.tagValueGroupBElementID).value;
            const theProportion = Number(document.getElementById(choosy.constants.tagPercentageElementID).value) / 100.0;

            const tTagAttributeName = choosy.constants.tagsAttributeName;     //      probably "Tags"
            //  const selectedCases = await connect.selection.getCODAPSelectedCaseIDs();

            let valuesArray = [];

            const allData = await connect.getAllCasesFrom(choosy.state.datasetName);

            Object.keys(allData).forEach(caseID => {
                let valuesObject = {};
                const inGroupA = Math.random() < theProportion;
                valuesObject[tTagAttributeName] = inGroupA ? aTag : bTag;
                const oneCase = {
                    "id": caseID,
                    "values": valuesObject,
                }
                valuesArray.push(oneCase);
            });

            await connect.updateTagValues(tTagAttributeName, valuesArray);

        },

        clearAllTagsFrom: async function (iTag) {
            let valuesArray = [];

            const allData = await connect.getAllCasesFrom(choosy.state.datasetName);

            Object.keys(allData).forEach(caseID => {
                let valuesObject = {};
                valuesObject[iTag] = "";
                const oneCase = {
                    "id": caseID,
                    "values": valuesObject,
                }
                valuesArray.push(oneCase);
            });

            await connect.updateTagValues(iTag, valuesArray);

        },

        tagSelectedCases: async function (iMode = "clear") {

            const tagLabel = (iMode === "add") ?
                document.getElementById(choosy.constants.tagValueElementID).value :
                "";
            const tTagAttributeName = choosy.constants.tagsAttributeName;     //      probably "Tags"
            const selectedCases = await connect.tagging.getCODAPSelectedCaseIDs();

            let valuesArray = [];

            //  construct the array of value objects, one for each selected case.

            selectedCases.forEach(caseID => {
                let valuesObject = {};
                valuesObject[tTagAttributeName] = tagLabel;
                const oneCase = {
                    "id": caseID,
                    "values": valuesObject,
                }
                valuesArray.push(oneCase);
            });

            await connect.updateTagValues(tTagAttributeName, valuesArray);
        },
    },

    updateTagValues: async function (iTagAttName, iValues) {
        const tagCollection = await connect.tagging.ensureTagsAttributeExists();

        const theResource = `dataContext[${choosy.state.datasetName}].collection[${tagCollection}].case`;
        const theRequest = {
            "action": "update",
            "resource": theResource,
            "values": iValues,
        }

        const tagCasesResult = await codapInterface.sendRequest(theRequest);
        if (tagCasesResult.success) {
            console.log(`Applied tags to ${tagCasesResult.caseIDs.length} case(s)`);
        } else {
            Swal.fire({
                icon: 'error',
                title: tagCasesResult[0].values.error,
                text: `In connect.tagSelectedCases(), we failed to update the cases with the new tag.`,
            });
        }

    },

    utilities: {

        collectionNameFromAttributeName: function (iName, info) {
            let out = "";

            info.collections.forEach(coll => {
                coll.attrs.forEach(att => {
                    if (att.name === iName) {
                        out = coll.name;
                    }
                })
            })
            return out;
        },

        descriptionFromAttributeName: function (iName, info) {
            let out = "";

            info.collections.forEach(coll => {
                coll.attrs.forEach(att => {
                    if (att.name === iName) {
                        out = att.description;
                    }
                })
            })
            return out;
        }

    },


    iFrameDescriptor: {
        version: choosy.constants.version,
        name: 'choosy',
        title: 'choosy',
        dimensions: {
            width: 333, height: 444,
        },
    },

}