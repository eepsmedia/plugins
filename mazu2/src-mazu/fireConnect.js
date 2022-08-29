const fireConnect = {

    db: null,
    gamesCR: null,     //      = all games collection reference
    gameDR: null,       //      this game's document reference
    turnsCR: null,     //  this game's turns subcollection reference
    playersCR: null,
    godsCR : null,

    //  for auth
    ui: null,
    provider: null,

    latestPlayers: [],

    unsubscribeFromTurns: null,
    unsubscribeFromPlayers: null,
    unsubscribeFromGame: null,

    initialize: async function () {
        // Initialize Firebase
        if (!firebase.apps.length) {
            await firebase.initializeApp(firebaseConfig);
        } else {
            await firebase.app();
        }

        //  firebase.analytics();

        console.log('initializing fireConnect');
        this.db = firebase.firestore();
        this.gamesCR = this.db.collection("games");
        this.godsCR = this.db.collection("gods");

        /*
                this.ui = new firebaseui.auth.AuthUI(firebase.auth());
                this.provider = new firebase.auth.GoogleAuthProvider();
        */

    },

    addGodToDB: async function () {
        const theName = mazu.loginName;
        const theContents = {
            name: theName,
            email: "foo@bar.org",
        }
        const godDR = await this.godsCR.doc(theName);
        const docSnap = await godDR.get()

        if (docSnap.exists) {
            godDR.update(theContents);
            Swal.fire({
                icon : "success",
                text : `Welcome back, ${theName}!`
            })
        } else {
            godDR.set(theContents);
            Swal.fire({
                icon : "success",
                text : `Welcome to Mazu, ${theName}!`
            })
        }
    },

    /**
     * called from model.newGame.
     * @param iGameType
     * @returns {Promise<void>} an object with useful stuff
     */
    makeNewGame: async function (iGameType) {
        const params = mazu.fishGameParameters[iGameType];

        params['startingTurn'] = new Date().getFullYear();
        params['endingTurn'] = params.startingTurn + params.duration;

        let newCode = "didn't get a code";

        try {
            let stillLooking = true;
            let iter = 0;
            while (stillLooking) {
                iter++;
                console.log(`Finding a code, iteration ${iter}`);
                const theNumber = Math.floor(Math.random() * 1000000000);
                newCode = eepsWords.newGameCode(theNumber);
                const theDocRef = await this.gamesCR.doc(newCode);
                const theDocSnap = await theDocRef.get();
                stillLooking = theDocSnap.exists;
                console.log(`found a new code, ${newCode}, in ${iter} iteration(s)`);
            }
        } catch (msg) {
            console.log(`Sheesh. Can't even look to see whether a game exists! ${msg}`);
            Swal.fire({
                title: "Ouch!",
                text: `Sheesh. Can't even look to see whether a game exists! ${msg}`,
                icon: "error",
            });
        }

        const newGameValues = {
            turn: params.startingTurn,
            startingTurn: params.startingTurn,
            endingTurn : params.endingTurn,
            openingPopulation: params.openingPopulation,
            population: params.openingPopulation,
            winningPopulation : params.winningPopulation,
            losingPopulation : params.losingPopulation,
            carryingCapacity : params.carryingCapacity,
            birthProbability : params.birthProbability,
            binomialProbabilityModel : params.binomialProbabilityModel,

            fishStars : -1,
            brokePlayers : "",
            outOfTime : false,

            configuration: iGameType,
            gameState: mazu.constants.kInProgressString,
            gameCode: newCode,
            created: new Date(),
            god: mazu.loginName,
        };

        try {
            this.gameDR = this.gamesCR.doc(newCode);
            await this.gameDR.set(newGameValues);
        } catch (msg) {
            Swal.fire({icon : "error", text : `Firebase access denied: ${msg}`});
            return null;
        }
        this.setDBValuesAndConnections();

        return newGameValues;
    },

    /**
     * Find *and load* an old game by code. Called by `mazu.model.joinOldGame(iCode)`.
     *
     * Note: this is an exception to the "do everything through notifications" rule.
     * We actually get the game directly; we do not write it o th DB and wait for notification.
     * That way, `mazuStart` gets the game info synchronously and can log us in.
     *
     * @param iCode
     * @returns {Promise<null|*>}
     */
    joinOldGame: async function (iCode) {
        const thisGameDR = this.gamesCR.doc(iCode);
        const thisGameSnap = await thisGameDR.get();
        if (thisGameSnap.exists) {
            const theData = thisGameSnap.data();
            this.gameDR = thisGameDR;
            this.setDBValuesAndConnections();
            return theData;
            //  note this is the data at the "game" level.
            //  We do not deal with players and turns subcollections
        } else {
            this.gameDR = null;
            this.turnsCR = null;
            this.playersCR = null;
            return null;
        }
    },

    setDBValuesAndConnections: function () {
        this.turnsCR = this.gameDR.collection("turns");
        this.playersCR = this.gameDR.collection("players");
        this.makeSubscriptions();
    },

    makeSubscriptions: function() {
        if (this.unsubscribeFromPlayers) {
            this.unsubscribeFromPlayers();
            this.unsubscribeFromGame();
            this.unsubscribeFromTurns();
        }
        this.unsubscribeFromGame = this.receiveGameNotification(this.gameDR);
        this.unsubscribeFromPlayers = this.receivePlayersNotification(this.playersCR);
        this.unsubscribeFromTurns = this.receiveTurnsNotification(this.turnsCR);
    },

    receiveGameNotification : function(iGameDR) {
        iGameDR.onSnapshot( iGame => {
            const theGame = iGame.data();
            console.log(`    ¬¬¬ Game listener gets ${theGame.gameCode} on turn ${theGame.turn}`);
            mazu.model.gotGame(theGame);
        });
    },

    receiveTurnsNotification : function(iTurnsCR) {
        iTurnsCR.onSnapshot( iTurns => {
            let tAllTurns = [];
            iTurns.forEach( tSnap => {
                tAllTurns.push(tSnap.data());
            })
            console.log(`    ¬¬¬ Turns listener gets ${tAllTurns.length} turns`);
            mazu.model.gotAllTurns(tAllTurns);
        });
    },

    receivePlayersNotification: function (iPlayersCR) {
        //  notifications
        iPlayersCR
            .onSnapshot((iPlayers) => {
                let tPlayers = [];
                iPlayers.forEach((pSnap) => {
                    tPlayers.push(pSnap.data())
                });
                console.log(`    ¬¬¬ Players listener gets ${tPlayers.length} players`);
                mazu.model.gotAllPlayers(tPlayers);
            });
    },

    /**
     *
     * @param iYear     the year
     * @returns Array
     */
    getTurnsForYear: async function (iYear) {
        let theTurns = [];
        this.allTurns.forEach( t => {
            if (t.turn === iYear) {
                theTurns.push(t);
            }
        })
        return theTurns;
    },

    getArrayOfGameCodes: async function (iGod) {

        let theQuerySnap;

        if (iGod) {
            theQuerySnap = await this.gamesCR.where("god", "==", iGod).orderBy("created", "desc").get();
        } else {
            theQuerySnap = await this.gamesCR.orderBy("created", "desc").get();
        }

        let theList = [];

        theQuerySnap.forEach(qs => {
            theList.push(qs.data().gameCode);
        })

        return theList;
    },

    /**
     * Put the current game data on the database,
     * e.g., when the game is over, its gameState changes.
     * (Players are listening and can then update)
     * @param iGame
     * @returns {Promise<void>}
     */
    uploadGameToDB: async function (iGame) {
        console.log(`    π   posting game ${iGame.gameCode} on turn ${iGame.turn}`);
        await this.gameDR.set(iGame);
    },

    uploadTurnToDB: async function (iTurn) {
        const theTurnID = iTurn.turn + "_" + iTurn.playerName;

        console.log(`    π   posting turn ${theTurnID} (after = ${iTurn.after})`);
        await this.turnsCR.doc(theTurnID).set(iTurn);
    },

    updatePlayerToDB: async function (iPlayerName, iNewData) {
        console.log(`    π   posting player ${iPlayerName}, now with ${iNewData.after}`);
        await this.playersCR.doc(iPlayerName).update(iNewData);    //  e.g., balance = inewData.after
    },

    endGame : function() {
        this.unsubscribeFromTurns();
        this.unsubscribeFromGame();
        this.unsubscribeFromPlayers();
    },

};

