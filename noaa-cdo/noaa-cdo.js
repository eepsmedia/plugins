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
    },

    stationIDs : [
        "GHCND:USW00023234",        //  KSFO
        "GHCND:USW00023174",      //  KLAX
    ],

    datatypes : [ "TMAX", "PRCP"],

    doGet: async function () {
        let theText = "Default text";
        let nRecords = 0;
        const tDatasetIDClause = "&datasetid=GHCND";
        const tStationIDClause = "&stationid=" + noaa.ui.getCheckedStations().join("&stationid=");
        const tDataTypeIDClause = "&datatypeid=" + noaa.datatypes.join("&datatypeid=");
        const tDateClause = "&startdate=" + noaa.state.startDate + "&enddate=" + noaa.state.endDate;

        let tURL = noaa.constants.noaaBaseURL + "data?limit=" + noaa.constants.recordCountLimit +
            tDatasetIDClause + tStationIDClause + tDataTypeIDClause + tDateClause;

        let tHeaders = new Headers();
        tHeaders.append("token", noaa.constants.noaaToken);
        const tRequest = new Request(tURL, {headers: tHeaders});

        try {
            const tResult = await fetch(tRequest);
            if (tResult.ok) {
                const theJSON = await tResult.json();
                noaa.dataValues = [];
                theJSON.results.forEach( (r) => {
                    nRecords++;
                    theText += "<br>" + JSON.stringify(r);
                    const aValue = noaa.convertNOAAtoValue(r);
                    noaa.dataValues.push(aValue);
                })
            } else {
                console.error("noaa.doGet() error: " + tResult.statusText);
            }
        } catch (msg) {
            console.log('fetch error: ' + msg);
            theText = msg;
        }

        noaa.connect.createNOAAItems(noaa.dataValues);
        document.getElementById("results").innerHTML = "Retrieved " + nRecords + " observations";
    },

    convertNOAAtoValue : function( iRecord ) {
        let out = {};
        out.when = iRecord.date;
        out.where = noaa.decodeData("where", iRecord.station);
        out.what = iRecord.datatype;
        out.value = noaa.decodeData(iRecord.datatype, iRecord.value);
        out.units = noaa.units[iRecord.datatype];
        return out;
    },

    dateChange : function() {
        noaa.state.startDate = document.getElementById("startDate").value;
        noaa.state.endDate = document.getElementById("endDate").value;
    },

    decodeData : function( iField, iValue ) {
        switch(iField) {
            case "where":
                return noaaStations[iValue].name;
            case "TMAX":
                return iValue / 10;
            case "PRCP":
                return iValue / 10;
        }

        return iValue;

    },

    units : {
        TMAX : "°C",
        PRCP : "mm",
    },

    constants: {
        version : "000a",

        noaaToken: "XYMtyBtfgNMlwHKGadTjKhWkHjVWsOPu",
        noaaBaseURL: "https://www.ncdc.noaa.gov/cdo-web/api/v2/",
        defaultStart: "2018-01-01",
        defaultEnd: "2018-01-31",
        recordCountLimit : 512,

        DSName : "noaa",
        DSTitle : "noaa",
        dimensions : {height : 120, width : 333},
        tallDimensions : {height : 444, width : 333},
    },

};
