const singlePlayer = true;

const treePre = {

    markedTrees : [],
    treeData : [],
    gamePhase : null, //    { nogame | recruit | play | debrief | waiting }
    transactions : [],
    debriefInfo : {},

    initialize: async function () {
        console.log(`initializing treePre`);
        this.gamePhase = this.phases.kNoGame;
        await localize.initialize(localize.figureOutLanguage('en'));
        await connect.initialize();        //  initialize the connection with CODAP
        god.initialize();

        ui.initialize();
        this.state = {...this.constants.defaultState, ...this.state};   //  have all fields in default!
        this.cycle();
    },


    cycle: function () {
        ui.redraw();
    },

    /**
     * There is a new game, though it hasn't started yet. We can join it.
     * @param iPlayers  object containing all `Players`, keyed by name
     * @param iTrees    array of tree *ages*.
     */
    newGame : function(iContent) {
        this.gamePhase = treePre.phases.kRecruit;
        this.state.year = iContent.year;
        this.treeData = [...iContent.trees];
        forestView.newForest();

        if (singlePlayer) {
            handlers.doJoin();
            god.startPlay();
        }    //  automatically join

        this.cycle();
    },

    endGame : function(mess) {
        this.state.year = mess.year;
        this.debriefInfo = mess.reason;
        this.gamePhase = this.phases.kDebrief;
        this.treeData = [...mess.trees];
        //  this.players = [...mess.players];
        this.cycle();
    },

    newYear : function (mess) {
        this.gamePhase = treePre.phases.kPlay;
        this.markedTrees = [];
        this.treeData = [...mess.trees];
        this.state.year = mess.year;
        this.cycle();
    },

    endYear : async function(mess) {
        this.transactions = [];     //  OUR transactions
        for (const T of mess.transactions) {
            if (T.pName === this.state.me.name) {
                this.transactions.push(T)
            }
        }
        await connect.emitTransactions(this.transactions);
        this.transactions.forEach(t=> {
            //  console.log(t.toString());
        })
        //  this.cycle();
    },

    phases : {
        kWaitingForMarket : "waiting for market",
        kRecruit : "recruit",
        kPlay : "play",
        kNoGame : "nogame",
        kDebrief : "debrief",
        kWaiting : "waiting",   //  waiting for the FIRST new year
    },

    constants: {
        pluginName: "treePre",
        version: 0.001,
        dimensions: {height: 555, width: 444},

        defaultState: {
            lang: 'en',
            datasetName: 'treePreData',
            me : null,
            year : 1967,
        }
    }
}