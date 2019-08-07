/*
==========================================================================

 * Created by tim on 6/12/18.
 
 
 ==========================================================================
timer.ui in plugins

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


timer.ui = {

    initialize : function() {
        this.update();
    },

    update : function() {

        this.makeDataButtons();

        const newSetButton = document.getElementById("newSetButton");
        const statusDiv = document.getElementById("status");
        const wholeTimerDiv = document.getElementById("wholeTimer");
        const editorDiv = document.getElementById("editMode");
        const editorTextBox = document.getElementById("timerConfigurationTextBox");

        let tCaseOrCasesWord = (timer.sequenceNumber - 1) === 1 ? " case " : " cases "

        let theStatus = timer.waiting
            ? "Waiting for the first data in set " + (timer.setNumber + 1)
            : "You have " + (timer.sequenceNumber - 1) + tCaseOrCasesWord + " in set " + timer.setNumber;
        newSetButton.style.visibility = timer.waiting ? "hidden" : "visible";
        statusDiv.innerHTML = theStatus;

        wholeTimerDiv.style.display = timer.timerMode ? "block" : "none";
        editorDiv.style.display = timer.timerMode ? "none" : "block";

        editorTextBox.value = timer.state.configurationText;
    },

    makeDataButtons : function() {
        const buttonTextArray = timer.state.configurationText.split(",");
        let buttonsHTMLArray = [];

        buttonTextArray.forEach( name => {
            const thisButton =
                "<button class = 'do' " +
                " onclick='timer.doDataButton( \"" +  name + "\")'>" +
                name + "</button>";
            buttonsHTMLArray.push(thisButton);
        });

        document.getElementById("dataButtonDiv").innerHTML = buttonsHTMLArray.join('&nbsp;');
    }
};