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


xeno.model = {

    generateCase: function (iMalady) {
        var tMalady = this.wellCreature;
        var tHealth = this.maladies[iMalady];   //  { health : function... }
        Object.assign( tMalady, tHealth );        //  merge 'em
        var tOut = {malady : iMalady};

        for (var key in tMalady) {
            if (tMalady.hasOwnProperty(key)) {
                var theFunction = tMalady[key].bind(tOut);
                tOut[key] = theFunction();      //  are these guaranteed to be in order??
            }
        }
        return tOut;
    },

    creatureString: function (iValues) {
        return iValues.hair + "&nbsp;hair, " +
            iValues.eyes + "&nbsp;eyes, " +
            iValues.antennae + "&nbsp;antennae, " +
            iValues.tentacles + "&nbsp;tentacles, " +
            "height:&nbsp;" + iValues.height + ", " +
            "weight:&nbsp;" + iValues.weight;
    },

    makeMaladyMenuGuts : function() {
        out = "";
        for (var k in this.maladies) {
            out += "<option value='" + k + "'>" + k + "</option>";
        }

        return out;
    },

    wellCreature : {
        hair: function () {
            return TEEUtils.pickRandomItemFrom(["pink", "blue"]);
        },
        eyes: function () {
            return TEEUtils.pickRandomItemFrom(["purple", "orange"]);
        },
        antennae: function () {
            return TEEUtils.pickRandomItemFrom([6, 6, 6, 7, 8]);
        },
        tentacles: function () {
            return TEEUtils.pickRandomItemFrom([6, 6, 8, 10]);
        },
        height: function () {
            var tVal = 100 + Math.random() * 44.0;
            return tVal.toFixed(1);
        },
        weight: function () {
            var tVal = this.height * this.height / 100.0 * (1 + Math.random() / 2.0) + 4.0 * this.tentacles;
            return tVal.toFixed(1);
        }
    },

    maladies: {

        //  simple, single binary

        ague: {
            health: function () {
                return (this.hair === "blue" ? "well" : "sick");
            }
        },

        //  needs another branch, both binary categorical

        botulosis: {
            health: function () {
                out = "well";
                if (this.eyes === "purple" && this.hair === "pink") {
                    out = "sick";
                }
                return out;
            }
        },

        //  needs categorical split configuration

        cartis: {
            health: function () {
                return (this.tentacles === 6 ? "well" : "sick");
            }
        },

        //  single continuous split

        dengueso: {
            health: function () {
                return (this.weight < 202.5 ? "sick" : "well");
            }
        },

        //  more complex malady, categorical split with one branch continuous split

        eponitis: {
            health: function () {
                var out = "well";

                if (this.antennae === 8) {
                    out = (this.weight > 211.0) ? "well" : "sick";
                }
                return out;
            }
        },

        //  more complex malady, categorical split with two different continuous splits

        gorrux: {
            health: function () {
                var out = "well";

                if (this.eyes === "orange") {
                    out = (this.height > 125.0) ? "well" : "sick";
                } else {
                    out = (this.height > 110.0) ? "well" : "sick";
                }
                return out;
            }
        },

        //  Based on weight alone, but not 100% predictable

        sumonoma: {
            health: function () {
                var tHealth = "well";

                var tObese = this.weight - 212;

                if (Math.random() * 40 < tObese) {
                    tHealth = "sick";
                }
                return tHealth;
            }
        },

        //  basically, 7 OR orange indicates sick. With some randomness

        tirannica: {

            health: function () {

                //  basically, 7 OR orange indicates sick.

                var tHealth = (this.antennae === 7 || this.eyes === "orange") ? "sick" : "well";

                if (this.antennae === 7 && Math.random() < 0.1) {  //  some of the sevens are actually well.
                        tHealth = "well";
                }

                if (this.eyes !== "orange" && Math.random() < 0.1) {    //  some of the not-oranges are sick.
                    tHealth = "sick";
                }

                return tHealth;
            }
        }

    }

};