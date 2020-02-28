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

    newWorld: async function () {
        const tWorldCode = document.getElementById("worldCodeBox").value;
        const tJournalName = document.getElementById("journalNameBox").value;
        const tEpoch = document.getElementById("epochBox").value;
        const tScenario = document.getElementById("worldScenarioMenu").value;

        const tTheTruthOfThisScenario = univ.model.getNewStateTemp();
        const tGameState = {truth: tTheTruthOfThisScenario};    //  temp!

        const theWorldCode = await fireConnect.makeNewWorld(
            nos2.myGodName, tWorldCode, tEpoch, tJournalName, tScenario, tGameState
        );

        nos2.state.worldCode = theWorldCode;

        nos2.adminPhase = nos2.constants.kAdminPhasePlaying;
        await nos2.ui.update();

    },

    newTeam: async function () {
        const tCode = document.getElementById("newTeamCodeBox").value;
        const tName = document.getElementById("newTeamNameBox").value;
        const tBalance = univ.constants.kInitialBalance;
        await fireConnect.addTeam(tCode, tName, tBalance);
        this.suggestTeam();
        await nos2.ui.update();
    },

    suggestTeam: function () {
        const tCodeBox = document.getElementById("newTeamCodeBox");
        const tNameBox = document.getElementById("newTeamNameBox");
        const suggestionType = $('input[name=teamNameType]:checked').val();


        const tList = teamNameSuggestionList[suggestionType];
        const tIndex = Math.floor(Math.random() * tList.length);
        const tTeam = tList[tIndex];

        tCodeBox.value = tTeam.code;
        tNameBox.value = tTeam.name;
    },

    /**
     * Try to join the world whose code is in the "worldCodeBox" box.
     * If that world doesn't exist, alertthe user and return null
     * @returns {Promise<void>}
     */
    joinWorld: async function () {
        let tWorldCode = document.getElementById("worldCodeBox").value;

        let tWorldData = await fireConnect.joinWorld(tWorldCode);

        console.log("About " + tWorldCode + " ... " + (tWorldData ? " year " + tWorldData.epoch : " it doesn't exist."));

        if (tWorldData) {
            nos2.writerPhase = nos2.constants.kWriterPhaseNoTeam;
            nos2.editorPhase = nos2.constants.kEditorPhasePlaying;
            nos2.state.worldCode = tWorldCode;
        } else {
            alert("Sorry, world " + tWorldCode + " doesn't exist (yet).");
        }

        nos2.ui.update();
    },

    /**
     * Called by administrators only?
     * @param iCode
     */
    joinWorldByCode: function (iCode) {
        fireConnect.joinWorld(iCode);
        nos2.state.worldCode = iCode;
        nos2.adminPhase = nos2.constants.kAdminPhasePlaying;
        nos2.ui.update();
    },

    joinTeamByID: function (iTeamCode, iTeamName) {
        nos2.state.teamCode = iTeamCode;
        nos2.state.teamName = iTeamName;
        nos2.writerPhase = nos2.constants.kWriterPhasePlaying;
        nos2.currentPaper = new Paper();     //  because we have to have a teamID before we make a paper

        nos2.ui.update();
    },

    /**
     * User has chosen a data pack from a menu while editing a paper.
     * In this version, the user can have only one.
     *
     * The idea is, they have to assemble the data pack they want in their scenario (in CODAP)
     * before heading here to write the paper.
     */
    chooseOneDataPack: function (theMenu) {
        const thePackNumber = Number(theMenu.value);
        nos2.currentPack = nos2.currentPackByDBID(thePackNumber);   //  currentPack is the actual entire pack

        if (nos2.currentPaper) {
            if (nos2.currentPaper.isEditable()) {
                nos2.currentPaper.setThisPack(thePackNumber);   //  the value in the Paper is just the number
            }
        }

        nos2.ui.update();
    },

    assignDataPack: function () {
        nos2.currentPaper.addPack(nos2.currentPack);
    },

    sendMessageFrom: async function (iSender) {
        const theNewMessage = document.getElementById("messageTextBox").value;
        let out = (iSender === "author") ? "<tr><td>author</td>" : "<tr><td>editor</td>";
        out += "<td>" + theNewMessage + "</td></tr>";

        fireConnect.appendMessageToConvo( out, nos2.currentPaper.dbid );
    },

    makePaperPreview: async function () {
        const tPaperID = nos2.currentPaper.dbid;

        let thePreviewHTML = "";
        if (nos2.currentPaper) {
            thePreviewHTML = await fireConnect.getPaperPreview(tPaperID);
        } else {
            thePreviewHTML = "No paper specified."
        }

        document.getElementById("paperPreview").innerHTML = thePreviewHTML;

        $("#paperPreview").dialog("open");
    },

    erasePaper: async function () {
        nos2.currentPaper = new Paper();
        await nos2.ui.update();
    },

    savePaper: async function () {

        nos2.currentPaper.authors = $('#paperAuthorsBox').val();
        nos2.currentPaper.title = $('#paperTitleBox').val();
        nos2.currentPaper.text = $('#paperTextBox').val();
        nos2.currentPaper.authorComments = $('#paperAuthorCommentsBox').val();
        //  thePaper.packs = [];
        //  thePaper.references = [];

        const tPaperData = await fireConnect.savePaper(nos2.currentPaper);    //  send the Paper
        nos2.currentPaper.dbid = Number(tPaperData["id"]);

        await nos2.ui.update();
        return tPaperData
    },

    submitPaper: async function () {
        const thePaper = nos2.thePapers[nos2.currentPaperID];
        const tNewStatus = nos2.currentPaper.status =
            nos2.constants.kPaperStatusRevise ?
                nos2.constants.kPaperStatusReSubmitted :
                nos2.constants.kPaperStatusSubmitted;
        const tPaperData = await nos2.userAction.savePaper();
        await fireConnect.submitPaper(nos2.currentPaper.dbid, tNewStatus);
        nos2.ui.erasePaper();
        nos2.goToTabNumber(0);   //  return to the list
        await nos2.ui.update();
    },


    judgePaper: async function (iJudgment) {
        const tEditorComments = document.getElementById("paperEditorCommentsBox").value;
        const tPaperData = await fireConnect.judgePaper(nos2.currentPaperID, iJudgment, tEditorComments);
        await nos2.ui.update();
        nos2.ui.erasePaper();    //  clean up the boxes
        nos2.goToTabNumber(0);   //  return to the list
    },

    godSignIn: async function () {
        const tUsername = $('#godUsernameBox').val();
        const tGodData = await fireConnect.getGodData(tUsername);
        nos2.myGodID = tGodData.godName;
        nos2.myGodName = tGodData.godName;
        nos2.adminPhase = nos2.constants.kAdminPhaseNoWorld;
        nos2.ui.update();
    }

};