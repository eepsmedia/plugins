/*
==========================================================================

 * Created by tim on 2019-04-10.
 
 
 ==========================================================================
connector in jove

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


jove.connector = {

    resultsCollectionName: "observations",
    resultsDataSetName: "observations",
    resultsDataSetTitle: "observations",

    initialize: async function () {
        await codapInterface.init(this.kPluginConfiguration, null);
        await pluginHelper.initDataSet(this.kDataSetObject());

        const tReorgMessage = {
            "action"    : "update",
            "resource"  : "interactiveFrame",
            "values"    : {
                "preventDataContextReorg" : false
            }
        };

        codapInterface.sendRequest(tReorgMessage);
    },

    emitObservationRecord: function (iCaseValues) {
        pluginHelper.createItems(
            iCaseValues,
            this.resultsDataSetName
        );

        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "dataContext": this.resultsDataSetName
            }
        })

    },


    /**
     * constant to initialize the frame structure
     */
    kPluginConfiguration: {
        name: 'Jove',
        title: 'Jove',
        version: jove.constants.version,
        dimensions: {width: 520, height: 300}
    },

    kDataSetObject: function () {
        return {
            name: this.resultsDataSetName,
            title: this.resultsDataSetTitle,
            description: "moon observations",

            collections: [
                {       //  first and only collection
                    name : this.resultsCollectionName,
                    parent : null,
                    labels: {
                        singleCase: "result",
                        pluralCase: "results",
                        setOfCasesWithArticle: "the results data set"
                    },

                    attrs: [
                        {name: "t", type: 'numeric', precision: 2, unit: 'days', description: "time"},
                        {name: "x", type: 'numeric', precision: 3, unit: 'mr', description: "x-coordinate"},
                        {name: "y", type: 'numeric', precision: 3, unit: 'mr', description: "y-coordinate"},
                        {name: "name", type: 'categorical', editable : true, description: "object name"},
                    ]
                }

            ]
        }
    }

};
