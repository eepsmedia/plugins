/*
==========================================================================

 * Created by tim on 4/19/18.
 
 
 ==========================================================================
fish in fish

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

/**
 * Top-level singleton, a global.
 *
 * @type {{whence: string, debugThing: null, state: null, FS: null, freshState: {language: null, gameCode: null, gameState: null, gameTurn: number, gameCodeList: Array, config: null, isChair: boolean, fishRecordsInCODAPAreOutOfDate: boolean, playerName: null, playerState: null, turn: number, balance: number, gameEndMessage: string, turnReport: string, currentTurnResult: null, autoCatch: boolean, autoChair: boolean, OKtoEndTurnObject: {OK: boolean}, timerCount: number}, game: null, initialize: fish.initialize, setLanguage: fish.setLanguage, setLevel: fish.setLevel, endGame: fish.endGame, startWaitingForNewGame: fish.startWaitingForNewGame, doTimer: fish.doTimer, fishUpdate: (function(): boolean), readyToCatch: fish.readyToCatch, setNotice: fish.setNotice, constants: {version: string, kTimerInterval: number, kUsingTimer: boolean, kBaseURL: {local: string, xyz: string, eeps: string}, kFishDataSetName: string, kFishDataSetTitle: string, kFishCollectionName: string, kHistoricalDataSetName: string, kHistoricalDataSetTitle: string, kHistoricalCollectionName: string, kInProgressString: string, kWonString: string, kLostString: string, kWaitingString: string, kSellingString: string, kFishingString: string, kBetweenString: string, foo: number}}}
 */
