/*
==========================================================================

 * Created by tim on 2019-06-25.
 
 
 ==========================================================================
sentiConnect in sentimento

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

sentimento.connect = {

    initialize: async function () {
        try {
            await codapInterface.init(this.iFrameDescriptor, null);
            await pluginHelper.initDataSet(this.sentimentoDataContextSetupObject);

            //  restore the state if possible
            //  sentimento.state = codapInterface.getInteractiveState();
            //  then possibly get a fresh state here is the object is empty; see fish, e.g., for code

            console.log('CODAP connection init complete');
        }
        catch (msg) {
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

    makeTableAppear : function() {
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "name": sentimento.constants.kSentiDataSetName
            }
        })
    },

    sendCases: async function (iValues) {

        iValues = pluginHelper.arrayify(iValues);
        try {
            const res = await pluginHelper.createItems(iValues, sentimento.constants.kSentiDataSetName);
            //  console.log("Resolving sendCases with " + JSON.stringify(res));
        }
        catch (msg) {
            console.log("Problem emitting text items using iValues[0] = " + JSON.stringify(iValues[0]));
            console.log(msg);
        }
    },

    iFrameDescriptor: {
        version: sentimento.constants.version,
        name: 'sentimento',
        title: 'Simple Text Analysis',
        dimensions: {width: 300, height: 400},
        preventDataContextReorg: false
    },

    sentimentoDataContextSetupObject: {
        name: sentimento.constants.kSentiDataSetName,
        title: sentimento.constants.kSentiDataSetTitle,
        description: 'text data',
        collections: [
            {
                name: sentimento.constants.kSentiTextCollectionName,
                labels: {
                    singleCase: "sample",
                    pluralCase: "samples",
                    setOfCasesWithArticle: "one sample text"
                },

                attrs: [ // note how this is an array of objects.
                    {name: "textNumber",type: 'categorical', description: "text number"},
                    {name: "text",type: 'categorical', description: "the text"},
                    {name: "nWords",type: 'number', description: "number of words in the text"},
                    {name: "sumSent", type: "number", formula: "sum(sentiment)", description: "total of sentiment scores"},
                ]
            },
            {
                name: sentimento.constants.kSentiWordCollectionName,
                labels: {
                    singleCase: "word",
                    pluralCase: "words",
                    setOfCasesWithArticle: "the words from one text"
                },

                parent : sentimento.constants.kSentiTextCollectionName,

                attrs: [ // note how this is an array of objects.
                    {name: "sWord", type: 'categorical', description: "a word"},
                    {name: "sentiment", type: 'number', description: "the 'sentiment' associated with that word"},
                ]
            }


        ]
    },
};