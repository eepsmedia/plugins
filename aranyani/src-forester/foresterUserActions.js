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
 * @type {{pressNameButton: forester.userActions.pressNameButton, clickJoinButton: forester.userActions.clickJoinButton, startNewGame: (function(): Promise<any>), joinGame: forester.userActions.joinGame, cutTrees: forester.userActions.cutTrees, chairEndsTurn: forester.userActions.chairEndsTurn, foo: forester.userActions.foo}}
 */
forester.userActions = {

    /**
     * User clicked to button to join a game.
     * Proposed username is in forester.state.playerName.
     *
     * @returns {Promise<void>}
     */
    clickJoinButton: async function ( iCode = null) {
        const codeTextField = document.getElementById("gameCodeTextField");
        let theCode = iCode ? iCode : codeTextField.value;
        theCode = theCode.toLowerCase();

        const gameData = await fireConnect.tryGameCode(theCode);  //  null if not exist
        if (gameData) {
            forester.state.gameCode = theCode;

            forester.state.gameTurn = gameData.year;
            forester.state.gameState = gameData.gameState;
            forester.gameParameters = gameData;
            forester.state.playerName = "";

            const tJoinNotice = `You joined game ${theCode}`;
            forester.setNotice(tJoinNotice);
            await forester.CODAPConnector.deleteAllTurnRecords();       //  clean for the new game.
        } else {
            forester.state.gameCode = null;
            codeTextField.value = "";
            forester.setNotice(`<b>${theCode}</b> doesn't exist.`);
            alert(`game ${theCode} doesn't exist.`);
        }
        forester.ui.update();

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
            gameCode : forester.state.gameCode,
            balance : forester.gameParameters.openingBalance,
            playerState : forester.constants.kWoodCuttingString,
        };
        const   playerData = await fireConnect.tryPlayerName(forester.state.gameCode, newPlayerData);

        if (playerData) {
            forester.state.playerState = playerData.playerState;
            forester.state.playerName = playerData.playerName;
            forester.state.balance = playerData.balance;
            forester.CODAPConnector.getAndEmitMyForestryRecords(forester.state.playerName, forester.state.gameCode);
            forester.CODAPConnector.makeCaseTableAppear();


        } else {
            forester.state.playerName = null;
            forester.state.balance = 0;
            forester.state.playerState = null;
            nameTextField.value = "";
            alert("You need to choose a different name");
        }

        forester.ui.update();
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
    cutTrees: async function () {

        const treesWantedBox = document.getElementById("howManyTrees");
        let tTreesWanted = Number(treesWantedBox.value);

        if (tTreesWanted > forester.gameParameters.boatCapacity) {
            alert(`Your boat will only carry ${forester.gameParameters.boatCapacity}. `);
            treesWantedBox.value = forester.gameParameters.boatCapacity;
            return;
        }

        if (tTreesWanted < 0) {
            alert("You can't catch negative fish! ");
            treesWantedBox.value = 0;
            return;
        }

        if (forester.readyToCatch()) {      //  check to see if it's OK to catch fish
            forester.state.playerState = forester.constants.kSellingString;     //  set the player state to selling

            const tCatchModelResult =  forester.cutTrees(tTreesWanted);
            forester.state.currentTurnResult = tCatchModelResult;

            console.log("    fish ... " + tCatchModelResult.caught + " in " + tCatchModelResult.year
                + " (" + forester.state.playerState + ")" );

            //  todo: don't call this here, but rather in the notification handler when we get the turn back from the DB. (forester.updateTurns)
            //  the problem is that we get the CODAP caseIDs here  from the CODAP call, and we need them for the update.

            const theNewTurn = await (forester.CODAPConnector.addSingleTreesItemInCODAP(tCatchModelResult));  //  record in the CODAP table, partial record :)
            //  theNewTurn now has caseIDs, year, balance before, player name, game code

            let thePromises = [];

            //  record the (updated, complete) turn in the database, resolves to the number caught (which we don't need)
            thePromises.push(fireConnect.newTurnRecord(theNewTurn));

            //  update the player in the database  todo: get rid of dependency on player database every turn

            const playerDataForDB = {playerState : forester.state.playerState, playing : true};
            thePromises.push(fireConnect.updatePlayerDocument(playerDataForDB));

            await Promise.all(thePromises);

            // forester.state.currentTurnResult = tCatchModelResult;

        } else {
            forester.debugThing.innerHTML = 'Gotta wait for everybody else!';
        }

        // forester.ui.update();
    },

    changeAutomation : async function() {
        forester.state.autoCatch = document.getElementById("automateCatchCheckbox").checked;
        if (forester.state.autoCatch) {
            await this.cutTrees();
        } else {
            forester.ui.update();   //  if we go to no auto, refresh so we can see the Catch Trees button
        }
    },



    foo: function () {

    }

};