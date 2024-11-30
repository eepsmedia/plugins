/*
==========================================================================

 * Created by tim on 11/27/20.
 
 
 ==========================================================================
binomial.js in binomial

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

import * as UI from "./binomial.ui.js"
import * as Connect from "./connect.js"
import * as Language from "../strings/localize.js"
import * as Strings from "./strings.js"


/**
 * Have we changed the vocabulary?
 */
let dirty = false;
let strings = null;
export let state = {};

export async function initialize() {
    await Connect.connectToCODAP();
    state = await codapInterface.getInteractiveState();

    if (Object.keys(state).length === 0) {
        const freshState = getFreshState();
        codapInterface.updateInteractiveState(freshState);
        state = freshState;
    } else {
    }

    state.lang = await Language.initialize();
    addWordsToState();

    UI.setInputToState();

    await Connect.initialize();

    initializeHandlers();
    update();
}

function initializeHandlers() {

    document.getElementById("probabilityOfSuccessInput").addEventListener('change', update);
    document.getElementById("numberOfAtomicEventsInput").addEventListener('change', update);
    document.getElementById("numberOfExperimentsInput").addEventListener('change', update);

    document.getElementById("atomicEventNameInput").addEventListener('change', nameChange);
    document.getElementById("eventSuccessInput").addEventListener('change', nameChange);
    document.getElementById("eventFailureInput").addEventListener('change', nameChange);
    document.getElementById("experimentNameInput").addEventListener('change', nameChange);
}

export async function engage() {
    state.runNumber++;     //  increment the run number

    if (dirty) {
        await reset();
        dirty = false;
    }

    console.log("Engage!");

    let results = [];

    for (let ex = 0; ex < state.experimentsPerRun; ex++) {
        let nSuccesses = 0;
        for (let ev = 0; ev < state.atomicEventsPerExperiment; ev++) {
            const successP = Math.random() < state.parsedProbability.theNumber;
            if (successP) {
                nSuccesses++;
            }
        }
        const aResult = {};
        aResult["runNumber"] = state.runNumber;
        aResult[state.words.eventSuccess] = nSuccesses;
        aResult[state.words.eventFailure] = (state.atomicEventsPerExperiment) - nSuccesses;
        aResult[Language.pluralize(state.words.atomicEventName, 'en')] = state.atomicEventsPerExperiment;
        aResult[Language.pluralize(state.words.experimentName, 'en')] = state.experimentsPerRun;
        aResult["trueP"] = state.parsedProbability.theNumber;

        results.push(aResult);
    }

    Connect.emitData(results);      //  could await this but unnecessary?
    Connect.makeTableAppear();
}

function update() {
    const probabilityString = document.getElementById("probabilityOfSuccessInput").value;
    state.parsedProbability = utilities.stringFractionDecimalOrPercentToNumber(probabilityString);
    const theProb = state.parsedProbability.theNumber;

    if (state.parsedProbability.theString !== "") {
        if (theProb >= 0 && theProb <= 1) {
            state.atomicEventsPerExperiment = Number(document.getElementById("numberOfAtomicEventsInput").value);
            state.experimentsPerRun = Number(document.getElementById("numberOfExperimentsInput").value);
            if (state.experimentsPerRun > constants.kMaxExperimentsPerRun) {
                state.experimentsPerRun = constants.kMaxExperimentsPerRun;
                document.getElementById("numberOfExperimentsInput").value = constants.kMaxExperimentsPerRun;
            }
        } else {
            Swal.fire({
                icon: "warning",
                title: "dang!",
                text: `${state.parsedProbability.theString} is not a good number for a probability. 
                     It should be between 0 and 1 inclusive.`
            })
        }
    } else {
        Swal.fire({
            icon: "warning",
            title: "oops",
            text: `"${probabilityString}" is not a good probability.
                 Enter a fraction (like 1/5), a decimal (like 0.2), or a percentage (like 20%).`
        })
    }

    UI.update();
    document.getElementById("engageButton").addEventListener('click',   engage);

}

function nameChange() {
    dirty = true;

    state.words.atomicEventName = document.getElementById("atomicEventNameInput").value;
    state.words.eventSuccess = document.getElementById("eventSuccessInput").value;
    state.words.eventFailure = document.getElementById("eventFailureInput").value;
    state.words.experimentName = document.getElementById("experimentNameInput").value;

    update();
}

async function reset() {
    await Connect.destroyDataset();
    await Connect.initialize();
}


function getFreshState() {
    const theState = {
        parsedProbability: {theNumber: 0.5, theString: "1/2",},
        atomicEventsPerExperiment: 10,
        experimentsPerRun: 100,
        runNumber: 0,
    }
    return theState
}

function addWordsToState() {
    state["words"] = {
        atomicEventName: Language.getString("words.atomicEventName"),
            eventSuccess: Language.getString("words.eventSuccess"),
            eventFailure: Language.getString("words.eventFailure"),
            experimentName: Language.getString("words.experimentName"),
    }

}

const utilities = {
    stringFractionDecimalOrPercentToNumber: function (iString) {
        let theNumber;
        let theString;

        const wherePercent = iString.indexOf("%");
        const whereSlash = iString.indexOf("/");
        if (wherePercent !== -1) {
            const thePercentage = parseFloat(iString.substring(0, wherePercent));
            theString = `${thePercentage}%`;
            theNumber = thePercentage / 100.0;
        } else if (whereSlash !== -1) {
            const beforeSlash = iString.substring(0, whereSlash);
            const afterSlash = iString.substring(whereSlash + 1);
            const theNumerator = parseFloat(beforeSlash);
            const theDenominator = parseFloat(afterSlash);
            theNumber = theNumerator / theDenominator;
            theString = `${theNumerator}/${theDenominator}`;
        } else {
            theNumber = parseFloat(iString);
            theString = `${theNumber}`;
        }

        if (!isNaN(theNumber)) {
            return {theNumber: theNumber, theString: theString};
        } else {
            return {theNumber: 0, theString: ""};
        }
    }
}

export const iFrameDescriptor = {
    version: "001c",
    name: 'binomial',
    title: 'Binomial Simulator',
    dimensions: {width: 366, height: 466},
    preventDataContextReorg: false,
}


export const constants = {
    kBinomialDataSetName: "binData",
    kBinomialDataSetTitle: "binomial data",
    kRunCollectionName: "runs",
    kExperimentsCollectionName: "experiments",
    kMaxExperimentsPerRun: 400,
}
