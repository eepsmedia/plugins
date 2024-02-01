/*
==========================================================================

 * Created by tim on 9/20/19.
 
 
 ==========================================================================
aranyaniHeader in aranyani

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

const aranyaniStart = {

    newGame: false,

    /**
     * Called when God's login is complete
     * @returns {Promise<void>}
     */
    initialize: async function () {
        this.newGame = false;

        const typesMenuGuts = Object.keys(aranyani.fishGameParameters).map(
            (key) =>
                `<option key=${key} value=${key}>${key}</option>`
        );

        const oldGameMenuGuts = await this.makeOldGamesMenuGuts();  //  todo: see if we need this
        const oldGamesTableGuts = await fireConnect.makeGameListTableGuts(aranyani.loginName);

        document.getElementById("gameTypesMenu").innerHTML = typesMenuGuts;
       //        document.getElementById("oldGamesMenu").innerHTML = oldGameMenuGuts;
        document.getElementById("gameSelectTable").innerHTML = oldGamesTableGuts;
    },

    handleNewOrOldChange: function () {
        this.newGame = !this.newGame;
        ui.update();
    },

    /**
     * Make menu guts for this aranyani's old games
     *
     * @returns {Promise<*[]>}
     */
    makeOldGamesMenuGuts: async function () {
        const theGameList = await fireConnect.getArrayOfGameCodes(aranyani.loginName);

        let oldGuts = [];
        let oldGameCount = 0;

        if (theGameList.length) {
            theGameList.forEach(item => {
                const oneOption = `<option item=${item} value=${item}>${item}</option>`;
                oldGuts.push(oneOption);
                oldGameCount++;
            });
        } else {
            oldGuts = [`<option item=null value=null>no old games</option>`];
        }

        console.log(`found ${oldGameCount} game(s)`);
        return oldGuts;
    },

    renderRadioButtons: function () {
        const newChecked = this.newGame ? "checked" : "";
        const oldChecked = this.newGame ? "" : "checked";
        return `
        <label>
            <input type="radio" name="newOrOldGame" value="new" ${newChecked}
                   onChange="aranyaniStart.handleNewOrOldChange()"
            /> ${DG.plugins.aranyani.buttons.newGameRadioLabel}
        </label> <br/>
        <label>
            <input type="radio" name="newOrOldGame" value="old" ${oldChecked}
                   onChange="aranyaniStart.handleNewOrOldChange()"
            /> ${DG.plugins.aranyani.buttons.oldGameRadioLabel}
        </label>
        `
    },

    makeNewGame: async function () {
        const theChosenType = document.getElementById("gameTypesMenu").value;
        await aranyani.model.newGame(theChosenType);
    },

    joinOldGameByName : async function(iOldCode) {
        await aranyani.model.joinOldGame(iOldCode);
        if (aranyani.model.theGame) {
            const message = `${DG.plugins.aranyani.admin.youHaveRejoined} ${aranyani.model.theGame.gameCode}`;
            Swal.fire({
                icon: "success",
                text: message,
            })

        } else {
            Swal.fire({
                icon: "error",
                title: "dagnabbit!",
                text: `Could not find game ${iOldCode}. Please try again.`,
            });

            console.log(`Could not find game ${iOldCode}. Please try again.`);
            oldValueBox.value = "";
        }
        ui.update();
    },

    joinOldGame: async function () {
        const oldGamesMenu = document.getElementById("oldGamesMenu")
        const theOldCode = oldGamesMenu.value;
        await this.joinOldGameByName(theOldCode);
    },

    update: function () {
        theRadioButtons = document.getElementById("newOrOldRadioButtons");
        theRadioButtons.innerHTML = this.renderRadioButtons();

        ui.setGameStartControlVisibility();

        theGameType = document.getElementById("gameTypesMenu").value;

        const createOrJoinButton = (this.newGame ?
                `<button onClick="aranyaniStart.makeNewGame()")>new game (${theGameType})</button>`
                : `<button onClick="aranyaniStart.joinOldGame()")>join game</button>`
        );

        document.getElementById("startGameButton").innerHTML = createOrJoinButton;

    },


}


