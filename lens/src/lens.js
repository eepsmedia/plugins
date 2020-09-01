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

    currentZIPCollectionName : "cases",

    currentZIPSet : new Set(),

    currentTagValue : "foo",

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

        //  get all the information on this dataset
        const tInfo = await connect.refreshDatasetInfoFor(iName);
        if (tInfo.name) {
            console.log(`∂   changing dataset to [${iName}]`);
            this.state.datasetInfo = tInfo;
            lens_ui.attributeCheckboxes.install();

            //  now with a new dataset, we need to set up notifications and get all the attributes
            connect.setUpOtherNotifications();

            this.loadCurrentData(iName);

            connect.makeFilterAttributeIn(iName);
            connect.makeTagsAttributeIn(iName);

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
        const theCases = await connect.getAllCasesFrom(iDatasetName);
        this.state.data = theCases;       //  fresh!
    },

    //  handlers for controls ----------------

    handleTextChange : function( ) {
        const placeType = document.querySelector("input[name='place-type']:checked").value;
        const theText = document.getElementById("place-input").value;
        if (placeType === 'county') {
            lens.currentZIPSet = zip.findZipsFromString(theText, true);
        } else {
            lens.currentZIPSet = zip.findZipsFromString(theText, false, true, true);
        }
        lens_ui.displayPlaces(lens.currentZIPSet, theText); //  set the text in the box
        this.applySelection(connect.constants.kOnly);       //  set the COAP selection to match
    },

    handleTagValueChange : function() {
        this.currentTagValue = document.getElementById("tag-value-input").value;
    },

    handlePlaceTypeChoiceChange : function() {
        this.handleTextChange();
    },


    applySelection : function(iMode) {
        lens.state.zips = connect.selectByZIP(Array.from(lens.currentZIPSet), iMode);    //  has modes
    },


    /**
     * TAG the selection with the value in the tag box
     * @param iMode
     */
    setTagValuesToSelection : function(iMode) {
        //  lens.state.zips = connect.selectByZIP(Array.from(lens.currentZIPSet), iMode);    //  has modes

        connect.tagByZIP(iMode);
    },

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
        datasetInfo: "",
        data : {},      //  keyed by indexAttribute (zip code)
        zips : [],      //  currently-focused-on zip RECORDS
    },

    constants: {
        version: "000c",
        indexAttributeName : "ZIP",
        filterAttributeName : "ƒƒilter",
        tagsAttributeName : "Tags",
        noGroupString : "none",

    },

}
