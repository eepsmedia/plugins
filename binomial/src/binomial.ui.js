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
import * as Language from "../strings/localize.js"

    export function update() {
        const descriptionDiv = document.getElementById("description");
        const probabilityOfSuccessInputBox = document.getElementById("probabilityOfSuccessInput");
        const probabilityOfSuccessLabel = document.getElementById("probabilityOfSuccessInputLabel");
        const numberOfExperimentsLabel = document.getElementById("numberOfExperimentsInputLabel");
        const numberOfAtomicEventsLabel = document.getElementById("numberOfAtomicEventsInputLabel");
        const eventSuccessLabel = document.getElementById("eventSuccessInputLabel");
        const eventFailureLabel = document.getElementById("eventFailureInputLabel");
        const experimentNameLabel = document.getElementById("experimentNameInputLabel");

        descriptionDiv.innerHTML = makeDescription();

        //  construct experiment label, like "10 experiments per run, probably between 100 and 400"
        let experimentsLabelText = Language.getString("labels.experimentsPerRunLabelTextMain", Language.pluralize(Root.state.words.experimentName));
        experimentsLabelText += `<span class="fine-print">${Language.getString("labels.experimentsPerRunLabelTextFinePrint")}</span>`
        numberOfExperimentsLabel.innerHTML = experimentsLabelText;

        numberOfAtomicEventsLabel.innerHTML =
            `${Language.pluralize(Root.state.words.atomicEventName)} per ${Root.state.words.experimentName}
             <span class="fine-print">Not more than 20000.</span>
            `;

        //  settings
        probabilityOfSuccessInputBox.innerHTML = Root.state.parsedProbability.string;
        probabilityOfSuccessLabel.innerHTML = Language.getString(
            "labels.probabilityLabelText",
            Root.state.words.eventSuccess,
            Root.state.parsedProbability.theString
        );


        //  vocabulary
        eventSuccessLabel.innerHTML = Language.getString("labels.eventSuccessInputLabel", Root.state.words.atomicEventName);
        eventFailureLabel.innerHTML = Language.getString("labels.eventFailureInputLabel", Root.state.words.eventSuccess);
        experimentNameLabel.innerHTML = Language.getString(
            "labels.experimentNameInputLabel",
            Root.state.atomicEventsPerExperiment,
            Language.pluralize(Root.state.words.atomicEventName)
        );

    }


    function makeDescription() {

        const line1 = Language.getString("description.line1",
            Root.state.words.atomicEventName,
            Root.state.words.eventSuccess,
            Root.state.words.eventFailure
        );
        const line2 = Language.getString("description.line2",
            Root.state.words.eventSuccess,
            Root.state.parsedProbability.theString
        );
        const line3 = Language.getString("description.line3",
            Root.state.words.experimentName,
            Root.state.atomicEventsPerExperiment,
            Language.pluralize(Root.state.words.atomicEventName)
        );
        const line4 = Language.getString("description.line4",
            Root.state.experimentsPerRun,
            Language.pluralize(Root.state.words.experimentName)
        );

        return  `    ${line1}<br/>${line2}<br/>${line3}<br/>${line4}`;

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