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

    update: async function () {

        //  fish.state.autoCatch = document.getElementById("automateCatchCheckbox").checked;

        //  names of main UI elements

        const needPlayerNameElement = document.getElementById("needPlayerName");
        const joinGameElement = document.getElementById("joinGame");
        const winLoseElement = document.getElementById("winLoseDialog");
        const catchFishDIV = document.getElementById("catchFishDIV");
        const catchButton = document.getElementById("catchButton");

        //  Visibility of the main panels

        needPlayerNameElement.style.display = (fish.state.gameCode && !fish.state.playerName) ? "block" : "none";

        joinGameElement.style.display = (fish.state.gameCode ? "none" : "block");

        winLoseElement.style.display
            = (fish.state.gameState === fish.constants.kWonString || fish.state.gameState === fish.constants.kLostString)
            ? "block" : "none";

        //  visibility of catch fish DIV

        catchFishDIV.style.display
            = ((fish.state.gameState === fish.constants.kInProgressString) && fish.state.playerName) ? "block" : "none";   //  was : "none"
        catchButton.style.display
            = (fish.state.playerState === fish.constants.kFishingString) ? "block" : "none";

        //  update text to reflect current fish.state

        $("#statusYear").html(fish.state.turn);
        $("#statusBalance").html(fish.state.balance);
        $("#statusPlayer").html(fish.state.playerName);
        $("#statusGame").html(fish.state.gameCode);

        //  miscellaneous state-specific stuff

        switch (fish.state.gameState) {
            case fish.constants.kWaitingString:
                fish.setNotice('Waiting to start a game! ');
                break;

            case fish.constants.kWonString:
                $("#winLoseText").html(fish.strings.youWonGame + " <span class='info'>"
                    + fish.state.gameCode + "</span> " + fish.strings.because + "<br> "
                    + fish.state.gameEndMessage);
                break;

            case fish.constants.kLostString:
                $("#winLoseText").html(fish.strings.youLostGame + " <span class='info'>"  //
                    + fish.state.gameCode + "</span> " + fish.strings.because + "<br> "
                    + fish.state.gameEndMessage);
                break;

            case fish.constants.kInProgressString:
                const theText = fish.strings.sitrep();
                $("#aboutPlayersText").html(theText);   //  the "missing" text


                const noticeText = (fish.state.playerState === fish.constants.kFishingString) ?
                    fish.strings.youAreFishingText : fish.strings.fishAtMarketText();
                fish.setNotice(noticeText);

                break;

        }

        //  debugging

        fish.debugThing.html(
            `${fish.gameConfig} (${fish.language}) ${fish.state.turn} `
        );

    },

};