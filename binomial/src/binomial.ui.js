/*
==========================================================================

 * Created by tim on 11/27/20.
 
 
 ==========================================================================
binomial.ui in binomial

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

binomial.ui = {

    update: function () {
        const descriptionDiv = document.getElementById("description");
        const probabilityLabel = document.getElementById("probabilityOfSuccessInputLabel");
        const numberOfExperimentsLabel = document.getElementById("numberOfExperimentsInputLabel");
        const numberOfAtomicEventsLabel = document.getElementById("numberOfAtomicEventsInputLabel");
        const eventSuccessLabel = document.getElementById("eventSuccessInputLabel");
        const eventFailureLabel = document.getElementById("eventFailureInputLabel");
        const experimentNameLabel = document.getElementById("experimentNameInputLabel");

        descriptionDiv.innerHTML = this.makeDescription();
        probabilityLabel.innerHTML =
            `probability of <b>${binomial.state.words.eventSuccess}</b> is <b>${binomial.state.successProbability}</b>.`
        numberOfExperimentsLabel.innerHTML =
            `${TEEUtils.pluralize(binomial.state.words.experimentName)} per run`;
        numberOfAtomicEventsLabel.innerHTML =
            `${TEEUtils.pluralize(binomial.state.words.atomicEventName)} per ${binomial.state.words.experimentName}`;

        eventFailureLabel.innerHTML =
            `the opposite of <b>${binomial.state.words.eventSuccess}</b>`;
        eventSuccessLabel.innerHTML =
            `possible result of one ${binomial.state.words.atomicEventName}`;
        experimentNameLabel.innerHTML =
            `what do you call a set of ${binomial.state.atomicEventsPerExperiment} ${TEEUtils.pluralize(binomial.state.words.atomicEventName)}?`


    },


    makeDescription: function () {
        let out = "";

        out += `<p>Press <button onclick="binomial.engage()">Engage!</button> ` +
            `to perform <b>${binomial.state.experimentsPerRun}</b> ${TEEUtils.pluralize(binomial.state.words.experimentName)}. <br/>` +
            `One ${binomial.state.words.experimentName} consists of <b>${binomial.state.atomicEventsPerExperiment}</b> 
                ${TEEUtils.pluralize(binomial.state.words.atomicEventName)}.<br/>` +
            `One ${binomial.state.words.atomicEventName} is either <b>${binomial.state.words.eventSuccess}</b> or 
                <b>${binomial.state.words.eventFailure}</b><br/>` +
            `The probability of <b>${binomial.state.words.eventSuccess}</b> is <b>${binomial.state.successProbability}</b>.</p>`;

        return out;
    },

    setInputToState : function() {
        //  the words
        document.getElementById("atomicEventNameInput").value = binomial.state.words.atomicEventName;
        document.getElementById("eventSuccessInput").value = binomial.state.words.eventSuccess;
        document.getElementById("eventFailureInput").value = binomial.state.words.eventFailure;
        document.getElementById("experimentNameInput").value = binomial.state.words.experimentName;

        //  the values
        document.getElementById("probabilityOfSuccessInput").value = binomial.state.successProbability;
        document.getElementById("numberOfAtomicEventsInput").value = binomial.state.atomicEventsPerExperiment;
        document.getElementById("numberOfExperimentsInput").value = binomial.state.experimentsPerRun;


    }
}