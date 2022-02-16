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

        if (theResult.success) {
            // todo: NOTICE the kludge of using case IDs here.
            //  You will NOT get the right result if "analysis" has been promoted.

            //  loop over all cases. Notice that the cases are already updated (by arbor)
            //  we're just checking to see how the tree did.
            //  todo: if possible, get items rather than cases, by caseID

            if (typeof theResult.cases !== 'undefined') {

                theResult.cases.forEach((c) => {
                    const thisCaseIndex = xeno.casesPendingDiagnosis.indexOf(c.id);
                    if (thisCaseIndex !== -1) {  // it's in the list
                        xeno.casesPendingDiagnosis.splice(thisCaseIndex, 1);    //  remove it
                        const tValues = c.values;

                        xeno.scoreFromPerformance(tValues.analysis);
                        xenoConnect.casesToProcess -= 1;
                        xenoConnect.casesProcessed.push(tValues);
                        console.log("xeno ... xenoConnect <" + theOperation + "> case IDs: [" + theResult.caseIDs + "], "
                            + xenoConnect.casesToProcess + " remain.");
                    } else {
                        console.log("xeno ... xenoConnect. Case " + c.id + " is not in the cases-to-process array.")
                    }
                })

            } else {
                console.log("xeno ... xenoConnect. Hmmm! got a result without cases: " + JSON.stringify(theResult));
            }
        } else {
            console.log(" *** xenoConnect fail on notification read ***");
        }

        //  the tree has diagnosed all of our new cases...
        //  now we assemble the summary text

        const nCases = xenoConnect.casesProcessed.length;
        let tAutoResultText = nCases + ((nCases === 1) ? "&nbsp;case processed. " : "&nbsp;cases processed. ");
        let tNumberCorrect = 0;
        let tNumberUndiagnosed = 0;

        /*
        This thing gets called for the update on each case. So this code runs many times, changing the
        text about how an auto-diagnosis has done.

        But it happens quickly, so only the last one sticks. That's dependent on this array,
        xenoConnect.casesProcessed. It gets set (emptied) in creatXenoItems, (and updated above)
        so even though this code may run over the ENTIRE
        set of cases, we only count up the results for the cases in that casesProcessed array.
         */
        this.casesProcessed.forEach(function (c) {
            const theAnalysis = c[xeno.constants.analysisAttributeName];
            tNumberCorrect += (theAnalysis.charAt(0) === "T") ? 1 : 0;
            tNumberUndiagnosed += (theAnalysis.charAt(0) === "?") ? 1 : 0;
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
        console.log("xeno ... createXenoItems with " + iValues.length + " case(s)");
        const out = await pluginHelper.createItems(
            iValues,
            xeno.constants.xenoDataSetName
        ); // no callback.

        //  make sure the case table is present
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "dataContext": xeno.constants.xenoDataSetName
            }
        });

        return out;     //  the awaited, resolved promise containing created items
    },
    /**
     * tell CODAP to make the tree.
     * If one exists, we will make a NEW one // todo: maybe check and don't do that.
     */
    createTree: function () {
        const theArborRequest = {
            "action": "create",
            "resource": "component",
            "values": {
                "type": "game",
                "name": "name-webview",
                "title": "diagnostic tree",
                "URL": xeno.constants.arborURL,
                "dimensions": {
                    "width": 500,
                    "height": 555
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

    xenoDataContextSetupObject: {},

};