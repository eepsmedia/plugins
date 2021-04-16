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
        version: "001c",
        pluginName: "scrambler",
        dimensions: {height: 244, width: 244},
        scrambledTopLevelCollectionName: "scrit",
        scrambledIterationAttributeName: "scrit",
    },

    situation : null,

    datasetName: "",
    scrambledDatasetName: "scrambled",
    attributes: {},
    needFreshOutputDataset: true,

    initialize: async function () {
        await connect.initialize();
        this.scrambleFew = document.getElementById("doScrambleDivFew");
        this.scrambleMany = document.getElementById("doScrambleDivMany");

        this.refresh();
    },

    refresh: async function () {
        const datasetMenuGuts = await connect.makeDatasetMenuGuts(this.datasetName);
        document.getElementById("datasetMenu").innerHTML = datasetMenuGuts;
        this.datasetName = document.getElementById("datasetMenu").value;
        //  this.scrambledDatasetName = `scram_${this.datasetName}`;

        if (this.datasetName) {
            this.situation = await connect.getStructure(this.datasetName);
            const attributeMenuGuts = await connect.makeAttributeMenuGuts(this.situation);
            document.getElementById("attributeMenu").innerHTML = attributeMenuGuts;
        }

        if (document.getElementById("saveContentsCheckbox").checked) {
            this.scrambleFew.style.display = "block";
            this.scrambleMany.style.display = "none";
        } else {
            this.scrambleFew.style.display = "none";
            this.scrambleMany.style.display = "block";
        }
    },

    doScramble: async function (iReps) {
        await this.loadCurrentData();

        if (this.needFreshOutputDataset) {
            await connect.createFreshOutputDataset();
        }

        for (let i = 0; i < iReps; i++) {
            this.scrambleTheSituation();
            const theItems = this.turnSituationToItems(i+1);
            await connect.emitScrambledData(this.scrambledDatasetName, theItems);
        }
    },

    scrambleTheSituation() {
        let valuesOut = [];
        //  scramble the data hidden in this structure
        this.situation.values.collections.forEach(col => {
            col.attrs.forEach(att => {
                const theDataArray = att.data;
                theDataArray.scramble();
            })
        })
    },

    turnSituationToItems: function (iterationNumber) {
        let allTheData = {};

        const theItems = [];  //  to be an array of "item" objects

        this.situation.values.collections.forEach(col => {
            col.attrs.forEach(att => {
                let ix = 0;             //  the index into theItems
                att.data.forEach(datum => {
                    if (!theItems[ix]) {
                        theItems[ix] = {};
                        theItems[ix][this.constants.scrambledIterationAttributeName] =  iterationNumber;
                    }
                    const thisItem = theItems[ix];
                    thisItem[att.name] = datum;
                    ix++;
                })
            })
        });

        return theItems;
    },

    /**
     * Put the current data from the dataset into arrays in the "this.structure" object.
     * These are in attributes called `data` in the attributes.
     *
     */
    loadCurrentData: async function () {
        this.datasetName = document.getElementById("datasetMenu").value;
        this.situation = await connect.getStructure(this.datasetName);
        const theItems = await connect.getAllItems(this.datasetName);

        //  populate the structure with the data
        this.situation.values.collections.forEach(
            col => {
                col.attrs.forEach( att => {
                    const theDataArray = [];
                    theItems.forEach(item => {theDataArray.push(item[att.name]);})
                    att["data"] = theDataArray;
                })
            }
        );
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