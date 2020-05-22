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

    initialize: function () {
        noaa.state.startDate = noaa.constants.defaultStart;
        noaa.state.endDate = noaa.constants.defaultEnd;

        noaa.connect.initialize();
        noaa.ui.initialize();
    },

    dataValues : [],

    state : {
        startDate : null,
        endDate : null,
        database : null,
    },

    doGet: async function () {
        let theText = "Default text";
        let nRecords = 0;
        noaa.state.database  = document.querySelector("input[name='frequencyControl']:checked").value;

        const theCheckedStations = noaa.ui.getCheckedStations();
        if (theCheckedStations.length < 1) {
            this.setResultText("Need at least one station!");
            return;
        }

        const tDatasetIDClause = "&datasetid=" + noaa.state.database;
        const tStationIDClause = "&stationid=" + theCheckedStations.join("&stationid=");
        const tDataTypeIDClause = "&datatypeid=" + noaa.ui.getCheckedDataTypes().join("&datatypeid=");
        const tDateClause = "&startdate=" + noaa.state.startDate + "&enddate=" + noaa.state.endDate;

        let tURL = noaa.constants.noaaBaseURL
            + "data?limit=" + noaa.constants.recordCountLimit
            + tDatasetIDClause + tStationIDClause
            + tDataTypeIDClause + tDateClause;

        let tHeaders = new Headers();
        tHeaders.append("token", noaa.constants.noaaToken);
        const tRequest = new Request(tURL, {headers: tHeaders});
        let resultText = "Request sent!";
        noaa.dataValues = [];
        this.setResultText(resultText);
        try {
            const tResult = await fetch(tRequest);
            if (tResult.ok) {
                const theJSON = await tResult.json();
                theJSON.results.forEach( (r) => {
                    nRecords++;
                    theText += "<br>" + JSON.stringify(r);
                    const aValue = noaa.convertNOAAtoValue(r);
                    noaa.dataValues.push(aValue);
                });
                noaa.connect.createNOAAItems(noaa.dataValues);
                resultText =  "Retrieved " + nRecords + " observations";
            } else {
                console.error("noaa.doGet() error: " + tResult.statusText);
                resultText = "Error. No records retrieved.";
            }
        } catch (msg) {
            console.log('fetch error: ' + msg);
            theText = msg;
        }

        this.setResultText(resultText);
    },

    setResultText : function( iText ) {
        document.getElementById("results").innerHTML = iText;

    },


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

    dateChange : function() {
        noaa.state.startDate = document.getElementById("startDate").value;
        noaa.state.endDate = document.getElementById("endDate").value;
    },

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
                const decoder = noaa.dataTypes[iField].decode[noaa.state.database];
                return decoder(iValue);
                break;
            case "what":
                return  noaa.dataTypes[iValue].name;
        }
        return iValue;

    },

    constants: {
        version : "000f",

        noaaToken: "XYMtyBtfgNMlwHKGadTjKhWkHjVWsOPu",
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
