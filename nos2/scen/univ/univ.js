/*
==========================================================================

 * Created by tim on 9/22/18.
 
 
 ==========================================================================
4color in 4color

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

/*
# Notes on design

## Where is the data?
There are really two copies of the experimental results: one in CODAP and one in the DB. This is unfortunate but inevitable.
We decide this:

When we display data in the plugin, we rely on CODAP's copy.

To make this work, we do several things:
* Whenever we take new data, we save it to the DB and to CODAP.
* Whenever we join a game -- enter a fresh CODAP doc -- we retrieve all KNOWN data from the database
  and add it to CODAP.

So see that in `nos2.ui.update`, when we update `dataView`, we go out to CODAP every time and get
the data.

 */

let univ = {

    playPhase : null,

    constants : {
        version : "000b",

        kPhaseNoWorld : 20,
        kPhaseNoTeam : 30,
        kPhasePlaying : 40,

        kUnivDataSetName : "univ",
        kUnivDataSetTitle : "four-color universe",
        kUnivCollectionName : "univ",

        kInitialBalance : 10000,

},

    initialize : async function(iApp) {
        nos2.app = iApp;
        await univ.CODAPconnect.initialize(null);

        fireConnect.initialize();
        univ.playPhase = univ.constants.kPhaseNoWorld;

        nos2.currentFigure = new Figure();      //  not in nos2.state...

        //  univ.model.initialize();
        univ.telescopeView.initialize( document.getElementById("telescope") );
        univ.dataView.initialize( document.getElementById("dataView") );

        //  register to receive notifications about selection

        codapInterface.on(
            'notify',
            'dataContextChangeNotice[' + univ.constants.kUnivDataSetName + ']',
            'selectCases',
            univ.selectionManager.codapSelectsCases
        );

        nos2.ui.update();
    },

    observationCosts :  function (size) {
        if (size === 3) return 3000;
        return 5000;
    },

    logout : function() {
        univ.playPhase = univ.constants.kPhaseNoWorld;
        univ.CODAPconnect.deleteAllCases();
        nos2.logout();
    },

    /**
     * Typically called from userAction, when we join a world.
     * Note: worldCode is the memorable text ID for that world in the DB
     * @param iWorldCode
     */
    setWorld : async function( iWorldCode ) {
        const tWorldData = await fireConnect.joinWorld(iWorldCode);

        if (tWorldData) {
            nos2.state.worldCode = tWorldData.code;
            nos2.epoch = tWorldData.epoch;
            const tState = JSON.parse( tWorldData.state);

            univ.model.truth = tState.truth;

        } else {
            console.log("About " + iWorldCode + " ...  it doesn't exist.");
        }
    },

    /**
     * Called from userActions
     *
     * @param iPoint
     * @returns {Promise<void>}
     */
    doObservation : async function(iPoint) {

        const theCost = this.observationCosts(univ.telescopeView.experimentSize);
        const theBalance = nos2.theTeams[nos2.state.teamCode].balance;

        if (theCost > theBalance) {
            alert(`You dont have the $${theCost} you need for that observation. Oops!`);
            return;
        }

        fireConnect.adjustBalance(nos2.state.teamCode, -theCost);

        const [ULCc, ULCr] = iPoint;

        //  the specific data appropriate to this scenario.
        //  epoch, team, and paper are added when we make a Result object.
        let data = {
            O : 0, R : 0, G : 0, B : 0,
            col : ULCc, row : ULCr,
            dim : univ.telescopeView.experimentSize
        };
        for ( let c = 0; c < univ.telescopeView.experimentSize; c++ ) {
            for (let r = 0; r < univ.telescopeView.experimentSize; r++) {
                let letter = univ.model.truth[ULCc + c][ULCr + r];
                data[letter]++;
            }
        }

        const tNewResult = await fireConnect.saveResultToDB(new Result(data));
        univ.telescopeView.latestResult = tNewResult;       //  make sure the telescope knows for its display
        nos2.theResults[tNewResult.dbid] = tNewResult;
        await univ.CODAPconnect.saveResultsToCODAP(tNewResult);  //  store it in CODAP. This has the dbid field.
    },


    convertCODAPValuesToResults : function( iValues, iSelected) {
        let out = [];

        iValues.forEach( v => out.push(Result.resultFromCODAPValues(v)) );

        return out;
    },

    /**
     *
     * @param iValues   an OBJECT one of whose fields is an array called values
     * @returns {Array}
     */
    convertAllCasesToResults : function( iValues ) {
        let out = [];
        iValues.values.forEach( v => {
            let r = Result.resultFromCODAPValues(v.values);
            out.push(r);
        });
        return out;
    },

    /**
     *
     * @param iValues   an ARRAY of objects with {success , values}
     * @returns {Array}
     */
    convertSelectedCasesToResults : function( iValues ) {
        if (iValues.length === 0) {
            return [];
        }

        let out = [];
        iValues.forEach( iV => {
            let r = Result.resultFromCODAPValues(iV.values.case.values);
            out.push(r);
        });
        return out;
    },

    goToTabNumber : function(iTab) {
        nos2.ui.update();
        $( "#tabs" ).tabs(  "option", "active", iTab );
    },

    colors: {
        "R": "tomato",
        "B": "dodgerblue",
        "O": "orange",
        "G": "green",
        "K": "black",
        "Y": "yellow",
        "selected" : "#72bfca",     //  "#89F",
        "unselected" : "gold",

    },


};