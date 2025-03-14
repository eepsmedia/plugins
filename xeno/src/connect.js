/*
==========================================================================

 * Created by tim on 11/21/17.
 
 
 ==========================================================================
xenoConnect in xeno

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

import * as XENO from './xeno.js'
import * as HANDLERS from "./handlers.js"
import * as MODEL from "./model.js"
import {state} from "./xeno.js";

let casesToProcess = 0;

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


/**
 * Tell CODAP to make items.
 * @param iValues   An array of objects containing the keys and values
 * corresponding to attributes and values of the new cases.
 */
export async function createXenoItems(iValues) {

    casesToProcess = iValues.length;

    iValues = pluginHelper.arrayify(iValues);
    console.log("xeno ... createXenoItems with " + iValues.length + " case(s)");
    const out = await pluginHelper.createItems(
        iValues,
        XENO.constants.xenoDataSetName
    ); // no callback.

    //  make sure the case table is present
    codapInterface.sendRequest({
        "action": "create",
        "resource": "component",
        "values": {
            "type": "caseTable",
            "dataContext": XENO.constants.xenoDataSetName
        }
    });

    return out;     //  the awaited, resolved promise containing created items
}


/**
 * tell CODAP to make the tree.
 * If one exists, we will make a NEW one // todo: maybe check and don't do that.
 */
export function createTree() {
    const theArborRequest = {
        "action": "create",
        "resource": "component",
        "values": {
            "type": "game",
            "name": "name-webview",
            "title": "diagnostic tree",
            "URL": XENO.constants.arborURL,
            "dimensions": {
                "width": 500,
                "height": 555
            }
        }
    };

    codapInterface.sendRequest(theArborRequest);
}

export function openInstructions() {

    const theURL = `${XENO.constants.kInstructionsFolderURL}/${state.lang}/`;
    const theWebViewValues = {
        type: 'webView',
        name: "XenoInstructions",
        title: localize.getString("instructionsTitle"),
        dimensions: {
            width: 444,
            height: 555
        },
        position: "top",
        cannotClose: false,
        URL: theURL
    }

    const theMessage = {
        action : "create",
        resource : "component",
        values : theWebViewValues
    }

    codapInterface.sendRequest(theMessage); //  no need to await, let it do it whenever.
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


function getIFrameDescriptor() {
    return {
        version: XENO.constants.version,
        name: 'xeno',
        title: 'Arbor Xenobiological Services',
        dimensions: {width: 400, height: 177},
        preventDataContextReorg: false
    }
}

function getDatasetDescriptor() {

    const theObject = {
        name: XENO.constants.xenoDataSetName,
        title: XENO.constants.xenoDataSetTitle,
        description: 'our creatures',
        collections: [
            {
                name: XENO.constants.xenoCollectionName,
                labels: {
                    singleCase: "creature",
                    pluralCase: "creatures",
                    setOfCasesWithArticle: "list of creatures"
                },

                attrs: [ // note how this is an array of objects.
                    {
                        name: XENO.constants.healthAttributeName,
                        title: "health",
                        type: 'categorical',
                        description: localize.getString("attributeDescriptions.health"),
                        colormap: {
                            "sick": XENO.constants.sickColor,      //  maps to positive
                            "well": XENO.constants.wellColor       //  maps to negative
                        },
                        isDependent: true
                    },

                    /*  Actual creature attributes. The predictors. */
                    {
                        name: localize.getString("attributeNames.hair"),
                        type: 'categorical',
                        description: localize.getString("attributeDescriptions.hair"),
                        colormap: {
                            "blue": "cornflowerblue",
                            "pink": "hotpink"
                        }
                    },
                    {
                        name: localize.getString("attributeNames.eyes"),
                        type: 'categorical', description: localize.getString("attributeDescriptions.eyes"),
                        colormap: {
                            "purple": "#60a",
                            "orange": "orange"
                        }
                    },
                    {name: localize.getString("attributeNames.antennae"), type: 'categorical', precision: 0,
                        description: localize.getString("attributeDescriptions.antennae")},
                    {name: localize.getString("attributeNames.tentacles"), type: 'categorical', precision: 0,
                        description: localize.getString("attributeDescriptions.tentacles")},
                    {
                        name: localize.getString("attributeNames.height"),
                        type: 'numeric',
                        precision: 2,
                        unit: "fb",
                        description: localize.getString("attributeDescriptions.height")
                    },
                    {name: localize.getString("attributeNames.weight"),
                        type: 'numeric', precision: 2, unit: "lk",
                        description: localize.getString("attributeDescriptions.weight")},

                    /*
                        Various attributes that are NOT predictors
                     */

                    {
                        name: XENO.constants.diagnosisAttributeName,
                        title: localize.getString("attributeNames.diagnosis"), type: 'categorical',
                        description: localize.getString("attributeDescriptions.diagnosis")
                    },
                    {
                        name: XENO.constants.analysisAttributeName,
                        title: localize.getString("attributeNames.analysis"), type: 'categorical',
                        description: localize.getString("attributeDescriptions.analysis")
                    },
                    {
                        name: XENO.constants.sourceAttributeName,
                        title: localize.getString("attributeNames.source"),
                        type: 'categorical',
                        description: localize.getString("attributeDescriptions.source")
                    }
                ]
            }
        ]
    }

    return theObject;
}
