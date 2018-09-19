/*
==========================================================================

 * Created by tim on 11/21/17.
 
 
 ==========================================================================
xeno in xeno

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

var xeno = {
    initialize: function () {

        var finishInit = function () {
            //  set UI values based on restored xeno.state


            document.getElementById("howManyCases").setAttribute("value", xeno.state.howManyCases.toString());
            document.getElementById("howManyAutoCases").setAttribute("value", xeno.state.howManyAutoCases.toString());

            console.log("Initialize into mode: " + xeno.state.mode);

            this.setControlsForScenarioStart();
            this.controlChange();       //  read control values, set UI
            $("#maladyMenu").empty().append(this.model.makeMaladyMenuGuts()).val(this.state.malady);

        }.bind(this);

        xenoConnect.initialize(finishInit);
        /*
                xeno.state.score = xeno.constants.initialScore;
                xeno.state.mode = "training";
        */

    },

    setControlsForScenarioStart: function () {
        document.getElementById(xeno.state.mode + "RadioButton").checked = true;
        document.getElementById("arborScore").innerHTML = xeno.state.score;

        var tAutoResultDisplay = document.getElementById("autoResultDisplay");
        tAutoResultDisplay.innerHTML = xeno.constants.autoResultInitialText;

    },

    maladyChange: function () {
        this.state.malady = $("#maladyMenu").val();

        xeno.state.score = xeno.constants.initialScore;
        xeno.state.mode = "training";

        //  delete all data

        var tResource = "dataContext[creatures].collection[creatures].allCases";
        var tArg = {action: "delete", resource: tResource};
        codapInterface.sendRequest(tArg);

        this.setControlsForScenarioStart();
        xeno.controlChange();
    },

    controlChange: function () {
        var tAutoDiagnoseCaseNumberBox = document.getElementById("howManyAutoCases");
        var tTrainingCaseNumberBox = document.getElementById("howManyCases");
        xeno.state.mode = $('input[name=arborMode]:checked').val();  //  "training" or "one by one"
        xeno.state.howManyCases = tTrainingCaseNumberBox.value;
        xeno.state.howManyAutoCases = tAutoDiagnoseCaseNumberBox.value;
        xeno.updateScore(0);

        if (xeno.state.howManyAutoCases > 20) {
            xeno.state.howManyAutoCases = 20;
            tAutoDiagnoseCaseNumberBox.value = xeno.state.howManyAutoCases;
            alert("Sorry -- for now you're limited to 20 at a time. So you don't have to wait so long.");
        }

        if (xeno.state.howManyCases > 100) {
            xeno.state.howManyCases = 100;
            tTrainingCaseNumberBox.value = xeno.state.howManyCases;
            alert("Sorry -- for now you're limited to 100 'training cases' at a time.");
        }

        switch (xeno.state.mode) {
            case 'training':
                document.getElementById("trainingControlPanel").style.display = "block";
                document.getElementById("oneByOneControlPanel").style.display = "none";
                document.getElementById("autoControlPanel").style.display = "none";
                xeno.state.currentCase = null;
                break;

            case 'one-by-one':
                if (!xeno.state.currentCase) {
                    xeno.state.currentCase = xeno.model.generateCase(xeno.state.malady);
                    xeno.displayCurrentCase("<b>Your first case:</b> ")
                }
                document.getElementById("trainingControlPanel").style.display = "none";
                document.getElementById("oneByOneControlPanel").style.display = "block";
                document.getElementById("autoControlPanel").style.display = "none";
                break;

            case 'auto':
                document.getElementById("trainingControlPanel").style.display = "none";
                document.getElementById("oneByOneControlPanel").style.display = "none";
                document.getElementById("autoControlPanel").style.display = "block";
                break;

            default:
                break;
        }
        console.log(
            'mode: ' + xeno.state.mode + ", cases: ("
            + xeno.state.howManyCases + ", 1, " + xeno.state.howManyAutoCases + ")"
        );

    },

    updateScore: function (iDeltaScore) {
        xeno.state.score += iDeltaScore;
        document.getElementById("arborScore").innerHTML = xeno.state.score;
    },

    getAnArrayOfCaseValues: function (n, iSource) {
        var theCaseValues = [];

        for (var i = 0; i < n; i++) {
            var tCase = xeno.model.generateCase(xeno.state.malady);
            tCase.source = iSource;
            tCase.diagnosis = "";
            theCaseValues.push(tCase);
        }

        return theCaseValues;
    },

    makeNewCases: function () {
        var n = xeno.state.howManyCases;
        console.log('making ' + n + ' new cases');

        var theCaseValues = this.getAnArrayOfCaseValues(n, "training");
        xeno.updateScore(-n);
        xenoConnect.createArborItems(theCaseValues);
    },

    manualDiagnose: function (iDiag) {
        xeno.state.currentCase.source = "clinic";
        xeno.state.currentCase.diagnosis = iDiag;


        var tActualState = (xeno.state.currentCase.health) === "sick" ? "P" : "N";

        if (iDiag === xeno.state.currentCase.health) {
            xeno.state.currentCase.analysis = "T" + tActualState;
            this.state.previousSingleDiagnosisReport = "Correct! The previous case was "
                + xeno.state.currentCase.health + ".<hr><b>Next case:</b>  ";
        } else {
            xeno.state.currentCase.analysis = "F" + tActualState;
            this.state.previousSingleDiagnosisReport = "Wrong! The previous case was "
                + xeno.state.currentCase.health + ".<hr><b>Next case:</b>  ";
        }

        xeno.scoreFromPerformance(xeno.state.currentCase.analysis);

        xenoConnect.createArborItems(xeno.state.currentCase);   //  send CODAP the clinic data

        //  next case

        xeno.state.currentCase = xeno.model.generateCase(xeno.state.malady);
        xeno.displayCurrentCase(this.state.previousSingleDiagnosisReport);
    },

    autoDiagnose: function () {
        var tAutoResultDisplay = document.getElementById("autoResultDisplay");
        var tAutoResultText = "Waiting for analysis from the tree.";

        tAutoResultDisplay.innerHTML = tAutoResultText;

        var theCaseValues = this.getAnArrayOfCaseValues(xeno.state.howManyAutoCases, "auto");

        console.log("AUTODIAGNOSE: We have " + theCaseValues.length + " objects that need diagnosis!");
        xenoConnect.createArborItems(theCaseValues);
    },

    displayCurrentCase: function (iPrefix) {
        var tCaseDescription = xeno.model.creatureString(xeno.state.currentCase);
        document.getElementById("caseDisplay").innerHTML = iPrefix + tCaseDescription;

    },

    scoreFromPerformance: function (iPerf) {
        var tScore = 0;

        switch (iPerf) {
            case "TP":
                this.updateScore(xeno.constants.scores.TP);
                break;

            case "TN":
                this.updateScore(xeno.constants.scores.TN);
                break;

            case "FP":
                this.updateScore(xeno.constants.scores.FP);
                break;

            case "FN":
                this.updateScore(xeno.constants.scores.FN);
                break;

            case "?":
                this.updateScore(xeno.constants.scores["?"]);
                break;

            default:
                break;
        }
    },


    freshState: {
        previousSingleDiagnosisReport: "",
        howManyCases: 10,
        howManyAutoCases: 10,
        mode: 'training',
        malady: 'ague',
        currentCase: null,
        score: 200
    },

    constants: {
        version: '001d',
        wellColor: '#752',
        sickColor: '#484',
        arborDataSetName: "creatures",
        arborDataSetTitle: "creatures",
        arborCollectionName: "creatures",
        autoResultInitialText: "Auto-diagnosis results display",
        initialScore: 200,

        scores: {
            TP: 5,
            FP: -10,
            TN: 5,
            FN: -20,
            "?": -10
        }
    }
};
