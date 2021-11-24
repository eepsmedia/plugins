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

    /**
     * Have we changed the vocabulary?
     */
    dirty : false,
    strings : null,

    initialize : async function() {
        await connect.connectToCODAP();
        binomial.state = await codapInterface.getInteractiveState();

        if (Object.keys(binomial.state).length === 0) {
            codapInterface.updateInteractiveState( binomial.freshState );
            //  binomial.state = binomial.freshState;
        } else {
        }

        this.state.lang = pluginLang.figureOutLanguage('en', binomialStrings.languages);
        binomial.strings = await binomialStrings.initializeStrings(this.state.lang);

        binomial.ui.setInputToState();

        await connect.initialize();

        binomial.ui.update();
    },

    engage : async function() {
        binomial.state.runNumber++;     //  increment the run number

        if (binomial.dirty) {
            await binomial.reset();
            binomial.dirty = false;
        }

        console.log("Engage!");

        let results = [];

        for (let ex = 0; ex < binomial.state.experimentsPerRun; ex++) {
            let nSuccesses = 0;
            for (let ev = 0; ev < binomial.state.atomicEventsPerExperiment; ev++) {
                const successP = Math.random() < binomial.state.parsedProbability.theNumber;
                if (successP) {
                    nSuccesses++;
                }
            }
            const aResult = {};
            aResult["runNumber"] = binomial.state.runNumber;
            aResult[binomial.state.words.eventSuccess] = nSuccesses;
            aResult[binomial.state.words.eventFailure] = (binomial.state.atomicEventsPerExperiment) - nSuccesses;
            aResult[pluginLang.pluralize(binomial.state.words.atomicEventName)] = binomial.state.atomicEventsPerExperiment;
            aResult[pluginLang.pluralize(binomial.state.words.experimentName)] = binomial.state.experimentsPerRun;
            aResult["trueP"] = binomial.state.parsedProbability.theNumber;

            results.push(aResult);
        }

        connect.emitData(results);      //  could await this but unnecessary?
        connect.makeTableAppear();
    },

    update : function () {
        const probabilityString = document.getElementById("probabilityOfSuccessInput").value;
        binomial.state.parsedProbability = binomial.utilities.stringFractionDecimalOrPercentToNumber(probabilityString);
        const theProb = binomial.state.parsedProbability.theNumber;

        if (binomial.state.parsedProbability.theString !== "") {
            if (theProb >= 0 && theProb <= 1) {
                this.state.atomicEventsPerExperiment = Number(document.getElementById("numberOfAtomicEventsInput").value);
                this.state.experimentsPerRun = Number(document.getElementById("numberOfExperimentsInput").value);
                if (this.state.experimentsPerRun > binomial.constants.kMaxExperimentsPerRun) {
                    this.state.experimentsPerRun = binomial.constants.kMaxExperimentsPerRun;
                    document.getElementById("numberOfExperimentsInput").value = binomial.constants.kMaxExperimentsPerRun;
                }
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "dang!",
                    text: `${binomial.state.parsedProbability.theString} is not a good number for a probability. 
                     It should be between 0 and 1 inclusive.`
                })
            }
        } else {
            Swal.fire({
                icon : "warning",
                title : "oops",
                text : `"${probabilityString}" is not a good probability.
                 Enter a fraction (like 1/5), a decimal (like 0.2), or a percentage (like 20%).`
            })
        }

        binomial.ui.update();
    },

    nameChange : function() {
        binomial.dirty = true;

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

        parsedProbability : {theNumber : 0.5, theString : "1/2",},

        atomicEventsPerExperiment : 10,
        experimentsPerRun : 100,

        runNumber : 0,
    },

    utilities: {
        stringFractionDecimalOrPercentToNumber: function (iString) {
            let theNumber;
            let theString;

            const wherePercent = iString.indexOf("%");
            const whereSlash = iString.indexOf("/");
            if (wherePercent !== -1) {
                const thePercentage = parseFloat(iString.substring(0, wherePercent));
                theString = `${thePercentage}%`;
                theNumber = thePercentage / 100.0;
            } else if (whereSlash !== -1) {
                const beforeSlash = iString.substring(0, whereSlash);
                const afterSlash = iString.substring(whereSlash + 1);
                const theNumerator = parseFloat(beforeSlash);
                const theDenominator = parseFloat(afterSlash);
                theNumber = theNumerator / theDenominator;
                theString = `${theNumerator}/${theDenominator}`;
            } else {
                theNumber = parseFloat(iString);
                theString = `${theNumber}`;
            }

            if (!isNaN(theNumber)) {
                return {theNumber: theNumber, theString: theString};
            } else {
                return {theNumber: 0, theString: ""};
            }
        },
    },


    constants : {
        kVersion : "001b",
        kBinomialDataSetName : "binData",
        kBinomialDataSetTitle : "binomial data",
        kRunCollectionName : "runs",
        kExperimentsCollectionName : "experiments",
        kMaxExperimentsPerRun : 400,
    }


}