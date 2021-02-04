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


const netwise = {

    initialize : async function() {
        await connect.initialize();

        this.state = this.getFreshState();  //todo: make more elaborate
        netwiseModel.initialize();

        await this.setUpDataset();
        await this.getAllData();

        netwiseUI.initialize();
    },

    state : null,

    getFreshState : function() {
        return {
            datasetName: null,
            datasetTitle: null,
            id_attribute: "id",
            link_attribute: "links",
            phase: netwise.constants.phases[0],
        }
    },

    getAllData : async function() {
        const tAllData = await connect.getAllItems(this.state.datasetName);
        netwiseModel.importData(tAllData);
    },

    setUpDataset : async function() {
        const domDSmenu = document.getElementById("datasetMenu");
        const domIDmenu = document.getElementById("idAttributeMenu");
        const domLinkmenu = document.getElementById("linkAttributeMenu");

        const theDSInfoArray = await connect.getListOfDataSetNames();

        if (theDSInfoArray.length) {
            netwise.state.datasetName = theDSInfoArray[0].name;       //  not the title, the name
            netwise.state.datasetTitle = theDSInfoArray[0].title;     //  not the name, the title
            const theDSGuts = await netwiseUI.makeDatasetMenuGuts(theDSInfoArray);
            domDSmenu.innerHTML = theDSGuts;

            netwise.state.phase = "in_progress";
        }

        const theAttGuts = await netwiseUI.makeAttributeMenuGuts(netwise.state.datasetName);
        domIDmenu.innerHTML = theAttGuts;
        domLinkmenu.innerHTML = theAttGuts;
    },


    constants : {
        version : "000a",
        phases : ["noDataset", "setup", "in_progress"],
    }
}