/*
==========================================================================

 * Created by tim on 9/20/19.
 
 
 ==========================================================================
PoseidonHeader in poseidon

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

import React from 'react';
//  import model from "../model";
import poseidon from "../constants";

export default class PoseidonHeader extends React.Component {

    constructor(props) {
        console.log("Constructing PoseidonHeader");
        super(props);
        this.state = {
            newOrOldGame: true,
            prospectiveGameType: poseidon.constants.kInitialGameTypeName,
        };

        //  binding
        this.makeNewGame = this.makeNewGame.bind(this);
        this.joinOldGame = this.joinOldGame.bind(this);
    }

    handleNewOrOldChange = (e) => {
        this.setState({
            newOrOldGame: (e.target.value === "new")
        })
    };

    handleGameTypeChange = (e) => {
        this.setState({prospectiveGameType: e.target.value})
    };

    async makeNewGame() {
        const theChosenType = document.getElementById("gameTypesMenu").value;
        const newGame = await this.props.model.newGame(theChosenType);
        console.log("... PoseidonHeader, new game " + newGame.gameCode);
    }

    async joinOldGame() {
        const oldValueBox = document.getElementById("oldGameCodeInput")
        const theOldCode = oldValueBox.value;
        const getDataResult = await this.props.model.joinOldGame(theOldCode);
        if (!getDataResult) {
            alert("Could not find game " + theOldCode + ". Please try again.");
            oldValueBox.value = "";
        }
    }

    sitrep() {
        console.log("... PoseidonHeader, sitrep ");
    }

    render() {
        const theGame = this.props.model.theGame;

        let wholeThing = (<div>waiting</div>);

        const typesMenuGuts = Object.keys(poseidon.fishGameParameters).map(
            (key) => (<option key={key} value={key}>{key}
            </option>)
        );

        const gameCodeOrTypeMenu = (this.state.newOrOldGame ? (
                <select id="gameTypesMenu" value={this.state.prospectiveGameType}
                        onChange={(e) => this.setState({prospectiveGameType: e.target.value})}>
                    {typesMenuGuts}
                </select>
            ) : (
                <input type="text" id={"oldGameCodeInput"}></input>
            )
        );

        const createOrJoinButton = (this.state.newOrOldGame ? (
                <button onClick={this.makeNewGame}>new game ({this.state.prospectiveGameType})</button>
            ) : (
                <button onClick={this.joinOldGame}>join game</button>
            )
        );

        const radioButtons = (<div className={"radioButtons"}>
            <label>
                <input type="radio" name="newOrOldGame" value="new" checked={this.state.newOrOldGame}
                       onChange={this.handleNewOrOldChange}
                /> new game
            </label> <br/>
            <label>
                <input type="radio" name="newOrOldGame" value="old" checked={!this.state.newOrOldGame}
                       onChange={this.handleNewOrOldChange}
                /> old game
            </label>
        </div>);

        if (theGame.gameState === poseidon.constants.kInProgressString) {
            wholeThing = (
                <div id="poseidonHeader">
                    <strong>{theGame.gameCode}</strong>&nbsp;|&nbsp;
                    <strong>{theGame.turn}</strong>&nbsp;|&nbsp;
                    <span><strong>{theGame.population}</strong></span>
                    <span role={"img"} aria-label={"fish"}>&nbsp;&#x1f41f; &nbsp;</span>|
                    <span>&nbsp;type: {theGame.config}</span>
                </div>
            )
        } else {
            wholeThing = (<div id="poseidonHeader">
                {radioButtons}
                {gameCodeOrTypeMenu}&nbsp;{createOrJoinButton}
            </div>)
        }

        return <div>{wholeThing}</div>;
    }
}

