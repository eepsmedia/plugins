/*
==========================================================================

 * Created by tim on 9/20/19.
 
 
 ==========================================================================
MazuHeader in mazu

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

const mazuStart = {

    newGame: false,

    initialize: async function () {
        this.newGame = false;

        const typesMenuGuts = Object.keys(mazu.fishGameParameters).map(
            (key) =>
                `<option key=${key} value=${key}>${key}</option>`
        );

        const oldGameMenuGuts = await this.makeOldGamesMenuGuts();

        document.getElementById("gameTypesMenu").innerHTML = typesMenuGuts;
        document.getElementById("oldGamesMenu").innerHTML = oldGameMenuGuts;
    },

    handleNewOrOldChange: function () {
        this.newGame = !this.newGame;
        ui.update();
    },

    makeOldGamesMenuGuts: async function () {
        const theGameList = await fireConnect.getArrayOfGameCodes(mazu.loginName);

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
                   onChange="mazuStart.handleNewOrOldChange()"
            /> new game
        </label> <br/>
        <label>
            <input type="radio" name="newOrOldGame" value="old" ${oldChecked}
                   onChange="mazuStart.handleNewOrOldChange()"
            /> old game
        </label>
        `
    },

    setGameStartControlVisibility: function () {
        const typesMenu = document.getElementById("gameTypesMenu");
        const oldGames = document.getElementById("oldGamesMenu");

        typesMenu.style.display = this.newGame ? "block" : "none";
        oldGames.style.display = this.newGame ? "none" : "block";
    },

    makeNewGame: async function () {
        const theChosenType = document.getElementById("gameTypesMenu").value;
        await mazu.model.newGame(theChosenType);
    },

    joinOldGame: async function () {
        const oldGamesMenu = document.getElementById("oldGamesMenu")
        const theOldCode = oldGamesMenu.value;
        await mazu.model.joinOldGame(theOldCode);
        if (mazu.model.theGame) {
            const message = `You have rejoined ${mazu.model.theGame.gameCode}`;
            Swal.fire({
                icon: "success",
                text: message,
            })

        } else {
            Swal.fire({
                icon: "error",
                title: "dagnabbit!",
                text: `Could not find game ${theOldCode}. Please try again.`,
            });

            console.log("Could not find game " + theOldCode + ". Please try again.");
            oldValueBox.value = "";
        }
        ui.update();
    },

    update: function () {
        theRadioButtons = document.getElementById("newOrOldRadioButtons");
        theRadioButtons.innerHTML = this.renderRadioButtons();

        this.setGameStartControlVisibility();

        theGameType = document.getElementById("gameTypesMenu").value;

        const createOrJoinButton = (this.newGame ?
                `<button onClick="mazuStart.makeNewGame()")>new game (${theGameType})</button>`
                : `<button onClick="mazuStart.joinOldGame()")>join game</button>`
        );

        document.getElementById("startGameButton").innerHTML = createOrJoinButton;

    },


}


