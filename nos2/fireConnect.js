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
    resultsCR : null,
    dataPacksCR : null,
    thisWorldDR: null,     //  THIS world's document reference

    firebaseConfig: {
        apiKey: "AIzaSyAQAxZ9e0NmweiaF7lHS65bIIE-Lq1e3BU",
        authDomain: "nature-of-science.firebaseapp.com",
        databaseURL: "https://nature-of-science.firebaseio.com",
        projectId: "nature-of-science",
        storageBucket: "nature-of-science.appspot.com",
        messagingSenderId: "199387340471",
        appId: "1:199387340471:web:049ece476099a1f34db732"
    },

    initialize: function () {
        firebase.initializeApp(this.firebaseConfig);
        this.db = firebase.firestore();
        this.worldsCR = this.db.collection("worlds");     //  worlds collection reference
        this.godsCR = this.db.collection("gods");

        //  testing firestore syntax...

        this.db.collection("tests").doc("aTest").set(
            {foo: 42, bar: [13, 43], baz : {foo : 12, bar : 45}}
        );
        const newDoc = this.db.collection("tests").add(
            {foo: 42, bar: [13, 43], baz : {foo : 12, bar : 45}}
        );
    },

    sendCommand: async function (iCommands) {
        let theBody = new FormData();
        for (let key in iCommands) {
            if (iCommands.hasOwnProperty(key)) {
                theBody.append(key, iCommands[key])
            }
        }
        theBody.append("whence", nos2.whence);

        let theRequest = new Request(
            nos2.kBasePhpURL[nos2.whence],
            {method: 'POST', body: theBody, headers: new Headers()}
        );

        try {
            const theResult = await fetch(theRequest);
            if (theResult.ok) {

                const theJSON = theResult.json();
                return theJSON;
            } else {
                console.error("sendCommand bad result error: " + theResult.statusText);
            }
        } catch (msg) {
            console.log('fetch error in DBconnect.sendCommand(): ' + msg);
        }
    },

    makeNewWorld: async function (iGodID, iWorldCode, iEpoch, iJournalName, iScenario, iGameState) {
        try {
            let theWorldCode = iWorldCode;  //  in case we have to change it

            const theData = {
                "god": iGodID,
                "code": theWorldCode,
                "epoch": Number(iEpoch),
                'jName': iJournalName,
                'scen': iScenario,
                'state': JSON.stringify(iGameState),
            };
            this.thisWorldDR = this.worldsCR.doc(iWorldCode);
            await this.thisWorldDR.set(theData);
            this.joinWorld(theWorldCode);

            return theWorldCode;
        } catch (msg) {
            console.log('makeNewWorld() error: ' + msg);
        }

    },

    joinWorld: async function (iWorldCode) {
        this.thisWorldDR = this.worldsCR.doc(iWorldCode);

        const snap = await this.thisWorldDR.get();
        if (snap.exists) {
            this.teamsCR = this.thisWorldDR.collection("teams");
            this.resultsCR = this.thisWorldDR.collection("results");
            this.dataPacksCR = this.thisWorldDR.collection("dataPacks");
            return snap.data();
        }
        return null;
    },

    addTeam: async function (iCode, iName, iBalance) {
        try {
            await this.teamsCR.doc(iCode).set({
                teamCode: iCode,
                teamName: iName,
                balance: iBalance,
            });
            const iData = await fireConnect.sendCommand(theCommands);
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

    getMyTeams: async function (iworldCode) {
        let theTeams = [];
        if (iworldCode) {
            try {
                const iterableDocSnap = await this.teamsCR.get();
                iterableDocSnap.forEach((ds) => {
                    theTeams.push(ds.data())
                });

            } catch (msg) {
                console.log('getMyTeams() error: ' + msg);
            }
        }
        return theTeams;
    },

    savePaper: async function (iPaper) {

        let theCommands = {
            "teamID": iPaper.teamID, "teamName": iPaper.teamName,
            "title": iPaper.title, "authors": iPaper.authors, "text": iPaper.text,
            "packs": JSON.stringify(iPaper.packs),     //  because it's an array, we'll store it as a string
            "references": JSON.stringify(iPaper.references),
            "status": iPaper.status,
        };

        try {
            if (iPaper.dbid) {
                theCommands.c = "updatePaper";
                theCommands.id = iPaper.dbid;   //  because that's the name of the field in Paper.
            } else {
                theCommands.c = "newPaper";
                theCommands.worldCode = nos2.state.worldCode;
            }

            const out = await fireConnect.sendCommand(theCommands);

            return out;
        } catch (msg) {
            console.log('savePaper() error: ' + msg);
        }
    },

    submitPaper: async function (iPaperID, iNewStatus) {
        try {
            if (iPaperID) {
                theCommands = {"c": "submitPaper", "id": iPaperID, "s": iNewStatus};
                const iData = await fireConnect.sendCommand(theCommands);
                return iData;
            } else {
                alert("There is no 'current' paper to submit.");
            }
        } catch (msg) {
            console.log('submitPaper() error: ' + msg);
        }
    },

    judgePaper: async function (iPaperID, iJudgment, iEdComments) {
        try {
            let tStatus;
            switch (iJudgment) {
                case 'accept':
                    tStatus = nos2.constants.kPaperStatusPublished;
                    break;
                case 'reject':
                    tStatus = nos2.constants.kPaperStatusRejected;
                    break;
                case 'revise':
                    tStatus = nos2.constants.kPaperStatusRevise;
                    break;
                default:
                    alert("Don't know how to handle a judgment of " + iJudgment);
                    break;
            }
            tSubmitted = 0;
            tPublished = (iJudgment == 'accept' ? 1 : 0);

            if (iPaperID) {
                theCommands = {"c": "judgePaper", "p": iPaperID, "s": tStatus, 'ec': iEdComments};
                const iData = await fireConnect.sendCommand(theCommands);
                return iData;
            } else {
                alert("There is no paper to submit.");
            }
        } catch (msg) {
            console.log('submitPaper() error: ' + msg);
        }

    },

    getGodData: async function (iUsername) {
        try {
            const docSnap = await this.godsCR.doc(iUsername).get();
            if (docSnap.exists) {
                return docSnap.data();
            } else {
                console.log("Making a new God: " + iUsername);
                const newGodRef = await this.godsCR.doc(iUsername);
                newGodRef.set({
                    godName: iUsername,
                    godPassword: "foo"
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

    getPaperPreview: async function (iPaperID) {
        let out = null;
        if (iPaperID) {
            try {
                out = await fireConnect.sendCommand({"c": "getPaperPreview", "paperID": iPaperID});
            } catch (e) {
                console.log('getPaperPreview() error: ' + e);
            }
        }
        return out;
    },

    getPublishedJournal: async function (iworldCode) {
        let out = null;
        if (iworldCode) {
            try {
                out = await fireConnect.sendCommand({"c": "getJournal", "w": iworldCode});
            } catch (e) {
                console.log('getPublishedJournal() error: ' + e);
            }
        }
        return out;
    },

    getPapers: async function (iworldCode, iTeamID = null) {
        if (iworldCode) {     //  if iTeamID is null, the getPapers command will get them for all teams
            let out = [];
            try {
                const dbout = await fireConnect.sendCommand({"c": "getPapers", "w": iworldCode, "t": iTeamID});

                dbout.forEach(dbp => {
                    out.push(Paper.paperFromDBArray(dbp));  //  convert to Papers
                });
                return out.length == 0 ? null : out;

            } catch (msg) {
                console.log('getPapers() error: ' + msg);
            }
        } else {
            return null;
        }

    },

    getMyDataPacks: async function (iWorld, iTeam) {
        if (iWorld && iTeam) {
            let dataPacksOut = [];
            try {
                const theDBPacks = await fireConnect.sendCommand({
                    c: "getMyDataPacks",
                    w: iWorld,
                    t: iTeam
                });

                theDBPacks.forEach(pk => {
                    dataPacksOut.push(DataPack.dataPackFromDBArray(pk));    //  convert to DataPacks
                });
                return dataPacksOut;
            } catch (e) {
                console.log('Trouble retrieving in getMyDataPacks(): ' + e)
            }
        } else {
            return [];
        }
    },

    /**
     * Note: not asynchronous. We can wait for this to come through.
     * @param iText
     * @param iPaper
     */
    appendMessageToConvo: function (iText, iPaper) {
        const theCommand = {c: "appendToConvo", t: iText, p: iPaper};
        fireConnect.sendCommand(theCommand);
    }

};