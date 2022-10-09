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
            gameState: mazu.constants.kWaitingString,
            fishStars : -1,
            brokePlayers : "",
            outOfTime : false,
            reason: "",
            turn : null,        //  the year we're in
        };
        this.gameParameters = null;
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

        //  automate sell, if appropriate

        if (whence === "allTurns" &&
            this.theSituation.autoOK &&
            mazu.state.autoSell &&
            this.thePlayers.length > 0 &&
            this.theGame.gameState === mazu.constants.kInProgressString) {
            await this.sellFish();
            console.log(`*** auto sold *** now it's ${this.theGame.year}`);
        }

        ui.update();
    }

    async gotAllTurns(iAllTurns) {
        if (iAllTurns && !this.allTurns.length) {       //  first time through; need to put these old turns into CODAP
            connect.emitAllTurns(this.theGame, iAllTurns);
        }
        this.allTurns = iAllTurns;
        this.gotNewData('allTurns');
    }

    async gotAllPlayers(iPlayers) {
        const oldPlayers = this.thePlayers;
        this.thePlayers = iPlayers;
        if (oldPlayers.length !== this.thePlayers.length) {
            console.log(`number of players changes from ${oldPlayers.length} to ${this.thePlayers.length}`);
        }
        //  this.thePlayers = iPlayers;
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
        console.log(`${this.theGame.year}: Selling fish`);

        const tN0 = Number(this.theGame['population']);

        const thisYearsTurns = this.thisYearsTurns();
        const playingPlayers = this.playingPlayers();
        const nPlayers = playingPlayers.length;         //  was this.thePlayers.length

        let tTotalCaughtFish = thisYearsTurns.reduce(function (a, v) {
            return {caught: a.caught + Number(v.caught)}
        }, {caught: 0});     //  count up how many fish got caught...

        console.log(`counted ${thisYearsTurns.length} turns; compare ${nPlayers} "playing" players`);

        //  fish ecology

        const tBirths = this.births();
        let newPopulation = Math.round(tN0 +
            tBirths -
            (nPlayers > 0 ? (tTotalCaughtFish.caught / nPlayers) : 0));
        if (newPopulation < this.theGame.losingPopulation) {
            newPopulation = 0;
        }
        this.theGame["population"] = newPopulation;

        const tUnitPrice = nPlayers ? this.gameParameters.calculatePrice(tTotalCaughtFish.caught / nPlayers) : 0;
        console.log(`${this.theGame["year"]}: pop: ${tN0} to ${newPopulation} caught: ${tTotalCaughtFish.caught} Unit price: ${tUnitPrice}`);

        //  update the local copy of the turns
        //  adding unitPrice, income, and after fields

        thisYearsTurns.forEach((t) => {
            t.unitPrice = tUnitPrice;
            t.income = tUnitPrice * Number(t.caught);
            const tAfter = Number(t.before) + t.income - Number(t.expenses);
            t.after = Math.round(tAfter);
            t.pop = newPopulation;
            t.player = t.playerName;
        });

        let thePromises = [];       //  for updating the game in the firebaseDB
        let theItemValues = [];     //  for uploading into CODAP

        //  load all the updated turns to the turnsDB
        //  while we're there, update player records for balance and playerState

        thisYearsTurns.forEach(
            (t) => {
                thePromises.push(fireConnect.uploadTurnToDB(t));
                theItemValues.push(t);

                //  todo: do we really need to update the player? Redundant with turns?
                //  note: the PLAYER has ".balance" rather then .before or .after.
                const playerStuff = {
                    balance: t.after,
                    playerState: mazu.constants.kFishingString,
                };
                thePromises.push(fireConnect.updatePlayerToDB(t.playerName, playerStuff));
            }
        );

        connect.emitAllTurns(this.theGame, theItemValues);

        //  Turns are done; see if the game is over; update the game.

        const endCheck = await this.checkForEndGame();   //  sets theGame.gameState if won or lost, also theGame.reason.
        if (endCheck.end) {
            this.theGame.outOfTime = endCheck.time;
            this.theGame.fishStars = endCheck.fishStars;
            this.theGame.brokePlayers = endCheck.broke.join(", ");
            this.theGame.gameState = mazu.constants.kEndedString;

            //  also, make sure we are no longer automated for selling
            mazu.state.autoSell = false;
        } else {
            this.theGame['year']++;     //      this is where the date gets incremented. End of turn.
            console.log(`... end of turn. Updating to ${this.theGame.year} `);
        }

        thePromises.push(fireConnect.uploadGameToDB(this.theGame)); //  todo: if it works, move this after the "all" call. Clrity and you could put the endCheck clause there too.

        await Promise.all(thePromises);     //  updates all the collections in the DB

        if (endCheck.end) {
            fireConnect.endGame();      //  unsubscribe todo: why isn't this working?
        }
        ui.update();
    }

    /**
     * Put the player to sleep or wake them;
     * this sets the player.playing flag, and also changes that flag in the firebase DB.
     * Plus any relevant side effects
     *
     * @param p
     */
    async sleepWakePlayerNamed(iName) {
        //  compute p...
        let player = null;
        this.thePlayers.forEach( p => {
            if (p.playerName === iName) {
                player = p;
            }
        })
        if (player) {
            if (player.playing) {
                player.playing = false;
            } else {
                player.playing = true;
            }
        }

        await fireConnect.updatePlayerToDB(player.playerName, {playing : player.playing});

        ui.update();
    };

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

        let tReasonObject = {
            end: false,     //  is the game over?
            broke: [],      //  who went broke?
            time: false,   //  set true if time is up
            params: this.gameParameters,
            fishStars : -1,  //  if ending, 0 to 5, how good was your game?
            text : "",
        };

        if (this.theGame.year >= this.theGame.endingYear) {
            tReasonObject.end = true;
            tReasonObject.time = true;
            if (this.theGame.population > this.theGame.winningPopulation) {
                tReasonObject.fishStars = 5;
            } else if (this.theGame.population >
                this.theGame.openingPopulation + (this.theGame.winningPopulation - this.theGame.openingPopulation) / 2){
                tReasonObject.fishStars = 4
            } else if (this.theGame.population >
                this.theGame.openingPopulation){
                tReasonObject.fishStars = 3
            } else if (this.theGame.population >
                this.theGame.openingPopulation - (this.theGame.openingPopulation - this.theGame.losingPopulation) / 2){
                tReasonObject.fishStars = 2
            } else if (this.theGame.population >
                this.theGame.losingPopulation){
                tReasonObject.fishStars = 1
            } else {
                tReasonObject.fishStars = 0
            }
        }

        //  check all turns to see if anyone went negative
        theTurns.forEach((aTurn) => {
            if (aTurn.after < 0) {
                tReasonObject.fishStars = 0;
                tReasonObject.end = true;
                tReasonObject.broke.push(aTurn.playerName);
            }
        });

        if (this.theGame.population < this.theGame.losingPopulation) {
            tReasonObject.end = true;
            tReasonObject.fishStars = 0;
        }

        if (this.theGame.population >= this.theGame.winningPopulation) {
            tReasonObject.fishStars = 5;
            tReasonObject.end = true;
        }

        //  set game state appropriately to win and loss, make tReasonText

        if (tReasonObject.end) {
            this.theGame.gameState = mazu.constants.kEndedString;      //  side effect; change the game
        } else {
            tReasonObject.text = "End of year " + this.theGame.year;
        }

        return tReasonObject;
    }

    /**
     * Filter the `allTurns` item to focus on the current year
     * @returns  the array of turns
     */
    thisYearsTurns() {
        const year = this.theGame.year;
        let out = [];
        this.allTurns.forEach(t => {
            //
            //  todo: maybe just use t.year if we change it so that the languages substitute the TITLEs not the NAMES.
            if (t.year === year) out.push(t);
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
        let playingPlayers = [];

        this.thePlayers.forEach( p => {
            if (p.playing === undefined) {
                p.playing = true;
            }

            if (p.playing) {
                playingPlayers.push(p);
            }
        })
        return playingPlayers;
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

            console.log(`getting curSit in ${this.theGame.year} for ${tTheseTurns.length} turns ... ${ok ? 
                "ready to sell" : "not ready to sell"}`);

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

