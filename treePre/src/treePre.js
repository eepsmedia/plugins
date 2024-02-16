const treePre = {

    markedTrees : [],
    treeAges : [],
    myName : null,
    gamePhase : 'nogame', //    { nogame | recruit | play | debrief | waiting }

    initialize: async function () {
        console.log(`initializing treePre`);
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
    newGame : function(/*iPlayers, iTrees*/) {
        this.gamePhase = 'recruit';
/*
        this.markedTrees = [];
        this.state.me = iPlayers[this.myName];    //  a Player instance
        this.treeAges = iTrees;
*/

        this.cycle();
    },

    endGame : function() {
        this.gamePhase = 'debrief';
    },

    newYear : function(iPlayers, trees) {
        this.gamePhase = 'play';
        this.markedTrees = [];
        this.treeAges = [...trees];
        //  this.state.me = iPlayers[this.myName];    //  a Player instance

        this.cycle();
    },

    constants: {
        pluginName: "treePre",
        version: 0.001,
        dimensions: {height: 333, width: 444},

        defaultState: {
            lang: 'en',
            datasetName: 'treePreData',
            datasetTitle: 'treePreTitle',
            me : null,
        }
    }
}