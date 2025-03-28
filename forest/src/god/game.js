import * as Fire from "../common/fire.js";
import * as Temple from "../common/temple.js";
import * as Nature from "./nature.js";
import * as Localize from "../../strings/localize.js";

export let players = {};        //  object of Players keyed by id
export let waitingFor = [];
export let gameEndSummary = {};

let CSVsummary = "";        //      text in CSV format to be assembled here, then copied for pasting into CODAP etc

let currentTransactions = [];
let allTransactions = {};

export let gameData = {...gameConfigs["normalGameConfig"]};

export async function makeNewGame(iGod, iCode) {
    console.log(`game • makeNewGame()`);

    resetAllData();
    const config = document.getElementById("configurationMenu").value;
    gameData = {...gameConfigs[config]};
    gameData.godHandle = iGod;
    gameData.gameCode = iCode;
    await Fire.createFirebaseGameRecord(gameData);
}

export function resetAllData() {
    gameData = {...gameConfigs["normalGameConfig"]};
    players = {};
    CSVsummary = Localize.getString("summaryTableHead");
    currentTransactions = [];
    allTransactions = {};
    gameEndSummary = {};
    waitingFor = [];
}


export async function startGame() {
    console.log(`game • startGame()`);

    const nPlayers = Object.keys(players).length;
    if (nPlayers > 9) {
        //  const theText = `${nPlayers} is too many players for now!`
        const theText = Localize.getString("alerts.tooManyPlayersText", nPlayers);
        swal({icon: "error", title: Localize.getString("oops"), text : theText});
    }
    const newDimensions = forestDimensions[nPlayers];
    gameData.forestDimensions.columns = newDimensions.w;
    gameData.forestDimensions.rows = newDimensions.h;

    gameData.initialBiomass = Nature.newForest();     //  make a new forest
    gameData.biomass = gameData.initialBiomass;
    gameData.year = (new Date()).getFullYear() - 1;
    gameData.endingYear = gameData.year + gameData.durationMin + Math.round(Math.random() * gameData.durationVar);

    //  finish installing all pre-start data for each player
    for (const p in players) {
        const who = players[p];
        who.balance = gameData.startingBalance;
        gameEndSummary.meanBalance = who.balance;
    }

    //  record the pre-start data for posterity
    await Fire.updateGameWithPlayerList(gameData.gameCode, players);
    CSVsummary += makeCSVforAllPlayers();

    //  now set the year to the first real year of the game
    gameData.year++;    //  advance to new year (without calling newYear() which grows the forest; don't want that.

    //  tell all players and give them the starting information
    for (const p in players) {
        const who = players[p];
        tellPlayerOfStartGame(who);
    }

    //  make sure we're waiting for everybody!
    waitingFor = checkReadyForMarket();

}

function makeCSVforAllPlayers() {
    let out = "";
    for (const p in players) {
        const who = players[p];
        out += "\n" + getOneCSVSummaryLine(who);
    }
    return out;
}

export function newYear() {
    console.log(`game • newYear()`);

    gameData.year++;

    for (let p in players) {
        const who = players[p];
        who.year = gameData.year;   //  update the player's year
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
            console.log(`****    GAME OVER: ${who.id}} went bankrupt ****`);
            gameEndSummary.broke.push(who.id);
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
    gameData.biomass = Nature.grow();
    console.log(`game • endYear() for ${gameData.year} (biomass = ${Nature.biomass} or ${gameData.biomass}`);

    //  inform players of year end, giving them their financial data.

    for (let p in players) {
        tellPlayerOfYearEnd(players[p]);
    }

    CSVsummary += makeCSVforAllPlayers();       //      update CODAP data
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
    Fire.updateGameWithPlayerList(gameData.gameCode, players);  //  did not await this
}

function tellPlayerOfEndGame(iWho, iEnd) {
    const contents = {
        year: gameData.year,
        me: iWho.asObject(),       //  includes the new balance
        forest: Nature.getForestDataForDisplay(),
        end : iEnd,
        CSVsummary : CSVsummary
    }
    Temple.godSpeaksToPlayer('endGame', iWho.id, contents);
}

/**
 * Called by God in response to a player join
 *
 * @param iID       the ID of the new player
 * @param iHandle   the new player's "handle"
 * @returns {Player}    the new Player instance
 */
export async function makeNewPlayer(iID, iHandle) {
    console.log(`game • makeNewPlayer() • ${iHandle}`);

    const thePlayer = new Player(iID, iHandle);
    thePlayer.gameCode = gameData.gameCode;
    players[iID] = thePlayer;        //  add to our internal list

    return thePlayer;
}

function getOneCSVSummaryLine(player) {
    const theLine = [
        gameData.year,
        gameData.biomass,
        gameEndSummary.meanBalance,
        player.id,
        player.harvest.length,
        player.balance
    ]
    return theLine.join(", ");      //      comma-separated values
}

export function isThereCSVData() {
    return CSVsummary.includes("\n");
}

export function getDataForCODAP() {
    return CSVsummary;
}


