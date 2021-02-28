/*
==========================================================================

 * Created by tim on 9/3/19.
 
 
 ==========================================================================
constants.js in mazu

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

//  import model from "./Model.js";

mazu.constants = {

    version: "001d",

    kTimerInterval: 2500,       //      milliseconds, ordinarily 1000
    kUsingTimer: true,
    kInitialLanguage: 'en',    //  can override with URL parameter *lang*, e.g., "...index.html?lang=es"

    kInitialTurn: 2020,
    kInitialPopulation: 200,
    kInitialGameTypeName: "albacore",

    //  player states
    kSellingString: "selling",
    kFishingString: "fishing",
    kBetweenString: "between games",

    //  game states
    kInProgressString: "in progress",
    kWonString: "won",
    kLostString: "lost",
    kWaitingString: "waiting",      //
}

/**
 * This object-with-objects contains parameters for each level of the game.
 * The keys in the "outermost" object (albacore, etc) are the names of the levels
 *
 * @type {{albacore: {starter: boolean, openingPopulation: number, carryingCapacity: number, winningPopulation: number, losingPopulation: number, openingBalance: number, openingTurn: number, endingTurn: number, defaultPrice: number, overhead: number, visibleProbability: number, birthProbability: number, catchProbability: number, binomialProbabilityModel: boolean, boatCapacity: number, calculatePrice: (function(*): number)}, bonito: {starter: boolean, openingPopulation: number, carryingCapacity: number, winningPopulation: number, losingPopulation: number, openingBalance: number, openingTurn: number, endingTurn: number, defaultPrice: number, overhead: number, visibleProbability: number, birthProbability: number, catchProbability: number, binomialProbabilityModel: boolean, boatCapacity: number, calculatePrice: (function(*): number)}, cod: {starter: boolean, openingPopulation: number, carryingCapacity: number, winningPopulation: number, losingPopulation: number, openingBalance: number, openingTurn: number, endingTurn: number, defaultPrice: number, overhead: number, visibleProbability: number, birthProbability: number, catchProbability: number, binomialProbabilityModel: boolean, boatCapacity: number, priceMax: number, salesMax: number, calculatePrice: (function(*): number)}, halibut: {starter: boolean, openingPopulation: number, carryingCapacity: number, winningPopulation: number, losingPopulation: number, openingBalance: number, openingTurn: number, endingTurn: number, defaultPrice: number, overhead: number, visibleProbability: number, birthProbability: number, catchProbability: number, binomialProbabilityModel: boolean, boatCapacity: number, priceMax: number, salesMax: number, calculatePrice: (function(*): number)}}}
 */
mazu.fishGameParameters = {

    trout: {
        starter: true,
        openingPopulation: 400,
        carryingCapacity: 3000,

        winningPopulation: 405,
        losingPopulation: 100,
        openingBalance: 5000,
        openingTurn: 2020,
        endingTurn: 2022,          //          2060
        defaultPrice: 100,
        overhead: 2000,
        visibleProbability: 0.50,
        birthProbability: 0.10,
        catchProbability: 1.00,
        binomialProbabilityModel: false,
        boatCapacity: 120,

        calculatePrice: function (n) {
            return this.defaultPrice;
        }
    },

    albacore: {
        starter: true,
        openingPopulation: 400,
        carryingCapacity: 3000,

        winningPopulation: 800,
        losingPopulation: 100,
        openingBalance: 5000,
        openingTurn: 2020,
        endingTurn: 2060,          //          2060
        defaultPrice: 100,
        overhead: 2000,
        visibleProbability: 0.50,
        birthProbability: 0.10,
        catchProbability: 1.00,
        binomialProbabilityModel: false,
        boatCapacity: 120,

        calculatePrice: function (n) {
            return this.defaultPrice;
        }
    },

    bonito: {
        starter: false,
        openingPopulation: 400,
        carryingCapacity: 3000,

        winningPopulation: 800,
        losingPopulation: 100,
        openingBalance: 5000,
        openingTurn: 2020,
        endingTurn: 2060,
        defaultPrice: 100,
        overhead: 2000,
        visibleProbability: 0.50,
        birthProbability: 0.10,
        catchProbability: 1.00,
        binomialProbabilityModel: true,
        boatCapacity: 120,

        calculatePrice: function (n) {
            return this.defaultPrice;
        }
    },

    cod: {
        starter: false,
        openingPopulation: 400,
        carryingCapacity: 3000,

        winningPopulation: 1000,
        losingPopulation: 100,
        openingBalance: 3000,
        openingTurn: 2020,
        endingTurn: 2060,
        defaultPrice: 100,
        overhead: 2000,
        visibleProbability: 0.50,
        birthProbability: 0.10,
        catchProbability: 1.00,
        binomialProbabilityModel: false,
        boatCapacity: 120,

        priceMax: 80,
        salesMax: 200,

        calculatePrice: function (n) {
            let tPrice = this.priceMax * (1 - n / this.salesMax);
            if (tPrice < 0) tPrice = 0;
            return tPrice;
        }
    },

    halibut: {
        starter: false,
        openingPopulation: 400,
        carryingCapacity: 3000,

        winningPopulation: 1000,
        losingPopulation: 100,
        openingBalance: 3000,
        openingTurn: 2020,
        endingTurn: 2060,
        defaultPrice: 100,
        overhead: 2000,
        visibleProbability: 0.50,
        birthProbability: 0.10,
        catchProbability: 0.60,
        binomialProbabilityModel: true,
        boatCapacity: 120,

        priceMax: 80,
        salesMax: 200,

        calculatePrice: function (n) {
            let tPrice = this.priceMax * (1 - n / this.salesMax);
            if (tPrice < 0) tPrice = 0;
            return tPrice;
        }
    }
};
