/*
/!*
==========================================================================

 * Created by tim on 9/17/19.
 
 
 ==========================================================================
model in poseidon

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

//todo: bring checking the situation from php into this model.

import phpConnect from "./poseidonPHPHelper";
import poseidon from "./constants.js";
import strings from "./strings.js";

export default class Model extends Object  {

    constructor() {
        super();
        this.theGame = {
            gameCode : "",
            gameType : poseidon.constants.kInitialGameTypeName,     //  called 'config' in mySQL
            gameState : poseidon.constants.kGameWaitingString,
        };        //  an image of the mySQL record
        this.thePlayers = [];
        this.theTurns = [];
        this.gameParameters = poseidon.fishGameParameters[this.theGame.gameType];

        return this;
    }

    /**
     * Ask php to make a new game, and set the this.theGame variable.
     *
     * @param iGameType
     * @returns {Promise<null>}
     */
    async newGame(iGameType) {
        this.gameParameters = poseidon.fishGameParameters[iGameType];
        this.theGame = await phpConnect.makeNewGame(iGameType);
        this.thePlayers = [];
        this.theTurns = [];

        return this.theGame;
    }

    async refreshAllData(iCode) {

        if (arguments.length === 1) {
            this.theGame = {gameCode : iCode};
        }
        //  here is where these values get set.
        this.theGame = await phpConnect.getGame(this.theGame) || {};
        if (!this.theGame) return false;
        this.thePlayers = await phpConnect.getPlayers(this.theGame) || [];
        this.theTurns = await phpConnect.getTurns(this.theGame) || [];
        return true;
    }

    async sellFish() {
        await this.refreshAllData();

        this.updateTurnsData();  //   update the model. fast. synchronous. Sets game pop and unit price
        this.updatePlayersData();   //  update the players balances based on their turns, unit price, etc.

        //  must do side effects in checkForEndGame before setting the game, player, and turns

        await phpConnect.setGame(this.theGame);
        await phpConnect.setTurns(this.theTurns);
        await phpConnect.setPlayers(this.thePlayers);

        //  return endGameObject;
    }

    updateTurnsData() {
        const tN0 = Number(this.theGame['population']);
        const nPlayers = this.theTurns.length;

        let tTotalCaughtFish = this.theTurns.reduce(function (a, v) {
            return {caught: a.caught + Number(v.caught)}
        }, {caught: 0});     //  count up how many fish got caught...

        const tBirths = this.births();

        //  update the population in model.theGame, the local copy
        this.theGame["population"] = tN0 + tBirths -
            (nPlayers > 0 ? (tTotalCaughtFish.caught / nPlayers) : 0);
        this.theGame['turn']++;


        const tUnitPrice = this.gameParameters.calculatePrice(tTotalCaughtFish.caught / nPlayers);
        console.log("... total caught: " + tTotalCaughtFish.caught +
            ", new population: " + this.theGame["population"] + " ... Unit price is " + tUnitPrice);

        //  update all of the turns from all of the players to show ending balance
        //  not yet uploaded to DB

        this.theTurns.forEach(
            (t) => {
                t.unitPrice = tUnitPrice;
                t.income = tUnitPrice * Number(t.caught);
                t.balanceAfter = Number(t.balanceBefore) + t.income - Number(t.expenses);
            }
        );
    }

    /**
     * update the player records to reflect the ending balance and the year in the corresponding turns record.
     * The trick is to get the names right... :P
     */
    updatePlayersData() {
        this.thePlayers.forEach( (p) => {
            this.theTurns.forEach( (t) => {
                if (t.playerName === p.playerName) {
                    p.balance = t.balanceAfter;
                    p.onTurn = t.onTurn + 1;
                }
            })
        });
    }

    births() {
        let tPop = this.theGame.population;
        let tAdjustedProbability = this.gameParameters.birthProbability *
            (1 - (tPop / this.gameParameters.carryingCapacity));
        let tOut = tAdjustedProbability * tPop;

        if (this.gameParameters.binomialProbabilityModel) {
            tOut = 0;
            for (let i = 0; i < tPop; i++) {
                if (Math.random() < tAdjustedProbability) {
                    tOut++;
                }
            }
        }
        return tOut;
    }

    /**
     * Assumes that the model is current, i.e., theGame, thePlayers, etc. are up to date.
     * @returns {Promise<{reason: *, end: *}>}
     */
    async checkForEndGame() {

        let tReasonText = "";

        let tEnd = "";      //  "" | "won" | "lost"
        let tReasonObject = {
            end: false,     //  is the game over?
            broke: [],      //  who went broke?
            time: false,   //  set true if time is up
            pop: "",       //  high | low
            params : this.gameParameters,
        };

        if (this.theGame.turn >= this.gameParameters.endingTurn) {
            tReasonObject.end = true;
            tReasonObject.time = true;
            if (this.theGame.population > this.gameParameters.winningPopulation) {
                tReasonObject.pop = "high";
                tEnd = poseidon.constants.kWonString;
            } else {
                tReasonObject.pop = "low";
                tEnd = poseidon.constants.kLostString;
            }
        }

        //  check all turns to see if anyone went negative
        this.theTurns.forEach((t) => {
            if (t.balanceAfter < 0) {
                tReasonObject.end = true;
                tReasonObject.broke.push(t.playerName);
                tEnd = poseidon.constants.kLostString;
            }
        });

        if (this.theGame.population < this.gameParameters.losingPopulation) {
            tReasonObject.end = true;
            tReasonObject.pop = "low";
            tEnd = poseidon.constants.kLostString;
        }

        //  set game state appropriately to win and loss

        if (tReasonObject.end) {
            this.theGame.gameState = tEnd;      //  side effect; change the game

            tReasonText = strings.constructGameEndMessageFrom(tReasonObject);
        } else {
            tReasonText = "End of year " + this.theGame.turn;
        }

        this.theGame.reason = tReasonText;
        await phpConnect.setGame(this.theGame);

        return this.theGame;
    }

    /**
     * This will return an object that describes the implications of the current game state.
     * Especially these Booleans:
     *
     * OK : is it OK to sell fish? (i.e., has everybody moved?)
     * gameOver : has the game ended?
     * @returns {Promise<{missing: [], playing: boolean, OK: boolean, allPlayers: *}|{missing: [], playing: boolean, OK: boolean, allPlayers: []}|{missing: *, playing: boolean, OK: boolean, allPlayers: *}>}
     */
    async getCurrentSituation() {

        await this.refreshAllData();
        await this.checkForEndGame();   //  sets theGame.gameState if won or lost, also theGame.reason.

        if (this.theGame.gameCode) {
            //  game information
            let missingPlayers = [];
            let allPlayers = [];

            this.thePlayers.forEach((p) => {
                let innit = false;
                this.theTurns.forEach((t) => {
                    if (t.playerName === p.playerName) {
                        innit = true;
                    }
                });
                allPlayers.push(p.playerName);
                if (!innit) {
                    missingPlayers.push(p.playerName);
                }
            });

            if (this.theGame.gameState === poseidon.constants.kInProgressString) {
                return {
                    OK: (this.thePlayers.length === this.theTurns.length),
                    missing: missingPlayers,
                    allPlayers: allPlayers,
                    playing : true,
                };
            } else {        //  game is not in progress, i.e., over
                return {
                    OK : false,
                    missing : [],
                    allPlayers : allPlayers,
                    playing : false,
                };
            }
        } else {
            return {
                OK : false,
                missing : [],
                allPlayers : [],
                playing : false,
            };
        }
    }

};

