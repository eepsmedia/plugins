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
        const theDescriptor = this.getFrameDescriptor(netwise.constants.version);
        await codapInterface.init(theDescriptor, null);

    },

    getFrameDescriptor: function (iVersion) {
        let theDescriptor = {
            version: iVersion,
            name: 'netwise',
            title: 'network/graph tool',
            dimensions: {width: 200, height: 366},
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

/*
        let outItems = [];
        tAllItemsResult.values.forEach(
            item => {
                outItems.push(item.values);
            }
        );
        return  outItems;
*/
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

    getListOfAttributes : async function(iDatasetName) {
        let listOfAttributes = [];
        const tMessage = {
            action : "get",
            resource : `dataContext[${iDatasetName}]`
        }

        try {
            const tDatasetResult = await codapInterface.sendRequest(tMessage);
            const tCollections = tDatasetResult.values.collections;

            tCollections.forEach( c => {
                c.attrs.forEach( a => {
                    listOfAttributes.push(a);   //  the CODAP attribute object
                })
            })
            return listOfAttributes;
        } catch (e) {
            console.log(`CODAP error getting attribute list: ${e}`);
            return null;
        }

    },

}