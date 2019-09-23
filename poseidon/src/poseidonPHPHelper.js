/*
==========================================================================

 * Created by tim on 9/3/19.
 
 
 ==========================================================================
phpHelper in poseidon

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

import poseidon from "./constants.js";

const phpConnect = {

    sendRequest: async function (iRequest) {
        if (iRequest.action === "update") {
            console.log("in sendRequest with " + JSON.stringify(iRequest));
        }

        let theBody = new FormData();
        // eslint-disable-next-line
        for (const k in iRequest) {
            if (iRequest.hasOwnProperty(k)) {
                theBody.append(k, JSON.stringify(iRequest[k]))
            }
        }
        const theRequest = new Request(
            poseidon.constants.kBaseURL[poseidon.constants.whence],
            {method: 'POST', body: theBody, header: new Headers()}
        );

        const theResponse = await fetch(theRequest);
        if (theResponse.ok) {
            try {
                const out = await theResponse.json();
                return out;
            } catch (msg) {
                console.log('fetch response decoding error : ' + msg);
            }
        } else {
            alert("problem with database access -- icky respose");
        }
    },

    //  todo: consider making these NOT async...just await completion in the callers.
    //  todo: consider getting player and turn information ONCE when we check for OK.

    getGame: async function (iGame) {
        if (iGame.gameCode) {
            const tGameRequest = {
                whence: poseidon.constants.whence,
                action: "get",
                resource: "game",
                values: {
                    gameCode: iGame.gameCode,
                },
            };
            return await this.sendRequest(tGameRequest);
        }
        console.log("No game code to get");
        return false;
    },

    getPlayers: async function (iGame) {
        if (iGame.gameCode) {
            const tRequest = {
                whence: poseidon.constants.whence,
                action: "get",
                resource: "players",
                values: {
                    gameCode: iGame.gameCode,
                },
            };
            return await this.sendRequest(tRequest);
        }
        console.log("No game code to get, can't get players");
        return false;
    },

    getTurns: async function (iGame) {
        if (iGame.gameCode && iGame.turn) {
            const tRequest = {
                whence: poseidon.constants.whence,
                action: "get",
                resource: "turns",
                values: {
                    gameCode: iGame.gameCode,
                    gameTurn: iGame.turn,
                },
            };
            return await this.sendRequest(tRequest);
        }
        console.log("No game code or year to get, can't get turns");
        return false;
    },

    makeNewGame: async function (iGameType) {
        const params = poseidon.fishGameParameters[iGameType]
        const tRequest = {
            whence: poseidon.constants.whence,
            action: "create",
            resource: "game",
            values: {
                onTurn: params.openingTurn,
                population: params.openingPopulation,
                configuration: iGameType,
                gameState: poseidon.constants.kInProgressString,
            },
        };
        return await phpConnect.sendRequest(tRequest);
    },

    setGame: async function (iGame) {
        const tUpdateRequest = {
            whence: poseidon.constants.whence,
            action: "update",
            resource: "game",
            values: iGame,
        };
        return await phpConnect.sendRequest(tUpdateRequest);
    },
    setTurns: async function (iTurns) {
        const tUpdateRequest = {
            whence: poseidon.constants.whence,
            action: "update",
            resource: "turns",
            values: iTurns,
        };
        return await phpConnect.sendRequest(tUpdateRequest);
    },
    setPlayers: async function (iPlayers) {

        console.log("setPlayers() with " + JSON.stringify(iPlayers));

        const tUpdateRequest = {
            whence: poseidon.constants.whence,
            action: "update",
            resource: "players",
            values: iPlayers,
        };
        return await phpConnect.sendRequest(tUpdateRequest);
    },
};

export default phpConnect;