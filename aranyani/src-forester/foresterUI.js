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


forester.ui = {

    initialize: function () {

        //  names of main UI elements

        this.needPlayerNameElement = document.getElementById("needPlayerNameDIV");
        this.joinGameElement = document.getElementById("joinGameDIV");
        this.gameEndDIV = document.getElementById("gameEndDIV");

        this.forestryDIV = document.getElementById("fishingDIV");
        this.showSeaDIV = document.getElementById("showSeaDIV");
        this.cutTreesDIV = document.getElementById("cutTreesDIV");

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
     *  * winLoseDialog -- only appears after a game ends
     *  * cutTreesDIV -- where you tell how many fish (irrelevant when selling)
     *  * noticeDIV -- what's happening (can change when fishing)
     *  * aboutPlayersDIV -- who are you waiting for
     *  * debug
     * @returns {Promise<void>}
     */
    update: async function () {

        //  Visibility of the main panels

        this.statusDIV.style.display = (forester.state.gameState === forester.constants.kWaitingString) ? "none" : "flex";
        this.joinGameElement.style.display = (forester.state.gameCode ? "none" : "flex");
        this.needPlayerNameElement.style.display = (forester.state.gameCode && !forester.state.playerName) ? "flex" : "none";

        this.cutTreesDIV.style.display =
            (forester.state.gameState === forester.constants.kInProgressString &&
                forester.state.playerName) ? "flex" : "none";

        this.forestryDIV.style.display =
            ((forester.state.playerState === forester.constants.kWoodCuttingString) &&
                forester.state.gameState === forester.constants.kInProgressString &&
                forester.state.playerName) ? "block" : "none";
        this.sellingDIV.style.display =
            ((forester.state.playerState === forester.constants.kSellingString) &&
                forester.state.gameState === forester.constants.kInProgressString &&
                forester.state.playerName) ? "block" : "none";

        //  this.noticeDIV.style.display = (forester.state.gameState === forester.constants.kInProgressString ? "flex" : "none");
        this.aboutPlayersDIV.style.display = (forester.state.gameState === forester.constants.kInProgressString ? "flex" : "none");
        this.gameEndDIV.style.display =
            (forester.state.gameState === forester.constants.kEndedString) ? "flex" : "none";

        this.catchButton.style.display = "none";

        //  update text to reflect current forester.state

        let theStatusText = "";
        theStatusText += forester.state.balance ? `\$${forester.state.balance} | ` : "";
        theStatusText += forester.state.playerName ? `${forester.state.playerName} | ` : "";
        theStatusText += forester.state.gameCode ? `${forester.state.gameCode} ` : "";
        this.statusText.innerHTML = theStatusText;

        this.theCalendar.innerHTML = forester.state.gameTurn;

        //  miscellaneous state-specific stuff
        switch (forester.state.gameState) {
            case forester.constants.kWaitingString:
                forester.setNotice('Waiting to start a game! ');
                break;

            case forester.constants.kEndedString:
                this.gameEndTextElement.innerHTML = MFS.constructGameEndMessage();
                break;

            case forester.constants.kInProgressString:
                document.getElementById("aboutPlayersText").innerHTML = MFS.sitrep();
                break;

            default:
                console.log(`unknown game state`);
                break;
        }

        switch (forester.state.playerState) {
            case forester.constants.kWoodCuttingString:
                const tVisible = forester.calculateVisible();
                forester.ui.placeTrees(tVisible);
                this.catchButton.style.display = "flex";
                this.turnReport.innerHTML = forester.state.turnReport;
                break;

            case forester.constants.kSellingString:
                document.getElementById("waitingToSellDIV").innerHTML = MFS.forestryAtMarketText();
                forester.ui.placeMarketTrees(forester.state.currentTurnResult.caught);
                break;

            default:
                break;
        }
        //  debugging

        forester.debugThing.innerHTML = `${forester.gameConfig} (${forester.language}) ${forester.state.gameTurn} | `;

    },

    placeMarketTrees: function (iNumber) {

        const kMaxIconSize = 48;

        if (iNumber > 0) {
            const forestryArtFile = `art/forester.png`;
            const w = this.showMarketDIV.offsetWidth;
            const h = this.showMarketDIV.offsetHeight;
            const area = w * h / iNumber;
            let iconWidth = Math.floor(Math.sqrt(area)) - 1;
            if (iconWidth > kMaxIconSize) iconWidth = kMaxIconSize;         //      maximum icon size
            const nInRow = Math.floor(w / iconWidth);

            this.showMarketDIV.replaceChildren();           //  empty this element
            let i = 0;
            while (i < iNumber) {
                const top = Math.floor(i / nInRow) * iconWidth;
                const left = (i % nInRow) * iconWidth;

                let aTree = document.createElement('img');
                const theStyle = `position: absolute; left: ${left}px; top: ${top}px`;

                aforester.style = theStyle;
                aforester.src = forestryArtFile;
                aforester.width = iconWidth;
                aforester.height = iconWidth;

                showMarketDIV.append(aTree);
                i++;
            }
        }

    },

    placeTree: function (iNumber) {
        const forestryArtFile = `art/forester.png`;
        const w = this.showSeaDIV.offsetWidth;
        const h = this.showSeaDIV.offsetHeight;
        const iconWidth = 20;

        this.showSeaDIV.replaceChildren();           //  empty this element
        for (let i = 0; i < iNumber / 10; i++) {
            let aTree = document.createElement('img');
            const left = Math.round(Math.random() * (w - iconWidth));
            const top = Math.round(Math.random() * (h - iconWidth));
            const theStyle = `position: absolute; left: ${left}px; top: ${top}px`;

            aforester.style = theStyle;
            aforester.src = forestryArtFile;
            aforester.width = iconWidth;
            aforester.height = iconWidth;

            showSeaDIV.append(aTree);

        }
    },

};