/*
==========================================================================

 * Created by tim on 2019-06-25.
 
 
 ==========================================================================
textyConnect in texty

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

texty.connect = {

    initialize: async function () {
        try {
            await codapInterface.init(this.iFrameDescriptor, null);
            await pluginHelper.initDataSet(this.textyDataContextSetupObject);

            //  restore the state if possible
            //  texty.state = codapInterface.getInteractiveState();
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
                "name": texty.constants.kTextyDataSetName
            }
        })
    },

    sendCases: async function (iValues) {

        iValues = pluginHelper.arrayify(iValues);
        try {
            const res = await pluginHelper.createItems(iValues, texty.constants.kTextyDataSetName);
            //  console.log("Resolving sendCases with " + JSON.stringify(res));
        }
        catch (msg) {
            console.log("Problem emitting text items using iValues[0] = " + JSON.stringify(iValues[0]));
            console.log(msg);
        }
    },

    iFrameDescriptor: {
        version: texty.constants.version,
        name: 'texty',
        title: 'Simple Text Analysis',
        dimensions: {width: 300, height: 333},
        preventDataContextReorg: false              //  todo: figure out why this seems not to work!
    },

    textyDataContextSetupObject: {
        name: texty.constants.kTextyDataSetName,
        title: texty.constants.kTextyDataSetTitle,
        description: 'text data',
        collections: [
            {
                name: texty.constants.kTextySampleCollectionName,
                labels: {
                    singleCase: "sample",
                    pluralCase: "samples",
                    setOfCasesWithArticle: "the text from one sample"
                },

                attrs: [ // note how this is an array of objects.
                    {name: "sample",type: 'categorical', description: "sample number"}
                ]
            },
            {
                name: texty.constants.kTextyLetterCollectionName,
                labels: {
                    singleCase: "letter",
                    pluralCase: "letters",
                    setOfCasesWithArticle: "the letters from one sample"
                },

                parent : texty.constants.kTextySampleCollectionName,

                attrs: [ // note how this is an array of objects.
                    {name: "letter", type: 'categorical', description: "a letter"},
                    {name: "digraph", type: 'categorical', description: "two letters that appeared together"},
                ]
            }


        ]
    },
};