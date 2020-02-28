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

    initialize: function () {
        const tJournalNameDiv = document.getElementById("journalNameBox");
        tJournalNameDiv.defaultValue = nos2.strings.sDefaultJournalName;
    },

    update: async function () {
        //  all the data we need to await...

        const pMyPapers = fireConnect.getPapers(nos2.state.worldCode, nos2.state.teamCode);
        const pMyWorlds = fireConnect.getMyWorlds(nos2.myGodID);
        const pMyTeams = fireConnect.getMyTeams(nos2.state.worldCode);

        const [tPapers, tWorlds, tTeams] = await Promise.all([pMyPapers, pMyWorlds, pMyTeams]);

        //  status bar

        document.getElementById("adminStatusBarDiv").innerHTML =
            "admin | " +
            nos2.constants.version + " | " +
            nos2.whence +
            (nos2.myGodName ? " | " + nos2.myGodName + " (" + nos2.myGodID + ")" : "") +
            (nos2.state.worldCode ? " | " + nos2.state.worldCode : "")
            + "&nbsp;&nbsp;&nbsp;&nbsp; <button onclick='nos2.logout()'>log out</button>";


        // main visibility

        const tGodLoginDiv = document.getElementById("godLoginDiv");
        const tGodChooseWorldDiv = document.getElementById("godChooseWorldDiv");
        const tTabsDiv = document.getElementById("tabs");

        tGodLoginDiv.style.display = (nos2.adminPhase === nos2.constants.kAdminPhaseNoGod ? "block" : "none");
        tGodChooseWorldDiv.style.display = (nos2.adminPhase === nos2.constants.kAdminPhaseNoWorld ? "block" : "none");
        tTabsDiv.style.display = (nos2.adminPhase === nos2.constants.kAdminPhasePlaying ? "block" : "none");


        //  editor panel visibility

        /*
                const tEditorTabDiv = document.getElementById("editor");
                tEditorTabDiv.style.display = (nos2.state.editor ? "block" : "none");
        */

        //  join page text etc

        const tJoinType = $('input[name=joinType]:checked').val();
        const tJoinButton = document.getElementById('joinButton');
        const tJoinHelpSpan = document.getElementById("joinHelpSpan");
        const tJournalNameDiv = document.getElementById("journalNameDiv");

        switch (tJoinType) {
            case 'join':
                tJoinButton.value = nos2.strings.sJoinWorldButtonLabel;
                tJoinHelpSpan.textContent = nos2.strings.sJoinJoinTypeHelpString;
                tJournalNameDiv.style.display = "none";
                break;
            case 'new':
                tJoinButton.value = nos2.strings.sNewWorldButtonLabel;
                tJoinHelpSpan.textContent = nos2.strings.sNewJoinTypeHelpString;
                tJournalNameDiv.style.display = "block";
                break;
        }

        //  paper task table
        const tPaperDiv = document.getElementById("papersListDiv");

        if (Array.isArray(tPapers)) {
            let text = "<table><tr><th>id</th><th>title</th></tr>";
            tPapers.forEach(p => {
                console.log(p.id + ": " + p.title);
                text += "<tr><td>" + p.id + "</td><td>" + p.title + "</td></tr>";
            });
            text += "</table>";
            tPaperDiv.innerHTML = text;
        } else {
            tPaperDiv.innerHTML = "<p>Sorry, no papers to display</p>";
        }

        //  world list table

        const tWorldDiv = document.getElementById("godChooseWorldTable");

        if (tWorlds) {
            let text = "<table><tr><th>code</th></tr>";
            tWorlds.forEach(w => {
                console.log("World " + w.code + ".");
                text += "<tr><td>" + w.code + "</td>"
                    + "<td><button onclick='nos2.userAction.joinWorldByCode(\"" + w.code + "\")'>join</button> </td></tr>";
            });
            text += "</table>";
            tWorldDiv.innerHTML = text;
        } else {
            tWorldDiv.innerHTML = "<p>Sorry, no worlds to display</p>";
        }

        //  teams list table

        const tTeamsListDiv = document.getElementById("teamsListDiv");

        if (tTeams) {
            let text = "<table><tr><th>code</th><th>name</th><th>balance</th></tr>";
            tTeams.forEach(t => {
                console.log(t.id + ") Team " + t.name + " is called " + t.code + ".");
                text += "<tr><td>" + t.teamCode + "</td><td>" + t.teamName + "</td><td>" + t.balance + "</td>"
                    + "</tr>";
                   // + "<td><button onclick='nos2.userAction.joinWorldByID(" + w.id + ", \"" + w.code + "\")'>join</button> </td></tr>";
            });
            text += "</table>";
            tTeamsListDiv.innerHTML = text;
        } else {
            tTeamsListDiv.innerHTML = "<p>Sorry, no teams to display</p>";
        }

    }
};