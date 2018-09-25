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

    constants : {
        version : "000a",

        kPhaseNoWorld : 20,
        kPhaseNoTeam : 30,
        kPhasePlaying : 40,

    },

    initialize : function() {
        univ.playPhase = univ.constants.kPhaseNoWorld;
        univ.state.size = 12;

        //  univ.model.initialize();
        univ.universeView.initialize( document.getElementById("universe") );
        univ.telescopeView.initialize( document.getElementById("telescope") );

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
        univ.telescopeView.latestResult = result;
    }
};