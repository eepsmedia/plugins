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

    showHideAttribute: async function( iDS, iColl, iAttr, toHide) {
        const theResource = `dataContext[${iDS}].collection[${iColl}].attribute[${iAttr}]`;

        const tMessage = {
            "action" : "update",
            "resource" : theResource,
            "values" : {
                "hidden" : toHide
            }
        }
        const hideResult = await codapInterface.sendRequest(tMessage);
        console.log(`    ∂    ${hideResult.success ? "success" : "failure"} changing ${iAttr} to ${toHide ? "hidden" : "visible"}`);
    },

    makeFilterAttributeIn : async function(iDSname, iLastCollectionName) {
        const tMessage = {
            "action": "create",
            "resource": `dataContext[${iDSname}].collection[${iLastCollectionName}].attribute`,
            "values": [
            {
                "name": "lens_filter",
                "type": "boolean",
                "title": "Filter",
                "description": "should this nt be set aside?",
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

    applyFilterFormulaIn : async function(iDS, iColl, iFunction) {
        const tMessage = {
            "action": "update",
            "resource": `dataContext[${iDS}].collection[${iColl}].attribute[lens_filter]`,
            "values": {
                "formula": iFunction
            }
        }
        const applyFormulaResult = await codapInterface.sendRequest(tMessage);

    },

    /*  selection methods   */

    /**
     *
     * @param iZips     array of ZIP codes
     * @param iMode     this.constants.kOnly | except | add | remove, constants here in connect
     * @returns {Promise<void>}
     */
    selectByZIP : async function(iZips, iMode) {

        //  first make sure iZips is an Array (OK to pass a single ZIP)

        if (!Array.isArray(iZips)) {
            iZips = [iZips];
        }


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

    getDatasetInfoFor : async function(iName) {
        const tMessage = {
            "action" : "get",
            "resource" : `dataContext[${iName}]`
        }
        const dsInfoResult = await codapInterface.sendRequest(tMessage);
        if (dsInfoResult.success) {
            return dsInfoResult.values;
        } else {
            alert(`Problem getting information for dataset [${iName}]`);
            return null;
        }
    },

    getAllItemsFrom: async function (iDatasetName) {
        const tMessage = {
            action: "get",
            resource: `dataContext[${iDatasetName}].itemSearch[*]`,
        };
        const tAllItemsResult = await codapInterface.sendRequest(tMessage);

        let outItems = [];
        tAllItemsResult.values.forEach(
            item => {
                outItems.push(item.values);
            }
        );
        return  outItems;
    },

    iFrameDescriptor: {
        version: lens.constants.version,
        name: 'lens',
        title: 'lens',
        dimensions: {width: 333, height: 444},
    },

    constants : {
        kOnly : "only",
        kExcept : "except",
        kAdd : "add",
        kRemove : "remove",
    },
}