/*
==========================================================================

 * Created by tim on 8/21/20.
 
 
 ==========================================================================
model in lens

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


/**
 This singleton, `model`, keeps track of which cases and which atttributes are included.
 */

/*
    STRUCTURE OF "situation": (inherited from scrambler)

    {
        datasetName : <the name>,
        collections (Array) : [
            {  (a collection; each collection is an OBJECT...
                attributes :    {
                    OBJECT keyed by attribute name, e.g. foo
                    foo : {
                        data : [] ARRAY of data values
                        info : { OBJECT of metadata, including
                            name, type, hidden, precision, description, unit
                        }
                    }
                }
                collection : {
                    OBJECT. keys: name, title, guid, id.
                }
            }
            { another collection
            }
        ]
    }

 */
let model = {

    attributes : new Set(),
    cases : new Set(),
    situation : {},

    initialize : function() {
        this.attributes = new Set();
        this.cases = new Set();
    },


    getStructure: async function (iDatasetName) {
        console.log(`≈   extracting attributes from [${iDatasetName}]`);

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



}