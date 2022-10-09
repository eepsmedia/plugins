/*
==========================================================================

 * Created by tim on 4/20/18.
 
 
 ==========================================================================
fishUserActions in fish

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
 * Methods that respond directly to user actions.
 *
 * @type {{pressNameButton: fish.userActions.pressNameButton, clickJoinButton: fish.userActions.clickJoinButton, startNewGame: (function(): Promise<any>), joinGame: fish.userActions.joinGame, catchFish: fish.userActions.catchFish, chairEndsTurn: fish.userActions.chairEndsTurn, foo: fish.userActions.foo}}
 */
fish.userActions = {

    /**
     * User clicked to button to join a game.
     * Proposed username is in fish.state.playerName.
     *
     * @returns {Promise<void>}
     */
    clickJoinButton: async function ( iCode = null) {
        const codeTextField = document.getElementById("gameCodeTextField");
        let theCode = iCode ? iCode : codeTextField.value;
        theCode = theCode.toLowerCase();

        const gameData = await fireConnect.tryGameCode(theCode);  //  null if not exist
        if (gameData) {
            fish.state.gameCode = theCode;

            fish.state.gameTurn = gameData.year;
            fish.state.gameState = gameData.gameState;
            fish.gameParameters = gameData;
            fish.state.playerName = "";

            const tJoinNotice = `You joined game ${theCode}`;
            fish.setNotice(tJoinNotice);
            await fish.CODAPConnector.deleteAllTurnRecords();       //  clean for the new game.
        } else {
            fish.state.gameCode = null;
            codeTextField.value = "";
            fish.setNotice(`<b>${theCode}</b> doesn't exist.`);
            alert(`game ${theCode} doesn't exist.`);
        }
        fish.ui.update();

    },

    /**
     * User pressed the button to submit their name.
     *
     * @param iSituation
     */
    pressNameButton: async function (iSituation) {
        const nameTextField = document.getElementById("playerName");
        const theName = nameTextField.value;        //  the player's proposed name
        const newPlayerData = {
            playerName : theName,
            gameCode : fish.state.gameCode,
            balance : fish.gameParameters.openingBalance,
            playerState : fish.constants.kFishingString,
        };
        const   playerData = await fireConnect.tryPlayerName(fish.state.gameCode, newPlayerData);

        if (playerData) {
            fish.state.playerState = playerData.playerState;
            fish.state.playerName = playerData.playerName;
            fish.state.balance = playerData.balance;
        } else {
            fish.state.playerName = null;
            fish.state.balance = 0;
            fish.state.playerState = null;
            nameTextField.value = "";
            alert("You need to choose a different name");
        }

        fish.ui.update();
    },

    /**
     * Vital event handler. Updates the current turn with number of fish to be caught,
     * and goes all the way to saving the current turn in the Firebase DB.
     *
     * Note: it also saves the fact that the player is "playing" to the playerDB.
     * (so that if the teacher paused you because you were out of the room,
     * you get "saved.")
     *
     * @returns {Promise<void>}
     */
    catchFish: async function () {

        const fishWantedBox = document.getElementById("howManyFish");
        let tFishWanted = Number(fishWantedBox.value);

        if (tFishWanted > fish.gameParameters.boatCapacity) {
            alert(`Your boat will only carry ${fish.gameParameters.boatCapacity}. `);
            fishWantedBox.value = fish.gameParameters.boatCapacity;
            return;
        }

        if (tFishWanted < 0) {
            alert("You can't catch negative fish! ");
            fishWantedBox.value = 0;
            return;
        }

        if (fish.readyToCatch()) {      //  check to see if it's OK to catch fish
            fish.state.playerState = fish.constants.kSellingString;     //  set the player state to selling

            const tCatchModelResult =  fish.catchFish(tFishWanted);
            fish.state.currentTurnResult = tCatchModelResult;

            console.log("    fish ... " + tCatchModelResult.caught + " in " + tCatchModelResult.year
                + " (" + fish.state.playerState + ")" );

            //  todo: don't call this here, but rather in the notification handler when we get the turn back from the DB. (fish.updateTurns)
            //  the problem is that we get the CODAP caseIDs here  from the CODAP call, and we need them for the update.

            const theNewTurn = await (fish.CODAPConnector.addSingleFishItemInCODAP(tCatchModelResult));  //  record in the CODAP table, partial record :)
            //  theNewTurn now has caseIDs, year, balance before, player name, game code

            let thePromises = [];

            //  record the (updated, complete) turn in the database, resolves to the number caught (which we don't need)
            thePromises.push(fireConnect.newTurnRecord(theNewTurn));

            //  update the player in the database  todo: get rid of dependency on player database every turn

            const playerDataForDB = {playerState : fish.state.playerState, playing : true};
            thePromises.push(fireConnect.updatePlayerDocument(playerDataForDB));

            await Promise.all(thePromises);

            // fish.state.currentTurnResult = tCatchModelResult;

        } else {
            fish.debugThing.innerHTML = 'Gotta wait for everybody else!';
        }

        // fish.ui.update();
    },

    changeAutomation : async function() {
        fish.state.autoCatch = document.getElementById("automateCatchCheckbox").checked;
        if (fish.state.autoCatch) {
            await this.catchFish();
        } else {
            fish.ui.update();   //  if we go to no auto, refresh so we can see the Catch Fish button
        }
    },



    foo: function () {

    }

};