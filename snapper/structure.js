/*
==========================================================================

 * Created by tim on 2019-01-23.
 
 
 ==========================================================================
structure in snapper

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

snapper.structure = {

    getDataContextNameFromDOM : function() {
        const e = snapper.domObjects.dataContextMenu;
        return e.options[e.selectedIndex].value
    },

    constructDataContextMenu : async function() {
        snapper.domObjects.dataContextMenu.innerHTML =
            await snapper.connect.makeDataContextMenuGuts(snapper.state.dcName);

        console.log("Fresh DC menu with <" + this.getDataContextNameFromDOM() + ">  selected.");
    },

    setDataContext : async function( ) {
        snapper.state.dcName = this.getDataContextNameFromDOM();    //  synchronous
        console.log("Setting data context to " + snapper.state.dcName);

        await this.setCollectionAndAttributes();
    },

    setCollectionAndAttributes : async function() {

        //  first, get the data context
        //  it will have an array of collections, each of which has an array of attributes

        const theResource = "dataContext[" + snapper.state.dcName + "]"; //  ".collectionList";
        let message = {
            "action" : "get",
            "resource" : theResource
        };
        const tGetDataContextResult = await codapInterface.sendRequest(message);

        if (tGetDataContextResult.values.collections.length > 0) {

            const tTopCollection = tGetDataContextResult.values.collections[0];
            snapper.state.collectedAttrs = tTopCollection.attrs;    //  get attributes for top collection

            if (snapper.state.collectedAttrs.length > 0) {

                snapper.state.topCollectionName = tGetDataContextResult.values.collections[0].name;

                //  get all cases in the top collection to see if there are more than one.
                const aMessage = {
                    "action": "get",
                    "resource": "dataContext[" + snapper.state.dcName + "].collection["
                        + snapper.state.topCollectionName + "].allCases"
                };
                const tAllCasesResult = await codapInterface.sendRequest(aMessage);
                if (tAllCasesResult.values.cases.length > 1) {
                    snapper.setStatus({
                        ok: false,
                        text: "you can't have more than one case in your top-level collection"
                    });
                } else {
                    snapper.setStatus({ok: true});
                }


                console.log(snapper.state.topCollectionName + " -- Cases: " + JSON.stringify(tAllCasesResult));
            } else {
                //  no attributes, for some reason
                snapper.setStatus({
                    ok: false,
                    text: "you need an attribute in your top-level collection"
                });

            }

        } else {
            snapper.setStatus({ok: false, text: "you have to have an attribute to collect"});
        }
    },

    getNewCaseValues : async function() {

        //  get all cases from the top collection
        const aMessage = {
            "action": "get",
            "resource": "dataContext[" + snapper.state.dcName + "].collection[" +
                snapper.state.topCollectionName  + "].allCases"
        };
        const tAllCasesResult = await codapInterface.sendRequest(aMessage);
        let values = tAllCasesResult.values.cases[0].case.values;    //  an object containing the values. Assume 1 case.

        //  now get the sliders
        for (const s of snapper.state.theSliders) {
            values[s.title + snapper.state.sliderSuffix] = await snapper.connect.getSliderValue(s.id);
        }

        snapper.connect.emitOneCase( values );
    }
};