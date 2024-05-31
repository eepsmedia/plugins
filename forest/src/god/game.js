import * as Fire from "../common/fire.js";
import * as Temple from "../common/temple.js";
import * as Nature from "./nature.js";

export let players = {};        //  object of Players keyed by id
export let waitingFor = [];

export let gameEndSummary = {};

let historicalSummary = {};

let currentTransactions = [];
let allTransactions = {};

export let gameData = {...gameConfigs["normalGameConfig"]};

export async function makeNewGame(iGod, iCode) {
    console.log(`game • makeNewGame()`);

    const config = document.getElementById("configurationMenu").value;
    gameData = {...gameConfigs[config]};
    gameData.godHandle = iGod;
    gameData.gameCode = iCode;
    await Fire.createFirebaseGameRecord(gameData);
    resetGameVariables();

    const oldPlayers = {...players};    //   shallow clone
    players = {};

    for (const pid in oldPlayers) {
        const who = oldPlayers[pid];
        makeNewPlayer(pid, who.handle);
    }

}

function resetGameVariables() {
    historicalSummary = {};
    currentTransactions = [];
    allTransactions = {};
    gameEndSummary = {};
    waitingFor = [];
}

export function startGame() {
    console.log(`game • startGame()`);

    const nPlayers = Object.keys(players).length;
    if (nPlayers > 9) {
        swal({icon: "error", "text" : `${nPlayers} is too many players for now!`});
    }
    const newDimensions = forestDimensions[nPlayers];
    gameData.forestDimensions.columns = newDimensions.w;
    gameData.forestDimensions.rows = newDimensions.h;

    gameData.initialBiomass = Nature.newForest();     //  make a new forest
    gameData.biomass = gameData.initialBiomass;
    gameData.year = (new Date()).getFullYear() - 1;
    gameData.endingYear = gameData.year + gameData.durationMin + Math.round(Math.random() * gameData.durationVar);

    historicalSummary[gameData.year] = {
        biomass : gameData.initialBiomass,
        meanBalance : gameData.startingBalance
    }

    for (const p in players) {
        const who = players[p];
        who.balance = gameData.startingBalance;
        tellPlayerOfStartGame(who);
        //newYear();      //  includes update
    }

    waitingFor = checkReadyForMarket();

}


function tellPlayerOfStartGame(iWho) {
    const contents = {
        me: iWho.asObject(),       //  includes the new balance
        year: gameData.year,
        forest: Nature.getForestDataForDisplay(),
        gameData: gameData
    }
    Temple.godSpeaksToPlayer('startGame', iWho.id, contents);
}

export function newYear() {
    console.log(`game • newYear()`);

    gameData.biomass = Nature.grow();
    gameData.year++;

    for (let p in players) {
        const who = players[p];
        tellPlayerOfNewYear(who);
    }

    setForFreshYear();
    waitingFor = checkReadyForMarket();
}

/**
 * A player has pressed the harvest button.
 * The harvest data is an array of tree indices in the Nature.forest array.
 * We put that info into the Player's "harvest" member.
 *
 * @param iPlayerID     ID of the Player
 * @param iHarvest      array of tree Indices.
 * @returns {*[]}
 */
export function recordHarvest(iPlayerID, iHarvest) {
    console.log(`    got harvest data in Data from ${iPlayerID}:  ${iHarvest}`);

    const who = players[iPlayerID];
    who.harvest = iHarvest;
    who.harvestDone = true;

    waitingFor = checkReadyForMarket();
    return waitingFor;
}

/**
 * At the end of the year,
 * actually cut down the trees and pay the players.
 * The data about which trees is stored in the Player objects in our `players` object.
 *
 * Meanwhile, test for whether the game is over. (Like if someone goes broke)
 *
 * @returns {Promise<{end: boolean}>}
 */
async function processHarvest() {
    console.log(`game • processHarvest()`);

    currentTransactions = [];

    //  object that includes the reason for ending a game, if it ends
    gameEndSummary = {
        end: false,
        broke: [],
        time: null,
        meanBalance: null,
        biomass : Nature.biomass,
        initialBiomass : gameData.initialBiomass,
    };

    console.log(`Harvesting start... BIOMASS = ${Nature.biomass}`);

    //  look at all players' requests, have nature mark the appropriate trees

    for (const playerID in players) {
        const who = players[playerID];
        who.currentFinance = {year: gameData.year, startingBalance: who.balance, lineItems: []};      //  start a new finance object

        const theHarvest = who.harvest;   //  this is an array of tree numbers
        theHarvest.forEach(treeID => {
            Nature.recordHarvestAtTree(playerID, treeID);
        })
    }

    //  harvest the trees, pay wages, receive income

    currentTransactions = Nature.harvestMarkedTrees();

    //  pay all salaries
    for (const pid in players) {
        const salary = new Transaction(
            pid, gameData.year, Nature.biomass, -gameData.salary, "salary"
        );
        currentTransactions.push(salary);
    }

    if (gameData.year >= gameData.endingYear) {
        gameEndSummary.end = true;
        gameEndSummary.time = gameData.year;
    }

    //  checks for end of game as well (players going broke)
    //  side effect: changes gameEndSummary.
    implementAndSortAllCurrentTransactions(currentTransactions);


    //  calculate the mean balance...
    let balanceSum = 0;     //      balance of ALL players
    for (const p in players) {
        const who = players[p];
        balanceSum += who.balance;
        who.markedTrees = [];       //  blank them!
    }
    gameEndSummary.meanBalance = balanceSum / Object.keys(players).length;     //  for end-of-game information

    //  allTransactions[gameData.year] = (currentTransactions);

    console.log(`Harvesting end... BIOMASS = ${Nature.biomass}`);
    return gameEndSummary;
}

