/*
==========================================================================

 * Created by tim on 2019-04-10.
 
 
 ==========================================================================
jove in jove

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


let jove = {
        state: {
        },

        options : {
            weather : true,
            moonNames : true
        },

        readOptions : function() {
            this.options.weather = !document.getElementById("weatherOption").checked;
            this.options.moonNames = document.getElementById("idOption").checked;
        },

        constants: {
            version: "001a"
        },

        initialize: async function () {
            jove.model.initialize();
            jove.skyView.initialize(jove.model);
            await jove.connector.initialize();
            console.log("JOVE initialization complete");

            this.update(0);
        },

        tomorrow : function() {
            this.update(jove.model.constants.secondsPerDay);
        },

        update: function (dt) {
            this.readOptions();

            jove.model.update(dt);
            const theData = jove.model.moonPositionArray();
            if (jove.model.clear) {
                jove.connector.emitObservationRecord(theData);
            }

            this.update_ui();
        },

        update_ui : function() {
            const dateText = "Day " + jove.model.time / jove.model.constants.secondsPerDay;
            const weatherText = " Weather: " + (jove.model.clear ? "clear" : "cloudy");

            jove.skyView.update();

            document.getElementById("statusText").innerHTML = dateText + " | " + weatherText;

        }
    }
;