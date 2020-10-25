/*
==========================================================================

 * Created by tim on 9/29/20.
 
 
 ==========================================================================
gator in gator

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


/* global codapInterface        */

const gator = {
    state : {},             //  stores the dataset name. To be saved.
    datasetInfo : {},       //  from the API, has name, collections, attribute names. Do not save!
    theData : {},           //  case-ID-keyed object containing objects with non-formula values for all cases

    initialize : async function() {
        await connect.initialize();
        gator.state = await codapInterface.getInteractiveState();

        //  Note: if there is only one dataset, the state.datasetName gets set to that DS
        //  Therefore _ui.initialize() must follow the call to getInteractiveState.
        await gator_ui.initialize();

        //  Do we have a DS name?

        if (gator.state.datasetName) {
            await gator.setTargetDataset();
        }

        if (Object.keys(gator.state).length === 0 && gator.state.constructor === Object) {
            await codapInterface.updateInteractiveState(gator.freshState);
            console.log("gator: getting a fresh state");
        }
    },

    freshState: function () {
        console.log(`called lens.freshState()`);
        return {
            datasetName: "",
        };
    },

    setTargetDataset : async function() {
        if (this.state.datasetName) {
            this.setTargetDatasetByName(this.state.datasetName);
        } else {
            console.log(`∂  tried to set a dataset without a dataset name`);
        }
    },

    setTargetDatasetByName: async function (iName) {

        //  get all the information on this dataset
        const tInfo = await connect.refreshDatasetInfoFor(iName);
        if (tInfo.name) {
            console.log(`∂   changing dataset to [${iName}]`);
            this.state.datasetName = tInfo.name;
            this.datasetInfo = tInfo;
            gator_ui.attributeCheckboxes.install();

            //  now with a new dataset, we need to set up notifications and get all the attributes
            connect.setUpOtherNotifications();

            this.loadCurrentData(iName);
            //  connect.makeTagsAttributeIn(iName);

        } else {
            console.log(`?   called setTargetDatasetByName without a dataset name`);
        }
    },

    loadCurrentData: async function (iDatasetName) {
        const theCases = await connect.getAllCasesFrom(iDatasetName);
        this.theData = theCases;       //  fresh!
    },

    getLastCollectionName : function() {
        //  get the name of the last collection...
        const colls = this.datasetInfo.collections;
        const nCollections = colls.length;
        const lastCollName = colls[nCollections - 1].name;
        return lastCollName;
    },

    constants : {
        version : '000a',
        noGroupString : "none",
    }
}