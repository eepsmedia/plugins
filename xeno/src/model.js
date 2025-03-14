/*
==========================================================================

 * Created by tim on 11/21/17.
 
 
 ==========================================================================
xeno.model in xeno

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

import {constants} from './xeno.js'
import {state} from './xeno.js'


export function generateCase(iMalady) {
    const tMalady = wellCreature;      //  object filled with functions!
    const tHealth = maladies[iMalady];   //  { health : function... }

    Object.assign(tMalady, tHealth);        //  merge 'em
    const tOut = {malady: iMalady};

    for (const key in tMalady) {
        if (tMalady.hasOwnProperty(key)) {
            const theFunction = tMalady[key].bind(tOut);

            if (key === `health`) {
                tOut[constants.healthAttributeName] = theFunction();      //  are these guaranteed to be in order??
            } else {
                tOut[key] = theFunction();      //  are these guaranteed to be in order??
            }
        }
    }
    return tOut;
}

/**
 * Make n new cases. Called by makeNewCases().
 *
 * @param n     how many cases
 * @param iSource what mode are we in? e.g., "auto"
 * @returns {Array} an array of objects suitable for export into CODAP
 */
export function getNewCreatureValues(n, iSource) {
    let theNewCreatureArray = [];

    for (let i = 0; i < n; i++) {
        let tCase = generateCase(state.malady);       //  random case from the model
        tCase[constants.sourceAttributeName] = iSource;
        tCase[constants.diagnosisAttributeName] = "";
        tCase[constants.analysisAttributeName] = "";
        theNewCreatureArray.push(tCase);
    }

    return theNewCreatureArray;
}

export function creatureString(iValues) {
    return "creature string";       //      xeno.strings.creatureString(iValues);
}

/**
 * construct the <option> statements for a menu of all the maladies
 * @returns {string}
 */
export function makeMaladyMenuGuts(iCurrentMalady) {
    let out = "";
    for (const k in maladies) {
        const selectedSting = (k === iCurrentMalady) ? "selected" : "";
        out += `<option value="${k}" ${selectedSting}>${k}</option>`;
    }
    return out;
}

/**
 * Make an object that's a randomly-generated creature.
 * These values are mostly independent, although weight depends on height and tentacles.
 */
const wellCreature = {
    hair: function () {
        return TEEUtils.pickRandomItemFrom([localize.getString("pink"), localize.getString("blue")]);
    },
    eyes: function () {
        return TEEUtils.pickRandomItemFrom([localize.getString("purple"), localize.getString("orange")]);
    },
    antennae: function () {
        return TEEUtils.pickRandomItemFrom([6, 6, 6, 7, 8]);
    },
    tentacles: function () {
        return TEEUtils.pickRandomItemFrom([6, 6, 8, 10]);
    },
    height: function () {
        let tVal = 100 + Math.random() * 44.0;
        return tVal.toFixed(1);
    },
    weight: function () {
        let tVal = this.height * this.height / 100.0 * (1 + Math.random() / 2.0) + 4.0 * this.tentacles;
        return tVal.toFixed(1);
    }
}

/**
 * Object containing malady info needed to determine `health`. Keyed by malady name.
 */
const maladies = {

    //  simple, single binary

    ague: {
        health: function () {
            return (this.hair === localize.getString("blue") ? localize.getString("well") : localize.getString("sick"));
        }
    },

    //  needs another branch, both binary categorical

    botulosis: {
        health: function () {
            let out = localize.getString("well");
            if (this.eyes === localize.getString("purple") && this.hair === localize.getString("pink")) {
                out = localize.getString("sick");
            }
            return out;
        }
    },

    //  needs categorical split configuration

    cartis: {
        health: function () {
            return (this.tentacles === 6 ? localize.getString("well") : localize.getString("sick"));
        }
    },

    //  single continuous split

    dengueso: {
        health: function () {
            return (this.weight < 202.5 ? localize.getString("sick") : localize.getString("well"));
        }
    },

    //  more complex malady, categorical split with one branch continuous split

    eponitis: {
        health: function () {
            let out = localize.getString("well");

            if (this.antennae === 8) {
                out = (this.weight > 211.0) ? localize.getString("well") : localize.getString("sick");
            }
            return out;
        }
    },

    //  more complex malady, categorical split with two different continuous splits

    gorrux: {
        health: function () {
            let out = localize.getString("well");

            if (this.eyes === localize.getString("orange")) {
                out = (this.height > 125.0) ? localize.getString("well") : localize.getString("sick");
            } else {
                out = (this.height > 110.0) ? localize.getString("well") : localize.getString("sick");
            }
            return out;
        }
    },

    //  Based on weight alone, but not 100% predictable

    sumonoma: {
        health: function () {
            let tHealth = localize.getString("well");

            const tObese = this.weight - 212;

            if (Math.random() * 40 < tObese) {
                tHealth = localize.getString("sick");
            }
            return tHealth;
        }
    },

    //  basically, 7 OR orange indicates sick. With some randomness

    tirannica: {

        health: function () {

            //  basically, 7 OR orange indicates sick.

            let tHealth = (this.antennae === 7 || this.eyes === localize.getString("orange")) ?
                localize.getString("sick") : localize.getString("well");

            if (this.antennae === 7 && Math.random() < 0.1) {  //  some of the sevens are actually well.
                tHealth = localize.getString("well");
            }

            if (this.eyes !== localize.getString("orange") && Math.random() < 0.1) {    //  some of the not-oranges are sick.
                tHealth = localize.getString("sick");
            }

            return tHealth;
        }
    }

}

