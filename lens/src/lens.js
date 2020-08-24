/*
==========================================================================

 * Created by tim on 8/20/20.
 
 
 ==========================================================================
lens in lens

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


let lens = {
    initialize: async function () {
        await connect.initialize();
        await lens_ui.initialize();

        model.initialize();
    },

    freshState: function () {
        console.log(`called lens.freshState()`);
        return {
            datasetInfo: null,
            data: {},
        };
    },

    setTargetDatasetByName: async function (iName) {
        const tInfo = await connect.getDatasetInfoFor(iName);
        if (tInfo.name) {
            console.log(`∂   changing dataset to [${iName}]`);
            this.state.datasetInfo = tInfo;

            //  now with a new dataset, we need to set up notifications and get all the attributes
            connect.setUpOtherNotifications();
            //  await model.loadCurrentData(this.state.datasetName);
            lens_ui.attributeCheckboxes.install();
            this.loadCurrentData(iName);

            connect.makeFilterAttributeIn(iName, this.getLastCollectionName());

        } else {
            console.log(`?   called setTargetDatasetName without a dataset name`);
        }
    },

    getLastCollectionName : function() {
        //  get the name of the last collection...
        const colls = this.state.datasetInfo.collections;
        const nCollections = colls.length;
        const lastCollName = colls[nCollections - 1].name;
        return lastCollName;
    },

    loadCurrentData: async function (iDatasetName) {
        const theItems = await connect.getAllItemsFrom(iDatasetName);
        this.state.data = {};       //  fresh!

        //  populate this.state.data with the data from that call
        this.state.datasetInfo.collections.forEach(
            col => {
                col.attrs.forEach(theAttr => {
                    this.state.data[theAttr.name] = [];
                    theItems.forEach(
                        item => {
                            this.state.data[theAttr.name].push(item[theAttr.name]);
                        }
                    )
                })
            }
        );
    },

    //  handlers for controls ----------------


    applyFilter: function () {
        console.log(`attempting to apply a filter`);
        const elFilterTextarea = document.getElementById("filter-input");
        const theText = elFilterTextarea.value;
        connect.applyFilterFormulaIn(
            lens.state.datasetInfo.name,
            this.getLastCollectionName(),
            theText
            );
    },

    //  handlers for changes from CODAP ----------------

    handleDatasetCountChange: function (mess) {
        console.log(`∂   changed number of data contexts. Message [${JSON.stringify(mess)}]`);
        lens_ui.initialize();
    },

    handleAttributeChange: function (mess) {
        console.log(`∂   changed attribute. Message [${JSON.stringify(mess)}]`);

    },

    //  not functions ------------------------------------

    state: {
        datasetName: "",
    },

    constants: {
        version: "000",
    },

}

const applyFilter = lens.applyFilter;
