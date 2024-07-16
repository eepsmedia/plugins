/**
 *  communicates with CODAP
 */

import * as HANDLERS from "./handlers.js"
import * as TEMPL8 from "./templ8.js"

let theDSD;

export async function initialize() {

    await codapInterface.init(
        getIFrameDescriptor(),
        HANDLERS.restorePluginFromStore         //  restores the state, if any
    );
    await allowReorg();
    await renameIFrame(localize.getString("frameTitle"));  //  localize the frame title

    theDSD = getDatasetDescriptor();
    await pluginHelper.initDataSet(theDSD);     //  open the output dataset

}

export async function emitData(iValues) {
    const theMessage = {
        action: "create",
        resource: `dataContext[${theDSD.name}].item`,
        values: iValues
    }

    try {
        await codapInterface.sendRequest(theMessage);
    } catch (err) {
        alert(`Error creating CODAP items: ${err}`)
    }

    makeCaseTableAppear(theDSD.name, localize.getString("outputDatasetTitle"));
}

export async function getAllItems(iDSName) {
    let out = null;

    const theMessage = {
        action : "get",
        resource : `dataContext[${iDSName}].itemSearch[*]`
    }

    try {
        const result = await codapInterface.sendRequest(theMessage);
        if (result.success) {
            return result.values;
        }
    } catch(err) {
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

function getDatasetDescriptor() {
    return {
        name : TEMPL8.constants.outputDatasetName,
        title : localize.getString("outputDatasetTitle"),
        collections : [
            {
                name: "data",
                title: localize.getString("dataCollectionTitle"),
                attrs: [
                    { name : localize.getString("attributeNames.count") },
                    { name : localize.getString("attributeNames.time"), type : "date", unit : "UTC" },
                    { name : localize.getString("attributeNames.interval"), unit : "sec" }

                ]
            }
        ]
    }
}

/**
 * Constant descriptor for the iFrame.
 * Find and edit the values in `templ8.constants`
 */
function getIFrameDescriptor() {
    return {
        name: TEMPL8.constants.pluginName,
        title: localize.getString("frameTitle"),
        version: TEMPL8.constants.version,
        dimensions: TEMPL8.constants.dimensions,      //      dimensions,
    }
}