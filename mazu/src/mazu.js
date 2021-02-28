/*
==========================================================================

 * Created by tim on 9/3/19.
 
 
 ==========================================================================
mazu in mazu

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

/*
Local testing: http://localhost:3000/plugins/mazu
 */



const mazu =  {

    loginName : "",
    model : null,

    initialize : async function() {

        this.loginName = "";

        this.state = {
            OKtoSell: false,
            autoSell: false,
            missing: [],
            now: new Date(),
        };
        console.log("Constructing Mazu. State: " + JSON.stringify(this.state));

        this.model = new Model(this);   //  singleton
        await fireConnect.initialize( );   //  must precede ui initialize

        ui.initialize();
        ui.update();
    },

    handleLogin : function() {
        const theName = document.getElementById("loginName").value;

        if (theName.length > 2) {
            this.loginName = theName;
            mazuStart.initialize();     //  so that we redo the game menu
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
        mazuStart.initialize();
        ui.update();
    },

    componentDidMount() {
        /*
                this.timerID = setInterval(
                    () => this.poll(),
                    mazu.constants.kTimerInterval
                );
        */
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
            console.log(" *** auto sold *** now it's " + this.model.theGame.turn);
        }

        ui.update();
    },

    showWonLost() {
        if (this.model.theGame.gameCode) {
            return (
                this.model.theGame.gameState === mazu.constants.kWonString ||
                this.model.theGame.gameState === mazu.constants.kLostString
            )
        } else {
            return false;
        }
    },

    playing() {
        if (this.model.theGame.gameCode) {
            return (
                this.model.theGame.gameState === mazu.constants.kInProgressString ||
                this.model.theGame.gameState === mazu.constants.kWaitingString
            )
        } else {
            return false;
        }
    },

    sitrep() {
        const theGame = this.model.theGame;

        return "Mazu sitrep: " +  theGame.gameCode + " (" + theGame.gameState + ") turn " + theGame.turn +
            " -- " + this.model.thePlayers.length + " players " +
            " -- " + this.model.theTurns.length + " turns "
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
        this.poll();
    },

/*
    render() {
        let gameRunningStuff;

        if (this.model.theGame.gameCode) {
            gameRunningStuff = (<div id={"gameRunningStuff"}>

                <FishMarket
                    OK={(this.state.missing.length === 0)}
                    autoHandler={this.handleAutoSellBoxChange.bind(this)}
                    sellHandler={this.sellFish.bind(this)}
                    missingNames={this.state.missing}
                />
                <GameOverDiv
                    game={this.model.theGame}
                    reason={this.model.theGame.reason}
                />
                <PlayerList
                    thePlayers={this.model.thePlayers}
                    theTurns={this.model.theTurns}
                />
            </div>)
        } else {
            gameRunningStuff = <div id={"gameRunningStuff"}><h4>no game yet</h4></div>
        }

        return (
            <div id={"mazu"}>
                <div id={"titleBar"}>
                    <h1>Mazu</h1>
                    <RefreshButton
                        doRefresh={this.poll.bind(this)}
                    />
                </div>

                <MazuHeader
                    id={"mazuHeader"}
                    model={this.model}
                />

                {gameRunningStuff}

                <div id={"clock"}><strong>{this.state.now.toLocaleTimeString()}</strong></div>
            </div>
        )
    }
*/
}

/*

    NOT part of the Mazu class

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