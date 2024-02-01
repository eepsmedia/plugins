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
 * @type {{whence: string, debugThing: null, state: null, FS: null, freshState: {language: null, gameCode: null, gameState: null, gameTurn: number, gameCodeList: Array, config: null, isChair: boolean, fishRecordsInCODAPAreOutOfDate: boolean, playerName: null, playerState: null, turn: number, balance: number, gameEndMessage: string, turnReport: string, currentTurnResult: null, autoCatch: boolean, autoChair: boolean, OKtoEndTurnObject: {OK: boolean}, timerCount: number}, game: null, initialize: forester.initialize, setLanguage: forester.setLanguage, setLevel: forester.setLevel, endGame: forester.endGame, startWaitingForNewGame: forester.startWaitingForNewGame, doTimer: forester.doTimer, fishUpdate: (function(): boolean), readyToCatch: forester.readyToCatch, setNotice: forester.setNotice, constants: {version: string, kTimerInterval: number, kUsingTimer: boolean, kBaseURL: {local: string, xyz: string, eeps: string}, kForestryDataSetName: string, kForestryDataSetTitle: string, kForestryCollectionName: string, kHistoricalDataSetName: string, kHistoricalDataSetTitle: string, kHistoricalCollectionName: string, kInProgressString: string, kWonString: string, kLostString: string, kWaitingString: string, kSellingString: string, kWoodCuttingString: string, kBetweenString: string, foo: number}}}
 */
