import * as Fire from "../common/fire.js";
import * as Temple from "../common/temple.js";
import * as Nature from "./nature.js";

export let players = {};        //  object of Players keyed by id
export let waitingFor = [];

let currentTransactions = [];

export let gameData = {...gameConfigs.vanilla};   //  default, clone it!

export function makeNewGame( iGod, iCode ) {
    gameData.godHandle = iGod;
    gameData.gameCode = iCode;

    Fire.createFirebaseGameRecord(gameData);
}

export function startGame() {
    Nature.newForest();     //  make a new forest
    gameData.year = (new Date()).getFullYear() - 1;
    gameData.endingYear = gameData.year + gameData.durationMin + 5;     //  + Math.round(Math.random() * gameData.durationVar);

    for (const p in players) {
        const who = players[p];
        who.balance = gameData.startingBalance;
        tellPlayerOfStartGame(who);
    }

    newYear();      //  includes update
}

function tellPlayerOfStartGame(iWho) {
    const contents = {
        me : iWho.asObject() ,       //  includes the new balance
        year : gameData.year,
        forest : Nature.getForestDataForDisplay(),
        gameData : gameData
    }
    Temple.godSpeaksToPlayer('startGame', iWho.id, contents);
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
    console.log(`got harvest data in Data from ${iPlayerID}:  ${iHarvest}`);

    players[iPlayerID]["harvest"] = iHarvest;

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

    currentTransactions = [];

    //  object that includes the reason for ending a game, if it ends
    let endGame = {
        end : false,
        broke : [],
        time : null,
        meanBalance : null
    };

    //  look at all players' requests, have nature mark the appropriate trees

    for (const playerID in players) {
        const who = players[playerID];
        who.currentFinance = { year : gameData.year, startingBalance : who.balance, lineItems : [] };      //  start a new finance object

        const theHarvest = who.harvest;   //  this is an array of tree numbers
        theHarvest.forEach( treeID => {
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
        endGame.end = true;
        endGame.time = gameData.year;
    }

    endGame = implementAllTransactions(currentTransactions, endGame);

    //  calculate the mean balace...
    let balanceSum = 0;     //      balance of ALL players
    for (const p in players) {
        const who = players[p];
        balanceSum += who.balance;
        who.markedTrees = [];       //  blank them!
    }
    endGame.meanBalance = balanceSum / Object.keys(players).length;     //  for end-of-game information

    return endGame;
}

function implementAllTransactions(iTransactions, endGame) {

    iTransactions.forEach( TT => {
        const who = players[TT.playerID];
        who.balance += TT.amount;
        who.currentFinance.lineItems.push({
            amount : TT.amount, reason : TT.reason, notes : TT.notes, balanceAfter : who.balance
        })
        if (who.balance < 0) {
            endGame.end = true;
            console.log(`****    GAME OVER: ${thePlayer.playerID}} went bankrupt ****`);
            endGame.broke.push(thePlayer.playerID);

        }
    })

    return endGame;
}

function checkReadyForMarket() {
    let notYet = [];
    for (let pID in players) {
        const who = players[pID];
        if (!who.harvest) {
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
    }
}

export function doMarket() {
    processHarvest();
}

export function newYear() {
    Nature.grow();
    gameData.year++;

    for (let p in players) {
        const who = players[p];
        tellPlayerOfNewYear(who);
    }

    setForFreshYear();
    waitingFor = checkReadyForMarket();
}

function tellPlayerOfNewYear(iWho) {
    const contents = {
        year : gameData.year,
        me : iWho.asObject() ,       //  includes the new balance
        forest : Nature.getForestDataForDisplay()
    }
    Temple.godSpeaksToPlayer('newYear', iWho.id, contents);
}

/**
 * Called by God in response to a player join
 *
 * @param iID       the ID of the new player
 * @param iHandle   the new player's "handle"
 * @returns {Promise<boolean>}
 */
export async function makeNewPlayer ( iID, iHandle ) {

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


