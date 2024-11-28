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

import * as Root from './binomial.js'
import * as Language from "./pluginLang.js"

    export function update() {
        const descriptionDiv = document.getElementById("description");
        const probabilityLabel = document.getElementById("probabilityOfSuccessInputLabel");
        const numberOfExperimentsLabel = document.getElementById("numberOfExperimentsInputLabel");
        const numberOfAtomicEventsLabel = document.getElementById("numberOfAtomicEventsInputLabel");
        const eventSuccessLabel = document.getElementById("eventSuccessInputLabel");
        const eventFailureLabel = document.getElementById("eventFailureInputLabel");
        const experimentNameLabel = document.getElementById("experimentNameInputLabel");

        descriptionDiv.innerHTML = makeDescription();

        let probabilityLabelText = `probability of <b>${Root.state.words.eventSuccess}</b> 
            is <b>${Root.state.parsedProbability.theString}</b>.
           `;
        probabilityLabel.innerHTML = probabilityLabelText;


        let experimentsLabelText = `${Language.pluralize(Root.state.words.experimentName)} per run. `;
        experimentsLabelText += `<span class="fine-print">Probably between 100 and 400.</span>`
        numberOfExperimentsLabel.innerHTML = experimentsLabelText;

        numberOfAtomicEventsLabel.innerHTML =
            `${Language.pluralize(Root.state.words.atomicEventName)} per ${Root.state.words.experimentName}
             <span class="fine-print">Not more than 20000.</span>
            `;

        eventFailureLabel.innerHTML =
            `the alternative to <b>${Root.state.words.eventSuccess}</b>`;
        eventSuccessLabel.innerHTML =
            `possible result of one ${Root.state.words.atomicEventName}`;
        experimentNameLabel.innerHTML =
            `what do you call a set of ${Root.state.atomicEventsPerExperiment} ${Language.pluralize(Root.state.words.atomicEventName)}?`

        document.getElementById("probabilityOfSuccessInput").innerHTML = Root.state.parsedProbability.string;
    }


    function makeDescription() {

        let out =
            `
                One ${Root.state.words.atomicEventName} 
                is either <b>${Root.state.words.eventSuccess}</b> or 
                <b>${Root.state.words.eventFailure}</b>.
                <br/>
                The probability of <b>${Root.state.words.eventSuccess}</b> 
                is <b>${Root.state.parsedProbability.theString}</b>.
                <br/>
                One ${Root.state.words.experimentName} 
                consists of <b>${Root.state.atomicEventsPerExperiment}</b> 
                ${Language.pluralize(Root.state.words.atomicEventName)}.
                <br/>
                Press <button id="engageButton">Engage!</button> 
                to simulate <b>${Root.state.experimentsPerRun}</b> 
                ${Language.pluralize(Root.state.words.experimentName)}.
                `;
        return out;
    }

    export function setInputToState() {
        //  the words
        document.getElementById("atomicEventNameInput").value = Root.state.words.atomicEventName;
        document.getElementById("eventSuccessInput").value = Root.state.words.eventSuccess;
        document.getElementById("eventFailureInput").value = Root.state.words.eventFailure;
        document.getElementById("experimentNameInput").value = Root.state.words.experimentName;

        //  the values
        document.getElementById("probabilityOfSuccessInput").value = Root.state.parsedProbability.theString;
        document.getElementById("numberOfAtomicEventsInput").value = Root.state.atomicEventsPerExperiment;
        document.getElementById("numberOfExperimentsInput").value = Root.state.experimentsPerRun;
    }