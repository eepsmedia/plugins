/*
==========================================================================

 * Created by tim on 8/22/19.
 
 
 ==========================================================================
noaa-cdo in noaa-cdo

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

let noaa;

noaa = {

    /**
     * Initialize the data and call other initializers.
     */
    initialize: function () {
        noaa.state.startDate = noaa.constants.defaultStart;
        noaa.state.endDate = noaa.constants.defaultEnd;

        noaa.connect.initialize();  //  initialize the connection to CODAP
        noaa.ui.initialize();   //  initialize UI elements such as checkboxes
    },

    dataValues : [],    //  the data we get from the NOAA server

    state : {
        startDate : null,
        endDate : null,
        database : null,
    },

    /**
     * Called when the user presses the button to get data
     *
     * @returns {Promise<void>}
     */
    doGet: async function () {
        let theText = "Default text";
        let nRecords = 0;

        /**
         * Determine which dataset (daily, monthly...) the user wants. The result determines how we decode the data.
         */
        noaa.state.database  = document.querySelector("input[name='frequencyControl']:checked").value;

        const theCheckedStations = noaa.ui.getCheckedStations();    //  get array of checked stations IDs
        if (theCheckedStations.length < 1) {    //  validate: do we have a station?
            this.setResultText("Need at least one station!");
            return;
        }

        /**
         * Assemble the URL to be passed to NOAA in order to get a response.
         */
        const tDatasetIDClause = "&datasetid=" + noaa.state.database;
        const tStationIDClause = "&stationid=" + theCheckedStations.join("&stationid=");
        const tDataTypeIDClause = "&datatypeid=" + noaa.ui.getCheckedDataTypes().join("&datatypeid=");
        const tDateClause = "&startdate=" + noaa.state.startDate + "&enddate=" + noaa.state.endDate;

        let tURL = noaa.constants.noaaBaseURL
            + "data?limit=" + noaa.constants.recordCountLimit
            + tDatasetIDClause + tStationIDClause
            + tDataTypeIDClause + tDateClause;

        //  Assemble a "fetch" request
        let tHeaders = new Headers();
        tHeaders.append("token", noaa.constants.noaaToken);     //  need this for the NOAA API
        const tRequest = new Request(tURL, {headers: tHeaders});

        let resultText = "Request sent!";
        noaa.dataValues = [];
        this.setResultText(resultText);     //  Make the text appear on the screen
        try {
            /**
             * Actually issue the request to fetch data from NOAA
             * @type {Response}     The fetch result, which we will render as JSON
             */
            const tResult = await fetch(tRequest);
            if (tResult.ok) {
                const theJSON = await tResult.json();
                theJSON.results.forEach( (r) => {   //  process each result record
                    nRecords++;
                    theText += "<br>" + JSON.stringify(r);      //  not used :) Useful for debugging.
                    const aValue = noaa.convertNOAAtoValue(r); // convert to a CODAP-style object
                    noaa.dataValues.push(aValue); //    stuff it into the array
                });
                noaa.connect.createNOAAItems(noaa.dataValues);  //  Make the CODAP records
                resultText =  "Retrieved " + nRecords + " observations";    //  create informative text
            } else {
                console.error("noaa.doGet() error: " + tResult.statusText);
                resultText = "Error. No records retrieved.";
            }
        } catch (msg) {
            console.log('fetch error: ' + msg);
            theText = msg;
        }

        this.setResultText(resultText);     //  tell the user how many observations we retrieved
    },

    /**
     * Display the text in the "results" area of the screen
     * @param iText
     */
    setResultText : function( iText ) {
        document.getElementById("results").innerHTML = iText;

    },

    /**
     * Gives a record as sent by NOAA, convert to the form we want for CODAP
     *
     * @param iRecord   record extracted from a NOAA response
     * @returns {{}}
     */
    convertNOAAtoValue : function( iRecord ) {
        let out = {};
        out.when = iRecord.date;    //  string in yyyy-mm-dd etc format
        out.where = noaa.decodeData("where", iRecord.station);
        out.what = noaa.decodeData("what", iRecord.datatype);
        out.value = noaa.decodeData(iRecord.datatype, iRecord.value);
        out.units = noaa.dataTypes[iRecord.datatype].units;
        out.year = Number(iRecord.date.substring(0,4));     //  yyyy
        out.month = Number(iRecord.date.substring(5,7));    //  mm
        return out;
    },

    /**
     * If the user has changed any dates, call this
     * and change the noaa.state variable
     */
    dateChange : function() {
        noaa.state.startDate = document.getElementById("startDate").value;
        noaa.state.endDate = document.getElementById("endDate").value;
    },

    /**
     * Called from convertNOAAtoValue.
     * For many fields in the CODAP record (what, where, when) return the categorical label.
     * For actual numeric values (temperatures, precip, etc) return a "decoded" numeric value.
     *
     * @param iField
     * @param iValue
     * @returns {*}
     */
    decodeData : function( iField, iValue ) {
        switch(iField) {
            case "where":
                return noaa.stations[iValue].name;
            case "AWND":
            case "TMAX":
            case "TMIN":
            case "TAVG":
            case "SNOW":
            case "EVAP":
            case "PRCP":
                const decoder = noaa.dataTypes[iField].decode[noaa.state.database]; //  each data type has its own function
                return decoder(iValue);
                break;
            case "what":
                return  noaa.dataTypes[iValue].name;
        }
        return iValue;

    },

    constants: {
        version : "000f",

        noaaToken: "XYMtyBtfgNMlwHKGadTjKhWkHjVWsOPu",          //  apply to get this thing
        noaaBaseURL: "https://www.ncdc.noaa.gov/cdo-web/api/v2/",
        defaultStart: "2019-01-01",
        defaultEnd: "2019-12-31",
        recordCountLimit : 1000,

        DSName : "noaa",
        DSTitle : "noaa",
        dimensions : {height : 120, width : 333},
        tallDimensions : {height : 444, width : 333},

        spreader : {
            // "URL" :  "http://localhost:8888/plugins/spreader/",
            "URL" :   "https://codap.xyz/plugins/spreader/",
            "dimensions": {height: 210, width: 380},
        }
    },

};
