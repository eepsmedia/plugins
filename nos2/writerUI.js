/*
==========================================================================

 * Created by tim on 8/24/18.
 
 
 ==========================================================================
ui in journal

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

journal.ui = {

    packs : [],
    currentPack : null,

    initialize : function() {

    },

    openPaper :  function( iPaperID) {
        const thePaper = journal.currentPaper = journal.thePapers[iPaperID];

        journal.goToTabNumber(1);   //  the second tab

        document.getElementById('paperStatusBox').innerHTML = "paper " + thePaper.dbid + " (" + thePaper.status + ")";    //  .innerHTML because it's a <td>
        document.getElementById('paperTitleBox').value = thePaper.title;    //  .value because it's an <input>
        document.getElementById('paperAuthorsBox').value = thePaper.authors;
        document.getElementById('paperTextBox').value = thePaper.text;
        document.getElementById('paperEditorCommentsBox').innerHTML = thePaper.editorComments;  //  because it's a span
        document.getElementById('paperAuthorCommentsBox').value = thePaper.authorComments;
        document.getElementById('paperTeamBox').innerHTML = (thePaper.teamID ? journal.state.teamName : "-");

        //journal.ui.currentPack = thePaper.packs[0];
    },

    displayCurrentPaper(  ) {
        const thePaper = journal.currentPaper;

        journal.goToTabNumber(1);   //  the second tab

        if (journal.currentPaper) {
            document.getElementById('paperStatusBox').innerHTML = "paper " + thePaper.dbid + " (" + thePaper.status + ")";    //  .innerHTML because it's a <td>
            document.getElementById('paperTitleBox').value = thePaper.title;    //  .value because it's an <input>
            document.getElementById('paperAuthorsBox').value = thePaper.authors;
            document.getElementById('paperTextBox').value = thePaper.text;
            document.getElementById('paperEditorCommentsBox').innerHTML = thePaper.editorComments;  //  because it's a span
            document.getElementById('paperAuthorCommentsBox').value = thePaper.authorComments;
            document.getElementById('paperTeamBox').innerHTML = (thePaper.teamID ? thePaper.teamName : "-");
            document.getElementById('dataPackList').innerHTML = thePaper.packs;
        } else {
            journal.currentPaper = null;
            //  $('#paperAuthorsBox').val("");    //  leave the authors in
            $('#paperStatusBox').html("no paper selected");
            $('#paperTitleBox').val("");
            $('#paperTextBox').val("");
            $('#paperTeamBox').html("");
            $('#paperAuthorCommentsBox').val("");
            $('#paperEditorCommentsBox').html("");
            $('#dataPackList').html("");

        }
    },

    erasePaper: function () {
        journal.currentPaper = null;
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

    makeDataPackChoiceControl : async function() {
        this.packs = await nos2.DBconnect.getMyDataPacks( journal.state.worldID, journal.state.teamID);

        let out = "";
        this.packs.forEach( pk => {
            out += "<input type='radio' name='dataPackChoice' value=" + pk.dbid +
                " onChange='journal.ui.displayOneDataPack(" + pk.dbid + ")'>" + pk.theTitle + "<br>";
        })

        return out;
    },

    displayOneDataPack : function(iDBID) {
        let thePack = null;

        this.packs.forEach( pk => {
            if (pk.dbid === iDBID) {
                journal.ui.currentPack = pk;
            }
        });
        document.getElementById("oneDataPackTitle").innerHTML = "<b>" + journal.ui.currentPack.theTitle + "</b>";
        document.getElementById("oneDataPackCaption").innerHTML = "<i>" + journal.ui.currentPack.theCaption + "</i>";

        const theSVG = document.getElementById("oneDataPackFigure");
        theSVG.innerHTML = journal.ui.currentPack.theFigure;
        const theViewBoxString = "0 0 " + journal.ui.currentPack.figureWidth + " " + journal.ui.currentPack.figureHeight;
        theSVG.setAttribute("viewBox", theViewBoxString);

    },

    update : async function() {
        //  all the data we need to await...

        const pMyPapers = nos2.DBconnect.getPapers(journal.state.worldID, journal.state.teamID);    //  these are of class Paper
        tPapers = await pMyPapers;

        //  assemble the journal.thePapers object by parsing the array from the DB;
        //  make it so that we are KEYED by the paperID, for easy access.

        journal.thePapers = {};

        if (Array.isArray(tPapers)) {
            tPapers.forEach(p => {
                journal.thePapers[p.dbid] = p;
            });
        }

        //  status bar

        document.getElementById("writerStatusBarDiv").innerHTML =
            journal.constants.version + " | " +
            journal.constants.whence +
            (journal.state.worldCode ? " | " + journal.state.worldCode  : "") +
            (journal.state.teamID ? " | " + journal.state.teamName : "") + "&nbsp;&nbsp;&nbsp;&nbsp;" +
            "<button onclick='journal.logout()'>log out</button>";


        // main visibility

        const tJoinWorldDiv = document.getElementById("joinWorldDiv");
        const tJoinTeamDiv = document.getElementById("joinTeamDiv");
        const tTabsDiv = document.getElementById("tabs");


        tJoinWorldDiv.style.display = (journal.writerPhase === journal.constants.kWriterPhaseNoWorld ? "block" : "none");
        tJoinTeamDiv.style.display = (journal.writerPhase === journal.constants.kWriterPhaseNoTeam ? "block" : "none");
        tTabsDiv.style.display = (journal.writerPhase === journal.constants.kWriterPhasePlaying ? "block" : "none");

        //  team name in edit paper panel

        document.getElementById("paperTeamBox").innerHTML = journal.state.teamName;

        //  choose team from list. ONLY IN THE APPROPRIATE PHASE!

        if (journal.writerPhase === journal.constants.kWriterPhaseNoTeam) {
            //  get the team list only if we're in this phase.
            const tTeams = await nos2.DBconnect.getMyTeams(journal.state.worldID);
            const tChooseTeamDiv = document.getElementById("chooseTeamFromListDiv");

            if (tTeams) {

                let text = "<table><tr><th>id</th><th>code</th><th>name</th></tr>";
                tTeams.forEach(t => {
                    const tParenGuts = '(' + t.id + ',"' + t.name + '")';
                    console.log(t.id + ") Team " + t.name + " is called " + t.code + ".");
                    text += "<tr><td>" + t.id + "</td><td>" + t.code + "</td><td>" + t.name + "</td>"
                        + "<td><button onclick='journal.userAction.joinTeamByID" + tParenGuts + "'>join</button> </td></tr>";
                });
                text += "</table>";
                tChooseTeamDiv.innerHTML = text;
            } else {
                tChooseTeamDiv.innerHTML = "<p>Sorry, no teams to display</p>";
            }
        }

        //  paper task table

        const tPaperDiv = document.getElementById("paperTaskTable");

        let tPaperCount = 0;
        if (Array.isArray(tPapers)) {
            let text = "<table><tr><th>id</th><th>title</th><th>status</th><th>action</th></tr>";
            tPapers.forEach(p => {
                    text += "<tr><td>" + p.dbid + "</td><td>" + p.title + "</td>";
                    text += "<td>" + p.status + "</td>";
                    switch (p.status) {
                        case journal.constants.kPaperStatusInProgress:
                            text += "<td><button onclick='journal.ui.openPaper(" + p.dbid + ")'>edit</button></td> ";
                            break;
                        case journal.constants.kPaperStatusRevise:
                            text += "<td><button onclick='journal.ui.openPaper(" + p.dbid + ")'>edit</button></td> ";
                            break;
                        case journal.constants.kPaperStatusPublished:
                            tPaperCount++;
                            text += "<td><button onclick='journal.ui.viewPaper(" + p.dbid + ", true)'>view</button></td> ";
                            break;
                        case journal.constants.kPaperStatusRejected:
                            text += "<td>-</td> ";
                            break;
                        case journal.constants.kPaperStatusSubmitted:
                            text += "<td>-</td> ";
                            break;
                        case journal.constants.kPaperStatusReSubmitted:
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

        //  fix text and "pack"-finding stuff in the paper-writing tab

        journal.ui.displayCurrentPaper();
        const tDataPackList = document.getElementById("writerDataListContents");
        const theListGuts = await journal.ui.makeDataPackChoiceControl();

        tDataPackList.innerHTML = theListGuts;

        //  update the full journal

        document.getElementById("journalDiv").innerHTML = await nos2.DBconnect.getPublishedJournal();


    }
};