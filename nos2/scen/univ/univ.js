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

let univ = {

    whence : "local",
    playPhase : null,
    state : {},


    freshState : {
        size : 12,
        when : 1954,
        worldID : null,
        worldCode : null,
        teamID : null,
        teamName : null
    },

    constants : {
        version : "000a",

        kPhaseNoWorld : 20,
        kPhaseNoTeam : 30,
        kPhasePlaying : 40,

        kUnivDataSetName : "univ",
        kUnivDataSetTitle : "four-color universe",
        kUnivCollectionName : "univ",
        kLocalSourceString : "local",
    },

    initialize : function() {
        univ.CODAPconnect.initialize(null);

        univ.playPhase = univ.constants.kPhaseNoWorld;
        univ.state.size = 12;

        //  univ.model.initialize();
        univ.universeView.initialize( document.getElementById("universe") );
        univ.telescopeView.initialize( document.getElementById("telescope") );
        univ.dataView.initialize( document.getElementById("dataView") );

        //  register for selection events

        //  register to receive notifications about selection
        codapInterface.on(
            'notify',
            'dataContextChangeNotice[' + univ.constants.kUnivDataSetName + ']',
            'selectCases',
            univ.selectionManager.codapSelectsCases
        );

        univ.ui.update();
    },

    /**
     * Typically called from userAction, when we join a world.
     * Note: the worldID is the unique integer in the db;
     * worldCode is the memorable text ID for that world in the DB
     * @param iWorldCode
     */
    setWorld : async function( iWorldCode ) {
        const tWorldData = await univ.DBconnect.getWorldData(iWorldCode);

        if (tWorldData) {
            univ.state.worldID = tWorldData.id;
            univ.state.worldCode = tWorldData.code;
            univ.state.epoch = tWorldData.epoch;
            const tState = JSON.parse( tWorldData.state);

            this.state.truth = tState.truth;

        } else {
            console.log("About " + iWorldCode + " ...  it doesn't exist.");
        }
    },

    doObservation : async function(iPoint) {
        const [ULCc, ULCr] = iPoint;
        let result = {O : 0, R : 0, G : 0, B : 0};
        for ( let c = 0; c < univ.telescopeView.experimentSize; c++ ) {
            for (let r = 0; r < univ.telescopeView.experimentSize; r++) {
                let letter = univ.state.truth[ULCc + c][ULCr + r];
                result[letter]++;
            }
        }
        univ.telescopeView.latestResult = result;       //  make sure the telescope knows for its display
        const tNewResult = new Result(result, iPoint);      //  encapsulate all this information
        const theNewID = await univ.DBconnect.saveNewResult(tNewResult.values);     //  save to DB, get the db ID
        tNewResult.values.dbid = theNewID;      //  make sure that's in the values

        console.log("New result " + tNewResult.toString() + " added and got dbid = " + theNewID);

        univ.CODAPconnect.saveItemsToCODAP(tNewResult.values);  //  store it in CODAP
    },


    convertValuesToResults : function( iValues ) {
        out = [];
        iValues.values.forEach( v => {
            let r = new Result({}, [1,2]);
            r.values = v.values;        //  that's right: values has two fields, id (the item id) and values. Sheesh.
            out.push(r);
        })
        return out;
    },

    colors: {
        "R": "tomato",
        "B": "dodgerblue",
        "O": "orange",
        "G": "green",
        "K": "black",
        "Y": "yellow",
        "obs" : "#89F",
    },


};