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
        this.theNetView = new NetView(linkyModel);
        linkyModel.relax(3);
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

                linky.state.id_attribute = null;
                linky.state.link_attribute = null;
                break;
        }

        this.update();
    },

    update: async function () {

        const domNetView = document.getElementById("net-view");
        const domSetup = document.getElementById("setup");
        const domStatus = document.getElementById("status");

        domStatus.innerHTML = this.makeStatus();

        this.theNetView.draw();

    },

    makeStatus: function() {
        const theStatus = linkyModel.netStatus();
        return `${theStatus.nodeCount} nodes, ${theStatus.linkCount} links`
    },

    makeDatasetMenuGuts: async function (iNames) {
        let out = "";

        iNames.forEach(ds => {
            out += `<option value="${ds.name}">${ds.title}</option>`;
        });
        return out;
    },

    makeAttributeMenuGuts: async function (iCollections) {
        let out = "";

        let theNames = [];

        iCollections.forEach(c => {
            c.attrs.forEach(a => {
                theNames.push(a);   //  the CODAP attribute object
            })
        })

        //  for now, the list is the CODAP attribute object

        theNames.forEach(a => {
            out += `<option value="${a.name}">${a.name}</option>`;
        });
        return out;
    },


}
