/*
==========================================================================

 * Created by tim on 9/24/18.
 
 
 ==========================================================================
univ.userAction in nos2

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

univ.userAction = {

    /**
     * Do all the things that can't be done in the "general" world-joining routine,
     * e.g., getting the scenario-specific "truth"
     * @returns {Promise<void>}
     */
    postJoinWorldCallback: async function (iWorldData) {

        if (iWorldData) {
            const tState = JSON.parse(iWorldData.state);
            univ.model.truth = tState.truth;
            univ.playPhase = univ.constants.kPhaseNoTeam;

        } else {
            alert("(univ) About " + iWorldData.worldCode + " ...  it doesn't exist.");
        }

        nos2.ui.update();
    },

    joinTeamByTeamCode: async function (iTeamCode, iTeamName) {
        nos2.state.teamCode = iTeamCode;
        nos2.state.teamName = iTeamName;
        univ.playPhase = univ.constants.kPhasePlaying;

        fireConnect.rememberTeamDocumentReference(nos2.state.teamCode);

        const theKnownResults = await nos2.getKnownResults();

        //  this needs to be awaited because if we don't it might come around again on a redraw and add n more cases
        await univ.CODAPconnect.saveResultsToCODAP(theKnownResults);     //  add our known-from-before results to CODAP

        nos2.ui.update();
    },

    changeSize : function() {
        const sizeString = document.querySelector("input[name='chooseObservationSize']:checked").value;
        univ.telescopeView.experimentSize = Number(sizeString);
        univ.telescopeView.selectedPoint = null;
        nos2.ui.update();
    },

    observe: async function () {
        if (univ.telescopeView.selectedPoint) {
            await univ.doObservation(univ.telescopeView.selectedPoint);
            nos2.ui.update();
        }
    },

    makeFigure : function() {
        nos2.currentFigure = new Figure();  //  loads default text

        //  dataView.thePaper is the SVG paper, not a journal article!
        //  this loads image information fron the dataView into the figure's .guts.image members

        nos2.currentFigure.guts.image.contents = univ.dataView.thePaper.innerSVG();
        nos2.currentFigure.guts.image.width = univ.dataView.thePaper.attr("width");
        nos2.currentFigure.guts.image.height = univ.dataView.thePaper.attr("height");

        nos2.currentFigure.guts.results = univ.dataView.resultIDArray();

        //  change to the edit Figure tab
        univ.goToTabNumber(2);
    },

    saveFigure: async function () {
        nos2.currentFigure.guts.text.caption = document.getElementById("snapshotCaption").value;
        nos2.currentFigure.guts.text.title = document.getElementById("snapshotTitle").value;
        nos2.currentFigure.guts.text.notes = document.getElementById("snapshotNotes").value;

        fireConnect.saveFigureToDB(nos2.currentFigure);         //  not in univ, but rather in nos2
        nos2.theFigures[(nos2.currentFigure.dbid)] = nos2.currentFigure;        //  save in the local array
        //  nos2.currentFigure = new Figure();      //   maybe they want to keep working on it?

        nos2.ui.update();
    },

    makeFigureCurrentByDBID: function (iDBID) {
        console.log(`Setting current figure to ${iDBID}`);

        nos2.currentFigure = nos2.theFigures[iDBID];

        //  change to the edit Figure tab
        univ.goToTabNumber(2);
    },

    deleteFigureByDBID: async function (iDBID) {
        delete nos2.theFigures[iDBID];
        fireConnect.deleteFigureByDBID(iDBID);  //  no need to await, I think
        nos2.ui.update();
    }

};