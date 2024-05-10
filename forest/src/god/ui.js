import * as God from './god.js';
import * as Game from './game.js';

const headerDIV = document.getElementById("header");
const playersDIV = document.getElementById("players");

export function initialize() {

}

export function update() {
    headerDIV.innerHTML = makeHeader();
    playersDIV.innerHTML = makePlayers();

    setVisibility();
}

function setVisibility() {
    const theVis = visibility[God.phase];
    for (const eKey in theVis) {
        const vis = theVis[eKey];
        document.getElementById(eKey).style.display = vis;
    }
}

function makeHeader() {
    const me = God.godData;
    const tGame = Game.gameData;
    const god = me ? `${me.handle}` : `sign in with your handle`;
    const game = tGame.gameCode ? `<span class="pill">${tGame.gameCode}</span>` : ``;
    const year = isNaN(tGame.year) ? "" : tGame.year;
    return `${god} ${year} | ${God.phase} ${game}`;
}

function makePlayers() {
    let out = `Players:<br>`;
    for (let p in Game.players) {
        const who = Game.players[p];
        out += `  ${who.handle} has ${who.balance}  ${(who.harvest) ? "*" : "-"}<br>`;
    }
    out += `Waiting for ${Game.waitingFor.join(", ")}`;
    return out;
}

const visibility = {
    "no god yet" : {
        "header" : "flex",
        "signin" : "flex",
        "getGame" : "none",
        "startGameControls" : "none",
        "playGameControls" : "none",
        "players" :  "none",
        "trees" :  "none",
    },
    "making game" : {
        "header" : "flex",
        "signin" : "none",
        "getGame" : "flex",
        "startGameControls" : "none",
        "playGameControls" : "none",
        "players" :  "none",
        "trees" :  "none",
    },
    "recruiting" : {
        "header" : "flex",
        "signin" : "none",
        "getGame" : "none",
        "startGameControls" : "flex",
        "playGameControls" : "none",
        "players" :  "flex",
        "trees" :  "none",

    },
    "collecting" : {
        "header" : "flex",
        "signin" : "none",
        "getGame" : "none",
        "startGameControls" : "none",
        "playGameControls" : "flex",
        "players" :  "flex",
        "trees" :  "flex",

    },
    "ready for market" : {
        "header" : "flex",
        "signin" : "none",
        "getGame" : "none",
        "startGameControls" : "none",
        "playGameControls" : "flex",
        "players" :  "flex",
        "trees" :  "flex",

    },
    "debrief" : {
        "header" : "flex",
        "signin" : "none",
        "getGame" : "flex",
        "startGameControls" : "none",
        "playGameControls" : "flex",
        "players" :  "flex",
        "trees" :  "flex",

    }
}
