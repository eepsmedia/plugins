/*
==========================================================================

 * Created by tim on 9/3/19.
 
 
 ==========================================================================
aranyani in aranyani

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


let DG = {
    plugins : null,
};

let aranyaniStrings = {};

const aranyani =  {

    loginName : "",
    model : null,

    initialize : async function() {
        MFS.initialize();      //   load all strings into DG.plugins.aranyani.... depending on language
        await connect.initializeFrame(); //  make the CODAP connection, initialize the iFrame
        await connect.initializeDataset();
        MFS.setInitialStrings();
        MFS.setFrameTitle(DG.plugins.aranyani.aranyaniFrameTitle);

        this.loginName = "";

        this.state = {
            OKtoSell: false,
            autoSell: false,
            missing: [],
            now: new Date(),
        };

        this.model = new Model(this);   //  singleton
        await fireConnect.initialize( );   //  must precede ui initialize

        ui.initialize();
        ui.update();
    },

    handleLogin : function() {
        const theName = document.getElementById("loginName").value;

        if (theName.length > 2) {
            this.loginName = theName;
            aranyaniStart.initialize();     //  so that we redo the game menu
            ui.update();
            fireConnect.addGodToDB();
        } else {
            Swal.fire({ icon : "error", text : "Make up a longer name!"});
        }
    },

    /**
     * leave this game without logging out
     */
    leaveGame : function () {
        this.model.theGame.gameCode = null;
        aranyaniStart.initialize();
        ui.update();
    },


    componentDidMount() {
        /*
                this.timerID = setInterval(
                    () => this.poll(),
                    aranyani.constants.kTimerInterval
                );
        */
    },

    /**
     * sleep or wake the player with the given name.
     * @param iName
     */
    async handleSleepWake(iName) {
        await this.model.sleepWakePlayerNamed(iName);
    },

    componentWillUnmount() {
        clearInterval(this.timerID);
    },

    async poll() {
        const theSituationResponse = await this.model.getCurrentSituation();

        this.state.OKtoSell = theSituationResponse.OK;
            this.state.missing = theSituationResponse.missing;
            this.state.now = new Date();

        console.log("... poll() ... " + this.sitrep());

        if (this.state.OKtoSell &&
            this.state.autoSell &&
            this.model.thePlayers.length > 0 &&
            this.playing()) {
            await this.sellFish();
            console.log(" *** auto sold *** now it's " + this.model.theGame.year);
        }

        ui.update();
    },

    isGameOver() {
        if (this.model.theGame.gameCode) {
            return (this.model.theGame.gameState === aranyani.constants.kEndedString)
        } else {
            return false;
        }
    },

    playing() {
        if (this.model.theGame.gameCode) {
            return (
                this.model.theGame.gameState === aranyani.constants.kInProgressString ||
                this.model.theGame.gameState === aranyani.constants.kWaitingString
            )
        } else {
            return false;
        }
    },

    /**
     * used only in a console.log, so OK not translated
     * @returns {string}
     */
    sitrep() {
        const theGame = this.model.theGame;
        const nTurns = this.model.thisYearsTurns();

        return "aranyani sitrep: " +  theGame.gameCode + " (" + theGame.gameState + ") turn " + theGame.year +
            " -- " + this.model.thePlayers.length + " players " +
            " -- " + nTurns + ` ${nTurns === 1 ? turn : turns} `
            ;
    },

    async sellFish() {
        const theSellButton = await document.getElementById("sellFishButton");
        if (theSellButton) {
            theSellButton.style.visibility = "hidden";
        }
        console.log("Selling fish!");
        await this.model.sellFish();
        console.log("Fish sold!");
        //  ui.update();    //  make the sales button appear again if we're manual
        // update may not be necessary as we will update when the listener fires.
    },

    handleAutoSellBoxChange(e) {
        const newCheckedState = document.getElementById("autoSellBox").checked;
        this.state.autoSell = newCheckedState;
        console.log("Auto sell checkbox now " + newCheckedState);
        const currentSituation = aranyani.model.getCurrentSituation();

        if (newCheckedState && currentSituation.OK && currentSituation.autoOK) {
            aranyani.model.sellFish();
        }
    },

}

/*

    NOT part of the aranyani class

 */

function RefreshButton(props) {
/*
    async function doRefresh(e) {
        props.doRefresh();
    }

    return (
        <div>
            <input id="refreshButton" type="image"
                   alt="refresh" height="25%" width="25%"
                   src={refreshIcon}
                   onClick={doRefresh}></input>
        </div>
    )
*/
}

function GameOverDiv(props) {
}