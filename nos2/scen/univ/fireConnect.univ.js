/*
==========================================================================

 * Created by tim on 8/24/18.


 ==========================================================================
DBconnect in nos2

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

fireConnect.univ = {

    myTeamDR : null,

    rememberTeamDocumentReference(iTeamCode) {
        this.myTeamDR = fireConnect.thisWorldDR.collection("teams").doc(iTeamCode);
    },

    /**
     * called by univ.doObservation()
     *
     * @param iResult
     * @returns {Promise<null>}
     */
    saveNewResult : async function(iResult) {
        let theResultID = null;
        try {
            let fireResult = iResult.toFireStoreObject();
            const theNewResultDR = await fireConnect.resultsCR.add(fireResult);
            console.log("Just made results doc: " + theNewResultDR.id);
            theResultID = theNewResultDR.id;
            this.assertKnownResult(theResultID);

        } catch (m) {
            console.log('saveNewResult() error: ' + m);
        }
        return theResultID;
    },

    async assertKnownResult(iID) {
        //  save in the known array of the TEAM
        await this.myTeamDR.update({
            known : firebase.firestore.FieldValue.arrayUnion(iID)
        });
    },

    /**
     * Save the current DataPack ON THE DATABASE
     */
    saveCurrentSnapshot : async function() {
        let theResultDocumentIDs = [];
        univ.currentSnapshot.theResults.forEach( r => {
            theResultDocumentIDs.push(r.dbid);
        });
        //  (we do not send the results, just their dbids)

        const forDataPackOnDB = {
                results: theResultDocumentIDs,
            worldCode: univ.state.worldCode,
            teamCode: univ.state.teamCode,
                "figure": univ.currentSnapshot.theFigure,
                "figureWidth" : univ.currentSnapshot.figureWidth,
                "figureHeight" : univ.currentSnapshot.figureHeight,
                "format": univ.currentSnapshot.theFormat,
                "caption": univ.currentSnapshot.theCaption,
                "notes": univ.currentSnapshot.theNotes,
                "title": univ.currentSnapshot.theTitle,
        };

        //  do the write
        const out = await fireConnect.dataPacksCR.add(forDataPackOnDB);
        return (out.id);
    },


    getKnownResults : async function() {
        if (univ.state.worldCode && univ.state.teamCode) {
            let DBout = null;
            let resultsOut = [];
            try {
                const myTeam = await this.myTeamDR.get();
                const theKnowns = myTeam.data().known;  //  array of result ID strings

                let observationDocumentResultPromises = [];
                theKnowns.forEach( knownID => {
                    const thisResultFromFireStore = fireConnect.resultsCR.doc(knownID);
                    observationDocumentResultPromises.push(thisResultFromFireStore.get());
                });

                const resultSnaps = await Promise.all(observationDocumentResultPromises)

                resultSnaps.forEach( snap => {
                    const kk= snap.data();    // the snapshot of this result
                    const theDataFields = (kk.data);
                    const aKnownResult = new Result(
                        theDataFields,
                        {
                            source : kk.source,
                            teamCode : kk.teamCode,
                            epoch : kk.epoch,
                            dbid : snap.id,
                        });
                    resultsOut.push(aKnownResult);
                });

            } catch (msg) {
                console.log('getResults() error: ' + msg);
            }

            return resultsOut;      //   and array of Results
        } else {
            return null;
        }

    },

/*
    getPapers: async function (iWorldID, iTeamID) {
        if (iWorldID && iTeamID) {
            let out = null;
            try {
                out = await nos2.DBconnect.sendCommand({"c": "getPapers", "w": iWorldID, "t": iTeamID});
                return out.length === 0 ? null : out;

            } catch (msg) {
                console.log('getPapers() error: ' + msg);
            }
        } else {
            return null;
        }

    },
*/


};