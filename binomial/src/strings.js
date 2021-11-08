/*
==========================================================================

 * Created by tim on 11/8/21.
 
 
 ==========================================================================
strings in binomial

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

const binomialStrings = {

    initializeStrings: async function (iLang = "en") {

        const theStrings = binomialStrings[iLang];

        //  substitute all the static strings in the IU (by `id`)
        for (const theID in theStrings.staticStrings) {
            if (theStrings.staticStrings.hasOwnProperty(theID)) {
                const theValue = theStrings.staticStrings[theID];
                try {
                    document.getElementById(theID).innerHTML = theValue;
                    //  console.log(`Set string for ${theID} in ${iLang}`);
                } catch (msg) {
                    console.log(msg + ` on ID = ${theID}`);
                }
            }
        }
        return theStrings;
    },

    languages : [`en`, 'de'],

    en : {
        name : "English",
        flags : ["🇬🇧", "🇺🇸", "🇳🇿", "🇨🇦"],

        staticStrings : {
            changeVocabWarning : `Note: Changing this vocabulary will delete your data on the next run.`,
        }
    },

    de : {
        name : "Deutsch",
        flags : ["🇩🇪"],

        staticStrings : {
            changeVocabWarning : `XXX Note: Changing this vocabulary will delete your data on the next run.`,
        }
    }
}