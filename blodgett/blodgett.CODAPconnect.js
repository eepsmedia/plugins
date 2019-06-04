/*
==========================================================================

 * Created by tim on 2019-05-25.
 
 
 ==========================================================================
blodgett.CODAPconnect in blodgett

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

/* global codapInterface    */

blodgett.CODAPconnect = {

    initialize: async function (iCallback) {
        await codapInterface.init(this.iFrameDescriptor, null)
        await pluginHelper.initDataSet(this.blodgettDataContextSetupObject);

        //  restore the state if possible

        blodgett.state = await codapInterface.getInteractiveState();

        if (jQuery.isEmptyObject(blodgett.state)) {
            await codapInterface.updateInteractiveState(blodgett.freshState);
            console.log("blodgett: getting a fresh state");
        }
        console.log("blodgett.state is " + JSON.stringify(blodgett.state));   //  .length + " chars");

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
            resource : "dataContext[" + blodgett.constants.kBlodgettDataSetName + "].item",
            values : iValues
        };

        const createItemsResult = await codapInterface.sendRequest(makeItemsMessage);
        this.makeCaseTableAppear();

    },

    makeNewAttributesIfNecessary : async function() {
        const theAttributes = blodgett.ui.getArrayOfChosenAttributes();
        await Promise.all(theAttributes.map(this.checkOneAttributeAndCreateIfNonexistent));
    },

    checkOneAttributeAndCreateIfNonexistent : async function(a) {
        const tMessage = {
            action: "get",
            resource: "dataContext[" + blodgett.constants.kBlodgettDataSetName + "].collection["
                + blodgett.constants.kBlodgettCollectionName + "].attribute[" + a.screenName + "]"
        };

        const attributeExistenceResult = await codapInterface.sendRequest(tMessage);

        if (attributeExistenceResult.success) {
            //  console.log("Attribute " + a.name + " exists as " + a.title);
        } else {
            console.log("Need to create attribute " + a.queryName + " as " + a.screenName);

            const naMessage = {
                action: "create",
                resource: "dataContext[" + blodgett.constants.kBlodgettDataSetName + "].collection["
                    + blodgett.constants.kBlodgettCollectionName + "].attribute",
                values : [
                    {
                        "name": a.screenName,
                        "title": a.screenName,
                        "description": a.description,
                        "unit" : a.units
                    }
                ]
            };
            const makeNewAttributeResult = await codapInterface.sendRequest(naMessage);

            if (makeNewAttributeResult.success) {
                console.log("Success creating " + a.screenName);
            } else {
                console.log("FAILED to create " + a.screenName);
            }
        }

    },

    makeCaseTableAppear : async function() {
        const theMessage = {
            action : "create",
            resource : "component",
            values : {
                type : 'caseTable',
                dataContext : blodgett.constants.kBlodgettDataSetName,
                name : blodgett.constants.kBlodgettDataSetName,
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

    blodgettDataContextSetupObject: {
        name: blodgett.constants.kBlodgettDataSetName,
        title: blodgett.constants.kBlodgettDataSetTitle,
        description: 'blodgett forest portal',
        collections: [
            {
                name: blodgett.constants.kBlodgettCollectionName,
                labels: {
                    singleCase: "time",
                    pluralCase: "times",
                    setOfCasesWithArticle: "the data"
                },

                attrs: [ // note how this is an array of objects. These are the "requires" attributes.
                    {name: "sample", type: 'categorical', description: "sample number"},
                    {name: "when", type: 'date', description: "date and time"},
                    {name: "hour", type: 'numeric', description: "hour (24-hour clock)", precision : 2, units: "hours"},
                    {name: "decimalDate", type: 'numeric', description: "decimal date", units: "days"},
                    {name: "stringDate", type: 'categorical', description: "date as a string"},
                ]
            }
        ]
    },

    iFrameDescriptor: {
        version: blodgett.constants.version,
        name: 'blodgett',
        title: 'Blodgett Forest Data Portal',
        dimensions: {width: 400, height: 222},
        preventDataContextReorg: false
    }

};