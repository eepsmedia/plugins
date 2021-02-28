const fireConnect = {

    db: null,
    gamesCR: null,     //      = games collection reference
    gameDR: null,       //      this game's document reference
    turnsCR: null,     //  this game's turns subcollection reference
    playersCR: null,

    //  for auth
    ui: null,
    provider: null,

    latestPlayers: [],

    unsubscribeFromTurns: null,
    unsubscribeFromPlayers: null,

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
        const params = mazu.fishGameParameters[iGameType]

        let newCode = "didn't get a code";

        try {
            let iter = 0;
            let stillLooking = true;
            while (stillLooking) {
                iter++;
                console.log(`Finding a code, iteration ${iter}`);
                const theNumber = Math.floor(Math.random() * 1000000000);
                newCode = eepsWords.newGameCode(theNumber);
                const theDocRef = await this.gamesCR.doc(newCode);
                const theDocSnap = await theDocRef.get();
                stillLooking = theDocSnap.exists;
            }
        } catch (msg) {
            console.log(`Sheesh. Can't even look to see whether a game exists! ${msg}`);
            Swal.fire({
                title: "Ouch!",
                text: `Sheesh. Can't even look to see whether a game exists! ${msg}`,
                icon: "error",
            });
        }

        console.log("new code: " + newCode);

        const newGameValues = {
            turn: params.openingTurn,
            population: params.openingPopulation,
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

        this.unsubscribeFromPlayers = this.setPlayersNotifications(this.playersCR);

    },

    setPlayersNotifications: function (iPlayersCR) {
        //  notifications
        iPlayersCR
            .onSnapshot((iPlayers) => {
                let tPlayers = [];
                iPlayers.forEach((pSnap) => {
                    tPlayers.push(pSnap.data())
                });
                console.log(`  listener gets ${tPlayers.length} players`);
                mazu.model.updateDataFromDB(tPlayers);
            });
    },

    getAllPlayers: async function () {
        let thePlayers = [];

        const querySS = await this.playersCR.get();
        querySS.forEach(docSS => {
            thePlayers.push(docSS.data())
        })

        return thePlayers;
    },

    getAllTurns: async function () {
        let theTurns = [];

        const querySS = await this.turnsCR.get();
        querySS.forEach(docSS => {
            theTurns.push(docSS.data())
        })

        return theTurns;
    },

    /**
     * called by model.updateDataFromDB() and .sellFish()
     *
     * @param iYear     the year
     * @returns {Promise<[]>}
     */
    getTurnsForYear: async function (iYear) {
        let theTurns = [];

        const theSnaps = await this.turnsCR
            .where("turn", "==", iYear)
            .get();
        theSnaps.forEach(ts => {
            theTurns.push(ts.data());
        });

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
        this.gameDR.set(iGame);
    },

    uploadTurnToDB: function (iTurn) {
        const theTurnID = iTurn.turn + "_" + iTurn.playerName;
        this.turnsCR.doc(theTurnID).set(iTurn);
    },

    updatePlayerOnDB: function (iPlayerName, iNewData) {
        this.playersCR.doc(iPlayerName).update(iNewData);    //  e.g., balance
    },

};

