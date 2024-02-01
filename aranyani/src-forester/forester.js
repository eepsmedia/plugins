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

let DG = {
    plugins : null,
};

let aranyaniStrings = {};

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
    gameParameters : null,      //  a copy from the game database, set when you join a game
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
        gameTurn: 0,                //  year we are in locally. Usually the same as fish.gameFromDB.year

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

        gameCodeFromURL : null,
    },

    /**
     * Set up initial values, initialize other objects with initializers.
     */
    initialize: async function () {
        MFS.initialize();      //   load all strings into DG.plugins.aranyani.... depending on language
        await fish.CODAPConnector.initialize(); //  make the CODAP connection, initialize the iFrame
        //  await fish.CODAPConnector.initializeFishDatasets();
        MFS.setInitialStrings();

        //  fish.state = fish.freshState;       //  todo: implement saving and restoring

        //  fish.setLevel(fish.state.config);
        fish.state.gameState = fish.constants.kWaitingString;
        fish.state.playerState = fish.constants.kBetweenString;     //  not in a game until join

        //  fish.CODAPConnector.initialize(null)
            //  .then(() => {
                    if (!fish.state.hasOwnProperty('gameCodeList')) {
                        fish.state.gameCodeList = [];
                    }
        //        }
        //    );

        this.debugThing = document.getElementById('debugSpan');

        // Initialize Firebase

        fireConnect.initialize(this);

        fish.ui.initialize();

        if (this.gameCodeFromURL) {
            fish.userActions.clickJoinButton(this.gameCodeFromURL);
        } else {
            fish.ui.update();
        }
    },

    calculateVisible : function() {
        let tVisible = 0;
        let tPop = Number(fish.gameFromDB['population']);   //  todo: use listener's game.

        if (fish.gameParameters.binomialProbabilityModel) {
            for (let i = 0; i < tPop; i++) {
                if (Math.random() < fish.gameParameters.visibleProbability) {
                    tVisible++;
                }
            }
        } else {
            tVisible = Math.round(fish.gameParameters.visibleProbability * tPop);
        }

        console.log(`${fish.state.gameTurn}: ${tVisible} seen of ${tPop}`);
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

    /**
     * Note: returned object is in English!
     *
     * @param iWanted
     * @returns {{caught: *, visible: number, want, turn: (number|*), player: (string|null|*), expenses: (*|number|number)}}
     */
    catchFish: function (iWanted) {

        try {
            const tSeen = this.calculateVisible();
            tCaught = this.calculateCaught(iWanted, tSeen);
            let tExpenses = fish.gameParameters.overhead;

            return {
                game : fish.state.gameCode,
                player : fish.state.playerName,
                year : fish.state.gameTurn,
                before : fish.state.balance,    //      state.balance; this is the turn object before sales.
                want: iWanted,
                seen: tSeen,
                caught: tCaught,
                expenses: tExpenses
            };

        } catch (msg) {
            console.log('catch fish error: ', msg);
        }
    },

    /**
     * Called on receiving a notification that the game has changed in the DB.
     * Typically, because aranyani has updated the game year.
     * @param iGame
     */
    updateGame: async function(iGame) {
        this.gameFromDB = iGame;
        this.state.gameState = this.gameFromDB.gameState; //      maybe we won or lost!
        this.gameConfig = this.gameFromDB.configuration;
        fish.state.fishStars = this.gameFromDB.fishStars;

        if (this.state.gameTurn !== this.gameFromDB.year) {
            console.log(`updating game, turn ${this.state.gameTurn} to ${this.gameFromDB.year}`);

            //  change of turn! Fish got sold!
            await this.updateTurnFromOldYearInCODAP(this.state.gameTurn); //  gets the turn data and pushes it todo: do we need to do this?
            this.state.gameTurn = this.gameFromDB.year;

            this.state.playerState = fish.constants.kFishingString;     //  myData.playerState;        //  we are back to fishing

            //  find the balance
            const myData = await fireConnect.getMyData();   //  todo: avoid this call through notifications
            this.state.balance = myData ? myData.balance : iGame.openingBalance;

            console.log(`\nfish.updateGame() Year is now ${this.state.gameTurn} (now ${this.state.playerState})`);
            if (fish.state.autoCatch && fish.state.playerState === fish.constants.kFishingString) {
                await fish.userActions.catchFish();       //      AUTOMATICALLY catch fish, but wait to complete before continuing!
            }
        }

        if (this.state.gameState === fish.constants.kEndedString) {
            this.endGame(iGame);
        }

        this.ui.update();
    },

    /**
     *  Called when the turns database is updated.
     * @param iTurns        all turns
     * @returns {Promise<void>}
     */
    updateTurns : async function( iTurns ) {
        //  for now, look for the turn for this year, for this player, and update the CODAP record to match.

        let thisTurn = null;
        iTurns.forEach( t => {

            //  look only at the current turn for this player...

            if (t.year === this.state.gameTurn && t.playerName === this.state.playerName) {
                fish.state.turnReport = MFS.makeRecentTurnReport(t);   //  t includes caseID
                fish.CODAPConnector.updateFishItemInCODAP(t);   //  t includes caseID
            }
        });
    },

    updateTurnFromOldYearInCODAP : async function( iTurn ) {
        console.log(`NOTE! NOTE! We do call updateTurnFromOldYear...`);
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

    extractGameCodeFromURL : function () {
        const params = new URLSearchParams(document.location.search.substring(1));
        const code = params.get("code");
        if (code) {
            console.log(`will try to join game ${code}`);
        } else {
            console.log(`No pre-set game`);
        }
        return code;
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
    setLanguage: async function (iCode) {
        fish.language = iCode;       //  put the thing in here to choose
        fish.strings = FS[iCode];

        //  initialize strings
        DG.plugins = await fishStrings.initialize();

        FS.setBasicStrings();           //  replace strings in the UI

    },

    leaveGame : function() {
        console.log(`leaving game "${this.state.gameCode}"`);

    },

    /**
     * Called when the game has ended
     * Makes the historical data appear.
     *
     * @param iGame     the received Game object
     * @returns {Promise<void>}
     */
    endGame: async function (iGame) {
        console.log(`in fish.endGame("${iGame.gameState}")`);
        fish.state.gameCodeList.push(this.state.gameCode);
        await fish.historicalData.getHistoricalData();
        //  fish.ui.update();
    },

    /**
     * Called when a game is over and the dialog is displayed.
     * Sets quantities so that we are not playing a game, etc.
     */
    startWaitingForNewGame: function () {
        console.log(`\nNow waiting for a new game\n`);
        document.getElementById("automateCatchCheckbox").checked = false;   //  de-automate "catch"

        fish.state.gameState = fish.constants.kWaitingString;
        fish.state.playerState = fish.constants.kBetweenString;     //  not in a game until join
        fish.state.gameCode = null;
        fish.state.autoCatch = false;
        fish.state.currentTurnResult = null;
        fish.state.gameTurn = 0;
        fish.state.balance = 0;

        document.getElementById("gameCodeTextField").value = "";         //  empty the code!
        document.getElementById("howManyFish").value = "";         //  empty the code!
        fish.ui.update();
    },



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
        console.log(`notice not displayed: ${iText}`);
        return;
        // document.getElementById("notice").innerHTML = iText;
    },

    constants: {
        version: "2023a",

        kTimerInterval: 500,       //      milliseconds, ordinarily 1000
        kUsingTimer: true,
        kInitialLanguage: 'en',    //  can override with URL parameter *lang*, e.g., "...index.html?lang=es"

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
        //  kFishDataSetTitle: "fishing records",
        kFishCollectionName: "years",

        kHistoricalDataSetName: "historical fish",
        //  kHistoricalDataSetTitle: "historical records",
        kHistoricalCollectionName: "years",

        //  game states
        kInProgressString: "in progress",
        kEndedString: "game over",
        kWaitingString: "waiting",      //

        //  player states
        kSellingString: "selling",
        kFishingString: "fishing",
        kBetweenString: "between games",

        foo: 42
    }
};

const delay = ms => new Promise(res => setTimeout(res, ms));
