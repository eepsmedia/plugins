/*
==========================================================================

 * Created by tim on 11/21/17.
 
 
 ==========================================================================
xeno in xeno

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

import * as HANDLERS from "./handlers.js"
import * as CONNECT from "./connect.js"
import * as MODEL from "./model.js"
import * as UI from "./ui.js"

let casesPendingDiagnosis = [];
export let state = {};

export async function initialize() {
    console.log(`initializing xeno`);
    await HANDLERS.initialize();        //  initialize event handlers

    state.lang = localize.figureOutLanguage('en');
    await localize.initialize(state.lang);

    await CONNECT.initialize();        //  initialize the connection with CODAP
    state = {...constants.defaultState, ...state};   //  have all fields from default!

    UI.initialize();
    cycle();
}

/**
 * Generally update the plugin because of a change.
 * Especially, redraw the UI.
 */
export function cycle() {
    UI.redraw();
}

/**
 * User changes which malady we're using
 * Deletes all the data in the table (so they won't be mixed up!)
 * Note that `this` is the malady menu!
 */
export function maladyChange() {
    state.malady = this.value;

    state.score = constants.initialScore;
    state.mode = "training";

    //  delete all data
    const tResource = "dataContext[creatures].collection[creatures].allCases";
    const tArg = {action: "delete", resource: tResource};
    codapInterface.sendRequest(tArg);

    UI.setControlsForScenarioStart();   //  this sets the radio button as well
    controlChange();
}

/**
 * User has changed some control or other, for example, the radio buttons for mode.
 * Change values, text, etc. to correspond.
 * Also changes the visibility of the corresponding divs.
 */
export function controlChange() {
    const tAutoDiagnoseCaseNumberBox = document.getElementById("howManyAutoCases");
    const tTrainingCaseNumberBox = document.getElementById("howManyCases");
    state.mode = document.querySelector('input[name="xenoMode"]:checked').value;  //  "training" or "one by one" or "auto"
    state.howManyCases = tTrainingCaseNumberBox.value;
    state.howManyAutoCases = tAutoDiagnoseCaseNumberBox.value;
    updateScore(0);

    if (state.howManyAutoCases > 20) {
        state.howManyAutoCases = 20;
        tAutoDiagnoseCaseNumberBox.value = state.howManyAutoCases;
        alert("Sorry -- for now you're limited to 20 at a time. So you don't have to wait so long.");
    }

    if (state.howManyCases > 100) {
        state.howManyCases = 100;
        tTrainingCaseNumberBox.value = state.howManyCases;
        alert("Sorry -- for now you're limited to 100 'training cases' at a time.");
    }

    console.log(
        'xeno ... current mode: ' + state.mode + ", cases: ("
        + state.howManyCases + ", 1, " + state.howManyAutoCases + ")"
    );
    cycle();
}

function updateScore(iDeltaScore) {
    state.score += iDeltaScore;
    document.getElementById("xenoScore").innerHTML = state.score;
}

/**
 * User has asked for new cases while in training.
 */
export function makeNewCases() {
    const n = state.howManyCases;
    console.log('xeno ... making ' + n + ' new training cases');

    const theCaseValues = MODEL.getNewCreatureValues(n, "training");
    updateScore(-n);
    CONNECT.createXenoItems(theCaseValues);
}

/**
 *  Called when the user presses a [single] diagnosis button
 * @param iDiag  "sick" or "well" in the current language
 */
export function manualDiagnose()
{
    const iDiag = this.value;
    state.currentCase[constants.sourceAttributeName] = "clinic";
    state.currentCase[constants.diagnosisAttributeName] = iDiag;

    const tTrueOrFalse = (iDiag === state.currentCase[constants.healthAttributeName]) ?
        "T" : "F";
        //  localize.getString("true") : localize.getString("false");

    const tPositiveOrNegative = (iDiag === localize.getString("sick")) ?
        "P" : "N";
        //  localize.getString("positive") : localize.getString("negative");

    state.previousSingleDiagnosisReport =  UI.getSingleDiagnosisReport(iDiag, tTrueOrFalse, tPositiveOrNegative);

    const theAnalysis = tTrueOrFalse[0] + tPositiveOrNegative[0];
    state.currentCase[constants.analysisAttributeName] = theAnalysis;

    scoreFromPerformance(theAnalysis);

    CONNECT.createXenoItems(state.currentCase);   //  send CODAP the clinic data

    //  next case

    state.currentCase = MODEL.generateCase(state.malady);
    UI.displayCurrentCase(state.previousSingleDiagnosisReport);
}


export function scoreFromPerformance(iPerf) {
    let tScore = 0;

    switch (iPerf) {
        case "TP":
            updateScore(constants.scores.TP);
            break;

        case "TN":
            updateScore(constants.scores.TN);
            break;

        case "FP":
            updateScore(constants.scores.FP);
            break;

        case "FN":
            updateScore(constants.scores.FN);
            break;

        case "?":
            updateScore(constants.scores["?"]);
            break;

        default:
            break;
    }
}

export function makeTree() {
    CONNECT.createTree();
}

export function openInstructions() {
    CONNECT.openInstructions();
}


export const constants = {
    version: '2025b',
    healthAttributeName: `Xhealth`,
    sourceAttributeName: `Xsource`,
    diagnosisAttributeName: `Xdiagnosis`,
    analysisAttributeName: `Xanalysis`,

    kInitialLanguage: 'en',
    wellColor: '#752',
    sickColor: '#484',
    xenoDataSetName: "creatures",
    xenoDataSetTitle: "creatures",
    xenoCollectionName: "creatures",
    autoResultInitialText: "Auto-diagnosis results display",
    initialScore: 200,
    arborURL: "https://localhost/plugins/arbor/",
    kInstructionsFolderURL : "http://localhost/plugins/xeno/instructions",
    //  arborURL : "https://www.codap.xyz/plugins/arbor/",

    defaultState : {
        previousSingleDiagnosisReport: "",
        howManyCases: 10,
        howManyAutoCases: 10,
        mode: 'training',
        malady: 'ague',
        currentCase: null,
        score: 200
    },

    scores: {
        TP: 5,
        FP: -10,
        TN: 5,
        FN: -20,
        "?": -10
    }
}
