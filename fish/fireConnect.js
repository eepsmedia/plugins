/*
==========================================================================

 * Created by tim on 4/19/18.
 
 
 ==========================================================================
fishPHP in fish

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

/**
 * This singleton is responsible for communication with firestore
 * @type {{getOneTurn: fireConnect.getOneTurn, startNewGame: fireConnect.startNewGame, getTurnsData: fireConnect.getTurnsData, endTurnForAll: fireConnect.endTurnForAll, newCatchRecord: fireConnect.newCatchRecord, getPlayersData: fireConnect.getPlayersData, getTurnsFromGame: fireConnect.getTurnsFromGame, getMyData: fireConnect.getMyData, getGameData: fireConnect.getGameData, joinGame: fireConnect.joinGame, getMyTurns: fireConnect.getMyTurns, sendCommand: fireConnect.sendCommand, validateGameCode: fireConnect.validateGameCode}}
 */
const fireConnect = {

    fish: null,     //  the global fish parent object

    db: null,
    gamesCR: null,     //  collection reference for all games
    gameDR: null,      //  document reference for THIS game
    playersCR: null,   //  collection reference for players in THIS game
    turnsCR: null,     //  collection reference for turns in this game

    meDR: null,         //  document reference for THIS player

    unsubscribeFromGame: null,
    unsubscribeFromPlayers: null,
    unsubscribeFromTurns : null,

    initialize: async function (iFish) {
        this.fish = iFish;
        console.log('initializing fireConnect');
        try {
            firebase.initializeApp(fish.constants.kFirebaseConfiguration);
            //  firebase.analytics();
            this.db = firebase.firestore();
            this.gamesCR = this.db.collection("games");     //  games collection reference
        } catch (err) {
            alert(`Oops, fatal: Could not start firebase, error = ${err}`);
        }
    },


    /**
     * Called from fish.userActions.clickJoinButton()
     * Validates the game code; if valid, join the game. If not, return null.
     * We do not write anything to the DB at his point;
     * we wait for a valid playerName before making the doc in the players subcollection.
     *
     * @param iCode
     * @returns {Promise<void>}
     */
    tryGameCode: async function (iCode) {
        if (this.db) {
            const docRef = this.gamesCR.doc(iCode);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                console.log(iCode + " exists!");
                await this.joinGame(docRef);
                return docSnap.data();      //  all fields
            } else {
                console.log(iCode + " doesn't exist!");
                return null;
            }
        } else {
            alert(`fatal: firebase did not initialize properly`);
        }
    },

    joinGame : async function(iDocRef) {
        this.gameDR = iDocRef;
        this.playersCR = this.gameDR.collection("players");
        this.turnsCR = this.gameDR.collection("turns");
        this.setNotifications();
    },

    /**
     * Called from fish.userActions.pressNameButton()
     * Checks if the name already exists in the players subcollection. If so, return null.
     * If not, enter the player data (with playerName as the key) as a new document in players.
     *
     * @param iGameCode
     * @param iPlayerData       the "starting" player data
     * @returns {Promise<null|*>}   the player data (or null)
     */
    tryPlayerName: async function (iGameCode, iPlayerData) {
        const playerDocRef = this.playersCR.doc(iPlayerData.playerName);
        const playerDocSnap = await playerDocRef.get();

        //  todo: make it possible to rejoin a game with your name
        if (playerDocSnap.exists) {
            console.log(iPlayerData.playerName + " is rejoining this game");
            this.meDR = playerDocRef;
            return playerDocSnap.data();
        } else {
            console.log(iPlayerData.playerName + " is a new player!");
            this.meDR = playerDocRef;
            this.meDR.set(iPlayerData);
            return iPlayerData;     //  optionally different if rejoining...
        }
    },

    setNotifications: function () {

        this.unsubscribeFromTurns = this.gameDR.collection('turns')
            .onSnapshot((iTurns) => {
                let tTurns = [];
                iTurns.forEach( tSnap => {
                    tTurns.push(tSnap.data());
                })
                console.log(`    ¬¬¬ Turn listener reported ${tTurns.length} turn(s)`);
                this.fish.updateTurns(tTurns);
            });

        this.unsubscribeFromGame = this.gameDR
            .onSnapshot((iDocSnap) => {
                const theGame = iDocSnap.data();
                console.log(`    ¬¬¬ Game listener got ${theGame.gameCode} turn ${theGame.turn} from listener`);
                this.fish.updateGame(theGame);
            });


        /**
         * Let's be careful here.
         * This is ONLY in order to tell, locally, who has moved and who has not.
         */
        this.unsubscribeFromPlayers = this.gameDR.collection("players")
            .onSnapshot((iPlayers) => {
                let tPlayers = [];
                iPlayers.forEach((pSnap) => {
                    tPlayers.push(pSnap.data())     //  don't need await??
                });
                console.log(`    ¬¬¬ Player listener reported ${tPlayers.length} player(s)`);
                this.fish.updatePlayers(tPlayers);
            });
    },

    // todo: make obsolete
    getMyData : async  function() {
        try {
            const mySnap = await this.meDR.get();
            const myData = mySnap.data();
            return myData;
        } catch(msg) {
            console.log(`Problem getting data for ${fish.state.playerName}: ${msg}`);
        }
        return null;
    },

    //  todo: make obsolete
    getOneTurn : async function(iPlayerName, iTurn) {
        try {
            const theDocName = iTurn + "_" + iPlayerName;
            const turnDR = this.turnsCR.doc(theDocName);
            const turnSnap = await turnDR.get();
            const  weGot = turnSnap.data()
            return weGot;
        } catch(msg) {
            console.log(`problem in getOneTurn() for ${iPlayerName} in ${iTurn}: ${msg}`);
            return null;
        }
    },

    getHistoricalRecord : async function(iGameCode) {

        const theTurns = await this.getAllTurnsFromGame(iGameCode);

        //  add two game-based fields to the turn record

        const thisGameDR = await this.gamesCR.doc(iGameCode);
        const thisGameSnap = await thisGameDR.get();
        const thisGame = thisGameSnap.data();

        theTurns.forEach( t => {
            t["result"] = thisGame.fishStars;
            t["level"] = thisGame.configuration;
        })

        return theTurns;
    },

    getAllTurnsFromGame : async function(iGameCode) {
        let theTurns = [];
        const thisGamesTurnsCR = this.gamesCR.doc(iGameCode).collection("turns");
        const turnSnapsPromise = await thisGamesTurnsCR.get();
        turnSnapsPromise.forEach( p => {
            theTurns.push(p.data());
        });
        return theTurns;
    },

    updatePlayerDocument : async  function(theData) {
        this.meDR.update(theData);
    },

    newTurnRecord: async function (iModelResult) {
        try {
            const theRecordName = iModelResult.turn + "_" + iModelResult.playerName;
            this.turnDR = this.turnsCR.doc(theRecordName);
            const turnDocRef = await this.turnDR.set(iModelResult);   //      formerly, theValues

            return iModelResult.caught;
        } catch (msg) {
            console.log('fireConnect newTurnRecord() error: ' + msg);
        }

    },

};