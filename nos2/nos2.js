/*
==========================================================================

 * Created by tim on 8/24/18.
 
 
 ==========================================================================
nos2 in nos2

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

let nos2 = {

    initialize: function(iApp) {
        this.app = iApp;
        console.log(`Initialize with iApp = ${iApp}`);
        fireConnect.initialize();

        nos2.clearVariableValues();

        nos2.ui.initialize();    //  whichever UI it is!
        nos2.ui.update();
    },

    app: null,

    kBasePhpURL: {
        local: "http://localhost:8888/plugins/nos2/nos2.php",
        xyz: "https://codap.xyz/plugins/nos2/nos2.php",
        eeps: "https://www.eeps.com/codap/nos2/nos2.php"
    },

    state: {},
    epoch: 2022,        //  the time.  Not saved because it will be in the DB
    currentPaper: null,
    currentFigure: null, //  the actual Figure currently being displayed/edited: nos2.currentFigure

    myGodID: null,
    myGodName: null,
    adminPhase: null,
    writerPhase: null,
    editorPhase: null,
    nextTeamIndex: Math.floor(Math.random() * 100),

    journalName: "",

    //  local copies of data stored on DB (FireStore). So not part of state.

    theWorld : {},
    theTeams: {},      //  keys will be team IDs, which are teamCodes
    thePapers: {},     //  keys will be paper IDs
    theFigures: {},     //  keys are figure dbids
    theResults: {},     //  likewise

    constants: {
        version: "000b",

        kAdminPhaseNoGod: 1,
        kAdminPhaseNoWorld: 2,
        kAdminPhasePlaying: 49,

        kWriterPhaseNoWorld: 51,
        kWriterPhaseNoTeam: 52,
        kWriterPhasePlaying: 89,

        kPaperStatusDraft: 'draft',
        kPaperStatusSubmitted: 'submitted',
        kPaperStatusRejected: 'rejected',
        kPaperStatusRevise: 'revise',
        kPaperStatusReSubmitted: 'resubmitted',
        kPaperStatusPublished: 'published',

        kEditorPhaseNoWorld: 101,
        kEditorPhasePlaying: 199,

        kTrashCan: "\uD83D\uddd1",

        freshState: {
            worldCode: null,
            teamCode: null,      //  the "team" we are in (the ID)
            teamName: null,    //  full name of the team
        },
    },

    clearVariableValues: function() {
        this.myGodID = null;
        this.myGodName = null;
        nos2.adminPhase = nos2.constants.kAdminPhaseNoGod;
        nos2.writerPhase = nos2.constants.kWriterPhaseNoWorld;
        nos2.editorPhase = nos2.constants.kEditorPhaseNoWorld;

        nos2.journalName = "";

        nos2.state = nos2.constants.freshState;     //  teamCode, teamName, worldCode

        nos2.theWorld = {};
        nos2.theTeams = {};
        nos2.thePapers = {};
        nos2.theFigures = {};
        nos2.theResults = {};

        nos2.currentPaper = null;
        nos2.currentFigure = null;

        const theWorldCodeBox = document.getElementById("worldCodeBox");
        if (theWorldCodeBox) theWorldCodeBox.value = "";
    },

    logout: function () {
        this.clearVariableValues();

        fireConnect.unsubscribeFromFigures();
        fireConnect.unsubscribeFromPapers();
        fireConnect.unsubscribeFromResults();
        fireConnect.unsubscribeFromTeams();
        fireConnect.unsubscribeFromWorld();
        
        nos2.ui.update();
    },

    goToTabNumber: function (iTab) {
        $("#tabs").tabs("option", "active", iTab);
        nos2.ui.update();
    },


    restoreTeamsFiguresPapersResults: async function (iWorldCode) {
        nos2.theWorld = await fireConnect.getWorldData(iWorldCode);
        nos2.theTeams = await fireConnect.getAllTeams(iWorldCode);
        nos2.thePapers = await fireConnect.getAllPapers();
        nos2.theFigures = await fireConnect.getAllFigures();
        nos2.theResults = await fireConnect.getAllResults();

        //  [nos2.theTeams, nos2.thePapers, nos2.theFigures] = await Promise.all([tPromise, pPromise, fPromise]);
    },

    /**
     *
     * @param fdbid  dbid of the first figure referenced by the paper
     */
    learnResults: function (fdbid) {

        const theFigure = nos2.theFigures[fdbid];
        const theResultIDs = theFigure.guts.results;
        fireConnect.assertKnownResult(theResultIDs);
/*
        theResultIDs.forEach(rid => {
            fireConnect.assertKnownResult(rid);
        });
*/
    },

    getKnownResults: async function () {
        if (nos2.state.worldCode && nos2.state.teamCode) {
            let resultsOut = [];
            const myTeam = nos2.theTeams[nos2.state.teamCode];
            const theKnownResultIDs = myTeam.known;

            theKnownResultIDs.forEach( krid => {
                resultsOut.push(nos2.theResults[krid]);
            });

            return resultsOut;      //   and array of Results
        } else {
            return [];
        }
    },


    constructConvoHTML: function (iPaper) {
        if (iPaper) {
            const C = iPaper.guts.convo;

            out = "<table>";
            C.forEach(mess => {
                out += `<tr><td>${mess.sender}:</td><td>${mess.message}</td></tr>`;
            });
            out += "</table>";
            return out;
        }
    },

};