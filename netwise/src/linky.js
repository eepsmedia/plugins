/*
==========================================================================

 * Created by tim on 12/26/20.
 
 
 ==========================================================================
netwise.js in netwise

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


const linky = {

    initialize : async function() {
        await connect.initialize();

        this.state = this.getFreshState();  //todo: make more elaborate
        linkyModel.initialize();

        await this.setUpDataset();
        console.log(`linky.setUpDataset() complete`);
        await this.getAllData();

        netwiseUI.initialize();
    },

    state : null,

    getFreshState : function() {
        return {
            datasetName: null,
            datasetTitle: null,
            idCollectionName : null,
            id_attribute: "id",
            link_attribute: "links",
            phase: linky.constants.phases[0],
        }
    },

    getAllData : async function() {
        //  const tAllData = await connect.getAllItems(this.state.datasetName);
        const tAllData = await connect.getAllCases(this.state.datasetName);
        linkyModel.importData(tAllData);
    },

    setUpDataset : async function() {
        const domDSmenu = document.getElementById("datasetMenu");

        const theDSInfoArray = await connect.getListOfDataSetNames();

        console.log(`    found ${theDSInfoArray.length} dataset(s)`);
        if (theDSInfoArray.length) {
            const theDSGuts = await netwiseUI.makeDatasetMenuGuts(theDSInfoArray);
            domDSmenu.innerHTML = theDSGuts;

            console.log(`Going to specify dataset [${theDSInfoArray[0].name}]`);
            await this.specifyDatasetByName(theDSInfoArray[0].name, theDSInfoArray[0].title);
        } else {
            Swal.fire({icon: "error", title: "Drat!", text: `No CODAP dataset. Get one, then click restart.`});
        }
    },

    /**
     * This is where the dataset name actually gets set. Then we make the
     * attribute menus for the setup panel.
     *
     * @param iName
     * @returns {Promise<void>}
     */
    specifyDatasetByName : async function(iName) {
        const domIDmenu = document.getElementById("idAttributeMenu");
        const domLinkmenu = document.getElementById("linkAttributeMenu");

        linky.state.datasetName = iName;
        const dsInfo = await connect.getDSInfoByName(linky.state.datasetName);

        linky.state.datasetTitle = dsInfo.values.title;     //  not the name, the title

        const theAttGuts = await netwiseUI.makeAttributeMenuGuts(dsInfo.values.collections);
        domIDmenu.innerHTML = theAttGuts;
        domLinkmenu.innerHTML = theAttGuts;

        linky.state.idCollectionName = await this.choosePlausibleAttributes(dsInfo.values.collections);

        //  now with a new dataset, we need to set up notifications and get all the attributes
        connect.setUpNotifications();

        linky.state.phase = "in_progress";

    },

    /**
     * Given the attribute menus have been made, set the `state` variables for the link and ID attributes
     * to reasonable values.
     *
     * For now, that means that if they're named `links` or `id` that's what they are,
     * and if not, the first one's `id` and the last one is `links`.
     *
     * @returns {Promise<void>}
     */
    choosePlausibleAttributes : async function(iCollections) {
        const domIDmenu = document.getElementById("idAttributeMenu");
        const domLinkmenu = document.getElementById("linkAttributeMenu");

        let theNames = [];
        let theIDCollectionName = null;

        iCollections.forEach(clx => {
            clx.attrs.forEach(a => {
                if (a.name === linky.state.id_attribute) {
                    theIDCollectionName = clx.name;
                }
                theNames.push(a.name);
            })
        })

        if (!theNames.includes(linky.state.id_attribute)) {
            linky.state.id_attribute = theNames[theNames.length - 2];
            theIDCollectionName = iCollections[iCollections.length - 1].name;
        }
        if (!theNames.includes(linky.state.link_attribute)) {
            linky.state.link_attribute = theNames[theNames.length - 1];
        }

        //  set the menus to these values
        domIDmenu.value = linky.state.id_attribute;
        domLinkmenu.value = linky.state.link_attribute;

        return theIDCollectionName;
    },

    constants : {
        version : "000c",
        phases : ["noDataset", "setup", "in_progress"],
    }
}