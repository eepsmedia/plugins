const gameConfigs = {
    vanilla : {
        godHandle : "",
        gameCode : "",
        year: 2025,
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
    }
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

