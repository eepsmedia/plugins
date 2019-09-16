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

import React from 'react';
import sendRequest from "./poseidonPHPHelper";
import poseidon from "./constants.js";

class Poseidon extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            whence: 'local',
            gameCode: "",
            gameLevel : poseidon.constants.kInitialGameLevelName,
            players: [],
            now: new Date(),
        };
        console.log("Constructing Poseidon. State: " + JSON.stringify(this.state));
    }

    componentDidMount() {
        this.timerID = setInterval(
            () => this.poll(),
            poseidon.constants.kTimerInterval
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    render() {
        return (
            <div>
                <LevelsMenu
                    gameLevelSetter={this.setGame.bind(this)}
                />
                <NewGameButton
                    gameCode={this.state.gameCode}
                    codeSetter={this.setGameCode.bind(this)}
                    whence={this.state.whence}
                    level = {this.state.gameLevel}
                />
                <div>{this.state.now.toLocaleTimeString()}</div>
            </div>

        )
    }

    poll() {
        this.setState({now: new Date()});
    }

    setGame(iLevel) {
        console.log("Setting game level to " + iLevel);
        this.setState({gameLevel: iLevel});
    }

    setGameCode(iCode) {
        this.setState({gameCode: iCode});
    }

}

function LevelsMenu(props) {
    async function changeGameLevel(e) {
        console.log("changing the level using " + e.target.value);
        props.gameLevelSetter(e.target.value);
    }

    const menuGuts = Object.keys(poseidon.fishLevels).map(
        (key) => (<option key={key} value={key}>{key}</option>)
    );

    return (
        <select id="gameLevelMenu" onChange={changeGameLevel}>{menuGuts}</select>
    )
}

/**
 *
 * @param props
 * @returns {*}
 * @constructor
 */
function NewGameButton(props) {
    async function makeNewGame(e) {
        console.log("new game clicked");
        const gameParameters = poseidon.fishLevels[props.level]
        const tRequest = {
            whence: props.whence,
            action: "create",
            resource: "game",
            values: {
                onTurn: gameParameters.openingTurn,
            },
        };
        const theResponse = await sendRequest(tRequest);
        props.codeSetter(theResponse.code);
    }

    return (
        <div>
            <button name="newGameButton" onClick={makeNewGame}>new game</button>
            <div>game code: {props.gameCode}</div>
        </div>
    );

}

export default Poseidon;
