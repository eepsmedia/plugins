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

        //  names of main UI elements

        this.needPlayerNameElement = document.getElementById("needPlayerNameDIV");
        this.joinGameElement = document.getElementById("joinGameDIV");
        this.gameEndDIV = document.getElementById("gameEndDIV");

        this.fishingDIV = document.getElementById("fishingDIV");
        this.showSeaDIV = document.getElementById("showSeaDIV");
        this.catchFishDIV = document.getElementById("catchFishDIV");

        this.sellingDIV = document.getElementById("sellingDIV");
        this.showMarketDIV = document.getElementById("showMarketDIV");
        this.waitingToSellDIV = document.getElementById("waitingToSellDIV");

        this.catchButton = document.getElementById("catchButton");
        this.turnReport = document.getElementById("turnReport");

        this.statusDIV = document.getElementById("statusDIV");
        this.noticeDIV = document.getElementById("noticeDIV");
        this.aboutPlayersDIV = document.getElementById("aboutPlayersDIV");

        this.catchButton = document.getElementById("catchButton");
        this.statusText = document.getElementById("statusText");
        this.theCalendar = document.getElementById("statusYear");

        this.gameEndTextElement = document.getElementById("gameEndText");

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


        //  Visibility of the main panels

        this.statusDIV.style.display = (fish.state.gameState === fish.constants.kWaitingString) ? "none" : "flex";
        this.joinGameElement.style.display = (fish.state.gameCode ? "none" : "flex");
        this.needPlayerNameElement.style.display = (fish.state.gameCode && !fish.state.playerName) ? "flex" : "none";

        this.catchFishDIV.style.display =
            (fish.state.gameState === fish.constants.kInProgressString &&
                fish.state.playerName) ? "flex" : "none";

        this.fishingDIV.style.display =
            ((fish.state.playerState === fish.constants.kFishingString) &&
                fish.state.gameState === fish.constants.kInProgressString &&
                fish.state.playerName) ? "block" : "none";
        this.sellingDIV.style.display =
            ((fish.state.playerState === fish.constants.kSellingString) &&
                fish.state.gameState === fish.constants.kInProgressString &&
                fish.state.playerName) ? "block" : "none";

        //  this.noticeDIV.style.display = (fish.state.gameState === fish.constants.kInProgressString ? "flex" : "none");
        this.aboutPlayersDIV.style.display = (fish.state.gameState === fish.constants.kInProgressString ? "flex" : "none");
        this.gameEndDIV.style.display =
            (fish.state.gameState === fish.constants.kEndedString) ? "flex" : "none";

        this.catchButton.style.display = "none";

        //  update text to reflect current fish.state

        let theStatusText = "";
        theStatusText += fish.state.balance ? `\$${fish.state.balance} | ` : "";
        theStatusText += fish.state.playerName ? `${fish.state.playerName} | ` : "";
        theStatusText += fish.state.gameCode ? `${fish.state.gameCode} ` : "";
        this.statusText.innerHTML = theStatusText;

        this.theCalendar.innerHTML = fish.state.gameTurn;

        //  miscellaneous state-specific stuff
        switch (fish.state.gameState) {
            case fish.constants.kWaitingString:
                fish.setNotice('Waiting to start a game! ');
                break;

            case fish.constants.kEndedString:
                this.gameEndTextElement.innerHTML = fish.strings.constructGameEndMessage();
                break;

            case fish.constants.kInProgressString:
                document.getElementById("aboutPlayersText").innerHTML = fish.strings.sitrep();


                /*
                                const noticeText = (fish.state.playerState === fish.constants.kFishingString) ?
                                    fish.strings.youAreFishingText :        //  todo: change to market report, move you are fishing elsewhere
                */
                //       fish.setNotice(noticeText);

                break;

            default:
                console.log(`unknown game state`);
                break;
        }

        switch (fish.state.playerState) {
            case fish.constants.kFishingString:
                const tVisible = fish.calculateVisible();
                fish.ui.placeFish(tVisible);
                this.catchButton.style.display = "flex";
                this.turnReport.innerHTML = fish.state.turnReport;
                break;

            case fish.constants.kSellingString:
                document.getElementById("waitingToSellDIV").innerHTML = fish.strings.fishAtMarketText();
                fish.ui.placeMarketFish(fish.state.currentTurnResult.caught);
                break;

            default:
                break;
        }
        //  debugging

        fish.debugThing.html(
            `${fish.gameConfig} (${fish.language}) ${fish.state.gameTurn} | `
        );

    },

    placeMarketFish: function (iNumber) {

        if (iNumber > 0) {
            const fishArtFile = `art/fish.png`;
            const w = this.showMarketDIV.offsetWidth;
            const h = this.showMarketDIV.offsetHeight;
            const area = w * h / iNumber;
            const iconWidth = Math.floor(Math.sqrt(area)) - 1;
            const nInRow = Math.floor(w / iconWidth);

            this.showMarketDIV.replaceChildren();           //  empty this element
            let i = 0;
            while (i < iNumber) {
                const top = Math.floor(i / nInRow) * iconWidth;
                const left = (i % nInRow) * iconWidth;

                let aFish = document.createElement('img');
                const theStyle = `position: absolute; left: ${left}px; top: ${top}px`;

                aFish.style = theStyle;
                aFish.src = fishArtFile;
                aFish.width = iconWidth;
                aFish.height = iconWidth;

                showMarketDIV.append(aFish);
                i++;
            }
        }

    },

    placeFish: function (iNumber) {
        const fishArtFile = `art/fish.png`;
        const w = this.showSeaDIV.offsetWidth;
        const h = this.showSeaDIV.offsetHeight;
        const iconWidth = 20;

        this.showSeaDIV.replaceChildren();           //  empty this element
        for (let i = 0; i < iNumber / 10; i++) {
            let aFish = document.createElement('img');
            const left = Math.round(Math.random() * (w - iconWidth));
            const top = Math.round(Math.random() * (h - iconWidth));
            const theStyle = `position: absolute; left: ${left}px; top: ${top}px`;

            aFish.style = theStyle;
            aFish.src = fishArtFile;
            aFish.width = iconWidth;
            aFish.height = iconWidth;

            showSeaDIV.append(aFish);

        }
    },

};