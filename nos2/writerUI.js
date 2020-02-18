/*
==========================================================================

 * Created by tim on 8/24/18.
 
 
 ==========================================================================
ui in nos2

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


nos2.ui = {

    //  nos2.currentPaper is the paper currently being edited/written. Null if none. DEFINED IN nos2.js, NOT HERE.
    //  nos2.currentPaper.packs : [],         //  array of database ids (dbid) for packs IN THE PAPER

    packMenuGuts : "",     //   like it says. Set in displayCurrentPaper() (from update)
    dirty : false,      //  eventually, a flag to show need to save
    packs : [],     //  all DataPacks. Set in initialize() and update()

    initialize : async function() {
        //  get all packs from the database
        this.packs = await nos2.DBconnect.getMyDataPacks( nos2.state.worldID, nos2.state.teamID);
        //  update() will get called
    },

    changeTabTo : async function(iTabName) {
        await nos2.ui.update();
    },

    /**
     * Called when the user presses as edit button in the paper list
     *
     * Fills spaces in the UI with paper contents, author names, etc.
     *
     * @param iPaperID
     */
    openPaper :  function( iPaperID) {
        const thePaper = nos2.currentPaper = nos2.thePapers[iPaperID];    //  thePapers is a keyed object, not an array

        nos2.goToTabNumber(1);   //  the second tab; also causes update
    },

    /**
     * Called by update()
     *
     * @returns {Promise<void>}
     */
    async displayCurrentPaper(  ) {
        const thePaper = nos2.currentPaper;  //  was set in openPaper(), above

        if (nos2.currentPaper) {
            document.getElementById('paperStatusBox').innerHTML = "paper " + thePaper.dbid + " (" + thePaper.status + ")";    //  .innerHTML because it's a <td>
            document.getElementById('paperTitleBox').value = thePaper.title;    //  .value because it's an <input>
            document.getElementById('paperAuthorsBox').value = thePaper.authors;
            document.getElementById('paperTextBox').value = thePaper.text;
            document.getElementById('paperConvoHistory').innerHTML = thePaper.convo;
            document.getElementById('paperTeamBox').innerHTML = (thePaper.teamID ? thePaper.teamName : "-");

        } else {
            nos2.currentPaper = null;
            $('#paperStatusBox').html("no paper selected");
            $('#paperTitleBox').val("");
            //  $('#paperAuthorsBox').val("");    //  leave the authors in
            $('#paperTextBox').val("");
            $('#paperConvoHistory').html("");
            $('#paperTeamBox').html("");
            //  $('#dataPackList').html("");

        }
    },

    erasePaper: function () {
        nos2.currentPaper = null;
        //  $('#paperAuthorsBox').val("");    //  leave the authors in
        $('#paperStatusBox').html("no paper selected");
        $('#paperTitleBox').val("");
        $('#paperTextBox').val("");
        $('#paperTeamBox').html("");
        $('#paperAuthorCommentsBox').val("");
        $('#paperEditorCommentsBox').html("");
    },


    viewPaper : function(iPaperID, iInJournal) {
        if (iInJournal) {

        }
    },

