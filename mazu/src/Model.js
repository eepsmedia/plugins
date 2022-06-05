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


class Model extends Object {

    constructor(iMazu) {
        super();

        this.theGame = {
            gameCode: "",
            gameType: mazu.constants.kInitialGameTypeName,
            gameState: mazu.constants.kGameWaitingString,
            reason: "",
        };
        this.theSituation = this.getCurrentSituation();
        this.thePlayers = [];
        this.allTurns = [];
        //       this.theTurns = [];
        //  this.gameParameters = mazu.fishGameParameters[this.theGame.gameType];
        this.mazu = iMazu;
        this.calculatePrice = null;   //      (function)
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
        await fireConnect.makeNewGame(iGameType);
        this.thePlayers = [];
        this.theTurns = [];
    }

    async joinOldGame(iCode) {
        this.theGame = await fireConnect.joinOldGame(iCode);    //  synchronous
        return this.theGame;
    }

    async gotNewData(whence) {
        this.theSituation = this.getCurrentSituation();

        if (whence === "allTurns" &&
            this.theSituation.autoOK &&
            mazu.state.autoSell &&
            this.thePlayers.length > 0 &&
            this.theGame.gameState === mazu.constants.kInProgressString) {
            await this.sellFish();
            console.log(`*** auto sold *** now it's ${this.theGame.turn}`);
        }

        ui.update();
    }

    async gotAllTurns(iAllTurns) {
        this.allTurns = iAllTurns;
        this.gotNewData('allTurns');
    }

    async gotAllPlayers(iPlayers) {
        const oldPlayers = this.thePlayers;
        this.thePlayers = iPlayers;
        if (oldPlayers.length !== this.thePlayers.length) {
            console.log(`number of players changes from ${oldPlayers.length} to ${this.thePlayers.length}`);
        }
        this.thePlayers = iPlayers;
        this.gotNewData('allPlayers');
    }

    async gotGame(iGame) {
        this.theGame = iGame;

        //  now, because the `calculatePrice()` function is not stored on the DB...
        if (this.theGame) {
            this.gameParameters = mazu.fishGameParameters[this.theGame.configuration];
        }

        this.gotNewData('theGame');
    }

