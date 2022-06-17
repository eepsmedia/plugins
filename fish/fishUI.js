/*
==========================================================================

 * Created by tim on 4/20/18.
 
 
 ==========================================================================
fishUI in fish

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

/* global fish, $, console */


fish.ui = {

    initialize: function () {

    },

    gameCodeTextFieldChange: function (e) {
        let theText = document.getElementById("gameCodeTextField").value;
        console.log('new text in code field = ' + theText);
    },

    /**
     * Update the UI in the player app.
     *
     * Here is the order of the "stripes"
     *  * statusDIV -- balance, name, year
     *  * winLoseDiaog -- only appears after a game ends
     *  * catchFishDIV -- where you tell how many fish (irrelevant when selling)
     *  * noticeDIV -- what's happening (can change when fishing)
     *  * aboutPlayersDIV -- who are you waiting for
     *  * debug
     * @returns {Promise<void>}
     */
    update: async function () {

        //  fish.state.autoCatch = document.getElementById("automateCatchCheckbox").checked;

        //  names of main UI elements

        const needPlayerNameElement = document.getElementById("needPlayerNameDIV");
        const joinGameElement = document.getElementById("joinGameDIV");
        const winLoseElement = document.getElementById("winLoseDialog");
        const catchFishDIV = document.getElementById("catchFishDIV");
        const statusDIV = document.getElementById("statusDIV");
        const noticeDIV = document.getElementById("noticeDIV");
        const aboutPlayersDIV = document.getElementById("aboutPlayersDIV");

        const catchButton = document.getElementById("catchButton");
        const statusText = document.getElementById("statusText");
        const theCalendar = document.getElementById("statusYear");

        //  Visibility of the main panels

        statusDIV.style.display = (fish.state.gameState === fish.constants.kWaitingString) ?  "none" : "flex" ;
        joinGameElement.style.display = (fish.state.gameCode ? "none" : "flex");
        needPlayerNameElement.style.display = (fish.state.gameCode && !fish.state.playerName) ? "flex" : "none";
        catchFishDIV.style.display
            = ((fish.state.gameState === fish.constants.kInProgressString) && fish.state.playerName) ? "flex" : "none";   //  was : "none"
        noticeDIV.style.display =  (fish.state.gameState === fish.constants.kInProgressString ? "flex" : "none");
        aboutPlayersDIV.style.display = (fish.state.gameState === fish.constants.kInProgressString ? "flex" : "none");
        winLoseElement.style.display
            = (fish.state.gameState === fish.constants.kWonString || fish.state.gameState === fish.constants.kLostString)
            ? "flex" : "none";

        //  visibility of catch fish DIV

        catchButton.style.display
            = (fish.state.playerState === fish.constants.kFishingString) ? "block" : "none";

        //  update text to reflect current fish.state


        let theStatusText = ""
        theStatusText += fish.state.balance ? `\$${fish.state.balance} | ` : "";
        theStatusText += fish.state.playerName ? `${fish.state.playerName} | ` : "";
        theStatusText += fish.state.gameCode ? `${fish.state.gameCode} ` : "";
        statusText.innerHTML = theStatusText;

        theCalendar.innerHTML = fish.state.gameTurn;

        //  miscellaneous state-specific stuff

        const winLoseText = document.getElementById("winLoseText");

        switch (fish.state.gameState) {
            case fish.constants.kWaitingString:
                fish.setNotice('Waiting to start a game! ');
                break;

            case fish.constants.kWonString:
                winLoseText.innerHTML = fish.strings.youWonGame
                    + " <span class='info'>" + fish.state.gameCode + "</span> "
                    + fish.strings.because + "<br> "
                    + fish.state.gameEndMessage;
                break;

            case fish.constants.kLostString:
                winLoseText.innerHTML = fish.strings.youLostGame
                    + " <span class='info'>" + fish.state.gameCode + "</span> "
                    + fish.strings.because + "<br> "
                    + fish.state.gameEndMessage;
                break;

            case fish.constants.kInProgressString:
                const theText = fish.strings.sitrep();
                document.getElementById("aboutPlayersText").innerHTML = theText

                const noticeText = (fish.state.playerState === fish.constants.kFishingString) ?
                    fish.strings.youAreFishingText : fish.strings.fishAtMarketText();       //  todo: change to market report, move you are fishing elsewhere
                fish.setNotice(noticeText);

                break;

        }

        //  debugging

        fish.debugThing.html(
            `${fish.gameConfig} (${fish.language}) ${fish.state.gameTurn} | `
        );

    },

};