/**
 * Created by tim on 2/24/16.


 ==========================================================================
 bartCODAPConnector.js in data-science-games.

 Author:   Tim Erickson

 Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

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


CASE STRUCTURE:

games
    gameNumber
    result

    buckets (of data)
        bucketNumber

    Times (day + hour)
        day
         hour
         day of week
         doy

    data (count by origin and destination)

        count
        origin
        destination
        id, etc
 */


barty.connector = {

    kHierarchicalDataSetName : "BARTY_data",
    kHierarchicalDataSetTitle : "BART data (don't pick this one)",
    kGameCollectionName : "games",
    kHoursCollectionName : "hours",
    kDataCollectionName : "data",

    kFlatDataSetName : "barty",
    kFlatDataSetTitle : "BART data",

    initializeDataSets : function () {

        var tDataSetupString = {
            name : this.kHierarchicalDataSetName,
            title : this.kHierarchicalDataSetTitle,
            description : "records of BART usage",
            collections : [

                //      GAMES level

/*
                {
                    name: this.kGameCollectionName,
                    labels: {
                        singleCase: "game",
                        pluralCase: "games",
                        setOfCasesWithArticle: "the games"
                    },
                    // The parent collection spec:
                    attrs: [
                        {name: "gameNumber", type: 'categorical'},
                        {name: "result", type: 'categorical'}
                    ],
                    childAttrName: this.kHoursCollectionName
                },
*/

                //          HOURS level
                //          doy, day, hour, date

                {
                    name: this.kHoursCollectionName,
                    //  parent : this.kGameCollectionName,
                    labels: {
                        singleCase: "hour",
                        pluralCase: "hours",
                        setOfCasesWithArticle: "an hour of data"
                    },
                    attrs: [
                        {name: "request", type: 'categorical'},
                        {name: "when", type: 'date', description : "what time and day"},
                        {name: "day", type : 'categorical', colormap : barty.constants.kWeekdayColorMap, description : "day of the week"},
                        {name: "hour", type: 'numeric', precision : 0, description : "hour (24-hour clock)"},
                        {name: "date", type: 'categorical', description : "the date"}
                    ],
                    childAttrName: "datum"
                },

                //          DATA level

                {
                    name: this.kDataCollectionName,
                    parent : this.kHoursCollectionName,
                    labels: {
                        singleCase: "datum",
                        pluralCase: "data",
                        setOfCasesWithArticle: "an hour's worth of data"
                    },
                    // The child collection specification:
                    attrs: [
                        {name: "riders", type: 'numeric', precision : 0, description : "number of riders leaving the system"},
                        {name: "startAt", type: 'categorical', description : "where these passengers entered BART"},
                        {name: "endAt", type: 'categorical', description : "where these passengers exited BART"},
                        {name: "startReg", type: 'categorical', colormap : barty.constants.kRegionColorMap,
                            description : "region where these passengers entered BART" },
                        {name: "endReg",   type: 'categorical', colormap : barty.constants.kRegionColorMap,
                            description : "region where these passengers exited BART" },
                        {name: "id", type: 'numeric', precision: 0, description : "record ID"}

                    ]
                }

            ]
        };

        var tFlatDataSetupString = {
            name : this.kFlatDataSetName,
            title : this.kFlatDataSetTitle,     //  this.kFlatDataSetName,
            description : "BART hourly data, not pre-organized",
            collections : [
                {
                    name: this.kFlatDataSetName,
                    labels: {
                        singleCase: "record",
                        pluralCase: "records",
                        setOfCasesWithArticle: "a group of records"
                    },
                    attrs: [
                        //{name: "gameNumber", type: 'categorical'},
                        {name: "request", type: 'categorical'},
                        {name: "when", type: 'date', description : "what time and day"},
                        {name: "day",
                            type : 'categorical',
                            colormap : barty.constants.kWeekdayColorMap,
                            description : "day of the week"
                        },
                        {name: "hour", type: 'numeric', precision : 0, description : "hour (24-hour clock)"},
                        {name: "date", type: 'categorical', description : "the date"},
                        {name: "riders", type: 'numeric', precision : 0,
                            description : "number of riders leaving the system"},
                        {name: "startAt", type: 'categorical',
                            description : "station where these passengers entered BART"},
                        {name: "endAt", type: 'categorical',
                            description : "station where these passengers exited BART"},
                        {name: "startReg",
                            type: 'categorical',
                            colormap : barty.constants.kRegionColorMap,
                            description : "region where these passengers entered BART" },
                        {name: "endReg",
                            type: 'categorical',
                            colormap : barty.constants.kRegionColorMap,
                            description : "region where these passengers exited BART" }
                    ]
                }
            ]
        };

        pluginHelper.initDataSet(tFlatDataSetupString);
        pluginHelper.initDataSet(tDataSetupString);

    },

    outputDataItems : function( iValArray ) {
        pluginHelper.createItems(iValArray, barty.connector.kHierarchicalDataSetName);
        pluginHelper.createItems(iValArray, barty.connector.kFlatDataSetName);
    }
};



