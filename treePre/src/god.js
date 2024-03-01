const god = {

    gameParams: {},
    gamePhase : 'nogame',   //  { nogame | recruit | play | debrief }
    waitingForOrdersFrom : [],
    gameNumber : 0,
    debriefInfo : {},

    initialize: function () {
    },

    addPlayer: function (iPlayer) {
        let thePlayerName = iPlayer.name;
        if (!singlePlayer) iPlayer.name = this.uniquePlayerName(iPlayer.name);

        nature.players[iPlayer.name] = iPlayer;

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
        nature.markedTrees[iPlayerName] = iTrees;

        const ix = this.waitingForOrdersFrom.indexOf(iPlayerName);
        if (ix === -1) {
            console.log(`could not find ${iPlayerName} in ${this.waitingForOrdersFrom}`);
        } else {
            this.waitingForOrdersFrom.splice(ix, 1);   //    remove it!
        }
        if (this.waitingForOrdersFrom.length === 0) {
            this.gamePhase = god.phases.kReadyForMarket;
        }
    },

    newGame: function () {
        this.gameNumber++;
        this.gamePhase = god.phases.kRecruit;
        this.gameParams = {...this.defaultGameParams};
        this.gameParams.year = (new Date()).getFullYear();
        this.gameParams.endingYear =
            this.gameParams.year + this.gameParams.durationMin
            + Math.round(Math.random() * this.gameParams.durationVar);
        nature.newForest();
        temple.godSpeaksToPlayer('newGame');
    },

    startPlay : function() {
        this.gamePhase = god.phases.kWaitingForOrders;
        this.waitingForOrdersFrom = Object.keys(nature.players);
        temple.godSpeaksToPlayer('newYear');        //  first year
    },

    endGame : function(reason) {
        this.gamePhase = god.phases.kDebrief;
        this.debriefInfo = {
            reason : reason
        }
        temple.godSpeaksToPlayer('endGame');
    },

    newYear : function() {
        nature.grow();
        this.gameParams.year++;
        temple.godSpeaksToPlayer('newYear');
        console.log(`****    New year ${this.gameParams.year}`);
    },

    endYear: async function () {
        const endGame = await nature.processHarvest();        //  last act of the old year
        temple.godSpeaksToPlayer('endYear');

        if (endGame.end) {
            this.endGame(endGame)
        } else {
            this.newYear();
        }
    },

    defaultGameParams: {
        year: 2025,
        endingYear: 0,
        durationMin : 18,
        durationVar : 7,
        balanceStart: 5000,
        harvestLimit: 10,
        salary: 1500,
        harvestCost: 100,
        seedlingProbability: 0.75,
        maxHarvest: 10,
        yearsToAdult: 10,
        adultTreePrice: 1000,
        minSalesAge : 4,
        forestDimensions: {
            rows: 3,
            columns: 10,
            cellWidth : 30,
            cellHeight : 50,
            ranFrac : 0.5
        }
    },

    phases : {
        kRecruit : "recruit",
        kPlay : "play",
        kNoGame : "nogame",
        kDebrief : "debrief",
        kReadyForMarket : "market",
        kWaitingForOrders : "collecting orders",
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