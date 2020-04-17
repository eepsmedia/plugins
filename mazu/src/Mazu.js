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

import React from 'react';
//  import mazu from "./constants.js";
import Model from "./Model.js";
import MazuHeader from "./components/MazuHeader.js";
import './css/mazu.css';

import refreshIcon from "./art/refresh.png";
import mazu from "./constants";

class Mazu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            OKtoSell: false,
            autoSell: false,
            missing: [],
            now: new Date(),
        };
        console.log("Constructing Mazu. State: " + JSON.stringify(this.state));

        this.model = new Model(this);   //  singleton

        //  bindings
    }

    componentDidMount() {
        /*
                this.timerID = setInterval(
                    () => this.poll(),
                    mazu.constants.kTimerInterval
                );
        */
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    async poll() {
        const theSituationResponse = await this.model.getCurrentSituation();

        //  this is the REACT state...
        this.setState({
            OKtoSell: theSituationResponse.OK,
            missing: theSituationResponse.missing,
            now: new Date(),
        });

        console.log("... poll() ... " + this.sitrep());

        if (this.state.OKtoSell &&
            this.state.autoSell &&
            this.model.thePlayers.length > 0 &&
            this.playing()) {
            await this.sellFish();
            console.log(" *** auto sold *** now it's " + this.model.theGame.turn);
        }
    }


    playing() {
        return (
            this.model.theGame.gameState === mazu.constants.kInProgressString ||
            this.model.theGame.gameState === mazu.constants.kWaitingString
        )
    }

    sitrep() {
        const theGame = this.model.theGame;

        return "Mazu sitrep: " +  theGame.gameCode + " (" + theGame.gameState + ") turn " + theGame.turn +
            " -- " + this.model.thePlayers.length + " players " +
            " -- " + this.model.theTurns.length + " turns "
            ;
    }

    async sellFish() {
        document.getElementById("sellFishButton").style.visibility = "hidden";
        console.log("Selling fish!");
        await this.model.sellFish();
        console.log("Fish sold!");
        document.getElementById("sellFishButton").style.visibility = "visible";
    }

    handleAutoSellBoxChange(e) {
        const newCheckedState = document.getElementById("autoSellBox").checked;
        this.setState({autoSell: newCheckedState});
        console.log("Auto sell checkbox now " + newCheckedState);
        this.poll();
    }

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

                    <i>Queen of Heaven, Lady of Numinous Grace, protector of fisherfolk</i>
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
}

/*

    NOT part of the Mazu class

 */

function RefreshButton(props) {
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
}

function GameOverDiv(props) {
    const theGame = props.game;

    if (theGame.gameState === mazu.constants.kInProgressString) {
        return null;
    }

    const theGuts = (
        <div id={"gameOverDiv"}>
            <h3>Game over! The players {theGame.gameState}!</h3>
            <p>{props.reason}</p>
        </div>
    );

    return <div>{theGuts}</div>
}

function PlayerList(props) {

    function playerRow(p, iTurns) {
        let myTurn = null;
        iTurns.forEach((t) => {
            console.log(`turn: ${JSON.stringify(t)}`);
            if (t.playerName === p.playerName) {
                myTurn = t;
            }
        });

        const tWanted = myTurn ? myTurn.want : "--";
        return (
            <tr key={p.playerName}>
                <td>{p.playerName}</td>
                <td>{tWanted}</td>
                <td>{p.balance}</td>
                <td>{p.playerState}</td>
            </tr>
        )
    }

    const theTurns = props.theTurns;
    const listGuts = props.thePlayers.map(
        (p) => playerRow(p, theTurns)
    );

    const headerText = props.thePlayers.length + " player(s)";
    const tableHeader = (<tr>
        <th>name</th>
        <th>wants</th>
        <th>balance</th>
        <th>status</th>
    </tr>);
    const wholeThing = props.thePlayers.length > 0 ?
        (
            <div>
                <h3>{headerText}</h3>
                <div>
                    <table id={"playerTable"}>
                        <thead>{tableHeader}</thead>
                        <tbody>{listGuts}</tbody>
                    </table>
                </div>
            </div>
        ) : (
            <h4>no players yet</h4>
        );

    return (<div>{wholeThing}</div>)
}

function FishMarket(props) {
    if (props.OK) {
        return (
            <div id={"fishMarket"}>
                <h3>Fish market: </h3>
                <button id="sellFishButton" onClick={props.sellHandler}>sell fish</button>
                <AutoSellBox
                    autoHandler={props.autoHandler}
                />

            </div>
        );
    } else {
        if (props.missingNames.length > 0) {
            const missingPlayerList = props.missingNames.join(", ");
            return (
                <div id={"fishMarket"}>
                    <h3>Fish market: </h3>
                    <span>Waiting for {missingPlayerList}</span>
                    <AutoSellBox
                        autoHandler={props.autoHandler}
                    />
                </div>
            )
        } else {
            return (<div id={"fishMarket"}>no fish to sell</div>)
        }
    }
}

function AutoSellBox(props) {

    return (
        <div>
            <input type={"checkbox"}
                   id={"autoSellBox"}
                   onChange={props.autoHandler}
            />
            <label htmlFor={"autoSellBox"}>automate market</label>
        </div>
    )
}

export default Mazu;
