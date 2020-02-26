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

    fish: null,

    db: null,
    gamesCR: null,     //  collection reference for all games
    gameDR: null,      //  document reference for THIS game
    playersCR: null,   //  collection reference for players in THIS game
    turnsCR: null,     //  collection reference for turns in this game
    meDR: null,        //  document reference for THIS player

    unsubscribeFromGame: null,
    unsubscribeFromPlayers: null,

    initialize: async function (iFish) {
        this.fish = iFish;
        console.log('initializing fireConnect');
        firebase.initializeApp(fish.constants.kFirebaseConfiguration);
        //  firebase.analytics();
        this.db = firebase.firestore();
        this.gamesCR = this.db.collection("games");     //  games collection reference
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
        const docRef = this.gamesCR.doc(iCode);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            console.log(iCode + " exists!");
            this.gameDR = docRef;
            this.setNotifications();
            return docSnap.data();      //  all fields
        } else {
            console.log(iCode + " doesn't exist!");
            return null;
        }
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
        this.playersCR = this.gamesCR.doc(iGameCode).collection("players");
        const playerDocRef = this.playersCR.doc(iPlayerData.playerName);
        const playerDocSnap = await playerDocRef.get();

        //  todo: make it possible to rejoin a game with your name
        if (playerDocSnap.exists) {
            console.log(iPlayerData.playerName + " is already in this game");
            return null;
        } else {
            console.log(iPlayerData.playerName + " is a new player!");
            this.meDR = playerDocRef;
            this.meDR.set(iPlayerData);
            return iPlayerData;     //  optionally different if rejoining...
        }
    },

    setNotifications: function () {

        this.unsubscribeFromGame = this.gameDR
            .onSnapshot((iDocSnap) => {
                const theGame = iDocSnap.data();       //  don't need await??
                console.log("DB sends player doc of game. Turn: " + theGame.turn);
                this.fish.updateGame(theGame);
            });

        this.unsubscribeFromPlayers = this.gameDR.collection("players")
            .onSnapshot((iPlayers) => {
                let tPlayers = [];
                iPlayers.forEach((pSnap) => {
                    tPlayers.push(pSnap.data())     //  don't need await??
                });
                console.log("DB sends player all " + tPlayers.length + " player(s)");
                this.fish.updatePlayers(tPlayers);
            });

        /*
                this.gameDR.collection("turns")
                    .onSnapshot((iTurns) => {
                            let tTurns = [];
                            iTurns.forEach((pSnap) => {
                                tTurns.push(pSnap.data())
                            });
                            console.log("turns event! (anonymous function in fireConnect)");
                            this.model.theTurns = tTurns;
                        }
                    );
        */
    },


    /**
     * This function is the only place in this file that actually communicates with php, via the fetch command.
     *
     * @param iCommands     The commands to send. This is an object whose keys (string) are the commands in php, and the values are the values.
     * @returns {Promise<any>}
     */
    sendCommand: async function (iCommands) {
        console.log("fish ... sendCommand " + iCommands.c);
    },

    getGameData: async function (iCode) {

        try {
            const docRef = this.gamesCR.doc(iCode);
            const docSnap = await docRef.get();
            return docSnap.data();
        } catch (msg) {
            console.log('get game data error: ' + msg);
        }
    },

    updatePlayerDocument : async  function(theData) {
        this.meDR.update(theData);
    },

    /**
     * Get the mySQL data for ALL of the players in this game
     *
     * @returns {Promise<any>}
     */
    getPlayersData: async function () {

        try {
            const theCommands = {"c": "playersData", "gameCode": fish.state.gameCode};
            const iData = await fish.fireConnect.sendCommand(theCommands);
            return iData;
        } catch (msg) {
            console.log('get players data error: ' + msg);
        }
    },

    getMyTurns: async function () {
        try {
            const theCommands = {"c": "myTurns", "gameCode": fish.state.gameCode, "playerName": fish.state.playerName};
            const iData = await fish.fireConnect.sendCommand(theCommands);
            return iData;

        } catch (msg) {
            console.log('get my turns error: ' + msg);
        }
    },

    getOneTurn: async function (iYear) {
        try {
            console.log('    fish ... php ... getOneTurn() from DB for '
                + iYear + ' for ' + fish.state.playerName);
            const theCommands = {
                "c": "oneTurn",
                "year": iYear,
                "gameCode": fish.state.gameCode,
                "playerName": fish.state.playerName
            };
            const iData = await fish.fireConnect.sendCommand(theCommands);
            return iData;
        } catch (msg) {
            console.log('get my turns error: ' + msg);
        }

    },

    getMyData: async function () {
        try {
            const theCommands = {"c": "myData", "gameCode": fish.state.gameCode, "playerName": fish.state.playerName};
            const iData = await fish.fireConnect.sendCommand(theCommands);
            return iData[0];
        } catch (msg) {
            console.log('get my data error: ' + msg);
        }
    },

    getTurnsData: async function () {

        try {
            const theCommands = {"c": "turnsData", "gameCode": fish.state.gameCode, "onTurn": fish.state.gameTurn};
            const iData = await fish.fireConnect.sendCommand(theCommands);
            return iData;
        } catch (msg) {
            console.log('get turns error: ' + msg);
        }
    },

    getTurnsFromGame: async function (iGameCode) {

        console.log("in getTurnsFromGame(" + iGameCode + ")");
        try {
            const theCommands = {"c": "historicalTurnsData", "gameCode": iGameCode};
            const iData = await fish.fireConnect.sendCommand(theCommands);
            return iData;
        } catch (msg) {
            console.log('getTurnsFromGame  error: ' + msg);
        }
    },

    startNewGame: async function (iGameData) {

        try {
            const theCommands = iGameData;
            theCommands.chair = fish.state.playerName;
            theCommands.c = "newGame";
            const iData = await
                fish.fireConnect.sendCommand(theCommands);
            fish.state.isChair = true;        //  YOU are the isChair of this game
            console.log("New game code: " + iData.gameCode);
            return iData;
        } catch (msg) {
            console.log('startNewGame error: ' + msg);
        }
    },

    /**
     * The game is valid, so all we have to do is add the player record.
     * @param iValidGame
     * @returns {Promise}
     */
    joinGame: async function (iValidGame) {
        try {
            const theCommands = {
                "c": "joinGame",
                "gameCode": iValidGame.gameCode,
                "onTurn": iValidGame.turn,
                "playerName": fish.state.playerName,
                "balance": fish.game.openingBalance
            };

            const iData = await fish.fireConnect.sendCommand(theCommands);
            iValidGame['newPlayer'] = iData.newPlayer;
            return (iValidGame);
        } catch (msg) {
            console.log('connector.joinGame error: ' + msg);
        }
    },

    newCatchRecord: async function (iModelResult) {
        try {
            const theValues = {
                gameCode: fish.state.gameCode,
                playerName: fish.state.playerName,
                turn: iModelResult.turn,
                visible: iModelResult.visible,
                sought: iModelResult.sought,
                caught: iModelResult.caught,
                before: fish.state.balance,
                expenses: iModelResult.expenses,
                //  income: iModelResult.income,
                //  balanceAfter: iModelResult.after
            };

            const theRecordName = iModelResult.turn + "_" + iModelResult.playerName;
            this.turnDR = this.gameDR.collection("turns").doc(theRecordName);
            const turnDocRef = this.turnDR.set(theValues);

            return iModelResult.caught;
        } catch (msg) {
            console.log('fireConnect catch fish error: ' + msg);
        }

    },

};