/*
==========================================================================

 * Created by tim on 8/23/19.
 
 
 ==========================================================================
noaa.ui in noaa-cdo

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

/**
 * This solitaire copes with user interface calculations and processes.
 * @type {{getCheckedDataTypes: (function(): []), getCheckedStations: (function(): []), makeBoxes: (function(*, *): string), initialize: noaa.ui.initialize, clearStations: noaa.ui.clearStations}}
 */
noaa.ui = {

    /**
     * Initialize the UI.
     * Called by noaa.initialize()
     */
    initialize : function() {
        document.getElementById("stationUI").innerHTML = this.makeBoxes(noaa.stations, noaa.defaultStations);
        document.getElementById("dataTypeUI").innerHTML = this.makeBoxes(noaa.dataTypes, noaa.defaultDataTypes);
    },

    /**
     * Which station boxes have been checked?
     * @returns {[]}    An array of the station IDs. See noaaStations.js to see what we mean.
     */
    getCheckedStations : function() {
        let out = [];
        for (const theKey in noaa.stations) {
            if (document.getElementById(theKey).checked) {
                out.push(theKey);
            }
        }
        return out;
    },

    /**
     * Clear the checkmarks in all the station boxes
     */
    clearStations : function() {
        for (const theKey in noaa.stations) {
            const theBox = document.getElementById(theKey);
            theBox.checked = false;
        }

    },

    /**
     * Get a list of the types of data to be emitted
     * @returns {[]}    Array of the data type IDs (zB: `tAvg`). See noaaDataTypes.js.
     */
    getCheckedDataTypes : function() {
        let out = [];
        for (const theKey in noaa.dataTypes) {
            if (document.getElementById(theKey).checked) {
                out.push(theKey);
            }
        }
        return out;
    },

    /**
     * Construct the HTML for a set of checkboxes
     * @param iChoices  an object, one for each item. Thing.name is to be the label
     * @param iDefaults an object with corresponding keys; all members are checked by default
     * @returns {string}
     */
    makeBoxes : function(iChoices, iDefaults) {
        let out = "";

        for (const theKey in iChoices) {
            const theName = iChoices[theKey].name;
            const isCheckedClause = (iDefaults.indexOf(theKey) === -1) ? "" : " checked";
            const choiceGuts = "<input type='checkbox' id='"
                + theKey + "'" +  isCheckedClause + ">" +
                "<label for='" + theKey + "'>" + theName + "</label>";
            out += "<div class='choiceDiv'>" + choiceGuts + "</div>";
        }
        return out;
    },

};