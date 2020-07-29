

import mazu from "./constants.js";
import firebase from "./Firestore.js";
//  import firebaseui from "./Firestore.js";
import eepsWords from "./words";
//  import Model from "./Model.js";

const fireConnect = {

    model: null,
    db: null,
    gamesCR: null,     //      = games collection reference
    gameDR: null,       //      this game's document reference
    turnsCR : null,     //  this game's turns subcollection reference
    playersCR : null,

    //  for auth
    ui : null,
    provider : null,

    latestPlayers: [],

    unsubscribeFromTurns: null,
    unsubscribeFromPlayers: null,

    initialize: async function (iModel) {
        this.model = iModel;
        console.log('initializing fireConnect');
        this.db = firebase.firestore();
        this.gamesCR = this.db.collection("games");

/*
        this.ui = new firebaseui.auth.AuthUI(firebase.auth());
        this.provider = new firebase.auth.GoogleAuthProvider();
*/

    },

    /**
     * called from model.newGame.
     * @param iGameType
     * @returns {Promise<void>} an object with useful stuff
     */
    makeNewGame: async function (iGameType) {
        const params = mazu.fishGameParameters[iGameType]

        let newCode = "didn't get a code";

        try {
            const gamesQuerySnapshot = await this.gamesCR.get();
            const currentGameCount = gamesQuerySnapshot.size;
            console.log(`there are ${currentGameCount} games in the db`);
            newCode = eepsWords.newGameCode(currentGameCount);
        } catch (msg) {
            alert(`Sheesh. Can't even look to see whether a game exists! ${msg}`);
        }

        console.log("new code: " + newCode);

        const newGameValues = {
            turn: params.openingTurn,
            population: params.openingPopulation,
            configuration: iGameType,
            gameState: mazu.constants.kInProgressString,
            gameCode: newCode,
            created: new Date(),
        };

        try {
            this.gameDR = this.gamesCR.doc(newCode);
            await this.gameDR.set(newGameValues);
        } catch(msg) {
            alert(`Firebase access denied: ${msg}`);
            return null;
        }
        this.setDBValuesAndConnections();

        return newGameValues;
    },

    joinOldGame: async function (iCode) {
        const thisGameDR = this.gamesCR.doc(iCode);
        const thisGameSnap = await thisGameDR.get();
        if (thisGameSnap.exists) {
            const theData = thisGameSnap.data();
            this.gameDR = thisGameDR;
            this.setDBValuesAndConnections();
            return theData;
        } else {
            this.gameDR = null;
            this.turnsCR = null;
            this.playersCR = null;
            return null;
        }
    },

    setDBValuesAndConnections: function() {
        this.turnsCR = this.gameDR.collection("turns");
        this.playersCR = this.gameDR.collection("players");

        this.unsubscribeFromPlayers = this.setPlayersNotifications();

    },

    setPlayersNotifications: function () {
        //  notifications
        this.playersCR
            .onSnapshot((iPlayers) => {
                let tPlayers = [];
                iPlayers.forEach((pSnap) => {
                    tPlayers.push(pSnap.data())
                });
                console.log(`  listener gets ${tPlayers.length} players`);
                this.model.updateDataFromDB(tPlayers);
            });
    },

    /**
     * called by model.sellFish()
     *
     * @param iTurn
     * @returns {Promise<[]>}
     */
    getTurnsForYear : async function(iTurn) {
        let theTurns = [];

        const theSnaps = await this.turnsCR
            .where("turn", "==", iTurn)
            .get();
        theSnaps.forEach( ts => {
            theTurns.push(ts.data());
        });

        return theTurns;
    },

    /**
     * Put the current game data on the database,
     * e.g., when the game is over, its gameState changes.
     * (Players are listening and can then update)
     * @param iGame
     * @returns {Promise<void>}
     */
    uploadGameToDB: async function (iGame) {
        this.gameDR.set(iGame);
    },

    uploadTurnToDB: function(iTurn) {
        const theTurnID = iTurn.turn + "_" + iTurn.playerName;
        this.turnsCR.doc(theTurnID).set(iTurn);
    },

    updatePlayerOnDB: function(iPlayerName, iNewData) {
        this.playersCR.doc(iPlayerName).update(iNewData);    //  e.g., balance
    },

};

export default fireConnect;