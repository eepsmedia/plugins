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

fireConnect = {

    db: null,
    worldsCR: null,
    godsCR: null,
    teamsCR: null,         //  teams SUBcollection within this world.
    resultsCR: null,
    figuresCR: null,
    papersCR: null,
    thisWorldDR: null,     //  THIS world's document reference
    myTeamDR: null,

    unsubscribeFromPapers: null,
    unsubscribeFromFigures: null,
    unsubscribeFromTeams: null,

    initialize: function () {
        firebase.initializeApp(firebaseConfig);
        this.db = firebase.firestore();
        this.worldsCR = this.db.collection("worlds");     //  worlds collection reference
        this.godsCR = this.db.collection("gods");


        //  testing firestore syntax...

        /*
                        const newDoc = this.db.collection("tests").add(
                            {foo: 42, bar: [13, 43], baz: {foo: 12, bar: 45}}
                        );
        */

        /*
                let testContents = {foo: 42, bar: [13, 43], baz: {alpha: 12, beta: 45}};
                this.db.collection("tests").doc("aTest").set(testContents);
        */

        /*
                        testContents["now"] = new Date();

                        const newDocRef = this.db.collection("tests").doc();
                        this.db.collection("tests").doc(newDocRef.id).set(testContents);
        */

        /*
                this.db.collection("tests").doc("aTest").update(
                    {
                        bar: firebase.firestore.FieldValue.arrayUnion(...[13, 14, 15]),
                    }
                )
        */

    },

    rememberTeamDocumentReference(iTeamCode) {
        this.myTeamDR = fireConnect.thisWorldDR.collection("teams").doc(iTeamCode);
    },

    adjustBalance(iTeamCode, iAmount) {
        nos2.theTeams[iTeamCode].balance += iAmount;
        fireConnect.teamsCR.doc(iTeamCode).update({balance : nos2.theTeams[iTeamCode].balance});
    },

    async assertKnownResult(iID) {
        //  save in the known array of the TEAM
        const thisTeam = nos2.theTeams[nos2.state.teamCode];

        if (!Array.isArray(iID)) {
            iID = [iID]
        }

        //  add to array, avoiding duplicates (Array Union)
        iID.forEach(id => {
            if (!thisTeam.known.includes(id)) {
                thisTeam.known.push(id);
            }
        });

        await this.myTeamDR.update({
            known: thisTeam.known
        });

        console.log(`Team ${thisTeam.teamCode} knows results ${thisTeam.known.toString()}`);
    },

    getWorldCount: async function() {
        const gamesQuerySnapshot = await this.worldsCR.get();
        return gamesQuerySnapshot.size;
    },

    makeNewWorld: async function (iNewWorldObject) {
        try {
           await this.worldsCR.doc(iNewWorldObject.code).set(iNewWorldObject);
            return iNewWorldObject;
        } catch (msg) {
            console.log('makeNewWorld() error: ' + msg);
        }

    },

    /**
     * We think the world code exists;
     * set up the various collection references (CR)
     * and launch the listeners
     * @param iWorldCode
     * @returns {Promise<null|*>}
     */
    joinWorld: async function (iWorldCode) {
        this.thisWorldDR = this.worldsCR.doc(iWorldCode);

        const snap = await this.thisWorldDR.get();
        if (snap.exists) {
            this.teamsCR = this.thisWorldDR.collection("teams");
            this.resultsCR = this.thisWorldDR.collection("results");
            this.figuresCR = this.thisWorldDR.collection("figures");
            this.papersCR = this.thisWorldDR.collection("papers");

            await nos2.restoreTeamsFiguresPapersResults(iWorldCode);
            this.subscribeToListeners();

            return snap.data();     //  world data
        }
        return null;
    },

    subscribeToListeners : function() {
        console.log(`   *** in fireConnect.subscribeToListeners, app is ${nos2.app}`);
        fireConnect.unsubscribeFromWorld = this.setWorldListener();
        fireConnect.unsubscribeFromPapers = this.setPapersListener();
        fireConnect.unsubscribeFromFigures = this.setFiguresListener();
        fireConnect.unsubscribeFromTeams = this.setTeamsListener();
        fireConnect.unsubscribeFromResults = this.setResultsListener();

    },

    addTeam: async function (iTeam) {
        try {
            await this.teamsCR.doc(iTeam.teamCode).set(iTeam);
        } catch (msg) {
            console.log('addTeam() error: ' + msg);
        }
    },

    /**
     * Get information on the world code,
     * If it does not exist, return null
     * @param iWorldCode    the world code to be tested
     * @returns {Promise<void>}
     */
    getWorldData: async function (iWorldCode) {
        try {
            const docSnap = await this.worldsCR.doc(iWorldCode).get();
            if (docSnap.exists) {
                return docSnap.data();
            }
            return null;
        } catch (msg) {
            console.log('getWorldData() error: ' + msg);
        }
    },

    getMyWorlds: async function (iGod) {
        let theWorlds = [];
        if (iGod) {
            const iterableDocSnap = await this.worldsCR.where("god", "==", iGod).get();
            iterableDocSnap.forEach((ds) => {
                theWorlds.push(ds.data())
            });
        }
        return theWorlds;
    },

    getAllTeams: async function (iWorldCode) {
        let theTeams = {};
        if (iWorldCode) {
            try {
                const iterableDocSnap = await this.teamsCR.get();
                iterableDocSnap.forEach((ds) => {
                    const aTeam = ds.data();
                    theTeams[aTeam.teamCode] = aTeam;
                });

            } catch (msg) {
                console.log('getAllTeams() error: ' + msg);
            }
        }
        return theTeams;
    },

    getGodData: async function (iUsername, iPassword) {
        try {
            const docSnap = await this.godsCR.doc(iUsername).get();
            if (docSnap.exists) {
                const theGodData = docSnap.data();

                if (theGodData.godPassword === iPassword) {
                    return theGodData;
                } else {
                    alert("Password does not match");
                    return null;
                }
            } else {
                console.log("Making a new God: " + iUsername);
                const newGodDR = await this.godsCR.doc(iUsername);
                newGodDR.set({
                    godName: iUsername,
                    godPassword: iPassword,
                });
                const newGodSnap = await newGodRef.get();
                return newGodSnap.data();
            }
        } catch (e) {
            console.log('getGodData() error: ' + e);
        }
    },

    newGod: async function (iUsername) {
        try {
            const out = await fireConnect.sendCommand({"c": "newGod", "u": iUsername});
            return out;
        } catch (e) {
            console.log('newGod() error: ' + e);
        }
    },

/*
    getFigurePreview: async function (iFigureID) {
        let out = null;
        if (iFigureID) {
            try {
                const theFigure = nos2.theFigures[iFigureID]
            } catch (e) {
                console.log('getFigurePreview() error: ' + e);
            }
        }
        return out;
    },
*/

    saveMessage: async function (iPaper, iWho, iText) {
        const paperDR = this.papersCR.doc(iPaper.guts.dbid);
        iPaper.guts.convo.push({
            sender: iWho,
            message: iText,
            when: Date.now(),
            subject: "paper " + iPaper.guts.text.title,
            team: iPaper.guts.teamCode,
        });

        try {
            await paperDR.update({convo: iPaper.guts.convo});
        } catch (msg) {
            console.log('saveMessage() error: ' + msg);
            return null;
        }
    },

    /**
     * Save a result ON THE DATABASE
     * called from ... univ.doObservation()
     */
    saveResultToDB: async function (iResult) {

        //  in case this result has never been saved, get a (new) dbid.
        //  if it has been saved, we'll simply save over it.

        let resultDR = null;

        if (!iResult.dbid) {
            resultDR = this.resultsCR.doc();
            iResult.dbid = resultDR.id;
        } else {
            resultDR = this.resultsCR.doc(iResult.dbid);
        }

        const tDBID = resultDR.id;

        //  do the write
        try {
            await this.resultsCR
                .doc(tDBID)
                .withConverter(resultConverter)
                .set(iResult);
            console.log(`Saved result "${iResult.toString()}" as ${tDBID}`);

            //      and, by the way,
            await fireConnect.assertKnownResult(tDBID);

            return (iResult);       //  just the dbid
        } catch (msg) {
            console.log('saveResultToDB() error: ' + msg);
            return null;
        }

    },

    /**
     * Save a paper ON THE DATABASE
     * called from nos2.userAction.savePaper
     */
    savePaperToDB: async function (iPaper) {

        //  in case this paper has never been saved, get a (new) dbid.
        //  if it has been saved, we'll simply save over it.

        let paperDR = null;

        if (!iPaper.guts.dbid) {
            paperDR = this.papersCR.doc();
            iPaper.guts.dbid = paperDR.id;
        } else {
            paperDR = this.papersCR.doc(iPaper.guts.dbid);
        }

        const tDBID = paperDR.id;

        //  do the write
        try {
            await this.papersCR
                .doc(paperDR.id)
                .withConverter(paperConverter)
                .set(iPaper);
            console.log(`Saved paper "${iPaper.guts.title}" as ${tDBID}`);
            return (tDBID);
        } catch (msg) {
            console.log('savePaperToDB() error: ' + msg);
            return null;
        }
    },


    /**
     * Save a Figure ON THE DATABASE
     * called from univ.userAction.saveFigure
     */
    saveFigureToDB: async function (iFigure) {

        let tDoc;       //  temp document reference

        if (iFigure.guts.dbid) {
            tDoc = this.figuresCR.doc(iFigure.guts.dbid);
        } else {
            //  get a new dbid
            tDoc = this.figuresCR.doc();
            iFigure.guts.dbid = tDoc.id;        //  put it in the object
        }

        //  do the write
        try {
            const out = await this.figuresCR
                .doc(tDoc.id)
                .withConverter(figureConverter)
                .set(iFigure);

            console.log(`Saved figure "${iFigure.guts.text.title}" as ${tDoc.id}`);
            return (tDoc.id);
        } catch (msg) {
            console.log('saveFigureToDB() error: ' + msg);
            return null;
        }
    },

    deleteFigureByDBID: async function (iDBID) {
        const theDR = this.figuresCR.doc(iDBID);
        theDR.delete();
    },

    getAllResults: async function () {
        let out = {};
        if (this.resultsCR) {
            try {
                const tResSnaps = await this.resultsCR.get();
                tResSnaps.forEach(rs => {
                    const aResult = resultConverter.fromFirestore(rs, null);
                    out[aResult.dbid] = aResult;
                });

            } catch (msg) {
                console.log("*** firestore error in getAllResults(): " + msg);
                return null;
            }

        } else {
            console.log("The resultsCR has not been set");
            return null;
        }
        return out;
    },

    getAllFigures: async function () {
        let out = {};
        const tFiguresSnaps = await this.figuresCR.get();    //  iterable of document snapshots

        tFiguresSnaps.forEach((figSnap) => {

            try {
                const aFigure = figureConverter.fromFirestore(figSnap, null);
                out[aFigure.guts.dbid] = aFigure;
            } catch (msg) {
                console.log("*** Error inside loop in getAllFigures(): " + msg);
                return null;
            }
        });

        return out;
    },

    getAllPapers: async function () {
        let out = {};
        if (this.papersCR) {
            try {
                const tPapersSnaps = await this.papersCR.get();
                tPapersSnaps.forEach(ps => {
                    const aPaper = paperConverter.fromFirestore(ps, null);
                    out[aPaper.guts.dbid] = aPaper;
                });

            } catch (msg) {
                console.log("*** firestore error in getAllPapers(): " + msg);
                return null;
            }

        } else {
            console.log("The papersCR has not been set");
            return null;
        }
        return out;
    },


    setWorldListener : function() {
        return this.thisWorldDR.onSnapshot( Ws => {
            nos2.theWorld = Ws.data();      //  update nos2.theWorld on change (e.g., epoch)
            const newYear = nos2.theWorld.epoch;

            if (newYear !== nos2.epoch) {   //  nos2.epoch was set earlier, old year number.
                nos2.epoch = nos2.theWorld.epoch;
                alert(`Happy New Year! It is now ${nos2.epoch} in ${nos2.state.worldCode}`);
                nos2.ui.update();
            }

        })
    },

    setPapersListener: function () {
        return this.papersCR.onSnapshot((iPapers) => {
            nos2.thePapers = {};    //  fresh start!
            iPapers.forEach((pSnap) => {
                const aPaper = paperConverter.fromFirestore(pSnap, null);
                const dbid = aPaper.guts.dbid;
                nos2.thePapers[dbid] = aPaper;
            });
            nos2.ui.update();
            console.log(`   Listener gets ${iPapers.size} papers`);
        });
    },

    setFiguresListener: function () {
        return this.figuresCR.onSnapshot((iFigs) => {
            nos2.theFigures = {};    //  fresh start!
            iFigs.forEach((fSnap) => {
                const aFigure = figureConverter.fromFirestore(fSnap, null);
                const dbid = aFigure.guts.dbid;
                nos2.theFigures[dbid] = aFigure;
            });
            nos2.ui.update();
            console.log(`   Listener gets ${iFigs.size} figures`);
        });
    },

    setTeamsListener: function () {
        return this.teamsCR.onSnapshot((iTeams) => {
            nos2.theTeams = {};    //  fresh start!
            iTeams.forEach((tSnap) => {
                const aTeam = tSnap.data();     //  no converter for teams; just an object
                nos2.theTeams[aTeam.teamCode] = aTeam;
            });
            console.log(`   Listener gets ${iTeams.size} teams`);
            nos2.ui.update();
        });
    },

    setResultsListener: function () {
        return this.resultsCR.onSnapshot((iResults) => {
            nos2.theResults = {};    //  fresh start!
            iResults.forEach((rSnap) => {
                const aResult = resultConverter.fromFirestore(rSnap, null);
                nos2.theResults[rSnap.id] = aResult;
            });
            console.log(`   Listener gets ${iResults.size} results`);
            nos2.ui.update();
        });
    },


};