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
    clickJoinButton: async function ( ) {
        const codeTextField = document.getElementById("gameCodeTextField");
        const theCode = codeTextField.value;
        const gameData = await fireConnect.tryGameCode(theCode);  //  null if not exist
        if (gameData) {
            fish.state.gameCode = theCode;

            fish.state.turn = gameData.turn;
            fish.state.gameState = gameData.gameState;
            fish.gameParameters = fish.fishLevels[gameData.configuration];
            fish.state.playerName = "";

            fish.setNotice("You joined <b>" + theCode + "</b>");
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
        const theName = nameTextField.value;
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

    catchFish: async function () {

        let tFishWanted = Number(document.getElementById("howManyFish").value);

        if (tFishWanted > fish.gameParameters.boatCapacity) {
            alert("Your boat will only carry " + fish.gameParameters.boatCapacity + ". ");
            $("#howManyFish").val(fish.gameParameters.boatCapacity);
            return;
        }

        if (tFishWanted < 0) {
            alert("You can't catch negative fish! ");
            $("#howManyFish").val(0);
            return;
        }

        $("#catchButton").hide();       //  hide immediately after pressing the button

        if (fish.state.turn < fish.state.gameTurn) {         //  odd occurrence
            fish.state.turn = fish.state.gameTurn;
            alert("Your turn number was somehow too low. Let Tim know. We'll catch you up for now.");
        }

        if (fish.readyToCatch()) {      //  check to see if it's OK to catch fish
            fish.state.playerState = fish.constants.kSellingString;     //  set the player state to selling

            const tCatchModelResult =  fish.catchFish(tFishWanted);

            console.log("    fish ... " + tCatchModelResult.caught + " in " + tCatchModelResult.turn
                + " (" + fish.state.playerState + ")" );

            const theNewTurn = await (fish.CODAPConnector.addSingleFishItemInCODAP(tCatchModelResult));  //  record in the CODAP table, partial record :)
            //  theNewTurn now has caseIDs, year, balance before, player name, game code

            let thePromises = [];

            //  record the (updated, complete) turn in the database, resolves to the number caught (which we don't need)
            thePromises.push(fireConnect.newTurnRecord(theNewTurn));

            //  update the player in the database
            thePromises.push(fireConnect.updatePlayerDocument({playerState : fish.state.playerState}));

            await Promise.all(thePromises);

            fish.state.currentTurnResult = tCatchModelResult;

        } else {
            fish.debugThing.html('Gotta wait for everybody else!');
        }

        fish.ui.update();
    },

    changeAutomation : async function() {
        fish.state.autoCatch = document.getElementById("automateCatchCheckbox").checked;
        if (fish.state.autoCatch) {
            await this.catchFish();
        } else {
            fish.ui.update();   //  if we go to no auto, refresh so we can see the Catch Fish button
        }
    },

    /**
     * User is joining a new game, either because of clicking Join or New.
     *
     * @param iGameCode
     * @returns {Promise<void>}
     */
/*
    joinGame: async function (iGameCode) {
        try {
            const iGame = await fish.fireConnect.validateGameCode(iGameCode);
            if (iGame) {
                if (iGame.gameState !== fish.constants.kInProgressString) {
                    alert('You cannot join ' + iGameCode);
                    throw('You cannot join ' + iGameCode);
                }
            } else {
                fish.state.gameCode = null;
                $('#gameCode').val("");      //  put blank into the box
                alert('You need a valid game code');
                throw('You need a valid game code');
            }

            const iJoinResult = await fish.fireConnect.joinGame(iGame);
            await fish.CODAPConnector.deleteAllTurnRecords();       //  clean for the new game.

            console.log("In joinGame(), connector.joinGame resolved with " + JSON.stringify(iJoinResult));

            fish.setLevel(iJoinResult.config);
            fish.state.gameCode = iJoinResult.gameCode;
            fish.state.gameState = iJoinResult.gameState;
            fish.state.gameTurn = iJoinResult.turn;
            fish.state.turn = fish.state.gameTurn;
            fish.state.playerState = fish.constants.kFishingString;     //  set us to be fishing
            fish.state.balance = fish.gameParameters.openingBalance;

            fish.state.gameCodeList.push(fish.state.gameCode);

            if (iJoinResult.newPlayer) {
                fish.setNotice(fish.strings.successfullyJoinedText + "<b>" + fish.state.gameCode
                    + "</b>!<br>" + fish.strings.enterAndPressCatchText);
            } else {
                fish.setNotice("Rejoined <b>" + fish.state.gameCode
                    + "</b>!<br>" + fish.strings.enterAndPressCatchText);
            }

            fish.fishUpdate();
            $('#gameCodeTextField').val("");      //  empty the box for the game code.

            return (iJoinResult);       //  return the valid game (with a newPlayer field)
        }

        catch (msg) {
            console.log('joinGame() error: ' + msg);
        }
    },
*/



    foo: function () {

    }

};