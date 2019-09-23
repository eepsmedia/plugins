/*
==========================================================================

 * Created by tim on 9/3/19.
 
 
 ==========================================================================
poseidon in poseidon

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
Local testing: http://localhost:3000/
 */

import React from 'react';
//  import poseidon from "./constants.js";
import Model from "./Model.js";
import PoseidonHeader from "./components/PoseidonHeader.js";
import './css/poseidon.css';

import refreshIcon from "./art/refresh.png";

class Poseidon extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            OKtoSell: false,
            missing: [],
            dirty: 0,
            now: new Date(),
        };
        console.log("Constructing Poseidon. State: " + JSON.stringify(this.state));

        this.model = new Model();

        //  bindings
        this.setDirty = this.setDirty.bind(this);
    }

    componentDidMount() {
        /*
                this.timerID = setInterval(
                    () => this.poll(),
                    poseidon.constants.kTimerInterval
                );
        */
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    async poll() {
        this.setState({now: new Date()});
        const theSituationResponse = await this.model.getCurrentSituation();

        this.setState({
            OKtoSell: theSituationResponse.OK,
            missing: theSituationResponse.missing,
        });

        console.log("... poll() ... " + this.sitrep());
    }

    setDirty() {
        const newDirty = this.state.dirty + 1;
        this.setState({dirty: newDirty});
        console.log("... setDirty() ... " + this.sitrep());
    }

    sitrep() {
        const theGame = this.model.theGame;

        return "Poseidon sitrep: " + theGame.config + " game " + theGame.gameCode +
            " (" + theGame.gameState + ") turn " + theGame.turn +
            " dirty = " + this.state.dirty;
    }


    async sellFish() {
        console.log("Selling fish!");
        await this.model.sellFish();
        this.setDirty();
        console.log("Fish sold!");
    }

    render() {
        return (
            <div id={"poseidon"}>
                <h1>Poseidon: God of the Sea</h1>
                <PoseidonHeader
                    id={"poseidonHeader"}
                    model={this.model}
                    setDirty={this.setDirty}
                />

                <RefreshButton
                    doRefresh={this.poll.bind(this)}
                />

                <SellButton
                    OK={this.state.OKtoSell}
                    sellHandler={this.sellFish.bind(this)}
                    missingNames={this.state.missing}
                />
                <PlayerList
                    thePlayers={this.model.thePlayers}
                />

                <div>{this.state.now.toLocaleTimeString()}</div>
            </div>
        )
    }

}

/*

    NOT part of the Poseidon class

 */

function RefreshButton(props) {
    async function doRefresh(e) {
        props.doRefresh();
    }

    return (
        <div>
            <input id="refreshButton" type="image"
                   alt="refresh"
                   height="14" width="16" src={refreshIcon}
                   onClick={doRefresh}></input>
        </div>
    )

}

function PlayerList(props) {

    const listGuts = props.thePlayers.map(
        (p) => (<tr key={p.playerName}>
            <td>{p.playerName}</td>
            <td>{p.onTurn}</td>
            <td>{p.balance}</td>
        </tr>)
    );
    const headerText = props.thePlayers.length + " player(s)";
    const tableHeader = (<tr>
        <th>name</th>
        <th>turn</th>
        <th>balance</th>
    </tr>);
    const wholeThing = props.thePlayers.length > 0 ?
        (
            <div>
                <h2>{headerText}</h2>
                <div>
                    <table id={"playerTable"}>
                        <thead>{tableHeader}</thead>
                        <tbody>{listGuts}</tbody>
                    </table>
                </div>
            </div>
        ) :
        "No players"
    return (<div>{wholeThing}</div>)
}

function SellButton(props) {
    if (props.OK) {
        return (
            <div>
                <button id="sellFishButton" onClick={props.sellHandler}>sell fish</button>
            </div>
        );
    } else {
        if (props.missingNames.length > 0) {
            const missingPlayerList = props.missingNames.join(", ");
            return (<div>Waiting for {missingPlayerList}</div>)
        } else {
            return (<div>No players</div>)
        }
    }
}

export default Poseidon;
