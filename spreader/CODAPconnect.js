/*
==========================================================================

 * Created by tim on 8/25/19.
 
 
 ==========================================================================
CODAPconnect in spreader

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

spreader.connect = {

    listOfDataSetNames: [],

    listOfAttributeNames: [],

    iFrameDescriptor: {
        name: spreader.constants.DSname,
        title: spreader.constants.DSname,
        version: spreader.constants.version,
        dimensions: spreader.constants.dimensions,      //      dimensions,
    },

    initialize: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
    },

    getDataSetInfo: async function (iName) {
        const tResource = "dataContext[" + iName + "]";
        const tMessage = {"action": "get", "resource": tResource};
        return await codapInterface.sendRequest(tMessage);
    },


    getListOfDataSetNames: async function () {
        this.listOfDataSetNames = [];
        const tMessage = {
            "action": "get",
            "resource": "dataContextList"
        };
        const tListResult = await codapInterface.sendRequest(tMessage);
        if (tListResult.success) {
            tListResult.values.forEach((ds) => {
                this.listOfDataSetNames.push(ds.name);
            });
        }
        return this.listOfDataSetNames;
    },

    getAllCases: async function (iCollection) {
        const tResource = "dataContext[" + spreader.state.tidyDataSetName + "].collection[" +
            iCollection + "].allCases";
        const tMessage = {
            "action": "get",
            "resource": tResource
        };
        const tAllCasesResult = await codapInterface.sendRequest(tMessage);
        return tAllCasesResult;
    },

    makeSpreadDataset: async function (iName, iAttributes) {

        //  destroy the old spread dataset

        const deleteMessage = {"action": "delete", "resource": "dataContext[" + iName + "]"};
        const tDeleteDSResult = await codapInterface.sendRequest(deleteMessage);

        //  create the spread dataset
        const tValues = {
            "name": iName,
            "collections": [
                {
                    "name": iName,
                    "attrs": iAttributes,
                }
            ]
        };
        const createMessage = {
            "action": "create",
            "resource": "dataContext",
            "values": tValues,
        };
        const theResult = await codapInterface.sendRequest(createMessage);

        //  make the case table appear
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "dataContext": iName,
            }
        })

        return theResult;
    },

    fillSpreadDataset : async function(iName, iValues) {
        const tResource = "dataContext[" + iName + "].item";
        const tFillMessage = {
            "action" : "create",
            "resource" : tResource,
            "values" : iValues,
        };
        return await codapInterface.sendRequest(tFillMessage);
    },
};