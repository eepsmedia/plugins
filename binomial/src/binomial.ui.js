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

    export async function update() {
        const descriptionDiv = document.getElementById("description");
        const probabilityOfSuccessInputBox = document.getElementById("probabilityOfSuccessInput");
        const probabilityOfSuccessLabel = document.getElementById("probabilityOfSuccessInputLabel");
        const numberOfExperimentsLabel = document.getElementById("numberOfExperimentsInputLabel");
        const numberOfAtomicEventsLabel = document.getElementById("numberOfAtomicEventsInputLabel");
        const eventSuccessLabel = document.getElementById("eventSuccessInputLabel");
        const eventFailureLabel = document.getElementById("eventFailureInputLabel");
        const experimentNameLabel = document.getElementById("experimentNameInputLabel");

        descriptionDiv.innerHTML = await makeDescription();

        //  construct experiment label, like "10 experiments per run, probably between 100 and 400"
        let experimentsLabelText = Language.getString(
            "labels.experimentsPerRunLabelTextMain",
            Root.state.words.experimentNamePlural
        );
        //  experimentsLabelText += `<span class="fine-print">${Language.getString("labels.experimentsPerRunLabelTextFinePrint")}</span>`
        numberOfExperimentsLabel.innerHTML = experimentsLabelText;

        //  construct number of events per experiment label, like "5 children per family, not more than 20000"
        let numberOfEventsPerExperimentLabelText = Language.getString(
            "labels.numberOfEventsLabelTextMain",
            Root.state.words.atomicEventNamePlural,
            Root.state.words.experimentName
        );
        numberOfEventsPerExperimentLabelText += `<span class="fine-print">${Language.getString("labels.numberOfEventsLimitFinePrint")}</span>`;    //  fine print
        numberOfAtomicEventsLabel.innerHTML = numberOfEventsPerExperimentLabelText;

        //  settings
        probabilityOfSuccessInputBox.innerHTML = Root.state.parsedProbability.string;
        probabilityOfSuccessLabel.innerHTML = Language.getString(
            "labels.probabilityLabelText",
            Root.state.words.eventSuccess,
            Root.state.parsedProbability.theString
        );


        //  vocabulary
        const singularEventAccusativeWithIndefiniteArticle = await Language.getNoun(Root.state.words.atomicEventName, false,"indef","Acc");
        const pluralEventDativeWithNumber = await Language.eventTextWithNumberDative(Root.state.words.atomicEventName, Root.state.atomicEventsPerExperiment);

        eventSuccessLabel.innerHTML = Language.getString("labels.eventSuccessInputLabel", singularEventAccusativeWithIndefiniteArticle);
        eventFailureLabel.innerHTML = Language.getString("labels.eventFailureInputLabel", Root.state.words.eventSuccess);
        experimentNameLabel.innerHTML = Language.getString("labels.experimentNameInputLabel", pluralEventDativeWithNumber,);

    }

    function capitalize(iString) {
        const s2 = iString.charAt(0).toUpperCase() + iString.slice(1);
        return s2;
    }

    async function makeDescription() {

        const singularEventNominativeWithIndefiniteArticle = await Language.getNoun(Root.state.words.atomicEventName, false,"indef","Nom");
        const singularExperimentNominativeWithIndefiniteArticle = await Language.getNoun(Root.state.words.experimentName, false,"indef","Nom");
        const pluralEventDativeWithNumber = await Language.eventTextWithNumberDative(Root.state.words.atomicEventName, Root.state.atomicEventsPerExperiment);

        const line1 = Language.getString("description.line1",
            singularEventNominativeWithIndefiniteArticle,
            Root.state.words.eventSuccess,
            Root.state.words.eventFailure
        );
        const line2 = Language.getString("description.line2",
            Root.state.words.eventSuccess,
            Root.state.parsedProbability.theString
        );
        const line3 = Language.getString("description.line3",
            singularExperimentNominativeWithIndefiniteArticle,
            pluralEventDativeWithNumber
        );
        const line4 = Language.getString("description.line4",
            Root.state.experimentsPerRun,
            Root.state.words.experimentNamePlural,
        );

        return  `    ${capitalize(line1)}<br/>${capitalize(line2)}<br/>${capitalize(line3)}<br/>${capitalize(line4)}`;
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