import * as XENO from "./xeno.js"
import * as UI from "./ui.js"
import * as AUTO from "./auto.js"
import {state} from "./xeno.js";

let caseChangeSubscriberIndex = null;
let attributeDragDropSubscriberIndex = null;

let currentlyDraggingCODAPAttribute = false;

/**
 * Set up handlers, e.g., event handlers
 */
export async function initialize() {
    registerForDragDropEvents();     //  if you're accepting drops!

    //  note: these subscriptions must happen BEFORE `connect.initialize()` so that the `.on` there does not
    //  override our handlers.

    codapInterface.on('update', 'interactiveState', "", restorePluginFromStore);
    codapInterface.on('get', 'interactiveState', "", getPluginState);


    document.getElementById("maladyMenu").addEventListener('change', XENO.maladyChange);
    document.getElementById("trainingRadioButton").addEventListener('change', XENO.controlChange);
    document.getElementById("one_by_oneRadioButton").addEventListener('change', XENO.controlChange);
    document.getElementById("autoRadioButton").addEventListener('change', XENO.controlChange);
    document.getElementById("howManyAutoCases").addEventListener('change', XENO.controlChange);
    document.getElementById("howManyCases").addEventListener('change', XENO.controlChange);

    document.getElementById("makeNewCasesButton").addEventListener('click', XENO.makeNewCases);
    document.getElementById("makeTreeButton").addEventListener('click', XENO.makeTree);
    document.getElementById("openInstructionsButton").addEventListener('click', XENO.openInstructions);
    document.getElementById("diagnoseSickButton").addEventListener('click', XENO.manualDiagnose);
    document.getElementById("diagnoseWellButton").addEventListener('click', XENO.manualDiagnose);
    document.getElementById("runTreeButton").addEventListener('click', AUTO.autoDiagnose);

    document.getElementById("howManyAutoCases").addEventListener('change', XENO.controlChange);

    const tResource = 'dataContextChangeNotice[' + XENO.constants.xenoDataSetName + ']';  //  todo resolve?
    // const tResource = 'dataContext[' + XENO.constants.xenoDataSetName + '].case';

    codapInterface.on(
        'notify',
        `dataContextChangeNotice[${XENO.constants.xenoDataSetName}]`,
        'updateCases',
        handleUpdateCaseNotification
    );
    //  iCallback();

}

function getPluginState() {
    return {
        success: true,
        values: {
            store: XENO.state,
        }
    };
}

function restorePluginFromStore(iStorage) {
    if (iStorage) {
        XENO.state = iStorage.store;
    }
}

/**
 *  handler for our initial button
 */
function pressCountButton() {
    XENO.doButton();
}

/**
 * Handlers for drag and drop of attributes from CODAP
 * @param iMessage
 * @returns {Promise<void>}
 */
export async function handleDragDrop(iMessage) {

    switch (iMessage.values.operation) {
        case   `dragstart`:
            currentlyDraggingCODAPAttribute = true;
            console.log(`    drag start`);
            break;
        case   `dragend`:
            currentlyDraggingCODAPAttribute = false;
            highlightNone();
            console.log(`    drag end`);
            break;
        case   `drag`:
            handleDrag(iMessage.values.position);
            break;
        case   `drop`:
            await XENO.copeWithAttributeDrop(
                iMessage.values.context,
                iMessage.values.collection,
                iMessage.values.attribute,
                iMessage.values.position
            );
            UI.redraw();
            break;
        case   `dragenter`:
            console.log(`    drag enter`);
            highlightNear();
            break;
        case   `dragleave`:
            highlightNone();
            console.log(`    drag leave`);
            break;
    }
}

/**
 * CODAP has told us that a case has changed.
 * This will cause a re-get of all data and a re-analysis.
 *
 * @param iMessage
 * @returns {Promise<void>}
 */
export async function handleUpdateCaseNotification(iMessage) {
    console.log("xeno ... handlers ... case updated");

    const theOp = iMessage.values.operation;

    switch (theOp) {
        case 'createCases':
        case 'updateCases':
        case 'deleteCases':
        case `dependentCases`:      //  fires on rerandomize
        case `updateAttributes`:
        case `deleteAttributes`:
        case `createAttributes`:
            AUTO.processUpdateCaseNotification(iMessage);
            break;

        default:
            break;
    }
    //  console.log(`end ${tMess}`);

}

function handleDrag(iPosition) {

}

function highlightNone() {

}

function highlightNear() {

}

/**
 * Register for the dragDrop[attribute] event.
 *
 * Called from connect.initialize();
 */
function registerForDragDropEvents() {
    const tResource = `dragDrop[attribute]`;

    attributeDragDropSubscriberIndex = codapInterface.on(
        'notify', tResource, handleDragDrop
    )
    console.log(`registered for drags and drops. Index ${attributeDragDropSubscriberIndex}`);
}

/**
 *  register to receive notifications about changes to the data context (including selection)
 *  called from xeno.setDataset()
 */
export async function registerForCaseChanges(iName) {
    if (caseChangeSubscriberIndex) {        //  zero is a valid index... :P but it should be the "get"
        codapInterface.off(caseChangeSubscriberIndex);    //  blank that subscription.
    }

    const theResource = `dataContextChangeNotice[${iName}]`;
    //  const sResource = `dataContext[${iName}].case`;
    try {
        caseChangeSubscriberIndex = codapInterface.on(
            'notify',
            theResource,
            handleCaseChangeNotice
        );
        console.log(`registered for case changes in ${iName}. Index ${this.caseChangeSubscriberIndex}`);
    } catch (msg) {
        console.log(`problem registering for case changes: ${msg}`);
    }
}
