/*
==========================================================================

 * Created by tim on 8/25/19.
 
 
 ==========================================================================
spreader.ui in spreader

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

spreader.ui = {

    typeMenu: null, valueMenu: null, unitsMenu: null,

    initialize: async function () {
        this.typeMenu = document.getElementById("chooseType");
        this.valueMenu = document.getElementById("chooseValue");
        this.unitsMenu = document.getElementById("chooseUnits");

        await this.makeDataSetMenu();
    },

    makeDataSetMenu: async function () {
        let menuGuts = "";
        const theList = await spreader.connect.getListOfDataSetNames();

        if (theList.length > 0) {
            spreader.pickDataSet(theList[0]);        //  default to the first one in thelist
            theList.forEach(dsName => {
                menuGuts += ("<option value='" + dsName + "'>" + dsName + "</option>");
            })
        } else {
            menuGuts = "<option>No datasets found</option>";
        }
        document.getElementById("chooseTidyDS").innerHTML = menuGuts;
    },

    /**
     * Given the result from a get data set (a global, but passed in),
     * construct menus for the attributes in the lowest level of its hierarchy
     *
     * @param iResult
     * @returns {Promise<void>}
     */
    makeAttributeMenus: async function (iResult) {
        let menuGuts = "";
        let tHierarchicalListOfAttributeNames = [];

        if (iResult.success) {
            iResult.values.collections.forEach((coll) => {
                const collectionAttList = [];
                coll.attrs.forEach((attr) => {
                    collectionAttList.push(attr.name);
                });
                tHierarchicalListOfAttributeNames.push(collectionAttList);
            });
        }

        const nCollections = tHierarchicalListOfAttributeNames.length;

        if (nCollections > 0) {
            menuGuts = "<option> -- pick an attribute -- </option>";
            tHierarchicalListOfAttributeNames[nCollections - 1].forEach((attrName) => {
                menuGuts += ("<option value='" + attrName + "'>" + attrName + "</option>");
            })
        } else {
            menuGuts = "<option>No attributes found</option>";
        }
        this.typeMenu.innerHTML = menuGuts;
        this.valueMenu.innerHTML = menuGuts;
        this.unitsMenu.innerHTML = menuGuts;
    },

    /**
     * User has picked an attribute from a menu.
     * Set the appropriate state global.
     * @param iTag      which attribute is it? "value", "units", "type"
     * @param theMenu   the actual menu in the DOM, needed to get its value.
     */
    processAttributeMenuChoice: function (iTag, theMenu) {
        switch (iTag) {
            case "type":
                spreader.state.typeAttribute = theMenu.value;
                break;
            case "value":
                spreader.state.valueAttribute = theMenu.value;
                break;
            case "units":
                spreader.state.unitsAttribute = theMenu.value;
                break;
        }
    },
};