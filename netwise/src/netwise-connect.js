/*
==========================================================================

 * Created by tim on 12/26/20.
 
 
 ==========================================================================
netwise-connect.js in netwise

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
    initialize: async function () {
        const theDescriptor = this.getFrameDescriptor(linky.constants.version);
        await codapInterface.init(theDescriptor, null);
    },

    getFrameDescriptor: function (iVersion) {
        let theDescriptor = {
            version: iVersion,
            name: 'netwise',
            title: 'network/graph tool',
            dimensions: {width: 222, height: 366},
        };
        return theDescriptor;
    },

    getAllItems: async function (iDatasetName) {
        const tMessage = {
            action: "get",
            resource: `dataContext[${iDatasetName}].itemSearch[*]`,
        };
        try {
            const tAllItemsResult = await codapInterface.sendRequest(tMessage);
            return tAllItemsResult;     //  data are in result.values.
        } catch (e) {
            console.log(`CODAP error getting all items from ${iDatasetName}: ${e}`);
        }
    },


    getAllCases: async function (iDatasetName) {
        const tMessage = {
            action: "get",
            resource: `dataContext[${iDatasetName}].collection[${linky.state.idCollectionName}].caseSearch[*]`,
        };
        try {
            const tAllCasesResult = await codapInterface.sendRequest(tMessage);
            return tAllCasesResult;     //  data are in result.values.
        } catch (e) {
            console.log(`CODAP error getting all cases from ${iDatasetName}: ${e}`);
        }
    },


    getListOfDataSetNames: async function () {
        this.listOfDataSetNames = [];
        const tMessage = {
            action: "get",
            resource: "dataContextList"
        };
        const tListResult = await codapInterface.sendRequest(tMessage);
        if (tListResult.success) {
            tListResult.values.forEach((ds) => {
                this.listOfDataSetNames.push({
                    name: ds.name,
                    title: ds.title,
                });
            });
        }
        return this.listOfDataSetNames;
    },

    getDSInfoByName: async function (iDatasetName) {
        const tMessage = {
            action: "get",
            resource: `dataContext[${iDatasetName}]`
        }

        try {
            const tDatasetResult = await codapInterface.sendRequest(tMessage);
            return tDatasetResult;
        } catch (msg) {
            Swal.fire({icon: "error"});
            return null;
        }
    },

    setUpNotifications: async function () {

        const tResource = `dataContext[${linky.state.datasetName}].attribute`;

        //  register to receive notifications about selection

        const sResource = `dataContextChangeNotice[${linky.state.datasetName}]`;
        codapInterface.on(
            'notify',
            sResource,
            'selectCases',
            this.handleSelectionChangeFromCODAP
        );

        console.log(`Asked for getting selectCases on [${sResource}]`);
    },

    handleSelectionChangeFromCODAP : async function() {

        //  get the list of selected cases

        const selectionListResource = `dataContext[${linky.state.datasetName}].selectionList`;
        const gMessage = {
            "action": "get", "resource": selectionListResource
        }
        const getSelectionResult = await codapInterface.sendRequest(gMessage);

        //  now we get the information on all of these cases: what are the values of the "id" attribute?
        //  we can then use that to select the cases in the network

        let theNetIDs = [];

        if (getSelectionResult.success) {

            let thePromises = [];

            getSelectionResult.values.forEach( aValue => {  //  these values have caseID as well as other stuff.
                const cid = aValue.caseID;
                const tResource = `dataContext[${linky.state.datasetName}].itemByCaseID[${cid}]`;
                const aPromise = codapInterface.sendRequest({"action" : "get" , "resource" : tResource});
                thePromises.push(aPromise);
            })

            const allItems = await Promise.all(thePromises);
            allItems.forEach( anItem => {
                theNetIDs.push(anItem.values.values[linky.state.id_attribute]);
            })

            console.log(theNetIDs);
            linkyModel.selectTheseNodes(theNetIDs);
        }

        netwiseUI.update();

    },

    /**
     * Set the selection list in CODAP based on the values of the "selected" field in the model.
     * Not awaited becasue we don't care.
     *
     * Called from the `NodeView.clickOnNode` handler.
     */
    setCODAPSelection : function() {
        theSelectedCaseIDs = [];
        linkyModel.nodes.forEach( aNode => {
            if (aNode.selected) theSelectedCaseIDs.push(aNode.codapCaseID);
        })

        const tMessage = {
            "action": "create",
            "resource": `dataContext[${linky.state.datasetName}].selectionList`,
            "values": theSelectedCaseIDs
        }

        codapInterface.sendRequest(tMessage);
    },

    updateLinks : async function(iNode) {
        let valuesObject = {};
        valuesObject[linky.state.link_attribute] = iNode.links.join(", ");

        const tMessage = {
            "action": "update",
            "resource": `dataContext[${linky.state.datasetName}].collection[${linky.state.idCollectionName}].caseByID[${iNode.codapCaseID}]`,
            "values": {
                "values": valuesObject
            },
        }

        try {
            await codapInterface.sendRequest(tMessage);
        } catch (msg) {
            Swal.fire({
                icon: 'error',
                title: "Curses!",
                text: `Trouble setting links in CODAP from ${iNode.name}: ${msg}`,
            });

        }

    },


    /*
        getListOfAttributes: async function (iDatasetName) {
            let listOfAttributes = [];

                const tDatasetResult = await this.getDSInfoByName(iDatasetName);
                const tCollections = tDatasetResult.values.collections;

                tCollections.forEach(c => {
                    c.attrs.forEach(a => {
                        listOfAttributes.push(a);   //  the CODAP attribute object
                    })
                })
                return listOfAttributes;
        },
    */

}