/**
 *  communicates with CODAP
 */

import * as HANDLERS from "./handlers.js"
import * as CBOXX from "./cboxx.js"

export async function initialize() {

    await codapInterface.init(
        getIFrameDescriptor(),
        HANDLERS.restorePluginFromStore         //  restores the state, if any
    );

    const theDSD = getDatasetDescriptor();
    await pluginHelper.initDataSet(theDSD);

    await allowReorg();
    await renameIFrame(localize.getString("frameTitle"));  //  localize the frame title
}

export async function emitData(iValues) {
    const theMessage = {
        action: "create",
        resource: `dataContext[${localize.getString("datasetName")}].item`,
        values: iValues
    }

    try {
        await codapInterface.sendRequest(theMessage);
    } catch (err) {
        alert(`Error creating CODAP items: ${err}`)
    }

    makeCaseTableAppear(localize.getString("datasetName"), localize.getString("datasetTitle"));
}

export async function getAllItems(iDSName) {
    let out = null;

    const theMessage = {
        action: "get",
        resource: `dataContext[${iDSName}].itemSearch[*]`
    }

    try {
        const result = await codapInterface.sendRequest(theMessage);
        if (result.success) {
            return result.values;
        }
    } catch (err) {
        alert(`ERROR getting items: ${err}`);
    }

    return out;
}

async function makeCaseTableAppear(contextName, title) {
    const theMessage = {
        action: "create",
        resource: "component",
        values: {
            type: 'caseTable',
            dataContext: contextName,
            title: title,
            cannotClose: true
        }
    };
    await codapInterface.sendRequest(theMessage);
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
 * Find and edit the values in `cboxx.constants`
 */
function getIFrameDescriptor() {
    return {
        name: CBOXX.constants.pluginName,
        title: localize.getString("frameTitle"),
        version: CBOXX.constants.version,
        dimensions: CBOXX.constants.dimensions,      //      dimensions,
    }
}

function getDatasetDescriptor() {
    return {
        name: localize.getString("datasetName"),
        title: localize.getString("datasetTitle"),
        collections: [
            {
                name: localize.getString("runCollectionName"),
                attrs: [
                    { name : localize.getString("attNames.run") },
                    { name : localize.getString("attNames.count"), unit : localize.getString("boxCollectionName") },
                    { name : localize.getString("attNames.types"), type : "categorical" }
                ]
            },
            {
                name: localize.getString("boxCollectionName"),
                parent: localize.getString("runCollectionName"),
                attrs: [
                    { name : localize.getString("attNames.card") }
                ]
            }
        ]

    }
}