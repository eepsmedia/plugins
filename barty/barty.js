/**
 * Created by tim on 3/14/17.


 ==========================================================================
 barty.js in gamePrototypes.

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


 */

/*
    "hub" file for bartY, now called barty.

    DEPLOYMENT NOTE: fix URL at about line 70.


    About making "games" work
        bartyManager, 56. Cope with endGame. (closing the game was disabled so we could create flat files easily.)
 */


var barty = {

    state: {},
    routeStrings: {},

    constants: {
        version: "002h",
        dimensions: {height: 700, width: 360},
        name: "barty",

        daysOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        daysOfWeekLong: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        queryTypes: ["byArrival", "byDeparture", "byRoute", "betweenAny"],
        kBaseDateString: "2015-04-15",     //  default search date
        kBaseH0: 8,        //      default starting hour
        kBaseH1: 14,       //      default ending hour for search

        kGetData: "data",
        kGetCounts: "counts",
        kRegionColorMap: {
            "Peninsula": "purple",
            "City": "red",
            "Downtown": "orange",
            "Oakland": "green",
            "East Bay": "dodgerblue"
        },
        kWeekdayColorMap: {
            "Sun": "green",
            "Mon": "orange",
            "Tue": "coral",
            "Wed": "gold",
            "Thu": "goldenrod",
            "Fri": "lightsalmon",
            "Sat": "limegreen"
        },
        kBaseURL: "https://codap.concord.org/data-science-games/php/getBARTYdata.php",	//	CODAP URL
        //  kBaseURL :  "../php/getBARTYdata.php"   //  RELEASE URL
        //	kBaseURL :  "http://localhost:8888/barty/getBARTYdata.php"   //  TESTING URL

        //  kDataLocation : "eeps"
        kDataLocation: "the CODAP servers"

    },


    /**
     * Construct a new "state"
     */
    freshState: {
        score: 42,
        statusSelector: null,
        gameNumber: 0,
        requestNumber: 0,
        day: 2,
        hour: 14,
        where: 'Orinda',
        number: 160
    },

    /**
     * set up barty game/sim
     */
    initialize: function () {
        var tPluginConfiguration = {
            name: barty.constants.name,
            title: barty.constants.name,
            version: barty.constants.version,
            dimensions: barty.constants.dimensions,

            preventDataContextReorg: false
        };

        codapInterface.init(tPluginConfiguration, null).then(
            function () {
                barty.state = codapInterface.getInteractiveState();
                if (jQuery.isEmptyObject(barty.state)) {
                    codapInterface.updateInteractiveState(barty.freshState);
                }

                meeting.restoreMeetingParameters({
                    day: barty.state.day,
                    hour: barty.state.hour,
                    where: barty.state.where,
                    number: barty.state.number
                });

                barty.connector.initializeDataSets();
            }
        );

        this.statusSelector = $("#status");

        barty.ui.initialize();
        barty.manager.newGame();
    }
};