function implementAndSortAllCurrentTransactions(iTransactions) {
    let thisYearSorted = {};

    for (const pID in players) {
        thisYearSorted[pID] = [];
    }

    iTransactions.forEach(TT => {

        //  this is to help split the transactions into separate objects, keyed by playerID
        const who = players[TT.playerID];
        thisYearSorted[who.id].push(TT);    //  push the transaction onto the appropriate Array

        //  now we push line items onto the player objects themselves (to be sent in the message)
        who.balance += TT.amount;
        who.currentFinance.lineItems.push({
            amount: TT.amount, reason: TT.reason, notes: TT.notes, balanceAfter: who.balance
        })
        if (who.balance < 0) {
            gameEndSummary.end = true;
            console.log(`****    GAME OVER: ${thePlayer.playerID}} went bankrupt ****`);
            gameEndSummary.broke.push(thePlayer.playerID);
        }
    })

    allTransactions[gameData.year] = thisYearSorted;
}


function checkReadyForMarket() {
    let notYet = [];
    for (let pID in players) {
        const who = players[pID];
        if (!who.harvestDone) {
            notYet.push(who);
        }
    }

    return notYet;
}

function setForFreshYear() {
    //  zero the harvests
    for (let p in players) {
        const who = players[p];
        who.harvest = [];
        who.harvestDone = false;    //  reset for next year

    }
}

export async function market() {
    console.log(`game • doMarket()`);

    return await processHarvest();     //  does processHarvest really need to be async? Does it matter?
}


export async function endYear() {
    console.log(`game • endYear()`);

    //  inform players of year end, giving them their financial data.

    for (let p in players) {
        const who = players[p];
        tellPlayerOfYearEnd(who);
    }

    //      file appropriate summary data

    historicalSummary[gameData.year] = {
        biomass : Nature.biomass,
        meanBalance : gameEndSummary.meanBalance
    }
}

function tellPlayerOfYearEnd(iWho) {
    const contents = {
        year: gameData.year,
        me: iWho.asObject(),       //  includes the new balance
    }
    Temple.godSpeaksToPlayer('endYear', iWho.id, contents);
}

function tellPlayerOfNewYear(iWho) {
    const contents = {
        year: gameData.year,
        me: iWho.asObject(),       //  includes the new balance
        forest: Nature.getForestDataForDisplay()
    }
    Temple.godSpeaksToPlayer('newYear', iWho.id, contents);
}

export function endGame(iEnd) {
    console.log(`game • endGame()`);

    for (let p in players) {
        const who = players[p];
        tellPlayerOfEndGame(who, iEnd);
    }
}

function tellPlayerOfEndGame(iWho, iEnd) {
    const contents = {
        year: gameData.year,
        me: iWho.asObject(),       //  includes the new balance
        forest: Nature.getForestDataForDisplay(),
        end : iEnd
    }
    Temple.godSpeaksToPlayer('endGame', iWho.id, contents);
}

/**
 * Called by God in response to a player join
 *
 * @param iID       the ID of the new player
 * @param iHandle   the new player's "handle"
 * @returns {Promise<boolean>}
 */
export async function makeNewPlayer(iID, iHandle) {
    console.log(`game • makeNewPlayer() • ${iHandle}`);

    const thePlayer = new Player(iID, iHandle);
    thePlayer.gameCode = gameData.gameCode;
    const result = await Fire.godAddsPlayer(thePlayer);   //  entire player, not handle, add to DB

    if (result) {
        players[iID] = thePlayer;        //  add to our internal list
    } else {
        console.log(`*** TROUBLE adding ${iHandle} to ${gameData.gameCode}`);
    }
    return result;
}

export function getDataForCODAP() {
    let out = "year,biomass,meanBalance\n";

    for (const year in historicalSummary) {
        const theSummary = historicalSummary[year];
        out += `${year},${theSummary.biomass},${theSummary.meanBalance}\n`;
    }
    return out;
}

