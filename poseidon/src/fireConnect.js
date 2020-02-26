/*
==========================================================================

 * Created by tim on 9/3/19.
 
 
 ==========================================================================
phpHelper in poseidon

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

import poseidon from "./constants.js";
import firebase from "./Firestore.js";
import eepsWords from "./words";
//  import Model from "./Model.js";

const fireConnect = {

    model: null,
    db: null,
    gamesCR: null,     //      = games collection reference
    gameDR: null,       //      this game's document reference

    latestPlayers: [],

    unsubscribeFromTurns: null,
    unsubscribeFromPlayers: null,

    initialize: async function (iModel) {
        this.model = iModel;
        console.log('initializing fireConnect');
        this.db = firebase.firestore();
        this.gamesCR = this.db.collection("games");
    },

    /**
     * called from model.newGame.
     * @param iGameType
     * @returns {Promise<void>} an object with useful stuff
     */
    makeNewGame: async function (iGameType) {
        const params = poseidon.fishGameParameters[iGameType]

        const gamesQuerySnapshot = await this.gamesCR.get();
        const currentGameCount = gamesQuerySnapshot.size;
        console.log("How many games? " + currentGameCount);

        const newCode = eepsWords.newGameCode(currentGameCount);
        console.log("new code: " + newCode);

        const gameValues = {
            turn: params.openingTurn,
            population: params.openingPopulation,
            configuration: iGameType,
            gameState: poseidon.constants.kInProgressString,
            gameCode: newCode,
            created: new Date(),
        };

        this.gameDR = this.gamesCR.doc(newCode);
        this.gameDR.set(gameValues);

        this.unsubscribeFromPlayers =  this.setPlayersNotifications();
        this.unsubscribeFromTurns = this.setTurnsNotifications(params.openingTurn);

        return gameValues;
    },

    joinOldGame: async function (iCode) {
        const thisGameDR = this.gamesCR.doc(iCode);
        const thisGameSnap = await thisGameDR.get();
        if (thisGameSnap.exists) {
            const theData = thisGameSnap.data();
            this.gameDR = thisGameDR;
            this.unsubscribeFromPlayers = this.setPlayersNotifications();
            this.unsubscribeFromTurns = this.setTurnsNotifications(theData.turn);
            return theData;
        } else {
            this.gameDR = null;
            return null;
        }
    },

    setPlayersNotifications: function () {
        //  notifications
        this.gameDR.collection("players")
            .onSnapshot((iPlayers) => {
                let tPlayers = [];
                iPlayers.forEach((pSnap) => {
                    tPlayers.push(pSnap.data())
                });
                console.log("player event! (anonymous function in fireConnect)");
                this.model.updatePlayersFromDB(tPlayers);
            });
    },

    setTurnsNotifications: function (iTurn) {
        this.gameDR.collection("turns")
            .onSnapshot((iTurns) => {
                let tTurns = [];
                iTurns.forEach((tSnap) => {
                    let tTemp = tSnap.data();
                    if (tTemp.turn === this.model.theGame.turn) {
                        tTurns.push(tTemp);
                    } else {
                        console.log("excluded turn from " + tTemp.turn);
                    }
                });
                console.log("turns event! (anonymous function in fireConnect)");
                this.model.updateTurnsFromDB(tTurns);
            });
    },


    sendRequest: async function (tUpR) {
        console.log('    ....send request...')
    },

    /**
     * Put the current game data on the database,
     * e.g., when the game is over, its gameState changes.
     * (Players are listening and can then update)
     * @param iGame
     * @returns {Promise<void>}
     */
    uploadGameToDB: async function (iGame) {
        this.gameDR.set(iGame);
    },

    uploadTurnToDB: function(iTurn) {
        const theTurnID = iTurn.turn + "_" + iTurn.playerName;
        this.gameDR.collection("turns").doc(theTurnID).set(iTurn);
    },

    updatePlayerOnDB: function(iPlayerName, iNewData) {
        this.gameDR.collection("players").doc(iPlayerName).update(iNewData);    //  e.g., balance
    },

};

export default fireConnect;