const gameConfigs = {
    normalGameConfig : {
        godHandle : "",
        gameCode : "",
        year: 2025,
        biomass : 0,
        initialBiomass : 0,
        endingYear: 0,
        durationMin : 18,
        durationVar : 7,
        startingBalance: 5000,
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
    quickGameConfig : {
        godHandle : "",
        gameCode : "",
        year: 2025,
        biomass : 0,
        initialBiomass : 0,
        endingYear: 0,
        durationMin : 2,
        durationVar : 0,
        startingBalance: 5000,
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
    }
}

const forestDimensions = {
    1 : {w : 10, h: 3},
    2 : {w : 12, h : 5},
    3 : {w : 15, h : 6},
    4 : {w : 15, h : 8},        //      120
    5 : {w : 19, h : 8},        //      152
    6 : {w : 20, h : 9},
    7 : {w : 21, h : 10},
    8 : {w : 24, h : 10},       //      240
    9 : {w : 27, h : 10}
}

const playerPhases = {
    kBegin : "begin",
    kEnterGame : "enteringGame",
    kWaitForStart : "waitingForStart",
    kMarkTrees : "markingTrees",
    kWaitForMarket : "waitingForMarket",
    kDebrief: "debriefing",
}

const godPhases = {
    kBegin: "begin",
    kMakeGame: "makingGame",
    kRecruit: "recruiting",
    kCollectMoves: "collectingMoves",
    kReadyForMarket: "readyForMarket",
    kDebrief: "debriefing",
}

