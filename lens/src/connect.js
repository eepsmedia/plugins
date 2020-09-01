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
        //  todo: investigate why state.datasetInfo seems to have the entire saved file (14 MB) in it!

        lens.state = await codapInterface.getInteractiveState();

        if (lens.state.datasetInfo) {
            lens.setTargetDatasetByName(lens.state.datasetInfo.name);
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
                alert(`Trouble making the filter attribute in ${iDSname}|${iLastCollectionName}`);
            }
        }

        console.log(`Filter already exists in collection[${lens.state.datasetInfo.attLocations.filterCollection}]`);

    },

    deleteTagsAttributeFrom: async function (iDSName) {

    },

    makeTagsAttributeIn: async function (iDSname) {
        const theTagsCollectionName = "cases";

        const tMessage = {
            "action": "create",
            "resource": `dataContext[${iDSname}].collection[${theTagsCollectionName}].attribute`,
            "values": [
                {
                    "name": lens.constants.tagsAttributeName,
                    "type": "boolean",
                    "title": "Tags",
                    "description": "user-made tags for sets of ZIP codes",
                    "editable": false,
                    //  "hidden" : "true",
                }
            ]
        }
        const makeTagsAttResult = await codapInterface.sendRequest(tMessage);

        if (!makeTagsAttResult.success) {
            Swal.fire({
                icon: "error",
                title: "Dagnabbit!",
                text: `Trouble making the Tags attribute in ${iDSname}|${theTagsCollectionName}`
            });
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
                text: `Trouble applying the filter attribute in ${iDSname}|${theTagsCollectionName}`,
            });
        }

    },

    /*  tag methods     */

    tagByZIP: async function (iMode = this.constants.kOnly) {

        switch (iMode) {
            case (this.constants.kAdd):
                const selectionListResource = `dataContext[${lens.state.datasetInfo.name}].selectionList`;
                //  first make sure iZips is an Array (OK to pass a single ZIP)

                //  first we get the selectionList

                const tMessage = {
                    "action": "get",
                    "resource": selectionListResource,
                }
                const getSelectionListResult = await codapInterface.sendRequest(tMessage);

                if (getSelectionListResult.success) {
                    const tagLabel = document.getElementById("tag-value-input").value;
                    console.log(`Applying tag [${tagLabel}] to ${getSelectionListResult.values.length} cases`);

                    //  construct a compound request to update the items by caseID

                    let theCompoundRequest = [];

                    getSelectionListResult.values.forEach(val => {
                        //  val.caseID is the caseID
                        const tTagAttributeName = lens.constants.tagsAttributeName;
                        let valuesObject = {};
                        valuesObject[tTagAttributeName] = tagLabel;
                        const oneReqest = {
                            "action": "update",
                            "resource": `dataContext[${lens.state.datasetInfo.name}].itemByCaseID[${val.caseID}]`,
                            "values": valuesObject,
                        }
                        theCompoundRequest.push(oneReqest);

                    })

                    const setTagValuesResult = await codapInterface.sendRequest(theCompoundRequest);
                    if (setTagValuesResult.success) {
                        console.log(`Applied tag [${tagLabel}] to ${getSelectionResult.values.length} cases`);
                    }

                }
                break;
            case this.constants.kClear:
                //  another compound request to update every case

                document.body.style.cursor = 'wait';
                Swal.fire({
                    title: "Patience is a virtue",
                    text: "We are trying to make this process faster. It's way too slow right now. We know.",
                    icon: "warning",
                })
                let clearCompoundRequest = [];

                for (const zip in lens.state.data) {
                    const theID = lens.state.data[zip].id;
                    const oneReqest = {
                        "action": "update",
                        "resource": `dataContext[${lens.state.datasetInfo.name}].itemByCaseID[${theID}]`,
                        "values": {
                            "Tags": ""
                        }
                    }
                    clearCompoundRequest.push(oneReqest);
                }

                const setTagValuesResult = await codapInterface.sendRequest(clearCompoundRequest);
                document.body.style.cursor = 'default';

                if (setTagValuesResult.success) {
                    console.log(`Cleared ${lens.state.data.length} tags`);
                }
                break;
        }
    },


    /*  selection methods   */

    /**
     *
     * @param iZips     array of ZIP code RECORD OBJECTS. The zip itself is in foo.zip
     * @param iMode     this.constants.kOnly | except | add | remove, constants here in connect
     * @returns {Promise<void>}
     */
    selectByZIP: async function (iZips, iMode = this.constants.kOnly) {

        const selectionListResource = `dataContext[${lens.state.datasetInfo.name}].selectionList`;
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
                currentIDs.push(recordInCODAPdataset.id);
            }
        });

        //  now get all the currently selected caseIDs.
        const gMessage = {
            "action": "get", "resource": selectionListResource
        }
        const getSelectionResult = await codapInterface.sendRequest(gMessage);

        //  the result has the ID but also the collection ID and name,
        //  so we collect just the caseID in `oldIDs`
        let oldIDs = [];
        if (getSelectionResult.success) {

            //  consturct an array of the currently-selected cases.
            //  NOTE that `val`
            getSelectionResult.values.forEach(val => {
                oldIDs.push(val.caseID)
            })
        }

        //  now we make a new array of IDs depending on the mode
        const newSelection = this.figureOutSelection(oldIDs, currentIDs, iMode);

        const tMessage = {
            "action": "create",
            "resource": selectionListResource,
            "values": newSelection,
        }

        const makeSelectionResult = await codapInterface.sendRequest(tMessage);
        if (!makeSelectionResult.success) {
            Swal.fire({
                icon: 'error',
                totle: "Curses!",
                text: `Trouble making the new selection`,
            });
        }

    },

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
    }
    ,

    /*  Notification setups */

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

    },

    getListOfDatasets: async function () {
        const tMessage = {
            "action": "get",
            "resource": "dataContextList"
        }
        const dataContextListResult = await codapInterface.sendRequest(tMessage);
        return dataContextListResult.values;
    },

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
            //  will hold the name of the colletion that the filter attribute is in

            return dsInfoResult.values;
        } else {
            Swal.fire({icon: "error", title : "Drat!", text: `Problem getting information for dataset [${iName}]`});
            return null;
        }
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
     *     tagsCollection : <tags colelction name>,
     * }
     * @param theInfo
     */
    processDatasetInfoForAttributeLocations: function (theInfo) {
        out = {
            "indexCollection" : null,
            "filterCollection" : null,
            "tagsCollection" : null,
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
                        break;
                }
            })
        });

        return out;
    },
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