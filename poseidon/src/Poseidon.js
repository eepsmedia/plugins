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

class Poseidon extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            whence: 'local',
            gameName: "",
            players: [],
            now : new Date(),
        }

    }

    componentDidMount() {
        this.timerID = setInterval(
            () => this.poll(),
            1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    render() {
        return (
            <div>
            <NewGameButton
                gameName={this.state.gameName}
                nameSetter={this.setNewGame.bind(this)}
                whence = {this.state.whence}
            />
            <div>{this.state.now.toLocaleTimeString()}</div>
            </div>

        )
    }

    poll() {
        this.setState({ now : new Date()});
    }

    setNewGame(iName) {
        this.setState({gameName: iName});
    }

}


function NewGameButton(props) {
    async function makeNewGame(e) {
        console.log("new game clicked");
        const theResponse = await sendRequest(props.whence);
        props.nameSetter(theResponse.name);
    }

    return (
        <div>
            <button name="newGameButton" onClick={makeNewGame}>new game</button>
            <div>game name: {props.gameName}</div>
        </div>
    );

}

export default Poseidon;
