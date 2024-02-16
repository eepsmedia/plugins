const god = {

    forest: [],
    gameParams: {},
    players: {},        //  Players, keyed by name (Player instances)
    markedTrees: {},       //  arrays of marked trees, keyed by name
    gamePhase : 'nogame',   //  { nogame | recruit | play | debrief }


    initialize: function () {
    },

    addPlayer: function (iPlayer) {
        const thePlayerName = this.uniquePlayerName(iPlayer.name);
        iPlayer.name = thePlayerName;
        this.players[thePlayerName] = iPlayer;
        this.gameParams.nPlayers = Object.keys(this.players).length;
        return iPlayer;
    },

    uniquePlayerName: function (iName) {
        const theSuffix = Math.round(999 * Math.random());
        return `${iName}${theSuffix}`;
    },

    /**
     *
     * @param iPlayerName the name of the player (serves as a key)
     * @param iTrees    simple array of tree indices
     */
    addHarvest: function (iPlayerName, iTrees) {
        this.markedTrees[iPlayerName] = iTrees;
    },

    newGame: function () {
        this.gamePhase = 'recruit';
        this.gameParams = {...this.defaultGameParams};
        this.newForest();
        temple.godSpeaksToPlayer('newGame');
    },

    startPlay : function() {
        this.gamePhase = 'play';
        this.newYear();     //  the first year
    },

    endGame : function() {
        this.gamePhase = 'debrief';
        temple.godSpeaksToPlayer('endGame');
    },

    newYear: function () {
        this.processHarvest();
        this.gameParams.gameYear++;
        this.grow();
        temple.godSpeaksToPlayer('newYear')
    },

    newForest: function () {
        this.forest = [];
        let index = 0;

        for (let col = 0; col < this.gameParams.columns; col++) {
            for (let row = 0; row < this.gameParams.rows; row++) {
                const theAge = Math.floor(2 * this.gameParams.yearsToAdult * Math.random());
                this.forest.push(new Tree(index, theAge));
                index++;
            }
        }
    },

    grow: function () {
        this.forest.forEach(tree => {
            if (tree.age > 0) {
                tree.age++;
            } else {
                if (Math.random() < tree.seedlingProbability) {
                    tree.age = 1;
                }
            }
        })
    },

    treeAgesArray: function () {
        let out = [];
        for (let i = 0; i < this.forest.length; i++) {
            out.push(this.forest[i].age);
        }
        return out;
    },


    processHarvest: function () {
        //  look at all players' requests, mark the appropriate trees
        for (playerName in this.markedTrees) {
            this.markedTrees[playerName].forEach(treeNumber => {
                this.forest[treeNumber].harvesters.push(playerName);
            })
        }

        this.forest.forEach(tree => {
            tree.harvestMe();
        })

        this.markedTrees = {};      //  blank these puppies
    },

    defaultGameParams: {
        gameYear: 2025,
        nPlayers: 1,
        balanceStart: 10000,
        adultTreePrice: 1000,
        rows: 5,
        columns: 6,
        yearsToAdult: 10,
        harvestLimit: 10,
        salary: 500,
        harvestCost: 200,
        seedlingProbability: 0.5,
        maxHarvest: 10,
    },

}


class Player {

    constructor(iName) {
        this.name = iName;
        this.balance = god.gameParams.balanceStart;
    }

    receives(amount) {
        this.balance += amount;
    }
}