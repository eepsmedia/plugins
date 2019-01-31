/*
==========================================================================

 * Created by tim on 2019-01-22.
 
 
 ==========================================================================
snapper in snapper

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

let snapper = {

    state: {
        dcName: null,
        topCollectionName : null,
        resultsDataContextName: null,
        collectedAttrs : [],
        theSliders : [],        //  a list of objects, each of which has id, name, and title.
        OKtoCollect : false,
        reasonYouCant : "you need to set up a results dataset",
        sliderSuffix : "_values"
    },

    constants: {
        version: "000"
    },

    domObjects: {
        dataContextMenu: null,
        resultsDataContextNameBox: null,
        autoCollect : null
    },

    initialize: async function () {

        this.domObjects.dataContextMenu = document.getElementById('dataContextMenu');
        this.domObjects.resultsDataContextNameBox = document.getElementById('resultsDataContextTextBox');
        this.domObjects.statusDiv = document.getElementById('status');
        this.domObjects.autoCollect = document.getElementById('autoCollectCheckbox');

        await snapper.connect.initialize();
        await snapper.structure.constructDataContextMenu();
        await snapper.structure.setDataContext();

        snapper.state.resultsDataContextName = snapper.domObjects.resultsDataContextNameBox.value;
        this.setStatus({ok: false, text : "you need to set up a results dataset"});
    },

    setStatus : function(iStatus) {
        snapper.state.OKtoCollect = iStatus.ok;

        let theText = "You're ready to collect data";
        if (!snapper.state.OKtoCollect) {
            snapper.state.reasonYouCant = iStatus.text;
            theText = "<strong>NOT READY: </strong>" + snapper.state.reasonYouCant;
        }
        this.domObjects.statusDiv.innerHTML = theText;
    },

    doSetup: async function () {
        snapper.state.resultsDataContextName = snapper.domObjects.resultsDataContextNameBox.value;
        console.log("Setting up for results in " + snapper.state.resultsDataContextName);
        await snapper.structure.setDataContext();

        if (snapper.state.OKtoCollect) {
            await snapper.connect.makeResultsDataContext();
        }
    },

    sliderChanged : async function(iMessage) {
        if (snapper.domObjects.autoCollect.checked) {
            console.log("Slider moved! " + JSON.stringify(iMessage));
            await snapper.structure.getNewCaseValues();
        }
    }
};