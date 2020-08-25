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
            lens.setTargetDatasetByName(lens.state.datasetInfo.name);
        }

        if (jQuery.isEmptyObject(lens.state)) {
            await codapInterface.updateInteractiveState(lens.freshState);
            console.log("lens: getting a fresh state");
        }
        console.log(`lens.state is ${JSON.stringify(lens.state)}`);   //  .length + " chars");

        //  now update the iframe to be mutable...

        const tMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };

        const updateResult = await codapInterface.sendRequest(tMessage);

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

    makeFilterAttributeIn: async function (iDSname, iLastCollectionName) {
        const tMessage = {
            "action": "create",
            "resource": `dataContext[${iDSname}].collection[${iLastCollectionName}].attribute`,
            "values": [
                {
                    "name": lens.constants.filterAttributeName,
                    "type": "boolean",
                    "title": "Filter",
                    "description": "should this not be set aside?",
                    "editable": false,
                    //  "hidden" : "true",
                }
            ]
        }
        const makeFilterAttResult = await codapInterface.sendRequest(tMessage);

        if (!makeFilterAttResult.success) {
            alert(`Trouble making the filter attribute in ${iDSname}|${iLastCollectionName}`);
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
        const applyFormulaResult = await codapInterface.sendRequest(tMessage);

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
    },

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

    getDatasetInfoFor: async function (iName) {
        const tMessage = {
            "action": "get",
            "resource": `dataContext[${iName}]`
        }
        const dsInfoResult = await codapInterface.sendRequest(tMessage);
        if (dsInfoResult.success) {
            return dsInfoResult.values;
        } else {
            alert(`Problem getting information for dataset [${iName}]`);
            return null;
        }
    },

    getAllCasesFrom: async function (iDatasetName) {

        //  figure out the name of the collection that "zip" is in.
        let collectionName = lens.currentZIPCollectionName;
        lens.state.datasetInfo.collections.forEach(coll => {
            //  todo: fill this in
        });


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
                const thisCase = {
                    id: theID,
                    caseIndex: theCaseIndex,
                    values: theValues,
                }

                outCases[theIndexValue] = thisCase;
            }
        );
        return outCases;
    },

    iFrameDescriptor: {
        version: lens.constants.version,
        name: 'lens',
        title: 'lens',
        dimensions: {width: 333, height: 444},
    },

    constants: {
        kOnly: "only",
        kExcept: "except",
        kAdd: "add",
        kRemove: "remove",
        kClear: "clear",
    },
}