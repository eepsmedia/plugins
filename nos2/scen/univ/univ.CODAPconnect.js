/*
==========================================================================

 * Created by tim on 9/25/18.
 
 
 ==========================================================================
univ.CODAPconnect in nos2

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

univ.CODAPconnect = {

    initialize: async function (iCallback) {
        await codapInterface.init(this.iFrameDescriptor, null)
        await pluginHelper.initDataSet(this.univDataContextSetupObject);

        //  restore the state if possible

        univ.state = await codapInterface.getInteractiveState();

        if (jQuery.isEmptyObject(univ.state)) {
            await codapInterface.updateInteractiveState(univ.freshState);
            console.log("univ: getting a fresh state");
        }
        console.log("univ.state is " + JSON.stringify(univ.state));   //  .length + " chars");

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

    saveItemsToCODAP: async function (iValues) {

        const makeItemsMessage = {
            action : "create",
            resource : "dataContext[" + univ.constants.kUnivDataSetName + "].item",
            values : iValues
        };

        const createItemsResult = await codapInterface.sendRequest(makeItemsMessage);

    },

    saveResultsToCODAP: async function (iResult) {

        if (!Array.isArray(iResult)) {
            iResult = [ iResult ];
        }

        let iValues = [];
        iResult.forEach( r => {
            iValues.push(r.toCODAPValuesObject());
        });

        const makeItemsMessage = {
            action : "create",
            resource : "dataContext[" + univ.constants.kUnivDataSetName + "].item",
            values : iValues
        };

        const createItemsResult = await codapInterface.sendRequest(makeItemsMessage);

    },

    getAllCases: async function() {
        const theMessage = {
            "action": "get",
            "resource": "dataContext[" + univ.constants.kUnivDataSetName + "].itemSearch[epoch!=-1]"
        };

        const getAllCasesResult = await codapInterface.sendRequest(theMessage);
        return getAllCasesResult;
    },

    getSelectedCases: async function() {
        const theMessage = {
            "action": "get",
            "resource": "dataContext[" + univ.constants.kUnivDataSetName + "].selectionList"
        };

        const getSelectedCasesListResult = await codapInterface.sendRequest(theMessage);

        let allSelectedCases = [];
        let theCasePromises = [];
        if (getSelectedCasesListResult.success) {
            getSelectedCasesListResult.values.forEach( obj => {     //  obj is of form {caseid : 17, collectionName : "univ" ...}
                const resource = "collection[" + obj.collectionName + "].caseByID[" + obj.caseID + "]";
                theCasePromises.push( codapInterface.sendRequest({action : "get", resource : resource}));
            });
            allSelectedCases = await Promise.all(theCasePromises);
        } else {

        }
        return allSelectedCases;
    },

    univDataContextSetupObject: {
        name: univ.constants.kUnivDataSetName,
        title: univ.constants.kUnivDataSetTitle,
        description: 'four-color universe',
        collections: [
            {
                name: univ.constants.kUnivCollectionName,
                labels: {
                    singleCase: "result",
                    pluralCase: "results",
                    setOfCasesWithArticle: "a set of results"
                },

                attrs: [ // note how this is an array of objects.
                    {name: "dbid", type: 'numeric', precision : 0, description: "database ID"},
                    {name: "O", type: 'numeric', precision : 0, description: "# orange"},
                    {name: "R", type: 'numeric', precision : 0, description: "# red"},
                    {name: "G", type: 'numeric', precision : 0, description: "# blue"},
                    {name: "B", type: 'numeric', precision : 0, description: "# green"},
                    {name: "col", type: 'numeric', precision : 0, description: "column of upper left corner"},
                    {name: "row", type: 'numeric', precision : 0, description: "row of upper left corner"},
                    {name: "epoch", type: 'numeric', precision : 0, description: "when was this observation made?"},

                    {name: "dim", type: 'categorical', description: "size of the observation"},
                    {name: "teamID", type: 'numeric', precision : 0, description: "which team (ID) found this"},
                    {name: "source", type: 'categorical', description: "publication, if any"},
                ]
            }
        ]
    },

    iFrameDescriptor: {
        version: univ.constants.version,
        name: 'univ',
        title: 'four-color universe',
        dimensions: {width: 555, height: 500},
        preventDataContextReorg: false
    }

};