/*
==========================================================================

 * Created by tim on 9/29/20.
 
 
 ==========================================================================
choosy in choosy

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


/* global codapInterface        */

const choosy = {
    state : {},             //  stores the dataset name. To be saved.
    datasetInfo : {},       //  from the API, has name, collections, attribute names. Do not save!
    notificationsAreSetUp : null,    //  the name of the ds that we used to set up notifications
    theData : {},           //  case-ID-keyed object containing objects with non-formula values for all cases
    selectedCaseIDs : [],   //  the case IDs of the selected cases

    currentTagValue : "foo",

    initialize : async function() {
        await connect.initialize();
        choosy.state = await codapInterface.getInteractiveState();

        //  Note: if there is only one dataset, the state.datasetName gets set to that DS
        //  Therefore _ui.initialize() must follow the call to getInteractiveState.
        try {
            console.log(`choosy --- ui.initialize --- try`);
            await choosy_ui.initialize();
        } catch (msg) {
            console.log(`choosy --- ui.initialize --- catch [${msg}]`);
        }

        //  Do we have a DS name?

        if (choosy.state.datasetName) {
            console.log(`choosy --- initialize --- about to set to [${choosy.state.datasetName}]`);
            try {
                await choosy.setTargetDataset();
            } catch (e) {
                console.log(`choosy --- initialize.setTargetDatabase --- catch [${e}]`);
            }
        }

        if (Object.keys(choosy.state).length === 0 && choosy.state.constructor === Object) {
            await codapInterface.updateInteractiveState(choosy.freshState);
            console.log("choosy: getting a fresh state");
        }
    },

    freshState: function () {
        console.log(`called choosy.freshState()`);
        return {
            datasetName: "",
        };
    },

    refresh : async function() {
        choosy.notificationsAreSetUp = false;
        choosy_ui.initialize();
        await choosy.setTargetDataset();
    },

    setTargetDataset : async function() {
        if (this.state.datasetName) {
            this.setTargetDatasetByName(this.state.datasetName);
        } else {
            console.log(`∂  tried to set a dataset without a dataset name`);
        }
    },

    setTargetDatasetByName: async function (iName) {

        //  get all the information on this dataset
        if (iName) {
            choosy.state.datasetName = iName;
            await choosy_ui.update();

            if (this.datasetInfo) {
                console.log(`∂   loaded [${iName}] structure`);
                await this.loadCurrentData(iName);
                //  connect.makeTagsAttributeIn(iName);

                //  now with a new dataset, we need to set up notifications and get all the attributes
                if (!choosy.notificationsAreSetUp) {
                    choosy.notificationsAreSetUp = notify.setUpNotifications();
                }
            }

        } else {
            console.log(`?   called setTargetDatasetByName without a dataset name`);
        }
    },

    loadCurrentData: async function (iDatasetName) {
        const theCases = await connect.getAllCasesFrom(iDatasetName);
        this.theData = theCases;       //  fresh!
    },

    getLastCollectionName : function() {
        //  get the name of the last collection...
        const colls = this.datasetInfo.collections;
        const nCollections = colls.length;
        const lastCollName = colls[nCollections - 1].name;
        return lastCollName;
    },

    getChoosyAttributeAndCollectionByAttributeName : function (iName) {
        for (let i = 0; i < choosy.datasetInfo.collections.length; i++) {       //  loop over collections
            const coll = choosy.datasetInfo.collections[i];
            for (let j = 0; j < coll.attrs.length; j++) {       //  loop over attributes within collection
                const att = coll.attrs[j];
                if (att.name === iName) {
                    return {
                        att : att,
                        coll : coll
                    }
                }
            }
        }
        return null;
    },

    addAttributeToClump : async function(iAttName, iClumpName) {
        await connect.setAttributeClump(choosy.state.datasetName, iAttName, iClumpName);
        await choosy_ui.update();
    },

    /**
     * return the id for an attribute stripe, e.g., "att-Age"
     * @param iName
     * @returns {string}
     */
    attributeStripeID(iName) {
        return `att-${iName}`;
    },

    /**
     * Some attributes have changed. We need to update their entries in choosy.datasetInfo AND
     * update their appearance in the UI.
     *
     * Why not just hide or show them (in CODAP) and then read everything from CODAP?
     * Because then that invokes a re-read and redraw of everything, which would be fine
     * except that when we hide or show a clump, we get a notification and a DOM event for every. Frigging. Attribute.
     *
     * Also, we get ontoggle events in the <detail> clump header(s) because we restore their open/closed state.
     * So this avoids the redraw and all its attendant peril.
     *
     * @param iAttArray
     */

/*
    updateAttributes: async function(iAttArray) {
        //  update choosy.datasetInfo. This is our internal list
        const theDSName = choosy.state.datasetName;
        if (theDSName) {
            this.datasetInfo = await connect.refreshDatasetInfoFor(theDSName);
            //  await this.processDatasetInfoForAttributeClumps(choosy.datasetInfo); //  get clumps and add the collection

            //  now go fix the DOM.
            iAttArray.forEach(att => {

                const newElement = document.createElement('div');
                newElement.id = choosy.attributeStripeID(att.name);
                newElement.classList.add("attribute-control-stripe");

                newElement.innerHTML = choosy_ui.attributeControls.makeOneAttCode(att);

                const oldElement = document.getElementById(newElement.id);
                oldElement.replaceWith(newElement);

            })
        } else {
            Swal.fire({icon : "error", text : "No dataset name in updateAttribute"});
        }
    },
*/

    /**
     * Parse the attribute "clumps" indicated by bracketed clump names in the attribute descriptions.
     *
     * For example, `{work}Percent of people working in agriculture`
     * puts the attribute in a clump called "work" and then strips that tag from the description.
     *
     * Does this by adding a `clump` key to the attribute data --- which does not exist in CODAP.
     *
     * @param theInfo   the information on all collections and attributes
     */
    processDatasetInfoForAttributeClumps: function (theInfo) {

        const whichWayToClump = choosy_ui.getClumpingStrategy();

        for (let clump in choosy_ui.clumpRecord) {
            let theRecord = choosy_ui.clumpRecord[clump];
            theRecord["attrs"] = [];
        }

        theInfo.collections.forEach(coll => {
            coll.attrs.forEach(att => {
                let theDescription = att.description;
                let theClump = choosy.constants.noClumpString;
                const leftB = theDescription.indexOf("{");
                const rightB = theDescription.indexOf("}");
                if (rightB > leftB) {
                    theClump = theDescription.substring(leftB + 1, rightB);
                    att["description"] = theDescription.substring(rightB + 1);  //  strip the bracketed clump name from the description
                }

                //  if we're clumping "byLevel", use the collection name as the clump name
                const theGroupName =  (whichWayToClump === "byLevel") ? coll.name : theClump;   //  todo: really should be title

                //  change the `att` field to include fields for `clump` and `collection`
                att["clump"] = theGroupName
                att["collection"] = coll.name;  //  need this as part of the resource so we can change hidden

                //  this is where choosy_ui.clumpRecord gets set!
                //  add an element to the object for this clump if it's not there already

                if (!choosy_ui.clumpRecord[theGroupName]) {
                    choosy_ui.clumpRecord[theGroupName] = {open : true, attrs : [], mode : ""};
                }
                choosy_ui.clumpRecord[theGroupName].attrs.push(att.name);
                choosy_ui.clumpRecord[theGroupName].mode = whichWayToClump;
            })
        })
    },

    handlers : {

        changeSearchText : async function () {

        },

        /**
         * todo: do we need this? We call it but we don't need it, right?
         * @returns {Promise<void>}
         */
/*
        changeTagValue : async function () {
            this.currentTagValue = document.getElementById("tag-value-input").value;
            console.log(`    tag is now ${this.currentTagValue}`);
        },
*/

        changeTagMode : function() {
            choosy_ui.update();
        },

        applyTagToSelection : async function (iMode) {
            //  lens.state.datasetInfo =  await connect.refreshDatasetInfoFor(lens.state.datasetInfo.name);
            await connect.tagging.tagSelectedCases(iMode);
        },

        applyBinaryTags : async function() {
            await connect.tagging.doBinaryTag();
        },

        applyRandomTags : async function() {
            await connect.tagging.doRandomTag();
        },

        clearAllTags : async function() {
            const theTagName = choosy.constants.tagsAttributeName;
            await connect.tagging.clearAllTagsFrom(theTagName);
        },

        /**
         * Handles user press of a visibility button for a single attribute (not a clump)
         *
         * @param iAttName
         * @param iHidden       are we hiding this?
         * @returns {Promise<void>}
         */
        oneAttributeVisibilityButton: async function(iAttName, iHidden) {
            await connect.showHideAttribute(choosy.state.datasetName, iAttName, !iHidden);
            choosy_ui.update();

        },

        clumpVisibilityButton : async function(event) {

            event.stopPropagation();
            event.preventDefault();

            const theID = event.target.id;
            const theType = theID.substring(0,4);
            const theClumpName = theID.substring(5);
            const toHide = theType === "hide";

            console.log(`${toHide ? "Hiding" : "Showing"} all attributes in [${theClumpName}]`);

            let theAttNames = [];

            choosy.datasetInfo.collections.forEach(coll => {
                coll.attrs.forEach( att => {
                    if (att.clump === theClumpName) {
                        theAttNames.push(att.name);    //  collect all these names
                    }
                })
            })
            const goodAttributes = await connect.showHideAttributeList(choosy.state.datasetName, theAttNames, toHide);
            //  choosy.updateAttributes(goodAttributes);
            choosy_ui.update();
        },

        toggleDetail : function(event) {
            const theClumpName = event.target.id.substring(8);

            console.log(`clump toggle! ${theClumpName}`);
            document.getElementById("clump-name-text-input").value = theClumpName;
           // choosy_ui.setCurrentClumpTo(theClumpName);
        },

        //  todo: decide if we really need this
        handleSelectionChangeFromCODAP: async function () {
            choosy.selectedCaseIDs = await connect.tagging.getCODAPSelectedCaseIDs();
            console.log(`    ${choosy.selectedCaseIDs.length} selected case(s)`);
            choosy_ui.update();
        },

    },

    utilities : {
        stringFractionDecimalOrPercentToNumber : function(iString) {
            let out = {theNumber : 0, theString : '0'};
            let theNumber = 0;
            let theString = "";

            const wherePercent = iString.indexOf("%");
            const whereSlash = iString.indexOf("/");
            if (wherePercent !== -1) {
                const thePercentage = parseFloat(iString.substring(0, wherePercent));
                theString = `${thePercentage}%`;
                theNumber = thePercentage/100.0;
            } else if (whereSlash !== -1) {
                const beforeSlash = iString.substring(0, whereSlash);
                const afterSlash = iString.substring(whereSlash + 1);
                const theNumerator = parseFloat(beforeSlash);
                const theDenominator = parseFloat(afterSlash);
                theNumber = theNumerator / theDenominator;
                theString = `${theNumerator}/${theDenominator}`;
            } else {
                theNumber = parseFloat(iString);
                theString = `${theNumber}`;
            }

            if (!isNaN(theNumber)) {
                return {theNumber: theNumber, theString: theString};
            } else {
                return {theNumber: 0, theString: ""};
            }
        },
    },

    constants : {
        version : '2021e',
        datasetSummaryEL : 'summaryInfo',
        selectionStatusElementID : 'selection-status',
        tagValueElementID : "tag-value-input",
        tagValueSelectedElementID : "tag-value-selected",
        tagValueNotSelectedElementID : "tag-value-not-selected",
        tagValueGroupAElementID : "tag-value-group-A",
        tagValueGroupBElementID : "tag-value-group-B",
        tagPercentageElementID : "tag-percentage",
        tagsAttributeName : "Tag",
        noClumpString : "none",
    }
}