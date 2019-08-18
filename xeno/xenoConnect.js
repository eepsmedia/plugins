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


var xenoConnect = {

    casesToProcess: 0,
    casesProcessed: [],

    /**
     * Set up connections with CODAP including subscribing to updateCases notifications
     *
     * @param iCallback
     */
    initialize: async function (iCallback) {
        await codapInterface.init(this.iFrameDescriptor, null).then(
            function () {
                pluginHelper.initDataSet(this.xenoDataContextSetupObject);

                //  restore the state if possible

                xeno.state = codapInterface.getInteractiveState();

                if (jQuery.isEmptyObject(xeno.state)) {
                    codapInterface.updateInteractiveState(xeno.freshState);
                    console.log("xeno: getting a fresh state");
                }
                console.log("xeno.state is " + JSON.stringify(xeno.state));   //  .length + " chars");

                //  receive notifications about updateCases (done by the tree!)

                const tResource = 'dataContextChangeNotice[' + xeno.constants.xenoDataSetName + ']';  //  todo resolve?
                // const tResource = 'dataContext[' + xeno.constants.xenoDataSetName + '].case';

                    codapInterface.on(
                    'notify',
                    tResource,
                    'updateCases',
                    xenoConnect.processUpdateCaseNotification.bind(this)
                );
                iCallback();
                console.log("xeno ... xenoConnect initialized");
            }.bind(this)
        );

        //      make the table(s) mutable

        const tMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };

        const updateResult = await codapInterface.sendRequest(tMessage);
    },

    /**
     * When the tree updates cases by setting the value for diagnosis,
     * we take those, evaluate the diagnoses, and set the value for analysis accordingly.
     *
     * @param iCommand
     * @param iCallback
     */
    processUpdateCaseNotification: async function (iCommand, iCallback) {
        const tAutoResultDisplay = document.getElementById("autoResultDisplay");

        const theOperation = iCommand.values.operation;
        const theResult = iCommand.values.result;

        console.log("xeno ... processUpdateCaseNotification <" + theOperation + ">");

        if (theResult.success) {
            // todo: NOTICE the kludge of using case IDs here.
            //  You will NOT get the right result if "analysis" has been promoted.
            console.log("xenoConnect <" + theOperation + "> case IDs: [" + theResult.caseIDs + "]");

            //  loop over all cases, constructing the compound request
            //  todo: if possible, get items rather than cases, by caseID

            if (typeof theResult.cases !== 'undefined') {
                theResult.cases.forEach((c) => {
                    const tValues = c.values;

                    xeno.scoreFromPerformance(tValues.analysis);
                    xenoConnect.casesToProcess -= 1;
                    xenoConnect.casesProcessed.push(tValues);
                })
            }
        } else {
            console.log(" *** xenoConnect fail on notification read ***");
        }

        //  the tree has diagnosed all of our new cases...

        if (xenoConnect.casesToProcess === 0) {
            const nCases = xenoConnect.casesProcessed.length;
            let tAutoResultText = nCases + ((nCases === 1) ? "&nbsp;case processed. " : "&nbsp;cases processed. ");
            let tNumberCorrect = 0;
            let tNumberUndiagnosed = 0;

            this.casesProcessed.forEach(function (c) {
                tNumberCorrect += (c.analysis.charAt(0) === "T") ? 1 : 0;
                tNumberUndiagnosed += (c.analysis.charAt(0) === "?") ? 1 : 0;
            });

            tAutoResultText += tNumberCorrect + "&nbsp;correct. ";

            if (tNumberCorrect === xenoConnect.casesProcessed.length) {
                tAutoResultText += "Great job! ";
            }

            if (tNumberUndiagnosed > 0) {
                tAutoResultText += "<br>Your tree left " + tNumberUndiagnosed
                    + ((tNumberUndiagnosed === 1) ? " case undiagnosed." : " cases undiagnosed.");
            }

            tAutoResultDisplay.innerHTML = tAutoResultText;
        }
    },


    /**
     * Tell CODAP to make items.
     * @param iValues   An array of objects containing the keys and values
     * corresponding to attributes and values of the new cases.
     */
    createXenoItems: async function (iValues) {

        this.casesToProcess = iValues.length;
        this.casesProcessed = [];

        iValues = pluginHelper.arrayify(iValues);
        console.log("Xeno ... createXenoItems with " + iValues.length + " case(s)");
        await pluginHelper.createItems(
            iValues,
            xeno.constants.xenoDataSetName
        ); // no callback.

        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "dataContext": xeno.constants.xenoDataSetName
            }
        });

    },
    /**
     * tell CODAP to make the tree.
     * If one exists, we will make a NEW one // todo: maybe check and don't do that.
     */
    createTree : function() {
        const theArborRequest = {
            "action": "create",
            "resource": "component",
            "values": {
                "type": "game",
                "name" : "name-webview",
                "title" : "diagnostic tree",
                "URL" : xeno.constants.arborURL,
                "dimensions" : {
                    "width" : 500,
                    "height" : 555
                }
            }
        };

        codapInterface.sendRequest(theArborRequest);
    },

    iFrameDescriptor: {
        version: xeno.constants.version,
        name: 'xeno',
        title: 'Arbor Xenobiological Services',
        dimensions: {width: 512, height: 180},
        preventDataContextReorg: false
    },

    xenoDataContextSetupObject : {},

};