/*
    makeDataPackRadioButtons : async function() {
        this.packs = await nos2.DBconnect.getMyDataPacks( nos2.state.worldID, nos2.state.teamID);

        let out = "";
        this.packs.forEach( pk => {
            out += "<input type='radio' name='dataPackChoice' value=" + pk.dbid +
                " onChange='nos2.ui.displayOneDataPack(" + pk.dbid + ")'>" + pk.theTitle + "<br>";
        });

        return out;
    },
*/


    makeDataPackMenuOptions : async function( iCurrentPack ) {

        tCurrentPackDBID = iCurrentPack ? iCurrentPack.dbid : null;

        let out = "";
        this.packs.forEach( pk => {
            const selectionThing = (tCurrentPackDBID == pk.dbid) ? " selected " : "";
            out += "<option value=" + pk.dbid + selectionThing +  ">" + pk.theTitle + "</option>";
        });

        return out;
    },


    displayDataPack : function( iPack ) {

        document.getElementById("oneDataPackTitle").innerHTML = "<b>" + iPack.theTitle + "</b>";
        document.getElementById("oneDataPackCaption").innerHTML = "<i>" + iPack.theCaption + "</i>";

        const theSVG = document.getElementById("oneDataPackFigure");

        theSVG.innerHTML = iPack.theFigure;
        const theViewBoxString = "0 0 " + iPack.figureWidth + " " + iPack.figureHeight;
        theSVG.setAttribute("viewBox", theViewBoxString);

    },

    makeTableOfAllPapers : function(tPapers) {
        //  paper task table

        const tPaperDiv = document.getElementById("paperTaskTable");

        let tPaperCount = 0;
        if (Array.isArray(tPapers)) {
            let text = "<table><tr><th>id</th><th>title</th><th>status</th><th>action</th></tr>";
            tPapers.forEach(p => {
                text += "<tr><td>" + p.dbid + "</td><td>" + p.title + "</td>";
                text += "<td>" + p.status + "</td>";
                switch (p.status) {
                    case nos2.constants.kPaperStatusInProgress:
                        text += "<td><button onclick='nos2.ui.openPaper(" + p.dbid + ")'>edit</button></td> ";
                        break;
                    case nos2.constants.kPaperStatusRevise:
                        text += "<td><button onclick='nos2.ui.openPaper(" + p.dbid + ")'>edit</button></td> ";
                        break;
                    case nos2.constants.kPaperStatusPublished:
                        tPaperCount++;
                        text += "<td><button onclick='nos2.ui.viewPaper(" + p.dbid + ", true)'>view</button></td> ";
                        break;
                    case nos2.constants.kPaperStatusRejected:
                        text += "<td>-</td> ";
                        break;
                    case nos2.constants.kPaperStatusSubmitted:
                        text += "<td>-</td> ";
                        break;
                    case nos2.constants.kPaperStatusReSubmitted:
                        text += "<td>-</td> ";
                        break;
                }
                text += "</tr>";
            });
            text += "</table>";
            tPaperDiv.innerHTML = text;
        } else {
            tPaperDiv.innerHTML = "<p>Sorry, no papers to display</p>";
        }


    },


    update : async function() {

        //  all the data we need to await...

        const pMyPapers = nos2.DBconnect.getPapers(nos2.state.worldID, nos2.state.teamID);    //  array of class Paper
        tPapers = await pMyPapers;

        //  assemble the nos2.thePapers object by parsing the array from the DB;
        //  make it so that we are KEYED by the paperID, for easy access.

        nos2.thePapers = {};

        if (Array.isArray(tPapers)) {
            tPapers.forEach(p => {
                nos2.thePapers[p.dbid] = p;
            });
        }

        //  status bar

        document.getElementById("writerStatusBarDiv").innerHTML =
            nos2.constants.version + " | " +
            nos2.whence +
            (nos2.state.worldCode ? " | " + nos2.state.worldCode  : "") +
            (nos2.state.teamID ? " | " + nos2.state.teamName : "") + "&nbsp;&nbsp;&nbsp;&nbsp;" +
            "<button onclick='nos2.logout()'>log out</button>";


        // main visibility

        const tJoinWorldDiv = document.getElementById("joinWorldDiv");
        const tJoinTeamDiv = document.getElementById("joinTeamDiv");
        const tTabsDiv = document.getElementById("tabs");


        tJoinWorldDiv.style.display = (nos2.writerPhase === nos2.constants.kWriterPhaseNoWorld ? "block" : "none");
        tJoinTeamDiv.style.display = (nos2.writerPhase === nos2.constants.kWriterPhaseNoTeam ? "block" : "none");
        tTabsDiv.style.display = (nos2.writerPhase === nos2.constants.kWriterPhasePlaying ? "block" : "none");

        //  team name in edit paper panel

        document.getElementById("paperTeamBox").innerHTML = nos2.state.teamName;

        //  choose team from list. ONLY IN THE APPROPRIATE PHASE!

        if (nos2.writerPhase === nos2.constants.kWriterPhaseNoTeam) {
            //  get the team list only if we're in this phase.
            const tTeams = await nos2.DBconnect.getMyTeams(nos2.state.worldID);
            const tChooseTeamDiv = document.getElementById("chooseTeamFromListDiv");

            if (tTeams) {

                let text = "<table><tr><th>id</th><th>code</th><th>name</th></tr>";
                tTeams.forEach(t => {
                    const tParenGuts = '(' + t.id + ',"' + t.name + '")';
                    console.log(t.id + ") Team " + t.name + " is called " + t.code + ".");
                    text += "<tr><td>" + t.id + "</td><td>" + t.code + "</td><td>" + t.name + "</td>"
                        + "<td><button onclick='nos2.userAction.joinTeamByID" + tParenGuts + "'>join</button> </td></tr>";
                });
                text += "</table>";
                tChooseTeamDiv.innerHTML = text;
            } else {
                tChooseTeamDiv.innerHTML = "<p>Sorry, no teams to display</p>";
            }
        }

        //  construct list of papers for papers tab

        this.makeTableOfAllPapers( tPapers );


        //  fix text and "pack"-finding stuff in the paper-writing tab

        nos2.ui.displayCurrentPaper();       //


        //  get all packs from the database. This is an array of DataPacks, most recent first.
        //  we get them here because they might have been changed by another team member.

        this.packs = await nos2.DBconnect.getMyDataPacks( nos2.state.worldID, nos2.state.teamID);
        nos2.currentPack = nos2.getCurrentPack();   //  depends on currentPaper. Null if nonexistent.

        if (nos2.currentPack) {
            this.displayDataPack( nos2.currentPack );
        }

        this.packMenuGuts = await nos2.ui.makeDataPackMenuOptions( nos2.currentPack );
        document.getElementById("dataPackMenu").innerHTML = this.packMenuGuts;

        //  update the full nos2

        document.getElementById("journalDiv").innerHTML = await nos2.DBconnect.getPublishedJournal(nos2.state.worldID);


    }
};