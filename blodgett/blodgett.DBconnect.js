/*
==========================================================================

 * Created by tim on 2019-05-25.
 
 
 ==========================================================================
blodgett.DBconnect in blodgett

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


blodgett.DBConnect = {
    sendCommand: async function (iCommands) {
        let theBody = new FormData();
        for (let key in iCommands) {
            if (iCommands.hasOwnProperty(key)) {
                theBody.append(key, iCommands[key])
            }
        }
        theBody.append("whence", blodgett.whence);

        let theRequest = new Request(
            blodgett.constants.kBasePhpURL[blodgett.whence],
            {method: 'POST', body: theBody, headers: new Headers()}
        );

        try {
            const theResult = await fetch(theRequest);
            if (theResult.ok) {
                return theResult.json();
            } else {
                console.error("sendCommand bad result error: " + theResult.statusText);
            }
        } catch (msg) {
            console.log('fetch error in DBconnect.sendCommand(): ' + msg);
        }
    },

    getCasesFromDB: async function (iAtts) {

        //  Suppose the date in the picker is Sept 10 1987

        // const tNumberOfDays = document.getElementById("numberOfDaysControl").value;
        const d0 = blodgett.state.currentStartDate; //  set in UI on change of date. ISO string. "1987-09-10"
        const d0_Date = new Date(d0);       //  This is the Date of "1987-09-10T00:00Z" which is of course on 1987-09-09
        const d0_milliseconds = d0_Date.getTime() + 60000 * d0_Date.getTimezoneOffset(); // the ms for our local midnight

        const tDt = (blodgett.state.numberOfDays - 1) * 86400 * 1000;     //  milliseconds in a day. ms for Local midnight.
        const d1_Date = new Date(d0_milliseconds + tDt); // the Date at our local midnight
        const d1 = d1_Date.ISO_8601_string();       //  the ISO day-only string for that date.

        let tAttNames = ["Date", "dayDec", "Hour", "Minute"];

        iAtts.forEach(a => {
            tAttNames.push(a.queryName);
        });

        try {
            const theCommands = {
                "c": "getCases",
                "atts": tAttNames.join(','),  //  iAttNames is an array, we need a comma-separated string
                "interval" : blodgett.state.intervalString,
                "d0": d0,
                "d1": d1
            };
            return await blodgett.DBConnect.sendCommand(theCommands);
        } catch (msg) {
            console.log('getCasesFromDB() error: ' + msg);
            return null;
        }

    }
};
