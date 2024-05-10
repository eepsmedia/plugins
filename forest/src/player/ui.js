import * as Player from './player.js';
import * as Localize from "../../strings/localize.js"

const headerDIV = document.getElementById("header");

export function update() {
    headerDIV.innerHTML = makeHeader();
    setVisibility();
}

function makeHeader() {
    const myData = Player.me.data;
    const tGameCode = myData.gameCode;

    const tYear = Player.gameState.year > 2020 ? Player.gameState.year : "";
    const tBalance = isNaN(myData.balance) ? "" : `${Localize.getString('currency')}${myData.balance}`;

    const thePlayer = myData.handle ? `${myData.handle}` : `sign in with your handle`;
    const theGame = tGameCode ? `<span class="pill">${tGameCode}</span>` : `no game yet`;
    return `${thePlayer} ${tYear} ${tBalance} | ${Player.phase} ${theGame}`;
}

function setVisibility() {
    const theVis = visibility[Player.phase];
    for (const eKey in theVis) {
        const vis = theVis[eKey];
        document.getElementById(eKey).style.display = vis;
    }
}

const visibility = {
    "begin" : {
        "header" : "flex",
        "signin" : "flex",
        "getGame" : "none",
        "trees" :  "none",
        "playGameControls" :  "none",

    },
    "entering game" : {
        "header" : "flex",
        "signin" : "none",
        "getGame" : "flex",
        "trees" :  "none",
        "playGameControls" :  "none",

    },
    "wait for start" : {
        "header" : "flex",
        "signin" : "none",
        "getGame" : "none",
        "trees" :  "none",
        "playGameControls" :  "none",

    },
    "marking trees" : {
        "header" : "flex",
        "signin" : "none",
        "getGame" : "none",
        "trees" :  "flex",
        "playGameControls" :  "flex",

    },
    "waiting for market" : {
        "header" : "flex",
        "signin" : "none",
        "getGame" : "none",
        "trees" :  "flex",
        "playGameControls" :  "none",
    },
    "debrief" : {
        "header" : "flex",
        "signin" : "none",
        "getGame" : "none",
        "trees" :  "flex",
        "playGameControls" :  "none",

    }
}