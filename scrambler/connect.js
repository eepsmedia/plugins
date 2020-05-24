/*
==========================================================================

 * Created by tim on 5/23/20.
 
 
 ==========================================================================
connect in scrambler

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


let connect;

connect = {

    theCollections: {},

    initialize: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
    },

    getStructure: async function (iDatasetName) {
        let theStructure = {
            dataSetName: iDatasetName,
            collections: [],
        };
        const theCollections = await this.getAllCollections(iDatasetName);

        for (const col of theCollections) {
            let attributesForThisCollection = await this.getTheseAttributes(iDatasetName, col.name);
            const tCollection = {
                collection: col,
                attributes: attributesForThisCollection,
            };
            theStructure.collections.push(tCollection);  //top level is an array of collections
        }

        return theStructure;
    },

    getTheseAttributes: async function (iDataSetName, iCollectionName) {
        let allAttsObject = {};     //   might should be an array....
        const tMessage = {
            action: "get",
            resource: `dataContext[${iDataSetName}].collection[${iCollectionName}].attributeList`,
        };
        const tALR = await codapInterface.sendRequest(tMessage);
        const attsInfo = tALR.values;   //  array of attribute names

        for (const ai of attsInfo) {
            const thisAtt = await this.getThisAttribute(iDataSetName, iCollectionName, ai.name);
            const tAttObject = {
                info: thisAtt.info,
                data: thisAtt.data,
            };
            allAttsObject[ai.name] = tAttObject;
        }
        return allAttsObject;
    },

    getThisAttribute: async function (iDataSetName, iCollectionName, iAttName) {

        const aMessage = {
            "action": "get",
            "resource": `dataContext[${iDataSetName}].collection[${iCollectionName}].attribute[${iAttName}]`,
        };
        const thisAttributeResult = await codapInterface.sendRequest(aMessage);
        delete thisAttributeResult.values.id;
        delete thisAttributeResult.values.guid;
        delete thisAttributeResult.values.cid;

        return {
            info: thisAttributeResult.values,
            data: [],
        }
    },

    makeDatasetMenuGuts: async function () {
        const theNames = await this.getListOfDataSetNames();
        let out = "";

        theNames.forEach(ds => {
            out += `<option value="${ds.name}">${ds.title}</option>`;
        });
        return out;
    },

    getAllCollections: async function (iDatasetName) {
        const tMessage = {
            action: "get",
            resource: `dataContext[${iDatasetName}].collectionList`,
        };
        const tAllCollectionsResult = await codapInterface.sendRequest(tMessage);
        return tAllCollectionsResult.values;    //  the array of collection info objects {name: xxx, title: yyy}
    },

    getAllItems: async function (iDatasetName) {
        const tMessage = {
            action: "get",
            resource: `dataContext[${iDatasetName}].itemSearch[*]`,
        };
        const tAllItemsResult = await codapInterface.sendRequest(tMessage);

        let outItems = [];
        tAllItemsResult.values.forEach(
            item => {
                outItems.push(item.values);
            }
        );
        return  outItems;
    },

    getAllCases: async function (iCollection) {
        const tResource = "dataContext[" + spreader.state.tidyDataSetName + "].collection[" +
            iCollection + "].allCases";
        const tMessage = {
            action: "get",
            resource: tResource
        };
        const tAllCasesResult = await codapInterface.sendRequest(tMessage);
        return tAllCasesResult;
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

    createFreshOutputDataset : async function(iSituation) {
        const newName = "scram_" + iSituation.dataSetName;

        //  delete the old one
        const dMessage = {
            "action" : "delete",
            "resource" : `dataContext[${newName}]`,
        };
        await codapInterface.sendRequest(dMessage);

        //  construct the "values" field for the create request
        let theValues = {
            "name" : newName,
            "title" : newName,      //  todo: alter the title of the original
            "collections" : [{      //  includes new top-level collection
                name : scrambler.constants.scrambledTopLevelCollectionName,
                attrs : [{
                    name : scrambler.constants.scrambledIterationAttributeName,
                    precision : 0,
                    type : "numeric",
                }]
            }],
        };

        let parentCollectionName = scrambler.constants.scrambledTopLevelCollectionName;

        //  start at the top, looping over the collections
        for (const col of iSituation.collections) {
            let thisCollection = {
                "name" : col.collection.name,
                "title" : col.collection.title,
                "parent" : parentCollectionName,
                "attrs" : []
            };

            parentCollectionName = col.collection.name;

            //  stuff all attributes into the attrs field for this collection
            //  note that col.attributes is an OBJECT , not an ARRAY
            for (const attrName in col.attributes) {        //  so in, not of
                const theAttrThing = col.attributes[attrName];
                thisCollection.attrs.push(theAttrThing.info);
            }
            //  now `thisCollection` is complete
            theValues.collections.push(thisCollection);
        }

        //  make a new one
        const cMessage = {
            "action" : "create",
            "resource" : `dataContext`,
            "values" : theValues,
        };
        await codapInterface.sendRequest(cMessage);

        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "dataContext": newName,
            }
        });

        return newName;
    },

    emitScrambledData : async function(iDatasetName, iItems) {
        const cMessage = {
            "action": "create",
            "resource": `dataContext[${iDatasetName}].item`,
            "values": iItems
        };
        codapInterface.sendRequest(cMessage);   //  no need to await?
    },

    iFrameDescriptor: {
        name: scrambler.constants.pluginName,
        title: scrambler.constants.pluginName,
        version: scrambler.constants.version,
        dimensions: scrambler.constants.dimensions,      //      dimensions,
    },
};