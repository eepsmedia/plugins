/*
/!*
==========================================================================

 * Created by tim on 9/17/19.
 
 
 ==========================================================================
model in mazu

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


class Model extends Object  {

    constructor(iMazu) {
        super();

        this.theGame = {
            gameCode : "",
            gameType : mazu.constants.kInitialGameTypeName,     //  called 'config' in mySQL
            gameState : mazu.constants.kGameWaitingString,
            reason : "",
        };
        this.thePlayers = [];
        this.theTurns = [];
        this.gameParameters = mazu.fishGameParameters[this.theGame.gameType];
        this.mazu = iMazu;

       // fireConnect.initialize(this);

        return this;
    }

    /**
     * Ask fireStore to make a new game, and set the this.theGame variable.
     *
     * @param iGameType     e.g., albacore
     * @returns {Promise<null>}
     */
    async newGame(iGameType) {
        this.gameParameters = mazu.fishGameParameters[iGameType];
        this.theGame = await fireConnect.makeNewGame(iGameType);
        this.thePlayers = [];
        this.theTurns = [];

        return this.theGame;
    }

    async   joinOldGame(iCode) {
        this.theGame = await fireConnect.joinOldGame(iCode);
        if (this.theGame) {
            this.gameParameters = mazu.fishGameParameters[this.theGame.configuration];
            //  this.theGame does NOT include subcollections, players and turns
            //  so we restore them here:

            this.thePlayers = await fireConnect.getAllPlayers();
            this.theTurns = await fireConnect.getAllTurns();
        }

        return this.theGame;
    }

    async updateDataFromDB(iPlayers) {
        this.thePlayers = iPlayers;
        this.theTurns = await fireConnect.getTurnsForYear(this.theGame.turn);
        this.mazu.poll();
    }

    updateTurnsFromDB(iTurns) {
        this.theTurns = iTurns;
        this.mazu.poll();
    }

    async sellFish() {
        const tN0 = Number(this.theGame['population']);

        this.theTurns = await fireConnect.getTurnsForYear( this.theGame.turn );

        const nPlayers = this.theTurns.length;

        let tTotalCaughtFish = this.theTurns.reduce(function (a, v) {
            return {caught: a.caught + Number(v.caught)}
        }, {caught: 0});     //  count up how many fish got caught...

        //  fish ecology

        const tBirths = this.births();
        const newPopulation = Math.round(tN0 +
            tBirths -
            (nPlayers > 0 ? (tTotalCaughtFish.caught / nPlayers) : 0));
        this.theGame["population"] = newPopulation;

        const tUnitPrice = this.gameParameters.calculatePrice(tTotalCaughtFish.caught / nPlayers);
        console.log(`${this.theGame["turn"]}: pop: ${tN0} to ${newPopulation} caught: ${tTotalCaughtFish.caught} Unit price: ${tUnitPrice}`);

        //  update the local copy of the turns
        //  adding unitPrice, income, and after fields

        this.theTurns.forEach((t) => {
            t.unitPrice = tUnitPrice;
            t.income = tUnitPrice * Number(t.caught);
            t.after = Number(t.before) + t.income - Number(t.expenses);
        });

        const ended = await this.checkForEndGame();   //  sets theGame.gameState if won or lost, also theGame.reason.

        if (!ended) {this.theGame['turn']++}         //  if the game is over, we don't bump the year.

        let thePromises = [fireConnect.uploadGameToDB(this.theGame)];    //  update the game in the DB

        //  load all the turns to the turnsDB
        //  while we're there, update player records for balance and playerState

        this.theTurns.forEach(
            (t) => {
                thePromises.push(fireConnect.uploadTurnToDB(t));

                const playerStuff = {
                    balance : t.after,
                    playerState : mazu.constants.kFishingString,
                };
                thePromises.push(fireConnect.updatePlayerOnDB( t.playerName, playerStuff));
            }
        );
        await Promise.all(thePromises);     //  updates all the collections in the DB
        ui.update();
       // this.mazu.forceUpdate();    // todo:  need this??
    }

/*
    /!**
     * update the player records to reflect the ending balance and the year in the corresponding turns record.
     * The trick is to get the names right... :P
     *!/
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
*/

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
        return Math.round(tOut);
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
                tEnd = mazu.constants.kWonString;
            } else {
                tReasonObject.pop = "low";
                tEnd = mazu.constants.kLostString;
            }
        }

        //  check all turns to see if anyone went negative
        this.theTurns.forEach((aTurn) => {
            if (aTurn.after < 0) {
                tReasonObject.end = true;
                tReasonObject.broke.push(aTurn.playerName);
                tEnd = mazu.constants.kLostString;
            }
        });

        if (this.theGame.population < this.gameParameters.losingPopulation) {
            tReasonObject.end = true;
            tReasonObject.pop = "low";
            tEnd = mazu.constants.kLostString;
        }

        //  set game state appropriately to win and loss

        if (tReasonObject.end) {
            this.theGame.gameState = tEnd;      //  side effect; change the game
            tReasonText = strings.constructGameEndMessageFrom(tReasonObject);
        } else {
            tReasonText = "End of year " + this.theGame.turn;
        }

        this.theGame.reason = tReasonText;
        return tEnd;
    }

    /**
     * This will return an object that describes the implications of the current game state.
     * Especially these Booleans:
     *
     * OK : is it OK to sell fish? (i.e., has everybody moved?)
     * missing: who has not moved yet?
     * gameOver : has the game ended?
     * @returns {Promise<{missing: [], playing: boolean, OK: boolean, allPlayers: *}|{missing: [], playing: boolean, OK: boolean, allPlayers: []}|{missing: *, playing: boolean, OK: boolean, allPlayers: *}>}
     */
    async getCurrentSituation() {

        if (this.theGame.gameCode) {
            //  game information
            let missingPlayers = [];
            let allPlayers = [];

            this.thePlayers.forEach((p) => {
                allPlayers.push(p.playerName);
                if (p.playerState !== mazu.constants.kSellingString) {
                    missingPlayers.push(p.playerName);
                }
            });

            const ok = this.thePlayers.length === this.theTurns.length;

            if (this.theGame.gameState === mazu.constants.kInProgressString) {
                return {
                    OK: ok,
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

