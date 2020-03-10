/*
==========================================================================

 * Created by tim on 8/24/18.
 
 
 ==========================================================================
userAction in nos2

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

nos2.userAction = {

    makeOrJoinWorld: async function (iMake, iInCode, iCallback = null) {
        let tWorldCode = iInCode;

        if (iMake) {
            //  get a world code
            const currentGameCount = await fireConnect.getWorldCount();
            console.log("   game count: " + currentGameCount);
            tWorldCode = eepsWords.newGameCode(currentGameCount);
            console.log("new code: " + tWorldCode);
        }

        if (tWorldCode) {
            const testDR = fireConnect.worldsCR.doc(tWorldCode);
            const testSnap = await testDR.get();

            if (iMake) {
                //      we are making a new world.
                if (testSnap.exists) {
                    alert(`World ${tWorldCode} already exists. Get a different name.`);
                    document.getElementById("worldCodeBox").value = "";
                    tWorldCode = null;
                } else {
                    //  new name, OK to make a world
                    await this.newWorld(tWorldCode, document.getElementById("worldNicknameBox").value);
                    await this.joinWorldByCode(tWorldCode, iCallback);
                    alert(`Success! The code for your new game is "${tWorldCode}". 
                                Players will need that code to log in.`);
                }
            } else {
                //      we are joining an exisiting world
                if (testSnap.exists) {
                    //  existing world, OK to join
                    await this.joinWorldByCode(tWorldCode, iCallback);
                } else {
                    alert(`World ${tWorldCode} does not exist. Find an existing world.`)
                    document.getElementById("worldCodeBox").value = "";
                    tWorldCode = null;
                }
            }
            nos2.ui.update();
            return tWorldCode;
        } else {
            alert("you need to enter a world code somehow, like in the box.");
        }
    },

    /**
     * @param iCode
     */
    joinWorldByCode: async function (iCode, iCallback = null) {
        const tWorldData = await fireConnect.joinWorld(iCode);
        nos2.state.worldCode = iCode;
        nos2.epoch = tWorldData.epoch;
        nos2.writerPhase = nos2.constants.kWriterPhaseNoTeam;
        nos2.editorPhase = nos2.constants.kEditorPhasePlaying;
        nos2.adminPhase = nos2.constants.kAdminPhasePlaying;

        nos2.journalName = tWorldData.jName;
        nos2.journal.initialize(nos2.journalName);

        if (iCallback) {
            iCallback(tWorldData);
        }
    },

    newWorld: async function (tWorldCode, tNickname) {

        //  OK, got it...
        const tJournalName = document.getElementById("journalNameBox").value;
        const tEpoch = document.getElementById("epochBox").value;
        const tScenario = document.getElementById("worldScenarioMenu").value;

        const tTheTruthOfThisScenario = univ.model.getNewStateTemp();
        const tGameState = {truth: tTheTruthOfThisScenario};    //  temp!

        const theWorldData = await fireConnect.makeNewWorld({
            "god": nos2.myGodName,
            "code": tWorldCode,
            "nickname" : tNickname,
            "epoch": Number(tEpoch),
            'jName': tJournalName,
            'scen': tScenario,
            'state': JSON.stringify(tGameState),
        });

        return theWorldData;
    },

    newYear : function() {
        nos2.epoch++;
        const income = 1000 * Number(document.getElementById("annualIncomeThou").value);

        //  todo: bundle?

        Object.keys(nos2.theTeams).forEach( k => {
            fireConnect.adjustBalance(k, income);
        });

        fireConnect.thisWorldDR.update({epoch : nos2.epoch});
    },

    newTeam: async function () {
        const tTeam = {
            teamCode:   document.getElementById("newTeamCodeBox").value,
            teamName:   document.getElementById("newTeamNameBox").value,
            balance:    univ.constants.kInitialBalance,
            known :     [],
        };

        await fireConnect.addTeam(tTeam);
        this.suggestTeam();
        await nos2.ui.update();
    },

    suggestTeam: function () {
        const tCodeBox = document.getElementById("newTeamCodeBox");
        const tNameBox = document.getElementById("newTeamNameBox");
        const suggestionType = $('input[name=teamNameType]:checked').val();


        const tList = teamNameSuggestionList[suggestionType];
        const tIndex = nos2.nextTeamIndex % tList.length;
        nos2.nextTeamIndex = tIndex + 1;
        const tTeam = tList[tIndex];

        tCodeBox.value = tTeam.code;
        tNameBox.value = tTeam.name;
    },



    joinTeamByTeamCode: async function (iTeamCode, iTeamName) {
        nos2.state.teamCode = iTeamCode;
        nos2.state.teamName = iTeamName;
        nos2.writerPhase = nos2.constants.kWriterPhasePlaying;
        nos2.currentPaper = null;

        fireConnect.rememberTeamDocumentReference(nos2.state.teamCode);

        nos2.ui.update();
    },

    /**
     * User has chosen a figure from a menu while editing a paper.
     * In this version, the user can have only one.
     *
     * The idea is, they have to assemble the figure they want in their scenario (in CODAP)
     * before heading here to write the paper.
     */
    chooseOneFigure: function (theMenu) {
        let figureDBID = (theMenu.value);
        if (figureDBID) {
            nos2.currentFigure = nos2.theFigures[figureDBID];
            if (nos2.currentPaper) {
                if (nos2.currentPaper.isEditable()) {
                    nos2.currentPaper.setThisFigure( figureDBID );   //  the value in the Paper is just the dbid
                }
            }
        } else {
            nos2.currentFigure = null;
            nos2.currentPaper.removeAllFigures();
        }

        nos2.ui.update();
    },

    assignFigureToCurrentPaper: function () {
        nos2.currentPaper.setThisFigure(nos2.currentFigure);
    },


    sendMessageFrom: async function (iSender) {
        const theTextBox = document.getElementById("messageTextBox");
        const theNewMessage = theTextBox.value;
        if (theNewMessage) {
            fireConnect.saveMessage(nos2.currentPaper, iSender, theNewMessage);
            theTextBox.value = "";
        } else {
            //  alert("Enter text in the box to send a message to the authors");
        }
        nos2.ui.update();
    },

    makeFigurePreview: async function () {
        const tFigureID = nos2.currentFigure.guts.dbid;

        let thePreviewHTML = "<svg>";
        if (nos2.currentFigure) {
            thePreviewHTML = `<svg>${nos2.currentFigure.guts.image.contents}</svg>`;
        } else {
            thePreviewHTML = "<p>No figure specified.</p>";
        }

        document.getElementById("figurePreview").innerHTML = thePreviewHTML;

        //  nos2.currentFigure.displayImageIn("figurePreview");
        $("#figurePreview").dialog("open");
    },

    erasePaper: async function () {
        nos2.currentPaper = new Paper();
        await nos2.ui.update();
    },

    savePaper: async function () {
        if (!nos2.currentPaper) {
            alert("Somehow there is no Current Paper when we try to save!");
            nos2.currentPaper = new Paper();
        }

        nos2.currentPaper.guts.authors = $('#paperAuthorsBox').val();
        nos2.currentPaper.guts.title = $('#paperTitleBox').val();
        nos2.currentPaper.guts.text = $('#paperTextBox').val();

        const theDBID = await fireConnect.savePaperToDB(nos2.currentPaper);    //  send the Paper
        //  nos2.thePapers[theDBID] = nos2.currentPaper; //  save in local object todo: not necessary when we use notifications

        await nos2.ui.update();
    },

    /**
     * called in writer
     */
    newPaper : function() {
        nos2.currentPaper = new Paper();
        nos2.currentFigure = null;
        nos2.goToTabNumber(1);   //  the second tab; also causes update
    },

    /**
     * Called when the user presses as edit button in the paper list
     *
     * Fills spaces in the UI with paper contents, author names, etc.
     *
     * @param iPaperID
     */
    openPaper :  function( iPaperID) {
        nos2.currentPaper = nos2.thePapers[iPaperID];    //  thePapers is a keyed object, not an array

        //  set the current figure to the first (if any) in this paper.
        const currentFigureDBID = nos2.currentPaper.guts.figures.length ? nos2.currentPaper.guts.figures[0] : null;
        nos2.currentFigure = currentFigureDBID ? nos2.theFigures[currentFigureDBID] : null;

        nos2.goToTabNumber(1);   //  the second tab; also causes update
    },

    viewPaper : function(iPaperID, iInJournal) {
        nos2.currentPaper = nos2.thePapers[iPaperID];    //  thePapers is a keyed object, not an array

        //  set the current figure to the first (if any) in this paper.
        const currentFigureDBID = nos2.currentPaper.guts.figures.length ? nos2.currentPaper.guts.figures[0] : null;
        nos2.currentFigure = currentFigureDBID ? nos2.theFigures[currentFigureDBID] : null;

        nos2.goToTabNumber(1);   //  the second tab; also causes update

/*
        if (iInJournal) {

        }
*/
    },


    submitPaper: async function () {
        //  what will the new status be?
        const tNewStatus =
            (nos2.currentPaper.guts.status === nos2.constants.kPaperStatusRevise) ?
                nos2.constants.kPaperStatusReSubmitted :
                nos2.constants.kPaperStatusSubmitted;
        nos2.currentPaper.guts.status = tNewStatus;

        nos2.currentPaper.guts.authors = $('#paperAuthorsBox').val();
        nos2.currentPaper.guts.title = $('#paperTitleBox').val();
        nos2.currentPaper.guts.text = $('#paperTextBox').val();

        const tPaperDBID = await fireConnect.savePaperToDB(nos2.currentPaper);
        await nos2.userAction.sendMessageFrom("author");  //  also blanks the text box

        nos2.currentFigure = null;
        nos2.currentPaper = null;

        nos2.goToTabNumber(0);   //  return to the list and update UI
    },


    judgePaper: async function (iJudgment) {
        switch (iJudgment) {
            case nos2.constants.kPaperStatusPublished:
                nos2.currentPaper.publish();        //  sets many consequences
        }
        nos2.currentPaper.guts.status = iJudgment;

        await fireConnect.savePaperToDB(nos2.currentPaper);
        await nos2.userAction.sendMessageFrom("reviewer");  //  also blanks the text box

        nos2.currentFigure = null;
        nos2.currentPaper = null;
        nos2.goToTabNumber(0);   //  return to the list, refresh
    },

    giveGrant: async function(iTeamCode) {
        const theAmount = 1000 * Number(document.getElementById("grantAmountThou").value);
        fireConnect.adjustBalance(iTeamCode, theAmount);
    },

    godSignIn: async function () {
        const tUsername = $('#godUsernameBox').val();
        const tEnteredPassword = document.getElementById("godPasswordBox").value;

        const tGodData = await fireConnect.getGodData(tUsername, tEnteredPassword);

        if (tGodData) {
            nos2.myGodID = tGodData.godName;
            nos2.myGodName = tGodData.godName;
            nos2.adminPhase = nos2.constants.kAdminPhaseNoWorld;
            nos2.ui.update();
        }
    }

};