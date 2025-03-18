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
                displayCurrentCase("", localize.getString("your_first_case"));
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

export function displayCurrentCase(iReport, iPrefix) {
    const tCaseDescriptionGuts = iReport + iPrefix + creatureString(state.currentCase);
    document.getElementById("caseDisplay").innerHTML = tCaseDescriptionGuts;
}

export function getSingleDiagnosisReport(iDiag, iTF, iPN) {
    let out = ((iTF === localize.getString("true")) ?
            localize.getString("correctDiagnosisReport", iDiag) :
            localize.getString("incorrectDiagnosisReport", iDiag))
    //  out += displayCurrentCase(localize.getString("next_case"));

    return out;
}

export function creatureString(iValues) {
    return localize.getString("creatureString",
        iValues[localize.getString("attributeNames.hair")],
        iValues[localize.getString("attributeNames.eyes")],
        iValues[localize.getString("attributeNames.antennae")],
        iValues[localize.getString("attributeNames.tentacles")],
        iValues[localize.getString("attributeNames.height")],
        iValues[localize.getString("attributeNames.weight")]
    )
}

