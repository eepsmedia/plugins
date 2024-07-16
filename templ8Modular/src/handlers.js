import * as TEMPL8 from "./templ8.js"
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

    document.getElementById("counterButton").addEventListener('click', pressCountButton);

}

function getPluginState() {
    return {
        success: true,
        values: {
            store: TEMPL8.state,
        }
    };
}

function restorePluginFromStore(iStorage) {
    if (iStorage) {
        TEMPL8.state = iStorage.store;
    }
}

/**
 *  handler for our initial button
 */
function pressCountButton() {
    TEMPL8.doButton();
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
            await TEMPL8.copeWithAttributeDrop(
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
            TEMPL8.copeWithCaseChange();
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
 *  called from templ8.setDataset()
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
