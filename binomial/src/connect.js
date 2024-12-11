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

import * as Root from './binomial.js'
import * as Language from "../strings/localize.js"


    export async function connectToCODAP() {
        await codapInterface.init(Root.iFrameDescriptor, null);
    }

    export async function initialize() {
        try {
            const theSetupObject = await getBinomialDataContextSetupObject();
            await pluginHelper.initDataSet(theSetupObject);

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
    }

    /**
     *
     * @param iValues   an array of objects, each of which has runNumber, # of successes, failures, and total
     * @returns {Promise<void>}
     */
    export async function emitData(iValues) {

        iValues = pluginHelper.arrayify(iValues);
        try {
            const res = await pluginHelper.createItems(iValues, Root.constants.kBinomialDataSetName);
        } catch (msg) {
            console.log("Problem emitting items using iValues[0] = " + JSON.stringify(iValues[0]));
            console.log(msg);
        }
    }

    export function makeTableAppear() {
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "name": Root.constants.kBinomialDataSetName,
            }
        })
    }

    export async function destroyDataset() {
        await codapInterface.sendRequest({
            action : "delete",
            resource : `dataContext[${Root.constants.kBinomialDataSetName}]`,
        });
        console.log(`deleted [${Root.constants.kBinomialDataSetName}]`);
    }

    async function getBinomialDataContextSetupObject() {
        const dsTitle = await Language.getString("labels.binomialDatasetTitle");
        const topCollectionName = await Language.getString("labels.topCollectionPluralCase");


        const theObject = {
            name: Root.constants.kBinomialDataSetName,
            title: dsTitle,
            description: 'binomial experiment data',
            collections:
                [
                    {
                        name: topCollectionName,
                        labels: {
                            singleCase: "run",
                            pluralCase: "runs",
                            setOfCasesWithArticle: "the data from one run"
                        },

                        attrs: [ // note how this is an array of objects.
                            {
                                name: `${Language.getString("attributeNames.runNumber")}`,
                                type: 'categorical',
                                description: Language.getString("attributeDescriptions.runNumber")
                            },
                            {
                                name: Root.state.words.atomicEventNamePlural,
                                type: 'numeric',
                                description: Language.getString("attributeDescriptions.eventsPerExperiment",
                                    Root.state.words.atomicEventNamePlural,
                                    Root.state.words.experimentName
                                ),
                            },
                            {
                                name: Root.state.words.experimentNamePlural,    //  experimentsPerRun
                                type: 'numeric',
                                description: Language.getString(
                                    "attributeDescriptions.experimentsPerRun",
                                    Root.state.words.experimentNamePlural
                                )
                            },
                            {
                                name: `${Language.getString("attributeNames.trueProbability")}`,
                                type : "numeric", precision : 4,
                                description: Language.getString("attributeDescriptions.trueProbability", Root.state.words.eventSuccess)
                            },
                        ]
                    },
                    {
                        name: Root.state.words.experimentNamePlural,
                        labels: {
                            singleCase: Root.state.words.experimentName,
                            pluralCase: Root.state.words.experimentNamePlural,
                            setOfCasesWithArticle:
                                `the ${Root.state.words.experimentNamePlural} from one run`,
                        },

                        parent: topCollectionName,

                        attrs: [ // note how this is an array of objects.
                            {
                                name: Root.state.words.eventSuccess,
                                type: 'numeric',
                                description: Language.getString("attributeDescriptions.eventSuccess",
                                    Root.state.words.eventSuccessPlural,
                                    Root.state.words.experimentName
                                )
                            },
                            {
                                name: Root.state.words.eventFailure,
                                type: 'numeric',
                                description: Language.getString("attributeDescriptions.eventFailure",
                                    Root.state.words.eventFailurePlural,
                                    Root.state.words.experimentName
                                )
                            },
                        ]
                    }

                ]
        }
        return theObject;
    }