/*
==========================================================================

 * Created by tim on 9/24/18.
 
 
 ==========================================================================
univ.ui in nos2

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

univ.ui = {

    update : async function() {

        //  visibility

        const tJoinWorldDiv = document.getElementById("joinWorldDiv");
        const tJoinTeamDiv = document.getElementById("joinTeamDiv");
        const tTabsDiv = document.getElementById("tabs");


        tJoinWorldDiv.style.display = (univ.playPhase === univ.constants.kPhaseNoWorld ? "block" : "none");
        tJoinTeamDiv.style.display = (univ.playPhase === univ.constants.kPhaseNoTeam ? "block" : "none");
        tTabsDiv.style.display = (univ.playPhase === univ.constants.kPhasePlaying ? "block" : "none");


        //  status bar

        document.getElementById("univStatusBarDiv").innerHTML =
            univ.constants.version + " | " +
            univ.whence +
            (univ.state.worldCode ? " | " + univ.state.worldCode  : "") +
            (univ.state.teamID ? " | " + univ.state.teamName : "") + "&nbsp;&nbsp;&nbsp;&nbsp;" +
            "<button onclick='univ.logout()'>log out</button>";


        //  choose team list. ONLY IN THE APPROPRIATE PHASE!

        if (univ.playPhase === univ.constants.kPhaseNoTeam) {
            //  get the team list only if we're in this phase.
            const tTeams = await univ.DBconnect.getTeamsInWorld(univ.state.worldID);
            const tChooseTeamDiv = document.getElementById("chooseTeamFromListDiv");

            if (tTeams) {

                let text = "<table><tr><th>id</th><th>code</th><th>name</th></tr>";
                tTeams.forEach(t => {
                    const tParenGuts = '(' + t.id + ',"' + t.name + '")';       //  the arguments for the onclick handler below
                    const callbackGuts = "univ.userAction.joinTeamByID" + tParenGuts;

                    console.log(t.id + ") Team " + t.name + " is called " + t.code + ".");
                    text += "<tr><td>" + t.id + "</td><td>" + t.code + "</td><td>" + t.name + "</td>"
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

        const allData = await univ.CODAPconnect.getAllCases();


        univ.dataView.displaySomeResults( univ.convertValuesToResults(allData));

        //  display entire grid. Just for now.

        if (univ.playPhase === univ.constants.kPhasePlaying) {
            univ.universeView.drawArray( univ.state.truth );

        }

    }
};