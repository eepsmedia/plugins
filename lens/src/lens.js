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

    /**
     * User has changed the text in the place search box.
     *
     */
    handleTextChange : function( ) {
        const placeType = document.querySelector("input[name='place-type']:checked").value;
        const theText = document.getElementById("place-input").value;

        //  here we set `lens.currentZIPset`, which contains all the data for all ZIPs
        //  as found in `lens.state.data`

        if (placeType === 'county') {
            lens.currentZIPSet = zip.findZIPsFromString(theText, true);
        } else {
            lens.currentZIPSet = zip.findZIPsFromString(theText, false, true, true, true);
        }
        lens_ui.displayPlaces(lens.currentZIPSet, theText); //  set the text in the box
        this.applySelection(connect.constants.kOnly);       //  set the CODAP selection to match
    },

    handleTagValueChange : function() {
        this.currentTagValue = document.getElementById("tag-value-input").value;
    },

    handlePlaceTypeChoiceChange : function() {
        this.handleTextChange();
    },

    applySelection : async function(iMode) {
        lens.state.zips = await connect.selectByZIP(Array.from(lens.currentZIPSet), iMode);    //  has modes
    },


    /**
     * TAG the selection with the value in the tag box
     * @param iMode
     */
    setTagValuesToSelection : async function(iMode) {
        //  lens.state.zips = connect.selectByZIP(Array.from(lens.currentZIPSet), iMode);    //  has modes

        lens.state.datasetInfo =  await connect.refreshDatasetInfoFor(lens.state.datasetInfo.name);
        await connect.tagByZIP(iMode);
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

    /**
     * We have been notified of a change in the number of data contexts.
     * Re-initialize so that we have to choose a context if there is more than one.
     * @param mess
     */
    handleDatasetCountChange: function (mess) {
        console.log(`∂   changed number of data contexts. Message [${JSON.stringify(mess)}]`);
        lens_ui.initialize();
    },

    handleAttributeChange: function (mess) {
        console.log(`∂   changed attribute. Message [${JSON.stringify(mess)}]`);

    },

    /**
     * User has changed the selection in CODAP, e.g., by clicking in the map.
     * We change the display and selection records in the plugin to match.
     *
     * @param iMessage  the message that comes from the notification.
     */
    handleSelectionChangeFromCODAP: async function(iMessage) {
        console.log(`ß   lens.handleSelectionChange`);

        if (Array.isArray(iMessage)) {
            Swal.fire({
                icon : "warning",
                title: "Mysterious occurrence",
                text: "Handling selection change, the message is unexpectedly an array."
            });
        } else {
            if (iMessage.values && iMessage.values.operation === "selectCases") {
                if (iMessage.values.result.success) {
                    const theSelectedIDs = await connect.getCODAPSelectedCaseIDs();
                    lens.currentZIPSet = lens.processCaseIDsToMakeZIPSet(theSelectedIDs);
                    const theText = "user selection";

                    lens_ui.displayPlaces(lens.currentZIPSet, theText); //  set the text in the box
                }
            }
        }

    },

    /**
     * Helper function solely to get a list (a `SET`) of ZIPs of selected cases.
     * This is used when the user selects cases by hand, in order to display a text listing describing
     * the selection by zip, city, and county.
     *
     * We will try NOT to use the list to re-select these cases!
     *
     * Plan: use `lens.state.data` to get the ZIPs from the IDs.
     * Then use the city-county-zip information (via `zip-model.js`) to construct the zip set,
     * which we will ship back to be `lens.currentZIPSet`.
     *
     * @param iCaseIDs
     */
    processCaseIDsToMakeZIPSet: function(iCaseIDs) {

        let theZIPs = [];

        for (const z in lens.state.data) {
            if (iCaseIDs.includes(lens.state.data[z].id)) {
                theZIPs.push(lens.state.data[z].values.ZIP);
            }
        }
        return zip.findRecordsFromArrayOfZIPs(theZIPs);
    },

    //  not functions ------------------------------------

    state: {
        datasetInfo: "",
        data : {},      //  keyed by indexAttribute (zip code)
        zips : [],      //  currently-focused-on zip RECORDS
    },

    constants: {
        version: "000d",
        indexAttributeName : "ZIP",
        filterAttributeName : "ƒƒilter",
        tagsAttributeName : "Tags",
        noGroupString : "none",

    },

}
