import * as God from './god.js';
import * as Game from './game.js';
import * as Player from "../player/player.js";
import * as Localize from "../../strings/localize.js";

const headerDIV = document.getElementById("header");
const adviceDIV = document.getElementById("advice");
const playersDIV = document.getElementById("players");

export function initialize() {

}

export function update() {
    headerDIV.innerHTML = makeHeader();
    adviceDIV.innerHTML = makeAdvice();
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
    const god = me ? `${me.handle}` : ``;
    const year = isNaN(tGame.year) ? "" : tGame.year;
    const game = tGame.gameCode ? `<span class="pill">${tGame.gameCode}</span>` : ``;
    return `${god} ${year} | ${God.phase} ${game}`;
}

function makeAdvice() {
    let out;
    let buttonTitle;

    switch (God.phase) {
        case godPhases.kBegin:
            buttonTitle = Localize.getString("staticStrings.buttonGodLogin");
            out = Localize.getString("advice.begin", buttonTitle);
            break;
        case godPhases.kMakeGame:
            buttonTitle = Localize.getString("staticStrings.buttonNewGame");
            out = Localize.getString("advice.makingGame", buttonTitle);
            break;
        case godPhases.kRecruit:
            buttonTitle = Localize.getString("staticStrings.buttonStartGame");
            out = Localize.getString("advice.recruiting", buttonTitle);
            break;
        case godPhases.kCollectMoves:
            out = Localize.getString("advice.collectingMoves");
            break;
        case godPhases.kReadyForMarket:
            buttonTitle = Localize.getString("staticStrings.buttonDoMarket");
            out = Localize.getString("advice.readyForMarket", buttonTitle);
            break;
        case godPhases.kDebrief:
            out = makeDebriefText(Player.debriefInfo);
            break;
        default:
            out = "some advice might appear here!"
            break;
    }

    return out;

}

function makeDebriefText(iInfo) {
    return "debrief text goes here";
}

function makePlayers() {
    let out = Localize.getString("noPlayersYet");

    if (Object.keys(Game.players).length > 0) {
        out = `Players:<br>`;
        out += `<table class="tableOfPlayers"><tr><th>player</th><th>balance</th><th>harvest</th></tr>`;
        for (let p in Game.players) {
            const who = Game.players[p];
            const theBalance = numberToString(who.balance);
            const theHarvest = who.harvest.join(", ");      //  string version with nice spaces
            out += `<tr><td>${who.handle} (${who.id})</td><td>${theBalance}</td><td>${(who.harvest) ? theHarvest : "-"}</td></tr>`;
        }
        out += "</table>"
        if (Game.waitingFor.length) {

            out += `Waiting for ${Game.waitingFor.join(", ")}`;

        } else {
            out += `Not waiting for players.`;
        }
    }
    return out;
}

function numberToString(iValue, iFigs = 2) {
    let out;
    let multiplier = 1;
    let suffix = "";
    let exponential = false;

    if (iValue === "" || iValue === null || typeof iValue === "undefined") {
        out = "";
    } else if (iValue === 0) {
        out = "0";
    } else {
        if (Math.abs(iValue) > 1.0e15) {
            exponential = true;
        } else if (Math.abs(iValue) < 1.0e-4) {
            exponential = true;
        } else if (Math.abs(iValue) > 1.0e10) {
            multiplier = 1.0e9;
            iValue /= multiplier;
            suffix = " B";
        } else if (Math.abs(iValue) > 1.0e7) {
            multiplier = 1.0e6;
            iValue /= multiplier;
            suffix = " M";
        }
        out = new Intl.NumberFormat(
            God.theLang,
            {maximumSignificantDigits: iFigs, useGrouping: false}
        ).format(iValue);

        if (exponential) {
            out = Number.parseFloat(iValue).toExponential(iFigs);
        }
    }
    return `${out}${suffix}`;       //  empty if null or empty
}

const visibility = {
    "begin": {
        "header": "flex",
        "advice": "flex",
        "signin": "flex",
        "getGame": "none",
        "startGameControls": "none",
        "playGameControls": "none",
        "players": "none",
        "trees": "none",
    },
    "makingGame": {
        "header": "flex",
        "advice": "flex",
        "signin": "none",
        "getGame": "flex",
        "startGameControls": "none",
        "playGameControls": "none",
        "players": "none",
        "trees": "none",
    },
    "recruiting": {
        "header": "flex",
        "advice": "flex",
        "signin": "none",
        "getGame": "none",
        "startGameControls": "flex",
        "playGameControls": "none",
        "players": "block",
        "trees": "none",

    },
    "collecting": {
        "header": "flex",
        "advice": "flex",
        "signin": "none",
        "getGame": "none",
        "startGameControls": "none",
        "playGameControls": "flex",
        "players": "block",
        "trees": "flex",

    },
    "readyForMarket": {
        "header": "flex",
        "advice": "flex",
        "signin": "none",
        "getGame": "none",
        "startGameControls": "none",
        "playGameControls": "flex",
        "players": "block",
        "trees": "flex",

    },
    "debriefing": {
        "header": "flex",
        "advice": "flex",
        "signin": "none",
        "getGame": "flex",
        "startGameControls": "none",
        "playGameControls": "flex",
        "players": "block",
        "trees": "flex",

    }
}
