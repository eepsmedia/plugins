/*
==========================================================================

 * Created by tim on 8/20/20.
 
 
 ==========================================================================
codapConnect in lens

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

/* global jQuery, codapInterface, Swal */

connect = {

    selectedIDs: new Set(),

    initialize: async function () {

        //  set up the iframe this plugin is in
        await codapInterface.init(this.iFrameDescriptor, null);
        await this.setUpDatasetNotifications();

        //  get any saved state
        //  restore the state if possible

        lens.state = await codapInterface.getInteractiveState();

        if (lens.state.datasetInfo) {
            await lens.setTargetDatasetByName(lens.state.datasetInfo.name);
        }

        if (jQuery.isEmptyObject(lens.state)) {
            await codapInterface.updateInteractiveState(lens.freshState);
            console.log("lens: getting a fresh state");
        }
        //  console.log(`lens.state is ${JSON.stringify(lens.state)}`);   //  .length + " chars");

        //  now update the iframe to be mutable...

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
    },

    /**
     * Get "dataset info" for the dataset.
     * This includes all attribute names in all collections, as returned by `get...dataContext`.
     *
     * @param iName         dataset name
     * @returns {Promise<null|*>}
     */
    refreshDatasetInfoFor: async function (iName) {
        const tMessage = {
            "action": "get",
            "resource": `dataContext[${iName}]`
        }
        const dsInfoResult = await codapInterface.sendRequest(tMessage);
        if (dsInfoResult.success) {
            this.processDatasetInfoForAttributeGroups(dsInfoResult.values);
            dsInfoResult.values["attLocations"] = this.processDatasetInfoForAttributeLocations(dsInfoResult.values);

            //  so, for example, `lens.state.datasetInfo.attLocations.filterCollection`
            //  will hold the name of the collection that the filter attribute is in

            console.log(`å   attLocations: ${JSON.stringify(dsInfoResult.values.attLocations)}`);
            return dsInfoResult.values;
        } else {
            Swal.fire({icon: "error", title: "Drat!", text: `Problem getting information for dataset [${iName}]`});
            return null;
        }
    },

    makeFilterAttributeIn: async function (iDSname) {
        let theCollectionName = lens.state.datasetInfo.attLocations.filterCollection;

        //  if it doesn't exist, get the last collection name...

        if (!theCollectionName) {
            const nColls = lens.state.datasetInfo.collections.length;
            const theColl = lens.state.datasetInfo.collections[nColls - 1];
            theCollectionName = theColl.name;

            const tMessage = {
                "action": "create",
                "resource": `dataContext[${iDSname}].collection[${theCollectionName}].attribute`,
                "values": [
                    {
                        "name": lens.constants.filterAttributeName,
                        "type": "boolean",
                        "title": "Filter",
                        "description": "secret filter attribute",
                        "hidden": true,
                        "editable": false,
                        //  "hidden" : "true",
                    },
                ]
            }
            const makeFilterAttResult = await codapInterface.sendRequest(tMessage);

            if (!makeFilterAttResult.success) {
                alert(`Trouble making the filter attribute in ${iDSname}|${theCollectionName}`);
            }
        }

        console.log(`Filter already exists in collection[${lens.state.datasetInfo.attLocations.filterCollection}]`);

    },

    /**
     * Actually remove the "tags" attribute from the dataset,
     * @param iDSName       name of the dataset
     * @returns {Promise<void>}
     */
    deleteTagsAttributeFrom: async function (iDSName) {
        //  we assume that the lens.datasetInfo is recently refreshed.

        const tTagsCollectionName = lens.state.datasetInfo.attLocations.tagsCollection;

        if (tTagsCollectionName) {
            const tResource = `dataContext[${iDSName}].collection[${tTagsCollectionName}].attribute[${lens.constants.tagsAttributeName}]`;
            const tMessage = {"action": "delete", "resource": tResource}

            const deleteTagsAttResult = await codapInterface.sendRequest(tMessage);

            if (deleteTagsAttResult.success) {
                lens.state.datasetInfo.attLocations.tagsCollection = null;
                console.log(`∂   Yay! Deleted [${lens.constants.tagsAttributeName}] from collection [${tTagsCollectionName}]!`);
            } else {
                const eText = `Trouble deleting the Tags attribute in ${iDSName}|${tTagsCollectionName}`
                Swal.fire({
                    icon: "error",
                    title: "Dagnabbit!",
                    text: eText,
                });
            }
        } else {
            console.log(`∂   Hmm. Trying to delete the Tags attribute, and the tags collection did not exist.`);
        }
    },

    makeTagsAttributeIn: async function (iDSname) {
        let theTagsCollectionName = lens.state.datasetInfo.attLocations.tagsCollection;

        if (!theTagsCollectionName) {
            //  for tags, we'll make it at the top level.
            const theFirstCollection = lens.state.datasetInfo.collections[0];
            theTagsCollectionName = theFirstCollection.name;
            const tResource = `dataContext[${iDSname}].collection[${theTagsCollectionName}].attribute`;
            const tValues = {
                "name": lens.constants.tagsAttributeName,
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
                lens.state.datasetInfo.attLocations.tagsCollection = theTagsCollectionName;
                console.log(`µ   Yay! Made [${lens.constants.tagsAttributeName}] in collection [${theTagsCollectionName}]!`);
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
    },

    applyFilterFormulaIn: async function (iDS, iColl, iFunction) {
        const tMessage = {
            "action": "update",
            "resource": `dataContext[${iDS}].collection[${iColl}].attribute[${lens.constants.filterAttributeName}]`,
            "values": {
                "formula": iFunction
            }
        }
        const applyFilterFormulaResult = await codapInterface.sendRequest(tMessage);
        if (!applyFilterFormulaResult.success) {
            Swal.fire({
                icon: 'error',
                totle: "Curses!",
                text: `Trouble applying the filter attribute in ${iDS}|${iColl}`,
            });
        }

    },

    showHideAttribute: async function (iDS, iColl, iAttr, toHide) {
        const theResource = `dataContext[${iDS}].collection[${iColl}].attribute[${iAttr}]`;

        const tMessage = {
            "action": "update",
            "resource": theResource,
            "values": {
                "hidden": toHide
            }
        }
        const hideResult = await codapInterface.sendRequest(tMessage);
        console.log(`    ∂    ${hideResult.success ? "success" : "failure"} changing ${iAttr} to ${toHide ? "hidden" : "visible"}`);
    },

    /*  tag methods     */

    /**
     * Updates case values in CODAP so that all selected cases have the values of their "Tags"
     * attribute set to the value in the `id="tag-value-input"` text box.
     *
     * Note: the name of the "Tags" attribute is probably "Tags" -- but more
     * specifically is `lens.constants.tagsAttributeName`
     *
     * @param iMode     normally as described. But if `this.constants.kClear`, blanks all Tag values.
     * @returns {Promise<void>}
     */
    tagSelectedCases: async function (iMode = this.constants.kOnly) {

        switch (iMode) {
            case (this.constants.kAdd):
                //      make sure the tags attribute exists
                await this.makeTagsAttributeIn(lens.state.datasetInfo.name);

                //  first we get the selectionList
/*
                const selectionListResource = `dataContext[${lens.state.datasetInfo.name}].selectionList`;

                const tMessage = {
                    "action": "get",
                    "resource": selectionListResource,
                }
*/

                const tSelectedCaseIDs = await this.getCODAPSelectedCaseIDs();
                //await codapInterface.sendRequest(tMessage);

                if (tSelectedCaseIDs.length) {
                    const tagLabel = document.getElementById("tag-value-input").value;
                    console.log(`Applying tag [${tagLabel}] to ${tSelectedCaseIDs.length} cases`);

                    //  construct a new update...case request to update the items by caseID

                    const theResource = `dataContext[${lens.state.datasetInfo.name}].collection[${lens.state.datasetInfo.attLocations.tagsCollection}].case`;
                    const tTagAttributeName = lens.constants.tagsAttributeName;     //      probably "Tags"

                    //  construct the array of value objects, one for each selected case.
                    let valuesArray = [];
                    tSelectedCaseIDs.forEach(caseID => {
                        let valuesObject = {};
                        valuesObject[tTagAttributeName] = tagLabel;
                        const oneCase = {
                            "id": caseID,
                            "values": valuesObject,
                        }
                        valuesArray.push(oneCase);
                    })

                    const theRequest = {
                        "action" : "update",
                        "resource" : theResource,
                        "values" : valuesArray,
                    }

                    const setTagValuesResult = await codapInterface.sendRequest(theRequest);
                    if (setTagValuesResult.success) {
                        console.log(`Applied tag [${tagLabel}] to ${setTagValuesResult.length} cases`);
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: setTagValuesResult[0].values.error,
                            text: `In connect.tagByZIP, we failed to update the cases with the new tag.`,
                        });

                    }
                }
                break;

            case this.constants.kClear:

                console.log(`ç trying to clear tags`);
                this.clearTagValues();

                //  begin by refreshing the datasetInfo to get the Tags collection name
                //  lens.state.datasetInfo = await this.refreshDatasetInfoFor(lens.state.datasetInfo.name);

                //  now delete that attribute, then remake it
                //await this.deleteTagsAttributeFrom(lens.state.datasetInfo.name);
                //await this.makeTagsAttributeIn(lens.state.datasetInfo.name);
                break;
        }
    },

    /**
     * Clear all values of the "Tags" attribute by
     * * getting all items from CODAP in order to get their `itemID`s
     * * issuing an update request to all items blanking the "Tags" attribute
     * @returns {Promise<void>}
     */
    clearTagValues : async function() {

        const tGetAllItemsMessage = {
            "action": "get",
            "resource": `dataContext[${lens.state.datasetInfo.name}].itemSearch[*]`,
        }
        const getAllItemsResult = await codapInterface.sendRequest(tGetAllItemsMessage);

        if (getAllItemsResult.success) {
            let updateCompoundRequestValues = [];
            getAllItemsResult.values.forEach( val => {
                const tItemID = val.id;
                updateCompoundRequestValues.push({
                    "id" : tItemID,
                    "values" : {
                        "Tags" : ""         //  todo: use the variable/constant instead of the literal string
                    }
                })
            })

            const tCompoundRequestMessage = {
                "action" : "update",
                "resource" : `dataContext[${lens.state.datasetInfo.name}].item`,
                "values" : updateCompoundRequestValues,
            }

            const compoundRequestResult = await codapInterface.sendRequest(tCompoundRequestMessage);

            if (!compoundRequestResult.success) {
                const theMessage = compoundRequestResult.values.error;
                Swal.fire({
                    icon: 'error',
                    title: theMessage,
                    text: `In connect.clearTagValues, we got the items but failed to update them.`,
                });
            }

        } else {
            Swal.fire({
                icon: 'error',
                title: "Drat!",
                text: `In connect.clearTagValues, we could not retrieve all the items.`,
            });
        }

    },

    /*  selection methods   */

    getCODAPSelectedCaseIDs : async function() {
        const selectionListResource = `dataContext[${lens.state.datasetInfo.name}].selectionList`;
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

    setCODAPSelectionToCaseIDs : async  function(iList) {
        const selectionListResource = `dataContext[${lens.state.datasetInfo.name}].selectionList`;
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

    /**
     *  Given a list of ZIP codes to select (or add to the selection, or...)
     *  have CODAP actually perform the selection.
     *
     * @param iZips     array of ZIP code RECORD OBJECTS (see zipCA.js). The zip itself is in [zips].zip
     * @param iMode     this.constants.kOnly | except | add | remove, constants here in connect
     * @returns {Promise<void>}
     */
    selectByZIP: async function (iZips, iMode = this.constants.kOnly) {

        //  first make sure iZips is an Array (OK to pass a single ZIP)

        if (!Array.isArray(iZips)) {
            iZips = [iZips];
        }

        //  now we go through the zip records we just received and find the corresponding caseIDs.
        //  We make an array `currentIDs` of the ones we find.
        //  There are many ZIP codes that will NOT appear in the data (`lens.state.data`)
        //  so we check to make sure that that ZIP code is present before pushing.
        let currentIDs = [];
        iZips.forEach(zRecord => {
            const recordInCODAPdataset = lens.state.data[zRecord.zip];
            if (recordInCODAPdataset) {
                currentIDs.push(recordInCODAPdataset.id);   //  so an array of CODAP caseIDs
            }
        });

        const oldIDs = await this.getCODAPSelectedCaseIDs();    //  array of selected caseIDs

        //  now we make a new array of IDs depending on the mode
        const newSelection = this.figureOutSelection(oldIDs, currentIDs, iMode);    //  corrected array

        await this.setCODAPSelectionToCaseIDs(newSelection);    //  perform the selection

    },

    /**
     * Given two input arrays and a mode, produce an output array reflecting the mode.
     * The modes are
     * * only: the output has only the input
     * * clear: the output is empty
     * * add: the output is the union of what was with the new selection
     * * remove: the output eliminates any of the new selection from the old selection
     *
     * @param iOld  the old selection
     * @param iNew  the set of "new" cases to be considered
     * @param iMode the mode
     * @returns {[]}
     */
    figureOutSelection: function (iOld, iNew, iMode) {
        let out = [];
        switch (iMode) {
            case this.constants.kOnly:
                out = iNew;
                break;
            case this.constants.kClear:
                out = [];
                break;
            case this.constants.kAdd:
                out = iOld;
                iNew.forEach(id => {
                    if (!out.includes(id)) out.push(id);
                })
                break;
            case this.constants.kRemove:
                out = [];
                iOld.forEach(id => {
                    if (!iNew.includes(id)) out.push(id);
                })
                break;
        }
        return out;
    },

    /*
                    Notification setups
    */

    setUpDatasetNotifications: async function () {
        codapInterface.on(
            'notify',
            'documentChangeNotice',
            'dataContextCountChanged',
            lens.handleDatasetCountChange
        );
    },

    setUpOtherNotifications: async function () {

        const tResource = `dataContext[${lens.state.datasetInfo.name}].attribute`;
        codapInterface.on(
            'notify',
            tResource,
            '*',
            lens.handleAttributeChange
        );
        console.log(`Asked for notify on [${tResource}]`);

        //  register to receive notifications about selection

        const sResource = `dataContextChangeNotice[${lens.state.datasetInfo.name}]`;
        codapInterface.on(
            'notify',
            sResource,
            'selectCases',
            lens.handleSelectionChangeFromCODAP
        );

        console.log(`Asked for getting selectCases on [${sResource}]`);


    },

    getListOfDatasets: async function () {
        const tMessage = {
            "action": "get",
            "resource": "dataContextList"
        }
        const dataContextListResult = await codapInterface.sendRequest(tMessage);
        return dataContextListResult.values;
    },

    getAllCasesFrom: async function (iDatasetName) {

        //  figure out the name of the collection that "ZIP" is in.
        let collectionName = lens.state.datasetInfo.attLocations.indexCollection;

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
                const theIndexValue = theValues[lens.constants.indexAttributeName];
                outCases[theIndexValue] = {
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
                    case lens.constants.indexAttributeName:
                        out.indexCollection = coll.name;
                        break;
                    case lens.constants.filterAttributeName:
                        out.filterCollection = coll.name;
                        break;
                    case lens.constants.tagsAttributeName:
                        out.tagsCollection = coll.name;
                        console.log(`¬   Found [${lens.constants.tagsAttributeName}] in [${coll.name}]`);
                        break;
                }
            })
        });

        return out;
    },

    /**
     * Parse the attribute "groups" indicated by bracketed group names in the attribute descriptions.
     *
     * For example, `{work}Percent of people working in agriculture`
     * puts the attribute in a group called "work" and then strips that tag from the description
     *
     * @param theInfo   the information on all collections and attributes
     */
    processDatasetInfoForAttributeGroups: function (theInfo) {
        theInfo.collections.forEach(coll => {
            coll.attrs.forEach(att => {
                let theDescription = att.description;
                let theGroup = "";
                const leftB = theDescription.indexOf("{");
                const rightB = theDescription.indexOf("}");
                if (rightB > leftB) {
                    theGroup = theDescription.substring(leftB + 1, rightB);
                    att["description"] = theDescription.substring(rightB + 1);
                }
                att["group"] = theGroup;
                att["collection"] = coll.name;  //  need this as part of the resource so we can change hidden
            })
        })
    },

    iFrameDescriptor: {
        version: lens.constants.version,
        name: 'lens',
        title: 'lens',
        dimensions: {
            width: 333, height: 444
        },
    },

    constants: {
        kOnly: "only",
        kExcept: "except",
        kAdd: "add",
        kRemove: "remove",
        kClear: "clear",
    },
}