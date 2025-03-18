/*
    auto.js

    part of the Xeno plugin

    This file is responsible for handling auto-diagnosis from the xeno perspective.
    Arbor itself actually does the diagnoses, this just counts up how well the tree did.


 */

import * as MODEL from "./model.js"
import * as CONNECT from "./connect.js"
import {state} from "./xeno.js"
import * as XENO from "./xeno.js"



let casesPendingDiagnosis;      //      array of Case IDs of the ones we created
let casesProcessed = [];        //  the ones we have received back (for comparison)
let casesToProcess = 0;     //  the number of cases we're automatically processing

/**
 * User pressed the auto-diagnose button
 */
export async function autoDiagnose() {
    casesProcessed = [];    //  blank this so tht in the case changed handler, we count only the ones from this set

    let tAutoResultDisplay = document.getElementById("autoResultDisplay");
    const tAutoResultText = "Waiting for analysis from the tree.";
    tAutoResultDisplay.innerHTML = tAutoResultText;

    const theCaseValues = MODEL.getNewCreatureValues(state.howManyAutoCases, "auto");
    casesToProcess = theCaseValues.length;

    console.log("xeno...AUTODIAGNOSE: We have " + casesToProcess + " objects that need diagnosis!");
    const createItemsResult = await CONNECT.createXenoItems(theCaseValues);
    casesPendingDiagnosis = createItemsResult.caseIDs;

    /*
    At this point, we're done.
    But we are awaiting a notification from CODAP that the data have changed.
    We registered in xenoConnect.initialize;
    it's processed in xenoConnect.processUpdateCaseNotification()
     */
}

/**
 * When the tree updates cases by setting the value for diagnosis,
 * we take those, evaluate the diagnoses, and set the value for analysis accordingly.
 *
 * @param iCommand
 * @param iCallback
 */

export async function processUpdateCaseNotification(iCommand) {

    const tAutoResultDisplay = document.getElementById("autoResultDisplay");

    const theOperation = iCommand.values.operation;
    const theResult = iCommand.values.result;

    if (theResult.success) {
        // todo: NOTICE the kludge of using case IDs here.
        //  You will NOT get the right result if "analysis" has been promoted.

        //  loop over all cases. Notice that the cases are already updated (by arbor)
        //  we're just checking to see how the tree did.
        //  todo: if possible, get items rather than cases, by caseID

        if (typeof theResult.cases !== 'undefined') {

            console.log(`xeno .. processing auto, doing ${theResult.cases.length} cases`);

            theResult.cases.forEach((c) => {
                const thisCaseIndex = casesPendingDiagnosis.indexOf(c.id);
                if (thisCaseIndex !== -1) {  // it's in the list
                    casesPendingDiagnosis.splice(thisCaseIndex, 1);    //  remove it
                    const tValues = c.values;

                    XENO.scoreFromPerformance(tValues.analysis);
                    casesToProcess -= 1;
                    casesProcessed.push(tValues);
                    console.log("xeno ...  <" + theOperation + "> case IDs: [" + theResult.caseIDs + "], "
                        + casesToProcess + " remain.");
                } else {
                    console.log("xeno .... Case " + c.id + " is not in the cases-to-process array.")
                }
            })

        } else {
            console.log("xeno .... Hmmm! got a result without cases: " + JSON.stringify(theResult));
        }
    } else {
        console.log(" *** auto tree process: fail on notification read ***");
    }

    //  the tree has diagnosed all of our new cases...
    //  now we assemble the summary text

    const nCases = casesProcessed.length;
    let tNumberCorrect = 0;
    let tNumberUndiagnosed = 0;

    /*
    This thing gets called for the update on each case. So this code runs many times, changing the
    text about how an auto-diagnosis has done.

    But it happens quickly, so only the last one sticks. That's dependent on this array,
   casesProcessed. It gets set (emptied) above, (and updated above)
    so even though this code may run over the ENTIRE
    set of cases, we only count up the results for the cases in that casesProcessed array.
     */
    casesProcessed.forEach(function (c) {
        const theAnalysis = c[XENO.constants.analysisAttributeName];
        tNumberCorrect += (theAnalysis.charAt(0) === "T") ? 1 : 0;
        tNumberUndiagnosed += (theAnalysis.charAt(0) === "?") ? 1 : 0;
    });

    const tAutoProcessedText = nCases === 1 ?
        localize.getString("autoProcessedTextSingular", tNumberCorrect) :
        localize.getString("autoProcessedTextPlural", nCases, tNumberCorrect);

    const greatJobText = (tNumberCorrect === casesProcessed.length) ? localize.getString("autoGreatJob") : "";

    const undiagnosedText = (tNumberUndiagnosed > 0) ?
        tNumberUndiagnosed === 1 ?
            localize.getString("autoUndiagnosedSingular") :
            localize.getString("autoUndiagnosedPlural", tNumberUndiagnosed) :
        "";

    tAutoResultDisplay.innerHTML = tAutoProcessedText + greatJobText + undiagnosedText;
}