let forestry = {

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

    FS: null,          //  fish strings. One of its elements will become forester.strings, depending on language

    /**
     * A copy of forester.state to start with.
     * Some items get set in initialize()
     */
    freshState: {
        gameCode: null,     //  three-word nearly-unique code for each game
        gameState: null,    //  is the game in progress?
        gameTurn: 0,                //  year we are in locally. Usually the same as forester.gameFromDB.year

        gameCodeList: [],

        forestryRecordsInCODAPAreOutOfDate: false,
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
        await forester.CODAPConnector.initialize(); //  make the CODAP connection, initialize the iFrame
        //  await forester.CODAPConnector.initializeForestryDatasets();
        MFS.setInitialStrings();

        //  forester.state = forester.freshState;       //  todo: implement saving and restoring

        //  forester.setLevel(forester.state.config);
        forester.state.gameState = forester.constants.kWaitingString;
        forester.state.playerState = forester.constants.kBetweenString;     //  not in a game until join

        //  forester.CODAPConnector.initialize(null)
            //  .then(() => {
                    if (!forester.state.hasOwnProperty('gameCodeList')) {
                        forester.state.gameCodeList = [];
                    }
        //        }
        //    );

        this.debugThing = document.getElementById('debugSpan');

        // Initialize Firebase

        fireConnect.initialize(this);

        forester.ui.initialize();

        if (this.gameCodeFromURL) {
            forester.userActions.clickJoinButton(this.gameCodeFromURL);
        } else {
            forester.ui.update();
        }
    },

    calculateVisible : function() {
        let tVisible = 0;
        let tPop = Number(forester.gameFromDB['population']);   //  todo: use listener's game.

        if (forester.gameParameters.binomialProbabilityModel) {
            for (let i = 0; i < tPop; i++) {
                if (Math.random() < forester.gameParameters.visibleProbability) {
                    tVisible++;
                }
            }
        } else {
            tVisible = Math.round(forester.gameParameters.visibleProbability * tPop);
        }

        console.log(`${forester.state.gameTurn}: ${tVisible} seen of ${tPop}`);
        return tVisible;
    },

    calculateCaught : function(iWanted, iVisible) {
        //  now calculate how many we caught

        let tCatchable = 0;

        if (forester.gameParameters.binomialProbabilityModel) {
            for (let i = 0; i < iVisible; i++) {
                if (Math.random() < forester.gameParameters.catchProbability) {
                    tCatchable++;
                }
            }
        } else {
            tCatchable = Math.round(forester.gameParameters.catchProbability * iVisible);
        }

        return tCatchable > iWanted ? iWanted : tCatchable;
    },

    /**
     * Note: returned object is in English!
     *
     * @param iWanted
     * @returns {{caught: *, visible: number, want, turn: (number|*), player: (string|null|*), expenses: (*|number|number)}}
     */
    cutTrees: function (iWanted) {

        try {
            const tSeen = this.calculateVisible();
            tCaught = this.calculateCaught(iWanted, tSeen);
            let tExpenses = forester.gameParameters.overhead;

            return {
                game : forester.state.gameCode,
                player : forester.state.playerName,
                year : forester.state.gameTurn,
                before : forester.state.balance,    //      state.balance; this is the turn object before sales.
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
        forester.state.forestryStars = this.gameFromDB.forestryStars;

        if (this.state.gameTurn !== this.gameFromDB.year) {
            console.log(`updating game, turn ${this.state.gameTurn} to ${this.gameFromDB.year}`);

            //  change of turn! Trees got sold!
            await this.updateTurnFromOldYearInCODAP(this.state.gameTurn); //  gets the turn data and pushes it todo: do we need to do this?
            this.state.gameTurn = this.gameFromDB.year;

            this.state.playerState = forester.constants.kWoodCuttingString;     //  myData.playerState;        //  we are back to fishing

            //  find the balance
            const myData = await fireConnect.getMyData();   //  todo: avoid this call through notifications
            this.state.balance = myData ? myData.balance : iGame.openingBalance;

            console.log(`\nforester.updateGame() Year is now ${this.state.gameTurn} (now ${this.state.playerState})`);
            if (forester.state.autoCatch && forester.state.playerState === forester.constants.kWoodCuttingString) {
                await forester.userActions.cutTrees();       //      AUTOMATICALLY catch fish, but wait to complete before continuing!
            }
        }

        if (this.state.gameState === forester.constants.kEndedString) {
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
                forester.state.turnReport = MFS.makeRecentTurnReport(t);   //  t includes caseID
                forester.CODAPConnector.updateForestryItemInCODAP(t);   //  t includes caseID
            }
        });
    },

    updateTurnFromOldYearInCODAP : async function( iTurn ) {
        console.log(`NOTE! NOTE! We do call updateTurnFromOldYear...`);
        const theTurn = await fireConnect.getOneTurn( this.state.playerName, iTurn );
        forester.CODAPConnector.updateForestryItemInCODAP(theTurn);
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
        let theLang = forester.constants.kInitialLanguage;

        const params = new URLSearchParams(document.location.search.substring(1));
        const lang = params.get("lang");

        if (lang) {
            theLang = lang;
        }
        forester.setLanguage(theLang);
    },


    /**
     * Set the UI language
     * @param iCode     two-letter language code, e.g., en, de, es.
     */
    setLanguage: async function (iCode) {
        forester.language = iCode;       //  put the thing in here to choose
        forester.strings = FS[iCode];

        //  initialize strings
        DG.plugins = await forestryStrings.initialize();

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
        console.log(`in forester.endGame("${iGame.gameState}")`);
        forester.state.gameCodeList.push(this.state.gameCode);
        await forester.historicalData.getHistoricalData();
        //  forester.ui.update();
    },

    /**
     * Called when a game is over and the dialog is displayed.
     * Sets quantities so that we are not playing a game, etc.
     */
    startWaitingForNewGame: function () {
        console.log(`\nNow waiting for a new game\n`);
        document.getElementById("automateCatchCheckbox").checked = false;   //  de-automate "catch"

        forester.state.gameState = forester.constants.kWaitingString;
        forester.state.playerState = forester.constants.kBetweenString;     //  not in a game until join
        forester.state.gameCode = null;
        forester.state.autoCatch = false;
        forester.state.currentTurnResult = null;
        forester.state.gameTurn = 0;
        forester.state.balance = 0;

        document.getElementById("gameCodeTextField").value = "";         //  empty the code!
        document.getElementById("howManyTrees").value = "";         //  empty the code!
        forester.ui.update();
    },



    /**
     * Check to see if the player is ready to catch fish (game is in progress, player is tagged as "fishing"
     * instead of "selling"
     *
     * @returns {boolean}
     */
    readyToCatch: function () {
        if (forester.state.playerState === forester.constants.kWoodCuttingString) {
            if (forester.state.gameState !== forester.constants.kInProgressString) {
                console.warn("forester.js readyToCatch(), but game state is " + forester.state.gameState);
            }
            return true;
        } else {
            return false;
        }
        //  return (forester.state.playerState === forester.constants.kWoodCuttingString && forester.state.gameState === forester.constants.kInProgressString)
    },

    otherPlayersInfo: function () {
        let tAllPlayers = [];
        let tMissing = [];

        this.players.forEach(p => {
            let innit = false;
            if (p.playerState === forester.constants.kWoodCuttingString) {
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
            authDomain: "eeps-forestry-commons.firebaseapp.com",
            databaseURL: "https://eeps-forestry-commons.firebaseio.com",
            projectId: "eeps-forestry-commons",
            storageBucket: "eeps-forestry-commons.appspot.com",
            messagingSenderId: "945924475632",
            appId: "1:945924475632:web:8a0f6f26d292f317511035",
            measurementId: "G-36DF6XG8Q7"
        },

        kForestryDataSetName: "fish",
        //  kForestryDataSetTitle: "fishing records",
        kForestryCollectionName: "years",

        kHistoricalDataSetName: "historical fish",
        //  kHistoricalDataSetTitle: "historical records",
        kHistoricalCollectionName: "years",

        //  game states
        kInProgressString: "in progress",
        kEndedString: "game over",
        kWaitingString: "waiting",      //

        //  player states
        kSellingString: "selling",
        kWoodCuttingString: "fishing",
        kBetweenString: "between games",

        foo: 42
    }
};

const delay = ms => new Promise(res => setTimeout(res, ms));