    /**
     * Note: we will be updating `this.theGame` throughout.
     * At the end, we load it into the DB, which may cause a listener firing.
     *
     * @returns {Promise<void>}
     */
    async sellFish() {
        console.log(`${this.theGame.turn}: Selling fish`);

        const tN0 = Number(this.theGame['population']);

        const theTurns = this.thisYearsTurns();
        const nPlayers = this.thePlayers.length;

        let tTotalCaughtFish = theTurns.reduce(function (a, v) {
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

        theTurns.forEach((t) => {
            t.unitPrice = tUnitPrice;
            t.income = tUnitPrice * Number(t.caught);
            const tAfter = Number(t.before) + t.income - Number(t.expenses);
            t.after = Math.round(tAfter);
        });


        let thePromises = [];    //  for updating the game in the DB

        //  load all the turns to the turnsDB
        //  while we're there, update player records for balance and playerState

        theTurns.forEach(
            (t) => {
                thePromises.push(fireConnect.uploadTurnToDB(t));

                //  todo: do we really need to update the player? Redundant with turns?
                const playerStuff = {
                    balance: t.after,
                    playerState: mazu.constants.kFishingString,
                };
                thePromises.push(fireConnect.updatePlayerToDB(t.playerName, playerStuff));
            }
        );

        //  Turns are done; see if the game is over; update the game.

        const ended = await this.checkForEndGame();   //  sets theGame.gameState if won or lost, also theGame.reason.
        if (!ended) {
            this.theGame['turn']++;     //      this is where the date gets incremented. End of turn.
            console.log(`... end of turn. Updating to ${this.theGame.turn} `);
        }
        thePromises.push(fireConnect.uploadGameToDB(this.theGame));

        await Promise.all(thePromises);     //  updates all the collections in the DB

        if (ended) {
            fireConnect.endGame();      //  unsubscribe

        }
        ui.update();
    }

    births() {
        let tPop = this.theGame.population;
        let tAdjustedProbability = this.theGame.birthProbability *
            (1 - (tPop / this.theGame.carryingCapacity));
        let tOut = tAdjustedProbability * tPop;

        if (this.theGame.binomialProbabilityModel) {
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

        const theTurns = this.thisYearsTurns();

        let tReasonText = "";

        let tEnd = "";      //  "" | "won" | "lost"
        let tReasonObject = {
            end: false,     //  is the game over?
            broke: [],      //  who went broke?
            time: false,   //  set true if time is up
            pop: "",       //  high | low
            params: this.gameParameters,
        };

        if (this.theGame.turn >= this.theGame.endingTurn) {
            tReasonObject.end = true;
            tReasonObject.time = true;
            if (this.theGame.population > this.theGame.winningPopulation) {
                tReasonObject.pop = "high";
                tEnd = mazu.constants.kWonString;
            } else {
                tReasonObject.pop = "low";
                tEnd = mazu.constants.kLostString;
            }
        }

        //  check all turns to see if anyone went negative
        theTurns.forEach((aTurn) => {
            if (aTurn.after < 0) {
                tReasonObject.end = true;
                tReasonObject.broke.push(aTurn.playerName);
                tEnd = mazu.constants.kLostString;
            }
        });

        if (this.theGame.population < this.theGame.losingPopulation) {
            tReasonObject.end = true;
            tReasonObject.pop = "low";
            tEnd = mazu.constants.kLostString;
        }

        if (this.theGame.population >= this.theGame.winningPopulation) {
            tReasonObject.end = true;
            tReasonObject.pop = "high";
            tEnd = mazu.constants.kWonString;
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
     * Filter the `allTurns` item to focus on the current year
     * @returns {*}
     */
    thisYearsTurns() {
        const year = this.theGame.turn;
        let out = [];
        this.allTurns.forEach(t => {
            if (t.turn === year) out.push(t);
        })
        return out;
    }

    mostRecentPlayerTurn(iName) {
        let thisPlayersTurns = [];
        this.allTurns.forEach(t => {
            if (t.playerName === iName) {
                thisPlayersTurns.push(t);
            }
        })

        //  assume allTurns is sorted by year, so we get the last one in the array
        return thisPlayersTurns[thisPlayersTurns.length - 1];
    }

    /**
     * In case not all players are playing; Mazu can proceed when somebody doesn't move.
     *
     * @returns {[]}
     */
    playingPlayers() {
        return this.thePlayers;
    }

    /**
     * This will return an object that describes the implications of the current game state.
     *
     * Especially these Booleans:
     *
     * * OK : is it OK to sell fish? (i.e., has everybody moved?)
     * * missing: who has not moved yet?
     * * playing : has the game ended?
     * @returns {Promise<{missing: [], playing: boolean, OK: boolean, allPlayers: *}|{missing: [], playing: boolean, OK: boolean, allPlayers: []}|{missing: *, playing: boolean, OK: boolean, allPlayers: *}>}
     */
    getCurrentSituation() {     //  todo: be SURE this shouldn't be async!

        if (this.theGame.gameCode) {
            //  game information
            let missingPlayerNames = [];
            let currentPlayerNames = [];

            const tPlayingPlayers = this.playingPlayers();
            const tTheseTurns = this.thisYearsTurns();


            tPlayingPlayers.forEach((p) => {
                currentPlayerNames.push(p.playerName);
                if (p.playerState !== mazu.constants.kSellingString) {
                    missingPlayerNames.push(p.playerName);
                }
            });

            const ok = (tPlayingPlayers.length === tTheseTurns.length);

            console.log(`getting curSit in ${this.theGame.turn} for ${tTheseTurns.length} turns ... ${ok ? "OK" : "not OK"}`);

            if (this.theGame.gameState === mazu.constants.kInProgressString) {
                return {
                    OK: ok,
                    autoOK: (tPlayingPlayers.length ? ok : false),
                    missing: missingPlayerNames,
                    current: currentPlayerNames,
                    playing: true,
                };
            } else {        //  game is not in progress, i.e., over
                return {
                    OK: false,
                    autoOK : false,
                    missing: [],
                    current: currentPlayerNames,
                    playing: false,
                };
            }

        } else {
            return {
                OK: false,
                autoOK: false,
                missing: [],
                current: [],
                playing: false,
            };
        }
    }

};

