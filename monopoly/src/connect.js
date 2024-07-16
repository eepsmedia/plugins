/**
 *  communicates with CODAP
 */

import * as HANDLERS from "./handlers.js"
import * as MONOPOLY from "./monopoly.js"



let attributeDragDropSubscriberIndex = null;

export async function initialize() {
    //  note: these subscriptions must happen BEFORE `.init` so that the `.on` there does not
    //  override our handlers.
    codapInterface.on('update', 'interactiveState', "", HANDLERS.restorePluginFromStore);
    codapInterface.on('get', 'interactiveState', "", HANDLERS.getPluginState);

    await codapInterface.init(
        getIFrameDescriptor(),
        HANDLERS.restorePluginFromStore         //  restores the state, if any
    );
    await registerForDragDropEvents();     //  if you're accepting drops!
    await allowReorg();
    await renameIFrame(localize.getString("frameTitle"));  //  localize the frame title
}


/**
 * Register for the dragDrop[attribute] event.
 *
 * Called from connect.initialize();
 */
function registerForDragDropEvents() {
    const tResource = `dragDrop[attribute]`;

    attributeDragDropSubscriberIndex = codapInterface.on(
        'notify', tResource, HANDLERS.handleDragDrop
    )
    console.log(`registered for drags and drops. Index ${attributeDragDropSubscriberIndex}`);

}

async function renameIFrame(iName) {
    const theMessage = {
        action: "update",
        resource: "interactiveFrame",
        values: {
            title: iName,
        }
    };
    await codapInterface.sendRequest(theMessage);
}


/**
 * Kludge to ensure that a dataset is reorg-able.
 *
 * @returns {Promise<void>}
 */
async function allowReorg() {
    const tMutabilityMessage = {
        "action": "update",
        "resource": "interactiveFrame",
        "values": {
            "preventBringToFront": false,
            "preventDataContextReorg": false
        }
    };

    codapInterface.sendRequest(tMutabilityMessage);
}

/**
 * Constant descriptor for the iFrame.
 * Find and edit the values in `monopoly.constants`
 */
function getIFrameDescriptor() {
    return {
        name: MONOPOLY.constants.pluginName,
        title: localize.getString("frameTitle"),
        version: MONOPOLY.constants.version,
        dimensions: MONOPOLY.constants.dimensions,      //      dimensions,
    }
}