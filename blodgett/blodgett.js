/*
==========================================================================

 * Created by tim on 2019-05-25.
 
 
 ==========================================================================
blodgett in blodgett

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

/*
See the wiki for how we handle the data, especially time attributes: https://github.com/eepsmedia/plugins/wiki/dataInPortals


 */

let blodgett = {

    constants : {
        version : "000c",
        kDefaultDate : "2017-09-10",
        kBlodgettDataSetName : "blodgett",
        kBlodgettCollectionName : "blodgett",
        kBlodgettDataSetTitle : "forest data",
        kBasePhpURL: {
            local:  "http://localhost:8888/plugins/blodgett/blodgett.php",
            xyz:    "https://codap.xyz/plugins/blodgett/blodgett.php"
        }
    },

    state : {
    },

    freshState : {
        sampleNumber : 0
    },

    attributeNameTranslator : {},

    initialize : async function() {
        await blodgett.CODAPconnect.initialize();
        blodgett.variables.forEach( v => {
            blodgett.attributeNameTranslator[v.queryName] = v.screenName;
        });
        document.getElementById("dateControl").value = blodgett.constants.kDefaultDate;
        blodgett.ui.updateUI();
    },

    getDataButtonPressed : async function () {
        let tAtts = blodgett.ui.getArrayOfChosenAttributes();

        const tDBCases = await blodgett.DBConnect.getCasesFromDB( tAtts );

        if (tDBCases.length > 0) {
            const tCODAPCases = this.convertDataFromDBToCODAP( tDBCases );
            await blodgett.CODAPconnect.saveCasesToCODAP(tCODAPCases);
            blodgett.ui.bumpCalendar();
        }
    },

    convertDataFromDBToCODAP : function( iData ) {
        blodgett.state.sampleNumber++;
        let tCODAPCases = [];

        //  loop over each case in the data
        iData.forEach(c => {     //  c is a database case, an OBJECT
            //  compute when
            const dateOnly = new Date(c.Date);
            const adjustedParsedDateTime =
                dateOnly.getTime() +
                60000 * dateOnly.getTimezoneOffset() +
                3600000 * c.Hour +
                60000 * c.Minute;
            const adjustedDateTime = new Date(adjustedParsedDateTime);
            const stringDate = adjustedDateTime.ISO_8601_string();
            const adjustedHours = adjustedDateTime.getHours();
            const adjustedMinutes = adjustedDateTime.getMinutes();

            let out = {
                "sample" : blodgett.state.sampleNumber,
                "when" : adjustedDateTime,
                "stringDate" : adjustedDateTime.toDateString(),
                "hour" : adjustedHours + adjustedMinutes/60
            };
            for (const key in c) {
                if (c.hasOwnProperty(key)) {
                    out[blodgett.attributeNameTranslator[key]] = c[key];
                }
            }
            tCODAPCases.push(out);
        });
        return tCODAPCases;
    },

    /**
     * The blodgett UI object
     */
    ui : {

        bumpCalendar : function() {
            const theCalendar = document.getElementById("dateControl");
            const theCurrentDate = new Date(theCalendar.value);
            const newDate = theCurrentDate.addDays( blodgett.state.numberOfDays  );
            theCalendar.valueAsDate = newDate;
            this.updateUI();
        },

        getArrayOfChosenAttributes : function() {   //  todo: really implement
            let out = [];
            blodgett.variables.forEach( v => {
                if (v.choosable) {
                    out.push(v)
                }
            });
            return out;
        },

        updateUI : function () {
            blodgett.state.currentStartDate = document.getElementById("dateControl").value;      //  just the string
            blodgett.state.numberOfDays = document.getElementById("numberOfDaysControl").value;
            blodgett.state.intervalString = document.querySelector("input[name='interval']:checked").value;

            const tNewRequestText = "starting on " + blodgett.state.currentStartDate
                + " for " + blodgett.state.numberOfDays + " day" + (blodgett.state.numberOfDays == 1 ? "" : "s");
            const tDataRequestText = document.getElementById("downloadDataRequestText");
            tDataRequestText.textContent = tNewRequestText;
        }
    }
};

Date.prototype.addDays = function(days) {
    let dayNumber = this.getDate();
    dayNumber += Number(days);
    const out = new Date(
        this.getFullYear(),
        this.getMonth(),
        dayNumber,
        this.getHours(),
        this.getMinutes(),
        this.getSeconds()
    );
    return out;
};
