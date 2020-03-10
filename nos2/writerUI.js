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

    figureMenuGuts: "",     //   like it says. Set in displayCurrentPaper() (from update)
    dirty: false,      //  eventually, a flag to show need to save

    initialize: async function () {
        await nos2.ui.update();
    },

    update: async function () {

        //  all the data we need to await...

        /*
                const pMyPapers = fireConnect.getPapers(nos2.state.worldCode, nos2.state.teamCode);    //  array of class Paper
                tPapers = await pMyPapers;
        */
        //  make tPapers, an ARRAY of Papers out of the keyed object nos2.thePapers
        //  where the writer is this team

        let tPapers = [];
        Object.keys(nos2.thePapers).forEach(pk => {
            const p = nos2.thePapers[pk];
            if (p.guts.teamCode === nos2.state.teamCode) {
                tPapers.push(p);
            }
        });

        //      sort these papers todo: to come


        //  status bar

        document.getElementById("writerStatusBarDiv").innerHTML =
            `writer | ${nos2.state.worldCode} | ${nos2.epoch} | ${nos2.state.teamName} ` +
            "&emsp;&emsp;<button onclick='nos2.logout()'>log out</button>" +
            `&emsp;version ${nos2.constants.version} ` +
            `&emsp;<img class="refreshButton" type="image"
                alt="refresh" title="refresh"
                src="../common/art/refresh_32.png"
                onClick="nos2.ui.update()">`
        ;


        // main visibility

        const tJoinWorldDiv = document.getElementById("joinWorldDiv");
        const tJoinTeamDiv = document.getElementById("joinTeamDiv");
        const tTabsDiv = document.getElementById("tabs");


        tJoinWorldDiv.style.display = (nos2.writerPhase === nos2.constants.kWriterPhaseNoWorld ? "block" : "none");
        tJoinTeamDiv.style.display = (nos2.writerPhase === nos2.constants.kWriterPhaseNoTeam ? "block" : "none");
        tTabsDiv.style.display = (nos2.writerPhase === nos2.constants.kWriterPhasePlaying ? "block" : "none");

        //  choose team from list. ONLY IN THE APPROPRIATE PHASE!

        if (nos2.writerPhase === nos2.constants.kWriterPhaseNoTeam) {
            //  get the team list only if we're in this phase.
            this.installTeamListForJoining();
        }


        if (nos2.writerPhase === nos2.constants.kWriterPhasePlaying) {
            //  construct list of papers for paper list tab
            this.installTableOfAllPapers(tPapers);

            //  team name in edit paper panel
            document.getElementById("paperTeamBox").innerHTML = nos2.state.teamName;

            //  fix text and "figure"-finding stuff in the paper-writing tab

            nos2.ui.displayCurrentPaper();       //

            //  current paper has a menu of figures
            //  assume nos2.currentFigure is set properly

            //  show the convo
            document.getElementById("paperConvoHistory").innerHTML = nos2.constructConvoHTML(nos2.currentPaper);

            //  update the full journal
            document.getElementById("journalDiv").innerHTML = await nos2.journal.constructJournalHTML();
        }
    },

    changeTabTo: async function (iTabName) {
        await nos2.ui.update();
    },


    /**
     * Called by update()
     *
     * @returns {Promise<void>}
     */
    async displayCurrentPaper() {
        const thePaper = nos2.currentPaper;  //  was set in openPaper(), in userActions

        const viewDIV = document.getElementById("viewPaperDIV");
        const editDIV = document.getElementById("composePaperDIV");

        if (nos2.currentPaper) {
            if (thePaper.isEditable()) {

                //      EDIT paper
                editDIV.style.display = "block";
                viewDIV.style.display = "none";

                document.getElementById("newPaperButton").style.display = "none";
                document.getElementById("savePaperButton").style.display = "block";
                document.getElementById("submitPaperButton").style.display = "block";

                document.getElementById('paperStatusBox').innerHTML = "(" + thePaper.guts.status + ")";    //  .innerHTML because it's a <td>
                document.getElementById('paperTitleBox').value = thePaper.guts.title;    //  .value because it's an <input>
                document.getElementById('paperAuthorsBox').value = thePaper.guts.authors;
                document.getElementById('paperTextBox').value = thePaper.guts.text;
                document.getElementById('paperConvoHistory').innerHTML = thePaper.guts.convo;

                //  update the figure menu and the figure itself

                this.figureMenuGuts = await nos2.ui.makeFigureMenuOptions();
                document.getElementById("figureMenu").innerHTML = this.figureMenuGuts;

                if (nos2.currentFigure) {
                    nos2.currentFigure.displayImageIn("oneFigureImageContents");
                    document.getElementById("oneFigureTitle").innerHTML = nos2.currentFigure.guts.text.title;
                    document.getElementById("oneFigureCaption").innerHTML = nos2.currentFigure.guts.text.caption;
                } else {
                    document.getElementById("oneFigureImageContents").innerHTML = "";
                    document.getElementById("oneFigureTitle").innerHTML = "";
                    document.getElementById("oneFigureCaption").innerHTML = "";
                }

                //  show the references
                this.installReferencesControls();

            } else {

                //  VIEW paper

                const thePaperHTML = thePaper.asHTML();
                editDIV.style.display = "none";
                viewDIV.style.display = "block";
                viewDIV.innerHTML = thePaperHTML;

                document.getElementById('paperStatusBox').innerHTML = "(" + thePaper.guts.status + ")";    //  .innerHTML because it's a <td>
                document.getElementById('paperConvoHistory').innerHTML = thePaper.guts.convo;
            }
        } else {
            editDIV.style.display = "none";
            viewDIV.style.display = "none";
            document.getElementById("savePaperButton").style.display = "none";
            document.getElementById("submitPaperButton").style.display = "none";
            document.getElementById("newPaperButton").style.display = "block";
            document.getElementById('paperStatusBox').innerHTML = "no paper selected";    //  .innerHTML because it's a <td>
        }
    },

    erasePaper: function () {
        nos2.currentPaper = null;
        //  $('#paperAuthorsBox').val("");    //  leave the authors in
        $('#paperStatusBox').html("no paper selected");
        $('#paperTitleBox').val("");
        $('#paperTextBox').val("");
        $('#paperAuthorsBox').html("");
        $('#paperConvoHistory').val("");
    },


    makeFigureMenuOptions: async function () {

        //  nos2.theFigures is a keyed object of Figures, ordered by dbid.
        //  todo:  to be kept current through notification (but not yet!)

        let tFigures = [];
        Object.keys(nos2.theFigures).forEach(fk => {
            const f = nos2.theFigures[fk];
            tFigures.push(f);
        });

        const tCurrentFigureDBID = nos2.currentFigure ? nos2.currentFigure.guts.dbid : null;

        let selectionThing = tCurrentFigureDBID ? "" : "selected";     //   "selected" if the current figure's dbid is null
        let out = `<option value="" ${selectionThing}>(none)</option>`;

        tFigures.forEach(f => {
            selectionThing = (tCurrentFigureDBID === f.guts.dbid) ? " selected " : "";
            out += "<option value=" + f.guts.dbid + selectionThing + ">" + f.guts.text.title + "</option>";
        });

        return out;
    },


    installTableOfAllPapers: function (tPapers) {
        //  paper task table

        const tPaperDiv = document.getElementById("paperTaskTable");

        let tPaperCount = 0;
        if (Array.isArray(tPapers) && tPapers.length > 0) {
            let text = "<table><tr><th>title</th><th>authors</th><th>status</th><th>action</th></tr>";
            tPapers.forEach(p => {
                const theDBID = p.guts.dbid;

                text += `<tr><td>${p.guts.title}</td><td>${p.guts.authors}</td><td>${p.guts.status}</td>`;
                switch (p.guts.status) {
                    case nos2.constants.kPaperStatusDraft:
                        text += `<td><button onclick="nos2.userAction.openPaper('${theDBID}')">edit</button></td>`;
                        break;
                    case nos2.constants.kPaperStatusRevise:
                        text += `<td><button onclick="nos2.userAction.openPaper('${theDBID}')">edit</button></td>`;
                        break;
                    case nos2.constants.kPaperStatusPublished:
                        tPaperCount++;
                        text += `<td><button onclick="nos2.userAction.viewPaper('${theDBID}')">view</button></td>`;
                        break;
                    case nos2.constants.kPaperStatusRejected:
                        text += `<td><button onclick="nos2.userAction.viewPaper('${theDBID}')">view</button></td>`;
                        break;
                    case nos2.constants.kPaperStatusSubmitted:
                        text += `<td><button onclick="nos2.userAction.viewPaper('${theDBID}')">view</button></td>`;
                        break;
                    case nos2.constants.kPaperStatusReSubmitted:
                        text += `<td><button onclick="nos2.userAction.viewPaper('${theDBID}')">view</button></td>`;
                        break;
                    default:
                        alert(`received a bogus paper status of ${p.guts.status}`);
                }
                text += "</tr>";
            });
            text += "</table>";
            tPaperDiv.innerHTML = text;
        } else {
            tPaperDiv.innerHTML = "<p>Sorry, no papers to display</p>";
        }
    },

    installTeamListForJoining: function () {
        let tTeams = [];
        Object.keys(nos2.theTeams).forEach(tdbid => tTeams.push(nos2.theTeams[tdbid]));

        const tChooseTeamDiv = document.getElementById("chooseTeamFromListDiv");

        //  todo: abstract this into a method in nos2 (for all player apps: univ, writer...)

        if (tTeams.length > 0) {
            let text = "<table><tr><th>code</th><th>name</th></tr>";
            tTeams.forEach(t => {
                //  the arguments for the onclick handler below
                const callbackGuts = `nos2.userAction.joinTeamByTeamCode("${t.teamCode}", "${t.teamName}")`;
                text += "<tr><td>" + t.teamCode + "</td><td>" + t.teamName + "</td>"
                    + "<td><button onclick='" + callbackGuts + "'>join</button> </td></tr>";
            });
            text += "</table>";
            tChooseTeamDiv.innerHTML = text;
        } else {
            tChooseTeamDiv.innerHTML = "<p>Sorry, no teams to display</p>";
        }
    },

    installReferencesControls: function() {
        tReferencesDiv = document.getElementById("referencesDIV");

        const thePapers = nos2.journal.assemblePublishedPapers();     //  sorted array of Papers
        if (thePapers.length > 0) {
            const theCheckboxesHTML = nos2.journal.constructCheckboxesForPapers(thePapers);
            tReferencesDiv.innerHTML = theCheckboxesHTML;
        } else {
            tReferencesDiv.innerHTML = "<p>No papers to reference</p>";
        }

    },
};