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
        version : "000a",
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
        }
    },

    convertDataFromDBToCODAP : function( iData ) {
        blodgett.state.sampleNumber++;
        let tCODAPCases = [];

        //  loop over each case in the data
        iData.forEach(c => {     //  c is a database case, an OBJECT
            //  compute when
            const dateOnly = new Date(c.Date);
            const adjustedParsedDateTime = dateOnly.getTime() +
                60000 * dateOnly.getTimezoneOffset() +
                3600000 * c.Hour +
                60000 * c.Minute;
            const adjustedDateTime = new Date(adjustedParsedDateTime);
            const stringDate = adjustedDateTime.ISO_8601_string();

            let out = {
                "sample" : blodgett.state.sampleNumber,
                "when" : adjustedDateTime,
                "stringDate" : adjustedDateTime.toDateString(),
                "hour" : c.Hour + c.Minute/60
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
            const tCalendar = document.getElementById("dateControl");
            blodgett.state.currentStartDate = tCalendar.value;      //  just the string

            const tNewRequestText = "collect data starting on " + blodgett.state.currentStartDate;
            const tDataRequestText = document.getElementById("downloadDataRequestText");
            tDataRequestText.textContent = tNewRequestText;
        }
    }
};