let fish = {

    debugThing: null,      //  UI element

    state: null,            //  object to hold the current state of the game. Very important.

    /**
     * An object about the game itself;
     * this is the game configuration, has stuff like default values.
     * Set in setLevel() below.
     */
    gameFromDB: null,         //  the game in the DB, updated when it changes
    gameConfig : null,
    gameParameters : null,      //  a copy from fishGameConfiguration corresponding to config, e.g., "albacore"
    players: [],

    language: null,

    FS: null,          //  fish strings. One of its elements will become fish.strings, depending on language

    /**
     * A copy of fish.state to start with.
     * Some items get set in initialize()
     */
    freshState: {
        gameCode: null,     //  three-word nearly-unique code for each game
        gameState: null,    //  is the game in progress?
        turn: 0,                //  year we are in locally. Usually the same as fish.gameFromDB.turn

        gameCodeList: [],

        fishRecordsInCODAPAreOutOfDate: false,
        playerName: null,       //  player's handle
        playerState: null,     //  fishing, selling, betweenGames
        balance: 0,

        gameEndMessage: "Game over",
        turnReport: "News of your last fishing efforts!",

        currentTurnResult: null,

        autoCatch: false,       //  automation button checked for catching
        otherPlayersInfo: {OK: true},
        timerCount: 0,
    },

    /**
     * Set up initial values, initialize other objects with initializers.
     */
    initialize: function () {
        fish.setLanguageFromURL();
        fish.state = fish.freshState;       //  todo: implement saving and restoring

        //  fish.setLevel(fish.state.config);
        fish.state.gameState = fish.constants.kWaitingString;
        fish.state.playerState = fish.constants.kBetweenString;     //  not in a game until join
        //  fish.state.turn = fish.game.openingTurn;
        fish.CODAPConnector.initialize(null)
            .then(() => {
                    if (!fish.state.hasOwnProperty('gameCodeList')) {
                        fish.state.gameCodeList = [];
                    }
                }
            );

        this.debugThing = $('#debugSpan');

        // Initialize Firebase

        fireConnect.initialize(this);

        fish.ui.initialize();
        fish.ui.update();
    },

    calculateVisible : function() {
        let tVisible = 0;
        let tPop = Number(fish.gameFromDB['population']);

        if (fish.gameParameters.binomialProbabilityModel) {
            for (let i = 0; i < tPop; i++) {
                if (Math.random() < fish.gameParameters.visibleProbability) {
                    tVisible++;
                }
            }
        } else {
            tVisible = Math.round(fish.gameParameters.visibleProbability * tPop);
        }

        console.log(`${fish.state.turn}: ${tVisible} seen of ${tPop}`);
        return tVisible;
    },

    calculateCaught : function(iWanted, iVisible) {
        //  now calculate how many we caught

        let tCatchable = 0;

        if (fish.gameParameters.binomialProbabilityModel) {
            for (let i = 0; i < iVisible; i++) {
                if (Math.random() < fish.gameParameters.catchProbability) {
                    tCatchable++;
                }
            }
        } else {
            tCatchable = Math.round(fish.gameParameters.catchProbability * iVisible);
        }

        return tCatchable > iWanted ? iWanted : tCatchable;
    },

    catchFish: function (iWanted) {

        try {
            const tVisible = this.calculateVisible();
            tCaught = this.calculateCaught(iWanted, tVisible);

            let tExpenses = fish.gameParameters.overhead;

            return {
                playerName : fish.state.playerName,
                turn : fish.state.turn,
                want: iWanted,
                visible: tVisible,
                caught: tCaught,
                expenses: tExpenses
            };

        } catch (msg) {
            console.log('catch fish error: ', msg);
        }
    },

    /**
     * Called on receiving a notification that the game has changed in the DB.
     * Typically, because poseidon has updated the game year.
     * @param iGame
     */
    updateGame: async function(iGame) {
        this.gameFromDB = iGame;
        this.state.gameState = this.gameFromDB.gameState; //      maybe we won or lost!
        this.gameConfig = this.gameFromDB.configuration;
        fish.state.gameEndMessage = this.gameFromDB.reason;

        if (this.state.turn !== this.gameFromDB.turn) {
            //  change of turn! Fish got sold!
            this.updateTurnFromOldYearInCODAP(this.state.turn); //  gets the turn data and pushes it
            this.state.turn = this.gameFromDB.turn;

            const myData = await fireConnect.getMyData();

            this.state.playerState = fish.constants.kFishingString;     //  myData.playerState;        //  we are back to fishing
            this.state.balance = myData.balance;

            console.log(`\nfish.updateGame() Year is now ${this.state.turn} (now ${this.state.playerState})`);
            if (fish.state.autoCatch && fish.state.playerState === fish.constants.kFishingString) {
                await fish.userActions.catchFish();       //      AUTOMATICALLY catch fish, but wait to complete before continuing!
            }
        }

        if (this.state.gameState === fish.constants.kWonString || this.state.gameState === fish.constants.kLostString) {
            this.endGame(this.state.gameState);
        }

        this.ui.update();
    },

    updateTurnFromOldYearInCODAP : async function( iTurn ) {
        const theTurn = await fireConnect.getOneTurn( this.state.playerName, iTurn );
        fish.CODAPConnector.updateFishItemInCODAP(theTurn);
    },

    /**
     * Called on receiving a notification that the players have changed in the DB.
     * Common. Typically, a player has changed status from fishing to selling, so
     * the message about who we're waiting for will change.
     * @param iPlayers
     */
    updatePlayers: function(iPlayers) {
        this.players = iPlayers;
        this.ui.update();
    },

    setLanguageFromURL: function () {
        let theLang = fish.constants.kInitialLanguage;

        const params = new URLSearchParams(document.location.search.substring(1));
        const lang = params.get("lang");

        if (lang) {
            theLang = lang;
        }
        fish.setLanguage(theLang);
    },


    /**
     * Set the UI language
     * @param iCode     two-letter language code, e.g., en, de, es.
     */
    setLanguage: function (iCode) {
        fish.language = iCode;       //  put the thing in here to choose
        fish.strings = FS[iCode];
        FS.setBasicStrings();           //  replace strings in the UI

    },


    /**
     * Called when the game has ended
     * Makes the historical data appear.
     *
     * @param iTheState     'won' or 'lost'
     * @returns {Promise<void>}
     */
    endGame: async function (iTheState) {
        console.log(`in fish.endGame("${iTheState}")`);
        fish.state.gameCodeList.push(this.state.gameCode);
        await fish.historicalData.getHistoricalData();
        //  fish.ui.update();
    },

    /**
     * Called when a game is over and the dialog is displayed.
     * Sets quantities so that we are not playing a game, no one is chair, etc.
     */
    startWaitingForNewGame: function () {
        console.log(`\nNow waiting for a new game\n`);
        document.getElementById("automateCatchCheckbox").checked = false;   //  de-automate "catch"

        fish.state.gameState = fish.constants.kWaitingString;
        fish.state.playerState = fish.constants.kBetweenString;     //  not in a game until join
        fish.state.gameCode = null;
        fish.state.autoCatch = false;
        fish.state.currentTurnResult = null;
        fish.state.turn = 0;
        fish.state.balance = 0;

        $("#gameCodeTextField").val("");         //  empty the code!
        $("#howManyFish").val("");         //  empty the code!
        fish.ui.update();
    },


    /**
     * At the top level, update the model
     *
     * @returns {Promise<boolean>}
     */
/*
    fishUpdate: async function () {
        fish.state.otherPlayersInfo = await this.otherPlayersInfo();
        let done = false;
        let tUpdatedTurn;
        const tDBgame = await fish.fireConnect.getGameData();

        const tNewGameTurn = Number(tDBgame['turn']);
        fish.state.gameState = tDBgame['gameState'];

        if (tNewGameTurn > fish.state.turn) {    //  the game just updated; its turn (from the DB) is more advanced.

            const tTurnArray = await fish.fireConnect.getOneTurn(fish.state.turn);
            const tMostRecentTurnFromDB = tTurnArray[0];
            const newBalance = tMostRecentTurnFromDB['balanceAfter'];

            if (newBalance) {

                //  The DB has updated prices, etc., so we now finish THIS YEAR's case, updating it in CODAP.
                //  Note that we're using fish.state.turn BEFORE it gets updated to the "game's" turn.
                tUpdatedTurn = await fish.CODAPConnector.updateFishItemInCODAP(
                    tMostRecentTurnFromDB,
                    "update " + fish.state.turn + " to " + tNewGameTurn);

                fish.state.gameTurn = Number(tNewGameTurn); //  now update local turn number
                fish.state.turn = fish.state.gameTurn;      //  here we update the turn (the player turn)
                fish.state.balance = newBalance;  //  we only update balance when the turn updates
                fish.state.playerState = fish.constants.kFishingString; //  now we are fishing again

                fish.state.turnReport = fish.strings.makeRecentTurnReport(tUpdatedTurn);
                fish.setNotice(fish.state.turnReport);
            } else {
                console.log("latest balance not available, wait for another tick...")
            }
        }

        if (fish.state.playerState === fish.constants.kSellingString) {
            //  this report will be DURING the turn, so we know how many we caught but not the price.
            fish.state.turnReport = fish.strings.makeCurrentTurnReport(fish.state.currentTurnResult);
            fish.setNotice(fish.state.turnReport);
        }

        //  check for end of game. fish.state.gameState set above (read from DB)

        if (fish.state.gameState === fish.constants.kWonString || fish.state.gameState === fish.constants.kLostString) {
            fish.state.gameEndMessage = tDBgame.reason;

            await fish.endGame(fish.state.gameState);
            done = true;
        }

        //  do an autocatch if appropriate
        if (fish.state.autoCatch && fish.state.playerState === fish.constants.kFishingString) {
            await fish.userActions.catchFish();       //      AUTOMATICALLY catch fish, but wait to complete before continuing!
        }
        /!*
                //  need to know if everyone is done fishing
                fish.state.OKtoEndTurnObject = await fish.phpConnector.checkToSeeIfOKtoEndTurn();

                //  do an auto fish-market if appropriate
                if (fish.state.isChair) {
                    if (fish.state.OKtoEndTurnObject.OK) {
                        if (fish.state.autoChair) {
                            await fish.userActions.chairEndsTurn();     //  OK to resolve AND autoChair. Do it!
                        }
                    }
                }
        *!/
        return done;
    },
*/

    /**
     * Check to see if the player is ready to catch fish (game is in progress, player is tagged as "fishing"
     * instead of "selling"
     *
     * @returns {boolean}
     */
    readyToCatch: function () {
        if (fish.state.playerState === fish.constants.kFishingString) {
            if (fish.state.gameState !== fish.constants.kInProgressString) {
                console.warn("fish.js readyToCatch(), but game state is " + fish.state.gameState);
            }
            return true;
        } else {
            return false;
        }
        //  return (fish.state.playerState === fish.constants.kFishingString && fish.state.gameState === fish.constants.kInProgressString)
    },

    otherPlayersInfo: function () {
        let tAllPlayers = [];
        let tMissing = [];

        this.players.forEach(p => {
            let innit = false;
            if (p.playerState === fish.constants.kFishingString) {
                tMissing.push(p.playerName);
            }
            tAllPlayers.push(p.playerName);
        });

        return {
            OK: (tMissing.length === 0),
            missing:tMissing,
            allPlayers: tAllPlayers,
        }

    },

    /**
     * Make the text appear in the UI in the notice section
     * @param iText     the text to appear
     */
    setNotice: function (iText) {
        $("#notice").html(iText);
    },

    constants: {
        version: "001g",

        kTimerInterval: 500,       //      milliseconds, ordinarily 1000
        kUsingTimer: true,
        kInitialLanguage: 'en',    //  can override with URL parameter *lang*, e.g., "...index.html?lang=es"

        kBaseURL: {
            local: "http://localhost:8888/plugins/fish/fish.php",
            xyz: "https://codap.xyz/projects/fish/fish.php",
            eeps: "https://www.eeps.com/codap/fish/fish.php"
        },

        kFirebaseConfiguration : {
            apiKey: "AIzaSyAMkheBMSdVmMyUi76UGyeMX3pJpBGS0Hw",
            authDomain: "eeps-fish-commons.firebaseapp.com",
            databaseURL: "https://eeps-fish-commons.firebaseio.com",
            projectId: "eeps-fish-commons",
            storageBucket: "eeps-fish-commons.appspot.com",
            messagingSenderId: "945924475632",
            appId: "1:945924475632:web:8a0f6f26d292f317511035",
            measurementId: "G-36DF6XG8Q7"
        },

        kFishDataSetName: "fish",
        kFishDataSetTitle: "fishing records",
        kFishCollectionName: "years",

        kHistoricalDataSetName: "historical fish",
        kHistoricalDataSetTitle: "historical records",
        kHistoricalCollectionName: "years",

        //  game states
        kInProgressString: "in progress",
        kWonString: "won",
        kLostString: "lost",
        kWaitingString: "waiting",      //

        //  player states
        kSellingString: "selling",
        kFishingString: "fishing",
        kBetweenString: "between games",

        foo: 42
    }
};

const delay = ms => new Promise(res => setTimeout(res, ms));
