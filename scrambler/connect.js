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

    /**
     * Retrieves the structure (the result of a get data context)
     *
     * @param iDatasetName  the name of the dataset
     * @returns {Promise<*>}
     */
    getStructure: async function (iDatasetName) {
        const theMessage = {
            action: "get",
            resource: `dataContext[${iDatasetName}],`
        }
        const theStructure = await codapInterface.sendRequest(theMessage);

        return theStructure;
    },

    /**
     * Retrieve "Attribute Lists" from each collection
     *
     * @param iDataSetName
     * @param iCollectionName
     * @returns {Promise<{}>}
     */
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

    /**
     * retrieve all of the info for a particular attribute.
     * We got its name in the attribute list;
     * this provides its type, units, etc., and, importantly, function
     * (If it's a function, we will never choose to scramble it)
     *
     * @param iDataSetName
     * @param iCollectionName
     * @param iAttName
     * @returns {Promise<{data: [], info: *}>}
     */
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

    /**
     * Construct and return the <option> tags in the menu of all datasets
     *
     * @returns {Promise<string>}
     */
    makeDatasetMenuGuts: async function () {
        const theNames = await this.getListOfDataSetNames();
        let out = "";

        theNames.forEach(ds => {
            out += `<option value="${ds.name}">${ds.title}</option>`;
        });
        return out;
    },

    makeAttributeMenuGuts: function (iStructure) {
        let out = "<option value=null selected>everything!</option>";

        iStructure.values.collections.forEach(coll => {
            coll.attrs.forEach(att => {
                if (att.formula === undefined) {
                    out += `<option value="${att.name}">${att.name}</option>)`;
                }
            })
        })

        return out;
    },


    /**
     * Get the list of collections in the given dataset.
     * These collection names are essential for getTheseAttributes, above.
     *
     * @param iDatasetName
     * @returns {Promise<*>}
     */
    getAllCollections: async function (iDatasetName) {
        const tMessage = {
            action: "get",
            resource: `dataContext[${iDatasetName}].collectionList`,
        };
        const tAllCollectionsResult = await codapInterface.sendRequest(tMessage);
        return tAllCollectionsResult.values;    //  the array of collection info objects {name: xxx, title: yyy}
    },

    /**
     * Does an itemSearch to get all items in the dataset
     *
     * @param iDatasetName
     * @returns {Promise<[]>}   an array of the items, containing only the "values" objects
     */
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
        return outItems;
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

    createFreshOutputDataset: async function () {

        //  delete the old one
        const dMessage = {
            "action": "delete",
            "resource": `dataContext[${scrambler.scrambledDatasetName}]`,
        };
        await codapInterface.sendRequest(dMessage);

        //  construct the "values" field for the create request
        let theValues = {
            "name": scrambler.scrambledDatasetName,
            "title": scrambler.scrambledDatasetName,      //
            "collections": [{      //  includes new top-level collection
                name: scrambler.constants.scrambledTopLevelCollectionName,
                attrs: [{
                    name: scrambler.constants.scrambledIterationAttributeName,
                    precision: 0,
                    type: "numeric",
                }]
            }],
        };

        let parentCollectionName = scrambler.constants.scrambledTopLevelCollectionName;

        const originalStructure = await this.getStructure(scrambler.datasetName);

        //  start at the top, looping over the collections

        originalStructure.values.collections.forEach(col => {
            let thisCollection = {
                "name": col.name,
                "title": col.title,
                "parent": parentCollectionName,
                "attrs": []
            };

            parentCollectionName = col.name;

            //  now do the attributes directly
            col.attrs.forEach( att => {
                thisCollection.attrs.push({
                    name: att.name,
                    title : att.title,
                    formula : att.formula,
                    description : att.description,
                    precision : att.precision,
                    colormap : att.colormap,
                    type : att.type,
                })
            })

            theValues.collections.push(thisCollection);
        })

        //  make a new one
        const cMessage = {
            "action": "create",
            "resource": `dataContext`,
            "values": theValues,
        };
        await codapInterface.sendRequest(cMessage);

        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "dataContext": scrambler.scrambledDatasetName,
            }
        });
    },

    emitScrambledData: async function (iDatasetName, iItems) {
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