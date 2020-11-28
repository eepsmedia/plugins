/*
==========================================================================

 * Created by tim on 11/27/20.
 
 
 ==========================================================================
binomial.js in binomial

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


const binomial = {

    initialize : async function() {
        await connect.connectToCODAP();
        binomial.state = await codapInterface.getInteractiveState();

        if (Object.keys(binomial.state).length === 0) {
            codapInterface.updateInteractiveState( binomial.freshState );
            //  binomial.state = binomial.freshState;
        } else {
            binomial.ui.setInputToState();
        }

        await connect.initialize();

        binomial.ui.update();
    },

    engage : function() {
        binomial.state.runNumber++;     //  increment the run number

        console.log("Engage!");

        let results = [];

        for (let ex = 0; ex < binomial.state.experimentsPerRun; ex++) {
            let nSuccesses = 0;
            for (let ev = 0; ev < binomial.state.atomicEventsPerExperiment; ev++) {
                const successP = Math.random() < binomial.state.successProbability;
                if (successP) {
                    nSuccesses++;
                }
            }
            const aResult = {};
            aResult["runNumber"] = binomial.state.runNumber;
            aResult[binomial.state.words.eventSuccess] = nSuccesses;
            aResult[binomial.state.words.eventFailure] = (binomial.state.atomicEventsPerExperiment) - nSuccesses;
            aResult[`${binomial.state.words.atomicEventName}s`] = binomial.state.atomicEventsPerExperiment;
            aResult[`${binomial.state.words.experimentName}s`] = binomial.state.experimentsPerRun;
            aResult["trueP"] = binomial.state.successProbability;

            results.push(aResult);
        }

        connect.emitData(results);      //  could await this but unnecessary?
        connect.makeTableAppear();
    },

    update : function () {
        this.state.successProbability = Number(document.getElementById("probabilityOfSuccessInput").value);
        this.state.atomicEventsPerExperiment = Number(document.getElementById("numberOfAtomicEventsInput").value);
        this.state.experimentsPerRun = Number(document.getElementById("numberOfExperimentsInput").value);

        binomial.ui.update();
    },

    nameChange : function() {
        this.state.words.atomicEventName = document.getElementById("atomicEventNameInput").value;
        this.state.words.eventSuccess = document.getElementById("eventSuccessInput").value;
        this.state.words.eventFailure = document.getElementById("eventFailureInput").value;
        this.state.words.experimentName = document.getElementById("experimentNameInput").value;

        binomial.ui.update();
    },

    reset : async function() {
        await connect.destroyDataset();
        await connect.initialize();
    },

    state : {

    },

    freshState : {
        words : {
            atomicEventName: "flip",
            eventSuccess: "heads",
            eventFailure: "tails",
            experimentName : "experiment",
        },

        successProbability : 0.5,
        atomicEventsPerExperiment : 20,
        experimentsPerRun : 50,

        runNumber : 0,
    },

    constants : {
        kVersion : "000a",
        kBinomialDataSetName : "binData",
        kBinomialDataSetTitle : "binomial data",
        kRunCollectionName : "runs",
        kExperimentsCollectionName : "experiments",
    }


}