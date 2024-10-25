/*
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/21/18 8:32 AM
 *
 * Created by Tim Erickson on 8/21/18 8:32 AM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 * ==========================================================================
 *
 */

//  import codapInterface from "../common/codapInterface";

nhanes.CODAPconnect = {

    initialize: async function (iCallback) {
        await codapInterface.init(this.iFrameDescriptor, null)
        await pluginHelper.initDataSet(this.NHANESDataContextSetupObject);

        //  restore the state if possible

        nhanes.state = await codapInterface.getInteractiveState();

        if (jQuery.isEmptyObject(nhanes.state)) {
            await codapInterface.updateInteractiveState(nhanes.freshState);
            console.log("nhanes: getting a fresh state");
        }
        console.log("nhanes.state is " + JSON.stringify(nhanes.state));   //  .length + " chars");

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

    saveCasesToCODAP: async function (iValues) {
        await this.makeNewAttributesIfNecessary();

        const makeItemsMessage = {
            action : "create",
            resource : "dataContext[" + nhanes.constants.kNHANESDataSetName + "].item",
            values : iValues
        };

        const createItemsResult = await codapInterface.sendRequest(makeItemsMessage);

    },

    makeNewAttributesIfNecessary : async function() {
        const theAttributes = nhanes.ui.getArrayOfChosenAttributes();
        await Promise.all(theAttributes.map(this.checkOneAttributeAndCreateIfNonexistent));
    },

    checkOneAttributeAndCreateIfNonexistent : async function(a) {
        const tMessage = {
            action: "get",
            resource: "dataContext[" + nhanes.constants.kNHANESDataSetName + "].collection["
                + nhanes.constants.kNHANESCollectionName + "].attribute[" + a.title + "]"
        };

        const attributeExistenceResult = await codapInterface.sendRequest(tMessage);

        if (attributeExistenceResult.success) {
            //  console.log("Attribute " + a.name + " exists as " + a.title);
        } else {
            console.log("Need to create attribute " + a.name + " as " + a.title);

            const naMessage = {
                action: "create",
                resource: "dataContext[" + nhanes.constants.kNHANESDataSetName + "].collection["
                    + nhanes.constants.kNHANESCollectionName + "].attribute",
                values : [
                    {
                        "name": a.title,
                        "title": a.title,
                        "description": a.description,
                        "unit" : a.units
                    }
                ]
            };
            const makeNewAttributeResult = await codapInterface.sendRequest(naMessage);

            if (makeNewAttributeResult.success) {
                console.log("Success creating " + a.title);
            } else {
                console.log("FAILED to create " + a.title);
            }
        }

    },

    makeCaseTableAppear : async function() {
        const theMessage = {
            action : "create",
            resource : "component",
            values : {
                type : 'caseTable',
                dataContext : nhanes.constants.kNHANESDataSetName,
                name : nhanes.constants.kNHANESCaseTableName,
                cannotClose : true
            }
        };

        const makeCaseTableResult = await codapInterface.sendRequest( theMessage );
        if (makeCaseTableResult.success) {
            console.log("Success creating case table: " + theMessage.values.name);
        } else {
            console.log("FAILED to create case table: " + theMessage.values.name);
        }

    },

    NHANESDataContextSetupObject: {
        name: nhanes.constants.kNHANESDataSetName,
        title: nhanes.constants.kNHANESDataSetTitle,
        description: 'NHANES portal',
        collections: [
            {
                name: nhanes.constants.kNHANESCollectionName,
                labels: {
                    singleCase: "person",
                    pluralCase: "people",
                    setOfCasesWithArticle: "a sample of people"
                },

                attrs: [ // note how this is an array of objects.
                    {name: "sample", type: 'categorical', description: "sample number"},
                ]
            }
        ]
    },


    iFrameDescriptor: {
        version: nhanes.constants.version,
        name: 'nhanes2015',
        title: 'NHANES 2015',
        dimensions: {width: 444, height: 555},
        preventDataContextReorg: false
    }
};