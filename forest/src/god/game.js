import * as Fire from "../common/fire.js";
import * as Temple from "../common/temple.js";

export let players = {};        //  object of Players keyed by id
export let waitingFor = [];

export let forest = [{one : 1}, {two : 2}];

export let gameData = {...gameConfigs.vanilla};   //  default, clone it!

export function makeNewGame( iGod, iCode ) {
    gameData.godHandle = iGod;
    gameData.gameCode = iCode;

    Fire.createFirebaseGameRecord(gameData);
}

export function startGame() {
    gameData.year = (new Date()).getFullYear() - 1;
    gameData.endingYear = gameData.year + gameData.durationMin + 5;     //  + Math.round(Math.random() * this.gameParams.durationVar);

    for (const p in players) {
        const who = players[p];
        who.balance = gameData.startingBalance;
    }

    newYear();      //  includes update
}

export function recordHarvest(iPlayerID, iHarvest) {
    console.log(`got harvest data in Data from ${iPlayerID}`);

    players[iPlayerID]["harvest"] = iHarvest;
    waitingFor = checkReadyForMarket();
    return waitingFor;
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
        who.harvest = null;
    }
}

export function doMarket() {
    for (let p in players) {
        const who = players[p];
        who.balance += 1000;
    }
}

export function newYear() {
    //  todo: grow the forest

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
        forest : forest,
        year : gameData.year,
        me : iWho.asObject()        //  includes the new balance
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


