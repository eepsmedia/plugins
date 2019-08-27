/*
==========================================================================

 * Created by tim on 8/25/19.
 
 
 ==========================================================================
spreader in spreader

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

LOCAL:  http://localhost:8888/plugins/spreader/

LOCAL MAMP:
*/

let spreader = {
    initialize: async function () {
        await spreader.connect.initialize();  //  must wait for the CODAP connection before any UI
        await spreader.ui.initialize();

        //  make the tables reorg-able
        const tMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };
        await codapInterface.sendRequest(tMessage);
    },

    state: {
        tidyDataSetName: null,
        typeAttribute: null,
        valueAttribute: null,
        unitsAttribute: null,

        tidyDataSetResult : null,
    },

    refresh : function() {
        spreader.ui.initialize();
    },

    pickDataSet: async function (iName) {
        this.state.tidyDataSetName = iName;
        spreader.state.tidyDataSetResult = await spreader.connect.getDataSetInfo(this.state.tidyDataSetName);
        spreader.ui.makeAttributeMenus(spreader.state.tidyDataSetResult);

        //  register to receive notifications about change in the tidy dataset
        codapInterface.on(
            'notify',
            'dataContext[' + this.state.tidyDataSetName + '].collection',
            'createCollection',
            spreader.dataSetChange
        );

    },

    dataSetChange : async function() {
        console.log("spreader ... dataSetChange notification");
        spreader.state.tidyDataSetResult = await spreader.connect.getDataSetInfo(this.state.tidyDataSetName);
        spreader.ui.makeAttributeMenus(spreader.state.tidyDataSetResult);
    },

    spread: async function () {
        // get all cases in the top collection
        const tTopCollectionName = spreader.state.tidyDataSetResult.values.collections[0].name;
        const topData = this.casesResultToIDValuesObject(await spreader.connect.getAllCases(tTopCollectionName));
        const tBottomCollectionName = spreader.state.tidyDataSetResult.values.collections[1].name;
        const bottomData = this.casesResultToIDValuesObject(await spreader.connect.getAllCases(tBottomCollectionName));

        //  now topData and BottomData are objects,
        //  keyed by case ID,
        //  each containing children:, parent:, and values:

        const spreadAttributes = {};  //  to be keyed by attribute name, will hold units.
        const tValues = [];
        let types = [];
        let units = {};
        for (const parentID in topData) {
            const theParent = topData[parentID];
            const aCase = theParent.values;

            //  loop over all children
            theParent.children.forEach( childID => {
                const theChildValues = bottomData[childID].values;
                const theType = theChildValues[spreader.state.typeAttribute];
                aCase[theType] = theChildValues[spreader.state.valueAttribute];

                if (types.indexOf(theType) === -1) {
                    types.push(theType);
                    units[theType] = theChildValues[spreader.state.unitsAttribute];
                }
            });
            tValues.push(aCase);
        }

        let theAttributes = [];

        //  top attributes
        spreader.state.tidyDataSetResult.values.collections[0].attrs.forEach( a => {
            theAttributes.push({
                "name" : a.name,
                "description" : a.description,
                "precision" : a.precision,
                "type" : a.type,
                "title" : a.title,
                "unit" : a.unit,
            })
        });

        types.forEach( t => {
            theAttributes.push({
                "name" : t,
                "unit" : units[t],
            })
        });

        const spreadName = "spreadDS";
        const newDataSetResult =  await spreader.connect.makeSpreadDataset(spreadName, theAttributes);
        const fillDataSetResult = await spreader.connect.fillSpreadDataset(spreadName, tValues);

    },

    casesResultToIDValuesObject : function(iResult) {
        let out = {};
        if (iResult.success) {
            iResult.values.cases.forEach( c => {
                out[c.case.id] = {
                    "children" : c.case.children,
                    "parent" : c.case.parent,
                    "values" : c.case.values,
                }
            })
        }
        return out;
    },

    constants: {
        "version": "000a",
        "DSName": "spreader",
        "dimensions": {height: 196, width: 444}
    }
};