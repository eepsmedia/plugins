/*
==========================================================================

 * Created by tim on 5/23/20.
 
 
 ==========================================================================
scrambler in scrambler

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

const scrambler = {

    constants: {
        version: "001b",
        pluginName: "scrambler",
        dimensions: {height: 200, width: 202},
        scrambledTopLevelCollectionName: "scrit",
        scrambledIterationAttributeName: "scrit",
    },

    datasetName: "",
    scrambledDatasetName: "",
    attributes: {},
    needFreshOutputDataset: true,

    initialize: async function () {
        await connect.initialize();
        this.refresh();
        /*
                const datasetMenuGuts = await connect.makeDatasetMenuGuts(null);
                document.getElementById("datasetMenu").innerHTML = datasetMenuGuts;
        */
    },

    refresh: async function () {
        const datasetMenuGuts = await connect.makeDatasetMenuGuts(this.datasetName);
        document.getElementById("datasetMenu").innerHTML = datasetMenuGuts;
        this.datasetName = document.getElementById("datasetMenu").value;
        if (this.datasetName) {
            const tStructure = await connect.getStructure(this.datasetName);
            const attributeMenuGuts = await connect.makeAttributeMenuGuts(tStructure);
            document.getElementById("attributeMenu").innerHTML = attributeMenuGuts;
        }
    },

    doScramble: async function (iReps) {
        const theSituation = await this.loadCurrentData();

        if (this.needFreshOutputDataset) {
            this.scrambledDatasetName = await connect.createFreshOutputDataset(theSituation);
        }

        for (let i = 0; i < iReps; i++) {
            this.scrambleTheSituation(theSituation);
            theSituation["iteration"] = i + 1;
            const theItems = this.turnSituationToItems(theSituation);
            await connect.emitScrambledData(this.scrambledDatasetName, theItems);
        }
    },

    scrambleTheSituation(iSituation) {
        let valuesOut = [];
        //  scramble the data hidden in this structure
        iSituation.collections.forEach(
            col => {
                for (const attName in col.attributes) {
                    const theDataArray = col.attributes[attName].data;
                    theDataArray.scramble();
                }
            }
        );
    },

    turnSituationToItems: function (iSituation) {
        let allTheData = {};
        let N = 0;

        //  collect all the data (columns) into one object, keyed by attName
        iSituation.collections.forEach(col => {
            for (const attName in col.attributes) {
                allTheData[attName] = col.attributes[attName].data;
                if (!N) N = col.attributes[attName].data.length;
            }
        });

        let theItems = [];  //  to be an array of "item" objects

        for (let i = 0; i < N; i++) {
            let anItem = {};
            anItem[scrambler.constants.scrambledIterationAttributeName] = iSituation.iteration;

            for (const aName in allTheData) {
                const theColumn = allTheData[aName];
                anItem[aName] = theColumn[i];
            }
            theItems.push(anItem);
        }

        return theItems;
    },


    loadCurrentData: async function () {
        this.datasetName = document.getElementById("datasetMenu").value;
        const theStructure = await connect.getStructure(this.datasetName);
        const theItems = await connect.getAllItems(this.datasetName);

        //  populate the structure with the data
        theStructure.collections.forEach(
            col => {
                for (const attName in col.attributes) {
                    const theDataArray = col.attributes[attName].data;
                    theItems.forEach(
                        item => {
                            theDataArray.push(item[attName]);
                        }
                    )
                }
            }
        );
        return theStructure;        //  now that it has data, it's "theSituation"
    },

};

Array.prototype.scramble = function () {
    const N = this.length;

    for (let i = 0; i < N; i++) {
        const other = Math.floor(Math.random() * N);
        const temp = this[i];
        this[i] = this[other];
        this[other] = temp;
    }
};