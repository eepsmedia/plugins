/*
==========================================================================

 * Created by tim on 11/27/20.
 
 
 ==========================================================================
connect in binomial

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


connect = {

    connectToCODAP: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
    },

    initialize: async function () {
        try {
            await pluginHelper.initDataSet(this.getBinomialDataContextSetupObject());

            //  restore the state if possible
            //  texty.state = codapInterface.getInteractiveState();
            //  then possibly get a fresh state here is the object is empty; see fish, e.g., for code

            console.log('binomial/CODAP connection init complete');
        } catch (msg) {
            console.log('Problem initializing the connection to CODAP: ' + msg);
        }

        //  now update the iframe to be mutable...

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
     *
     * @param iValues   an array of objects, each of which has runNumber, # of successes, failures, and total
     * @returns {Promise<void>}
     */
    emitData: async function (iValues) {

        iValues = pluginHelper.arrayify(iValues);
        try {
            const res = await pluginHelper.createItems(iValues, binomial.constants.kBinomialDataSetName);
        } catch (msg) {
            console.log("Problem emitting items using iValues[0] = " + JSON.stringify(iValues[0]));
            console.log(msg);
        }
    },

    makeTableAppear: function () {
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "name": binomial.constants.kBinomialDataSetName,
            }
        })
    },

    destroyDataset : async function() {
        await codapInterface.sendRequest({
            action : "delete",
            resource : `dataContext[${binomial.constants.kBinomialDataSetName}]`,
        });
        console.log(`deleted [${binomial.constants.kBinomialDataSetName}]`);
    },

    iFrameDescriptor: {
        version: binomial.constants.kVersion,
        name: 'binomial',
        title: 'Binomial Simulator',
        dimensions: {width: 366, height: 466},
        preventDataContextReorg: false,
    },

    getBinomialDataContextSetupObject: function () {
        const theObject = {
            name: binomial.constants.kBinomialDataSetName,
            title: binomial.constants.kBinomialDataSetTitle,
            description: 'binomial experiment data',
            collections:
                [
                    {
                        name: binomial.constants.kRunCollectionName,
                        labels: {
                            singleCase: "run",
                            pluralCase: "runs",
                            setOfCasesWithArticle: "the data from one run"
                        },

                        attrs: [ // note how this is an array of objects.
                            {name: "runNumber", type: 'categorical', description: "run number"},
                            {name: `${pluginLang.pluralize(binomial.state.words.atomicEventName)}`,
                                type: 'numeric', description: `number of ${pluginLang.pluralize(binomial.state.words.atomicEventName)} per experiment`},
                            {name: `${pluginLang.pluralize(binomial.state.words.experimentName)}`,
                                type: 'numeric', description: `number of ${pluginLang.pluralize(binomial.state.words.experimentName)} per run`},
                            {name: "trueP", type : "numeric", precision : 4,
                                description: `true probability of ${binomial.state.words.eventSuccess}`},
                        ]
                    },
                    {
                        name: pluginLang.pluralize(binomial.state.words.experimentName),
                        labels: {
                            singleCase: binomial.state.words.experimentName,
                            pluralCase: pluginLang.pluralize(binomial.state.words.experimentName),
                            setOfCasesWithArticle:
                                `the ${pluginLang.pluralize(binomial.state.words.experimentName)} from one run`,
                        },

                        parent: binomial.constants.kRunCollectionName,

                        attrs: [ // note how this is an array of objects.
                            {
                                name: binomial.state.words.eventSuccess,
                                type: 'numeric',
                            },
                            {
                                name: binomial.state.words.eventFailure,
                                type: 'numeric',
                            },
                        ]
                    }

                ]
        }
        return theObject;
    },


}