import * as CBOXX from "./cboxx.js"
import * as UI from "./ui.js"

let caseChangeSubscriberIndex = null;
let attributeDragDropSubscriberIndex = null;

let currentlyDraggingCODAPAttribute = false;

/**
 * Set up handlers, e.g., event handlers
 */
export function initialize() {
    registerForDragDropEvents();     //  if you're accepting drops!

    //  note: these subscriptions must happen BEFORE `connect.initialize()` so that the `.on` there does not
    //  override our handlers.

    codapInterface.on('update', 'interactiveState', "", restorePluginFromStore);
    codapInterface.on('get', 'interactiveState', "", getPluginState);

    document.getElementById("doRunsButton").addEventListener('click', doRuns);
    document.getElementById("doOneRunButton").addEventListener('click', doOneRun);
    document.getElementById("numberOfCardsMenu").addEventListener('input', refresh);
    document.getElementById("numberOfRunsInput").addEventListener('input', refresh);

}

function refresh() {
    CBOXX.cycle();
}

function getPluginState() {
    return {
        success: true,
        values: {
            store: CBOXX.state,
        }
    };
}

function restorePluginFromStore(iStorage) {
    if (iStorage) {
        CBOXX.state = iStorage.store;
    }
}

/**
 *  handler for our buttons
 */
async function doRuns() {
    const nTypes = document.getElementById("numberOfCardsMenu").value;
    const nRuns = document.getElementById("numberOfRunsInput").value;

    await CBOXX.doRuns(nTypes, nRuns);
}

async function doOneRun() {
    const nTypes = document.getElementById("numberOfCardsMenu").value;

    await CBOXX.doRuns(nTypes, 1);
}

/**
 * Handlers for drag and drop of attributes frm CODAP
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
            await CBOXX.copeWithAttributeDrop(
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
export async function handleCaseChangeNotice(iMessage) {
    const theOp = iMessage.values.operation;

    switch (theOp) {
        case 'createCases':
        case 'updateCases':
        case 'deleteCases':
        case `dependentCases`:      //  fires on rerandomize
        case `updateAttributes`:
        case `deleteAttributes`:
        case `createAttributes`:
            CBOXX.copeWithCaseChange();
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
 *  called from cboxx.setDataset()
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
