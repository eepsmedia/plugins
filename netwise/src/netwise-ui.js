/*
==========================================================================

 * Created by tim on 12/26/20.
 
 
 ==========================================================================
netwise-ui.js in netwise

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


netwiseUI = {

    theNetView : null,

    initialize: async function () {
        this.theNetView = new NetView(netwiseModel);
        netwiseUI.update();

    },

    setupChange: function (e) {
        const domDSmenu = document.getElementById("datasetMenu");
        const domIDmenu = document.getElementById("idAttributeMenu");
        const domLinkmenu = document.getElementById("linkAttributeMenu");

        switch (e.target) {
            case domDSmenu:
                const attGuts = this.makeAttributeMenuGuts();
                domIDmenu.innerHTML = attGuts;
                domLinkmenu.innerHTML = attGuts;

                netwise.state.id_attribute = null;
                netwise.state.link_attribute = null;
                break;
        }

        this.update();
    },

    update: async function () {

        const domNetView = document.getElementById("net-view");
        const domSetup = document.getElementById("setup");
        const domStatus = document.getElementById("status");

        let theStatus = "Status of the Network";

        domStatus.innerHTML = theStatus;

        this.theNetView.draw();

    },


    makeDatasetMenuGuts: async function (iNames) {
        let out = "";

        iNames.forEach(ds => {
            out += `<option value="${ds.name}">${ds.title}</option>`;
        });
        return out;
    },

    makeAttributeMenuGuts: async function (iType) {
        const theNames = await connect.getListOfAttributes(netwise.state.datasetName);
        let out = "";

        //  for now, the list is the CODAP attribute object

        theNames.forEach(a => {
            out += `<option value="${a.name}">${a.name}</option>`;
        });
        return out;
    },


}
