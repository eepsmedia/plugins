/*
==========================================================================

 * Created by tim on 9/24/18.
 
 
 ==========================================================================
nos2.ui in nos2

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

    initialize: function () {
        console.log("Stub univ.ui initialization");
    },


    update: async function () {

        //  visibility

        const tJoinWorldDiv = document.getElementById("joinWorldDiv");
        const tJoinTeamDiv = document.getElementById("joinTeamDiv");
        const tTabsDiv = document.getElementById("tabs");

        tJoinWorldDiv.style.display = (univ.playPhase === univ.constants.kPhaseNoWorld ? "block" : "none");
        tJoinTeamDiv.style.display = (univ.playPhase === univ.constants.kPhaseNoTeam ? "block" : "none");
        tTabsDiv.style.display = (univ.playPhase === univ.constants.kPhasePlaying ? "block" : "none");

        //  status bar

        const theBalance = nos2.state.teamCode ?  nos2.theTeams[nos2.state.teamCode].balance : 0;

        document.getElementById("univStatusBarDiv").innerHTML =
            (nos2.state.worldCode ? `${nos2.state.worldCode} | ` : "") +
            (nos2.epoch ? `${nos2.epoch} | ` : "") +
            (nos2.state.teamName ? `${nos2.state.teamName} | ` : "") +
            `$${theBalance} | ` +
            "&nbsp;&nbsp;&nbsp;&nbsp;" +
            "<button onclick='univ.logout()'>log out</button>" +
            "&nbsp;&nbsp;&nbsp;&nbsp;" +
            univ.constants.version +
            `&emsp;<img class="refreshButton" type="image"
                alt="refresh" title="refresh"
                src="../../../common/art/refresh_32.png"
                onClick="nos2.ui.update()">`
        ;

/*
    <span class="refreshSpan" onclick="nos2.ui.update()">🔄</span>
*/



        //  choose team list. ONLY IN THE APPROPRIATE PHASE!

        if (univ.playPhase === univ.constants.kPhaseNoTeam) {
            //  get the team list only if we're in this phase.
            //  nos2.theTeams is set in univ.userActions.joinWorld()

            const tChooseTeamDiv = document.getElementById("chooseTeamFromListDiv");
            const teamKeys = Object.keys(nos2.theTeams);

            if (teamKeys.length > 0) {

                let text = "<table><tr><th>code</th><th>name</th></tr>";
                teamKeys.forEach(tk => {
                    const t = nos2.theTeams[tk];

                    //  the arguments for the onclick handler below
                    const callbackGuts = `univ.userAction.joinTeamByTeamCode("${t.teamCode}", "${t.teamName}")`;

                    text += "<tr><td>" + t.teamCode + "</td><td>" + t.teamName + "</td>"
                        + "<td><button onclick='" + callbackGuts + "'>join</button> </td></tr>";
                });
                text += "</table>";
                tChooseTeamDiv.innerHTML = text;
            } else {
                tChooseTeamDiv.innerHTML = "<p>Sorry, no teams to display</p>";
            }
        }

        //  in telescope view

        univ.telescopeView.displayLatestResult();
        univ.telescopeView.displayTelescopeLocation();

        //  in data view

        univ.dataView.redraw();

        //  in Make (/Edit) Figure view

        this.updateEditFigureSection();

        //  Figure archive

        const theFiguresListElement = document.getElementById("figuresList");
        let figureListGuts = "";
        let figuresListCount = 0;

        Object.keys(nos2.theFigures).forEach(dbid => {
            const theClass = "figureInList";
            const fig = nos2.theFigures[dbid];
            if (fig.guts.creator === nos2.state.teamCode && !fig.guts.citation) {
                figuresListCount++;
                let thisDiv;
                if (fig.guts.citation) {
                    thisDiv =
                        `<div class='${theClass}' > 
                        ${fig.guts.text.title} (${fig.guts.source})
                     </div>`;
                } else {
                    thisDiv =
                        `<div class='${theClass}' > 
                        <button onclick="univ.userAction.makeFigureCurrentByDBID('${dbid}')">edit</button>
                        ${fig.guts.text.title} 
                        <span class="spanButton" onclick="univ.userAction.deleteFigureByDBID('${dbid}')">${nos2.constants.kTrashCan}</span>
                     </div>`;
                }
                figureListGuts += thisDiv;
            }
        });

        theFiguresListElement.innerHTML = `${figureListGuts}`;

    },


    updateEditFigureSection: function () {
        const theMakeEditFigureTabGutsElement = document.getElementById("makeFigureTabGuts");
        const theNoCurrentFigureMessageElement = document.getElementById("noCurrentFigureMessage");

        if (nos2.currentFigure && nos2.currentFigure.guts.image.contents) {
            theNoCurrentFigureMessageElement.style.display = "none"
            theMakeEditFigureTabGutsElement.style.display = "block";

            //  load text fields with data from nos2.currentFigure
            document.getElementById("snapshotCaption").value = nos2.currentFigure.guts.text.caption;
            document.getElementById("snapshotTitle").value = nos2.currentFigure.guts.text.title;
            document.getElementById("snapshotNotes").value = nos2.currentFigure.guts.text.notes;

            //  The thumbnail is for DISPLAY. (display the image contents)
            nos2.currentFigure.displayImageIn("thumbnail");

        } else {
            //  what to do if there is no figure
            theNoCurrentFigureMessageElement.style.display = "block"
            theMakeEditFigureTabGutsElement.style.display = "none";
        }
    },

};