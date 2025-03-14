import {state} from "./xeno.js"
import {constants} from "./xeno.js"
import * as MODEL from "./model.js";
import {makeMaladyMenuGuts} from "./model.js";

let statusDIV = null;
let autoResultDisplayDIV = null;
let caseDisplayDIV = null;

export function initialize() {
    statusDIV = document.getElementById('status');

    autoResultDisplayDIV = document.getElementById('autoResultDisplay');
    caseDisplayDIV = document.getElementById('caseDisplay');

    document.getElementById("openInstructionsButton").setAttribute("title", localize.getString("openInstructionsButtonTooltip"));
    document.getElementById("makeTreeButton").setAttribute("title", localize.getString("makeTreeButtonTooltip"));

    setControlsForScenarioStart();
}

/**
 * Redraw the plugin.
 */
export function redraw() {

    const datasetInfo = state.datasetName ? `dataset: ${state.datasetName}` : `no dataset`;

    visibility();
}

export function setControlsForScenarioStart() {
    document.getElementById(state.mode + "RadioButton").checked = true;
    document.getElementById("xenoScore").innerHTML = state.score;


    const tAutoResultDisplay = document.getElementById("autoResultDisplay");
    tAutoResultDisplay.innerHTML = constants.autoResultInitialText;

    //  set menu
    const theGuts = MODEL.makeMaladyMenuGuts(state.malady)
    document.getElementById("maladyMenu").innerHTML = theGuts;

}

function visibility() {
    switch (state.mode) {
        case 'training':
            document.getElementById("trainingControlPanel").style.display = "block";
            document.getElementById("oneByOneControlPanel").style.display = "none";
            document.getElementById("autoControlPanel").style.display = "none";
            state.currentCase = null;
            break;

        case 'one-by-one':
            if (!state.currentCase) {
                state.currentCase = MODEL.generateCase(state.malady);
                displayCurrentCase("<b>Your first case:</b> ")
            }
            document.getElementById("trainingControlPanel").style.display = "none";
            document.getElementById("oneByOneControlPanel").style.display = "block";
            document.getElementById("autoControlPanel").style.display = "none";
            break;

        case 'auto':
            document.getElementById("trainingControlPanel").style.display = "none";
            document.getElementById("oneByOneControlPanel").style.display = "none";
            document.getElementById("autoControlPanel").style.display = "block";
            break;

        default:
            break;
    }

}

export function displayCurrentCase(iPrefix) {
    const tCaseDescription = creatureString(state.currentCase);
    document.getElementById("caseDisplay").innerHTML = iPrefix + tCaseDescription;
}

export function getSingleDiagnosisReport(iDiag, iTF, iPN) {
    const out = ((iTF === localize.getString("true")) ?
            localize.getString("correctDiagnosisReport", iDiag) :
            localize.getString("incorrectDiagnosisReport", iDiag))
        + "<b>Next case:</b>  ";

    return out;
}

export function creatureString(iValues) {
    return localize.getString("creatureString", iValues.hair, iValues.eyes, iValues.antennae, iValues.tentacles, iValues.height, iValues.weight);
}

