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
        await codapInterface.init(this.iFrameDescriptor, null);
        await pluginHelper.initDataSet(this.univDataContextSetupObject);

        //  restore the state if possible

        nos2.state = await codapInterface.getInteractiveState();

        if (jQuery.isEmptyObject(nos2.state)) {
            await codapInterface.updateInteractiveState(nos2.constants.freshState);
            console.log("univ/nos2: getting a fresh state");
        }
        console.log("nos2.state is " + JSON.stringify(nos2.state));   //  .length + " chars");

        //  now update the iframe to be mutable...

        const tMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": true,         //      false.  Saves selection functionality
            }
        };

        const updateResult = await codapInterface.sendRequest(tMessage);
    },

/*
    saveItemsToCODAP: async function (iValues) {

        const makeItemsMessage = {
            action : "create",
            resource : "dataContext[" + univ.constants.kUnivDataSetName + "].item",
            values : iValues
        };

        const createItemsResult = await codapInterface.sendRequest(makeItemsMessage);

    },
*/

    /**
     *
     * @param iResult       a single Result or an array of Results
     * @returns {Promise<void>}
     */
    saveResultsToCODAP: async function (iResult) {

        if (!Array.isArray(iResult)) {
            iResult = [ iResult ];
        }

        let codapValues = [];
        iResult.forEach( r => {
            codapValues.push(r.toCODAPValuesObject());
        });

        const createItemsMessage = {
            action : "create",
            resource : "dataContext[" + univ.constants.kUnivDataSetName + "].item",
            values : codapValues
        };

        //  actually create the items
        const createItemsResult = await codapInterface.sendRequest(createItemsMessage);

        fireStoreToCODAPMaps.addResultsAndResponses(iResult, createItemsResult);    //  update ID maps

        //  make the case table in case it's not present
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "dataContext": univ.constants.kUnivDataSetName,
            }
        })

    },

    selectTheseCases : async function( iDataContextName, iCaseIDList )  {
        const tMessage = {
            "action" : "update",
            "resource": "dataContext[" + iDataContextName + "].selectionList",
            "values" : iCaseIDList,
        };

        const tSelectionResult = await codapInterface.sendRequest( tMessage );
        nos2.ui.update();
    },

    deselectTheseCases : async function( iDataContextName, iCaseIDList )  {
        // get the selection list...
        const theSelectedCaseIDs = await this.getListOfSelectedCaseIDs(iDataContextName);
        let theNewList = [];
        theSelectedCaseIDs.forEach( id => {
           if (!iCaseIDList.includes(id)) {
               theNewList.push(id);
           }
        });

        const tMessage = {
            "action": "create",
            "resource": "dataContext[" + iDataContextName + "].selectionList",
            "values": theNewList
        };

        await codapInterface.sendRequest( tMessage );
        nos2.ui.update();
    },

    getListOfSelectedCaseIDs : async function( iDataContextName ) {
        //  process the selected cases to make an array of caseIDs
        const tSelectionListMessage = {
            "action": "get",
            "resource": "dataContext[" + iDataContextName + "].selectionList"
        };
        const getSelectedCasesListResult = await codapInterface.sendRequest(tSelectionListMessage);

        let theSelectedCaseIDs = [];

        if (getSelectedCasesListResult.success) {
            getSelectedCasesListResult.values.forEach(obj => {

                //  Note: obj.collectionName holds the collection name at the level of selection;
                //  this could be important if the user has reorganized the table.

                theSelectedCaseIDs.push(obj.caseID);
            });
        }
        return theSelectedCaseIDs;
    },

    getAllCasesAsResultsWithSelection : async function(iDataContextName) {

        const theSelectedCaseIDs = await this.getListOfSelectedCaseIDs(iDataContextName);

       //   now get all the cases.

        //  NOTE: we use iDataContextName for the collection name. This is fundamentally wrong todo: fix this.
        //  One issue is to somehow find the collection name more generally.
        //  Next issue: you only get values at that level. So for now we will prohibit reorganization.
        //  but ultimately, CODAP needs a fix, OR we will have to recursively
        //  look up the tree -- each case result from caseSearch will have a parent item which is the caseID of the parent case.
        //  then restore any values stored in the parent that might be needed to construct the Result. What a pain.

        const getAllCasesMessage = {
            "action": "get",
            "resource": "dataContext[" + iDataContextName + "].collection[" + iDataContextName + "].caseSearch[epoch!=-1]"
        };

        const getAllCasesResult = await codapInterface.sendRequest(getAllCasesMessage);

        let allResults = [];    //  this will hold objects of class Result

        if (getAllCasesResult.success) {
            getAllCasesResult.values.forEach(aCase => {     // aCase has form.... {id : <caseID> values : {} }
                aCase.values.selected = theSelectedCaseIDs.includes(aCase.id);    //  insert a selected attribute
                aCase.values.caseID = aCase.id;     //  save the case ID for this result (need for selection)
                let aResult = Result.resultFromCODAPValues(aCase.values);
                allResults.push(aResult);
            });

            return allResults;
        } else {
            return null;
        }

    },

    deleteAllCases : async function ( ) {

        const deleteAllCasesMessage = {
            "action": "delete",
            "resource": `dataContext[${univ.constants.kUnivDataSetName}].collection[${univ.constants.kUnivCollectionName}].allCases`
        };

        const deleteAllCasesResult = await codapInterface.sendRequest(deleteAllCasesMessage);
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
                    {name: "dbid", type: 'categorical', description: "database ID"},
                    {name: "R", type: 'numeric', precision : 0, description: "# red"},
                    {name: "O", type: 'numeric', precision : 0, description: "# orange"},
                    {name: "G", type: 'numeric', precision : 0, description: "# blue"},
                    {name: "B", type: 'numeric', precision : 0, description: "# green"},
                    {name: "col", type: 'numeric', precision : 0, description: "column of upper left corner"},
                    {name: "row", type: 'numeric', precision : 0, description: "row of upper left corner"},
                    {name: "epoch", type: 'numeric', precision : 0, description: "when was this observation made?"},

                    {name: "dim", type: 'categorical', description: "size of the observation"},
                    {name: "teamCode", type: 'categorical', description: "which team found this"},
                    {name: "citation", type: 'categorical', description: "publication, if any"},
                ]
            }
        ]
    },

    iFrameDescriptor: {
        version: univ.constants.version,
        name: 'univ',
        title: 'four-color universe',
        dimensions: {width: 555, height: 500},
        preventDataContextReorg: true           //      doing this (and the thing in init) saves our selection functionality
    }

};