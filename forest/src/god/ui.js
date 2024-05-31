import * as God from './god.js';
import * as Game from './game.js';
import * as Nature from './nature.js';
import * as Player from "../player/player.js";
import * as Localize from "../../strings/localize.js";
import {gameEndSummary} from "./game.js";

const headerDIV = document.getElementById("header");
const headerGutsDIV = document.getElementById("headerGuts");
const adviceDIV = document.getElementById("advice");
const playersDIV = document.getElementById("players");
const debriefTextDIV = document.getElementById("debriefText");
const extrasMENU = document.getElementById("menuExtras");

export function initialize() {
    //  only do this once!
    document.getElementById("configurationMenu").innerHTML = makeConfigurationMenuGuts();

}

export function update() {
    headerGutsDIV.innerHTML = makeHeaderGuts();
    adviceDIV.innerHTML = makeAdvice();
    playersDIV.innerHTML = makePlayers();
    extrasMENU.innerHTML = makeExtrasMenu();

    if (God.phase === godPhases.kDebrief) {
        debriefTextDIV.innerHTML = makeDebriefGuts();
    }

    setVisibility();
}

function makeExtrasMenu() {
    let out = "";
    out += `<option value="placeHolder" selected>${Localize.getString("menu.extrasPlaceholder")}</option>`;
    out += `<option value="abandonGame">${Localize.getString("menu.itemAbandonGame")}</option>`;
    out += `<option value="earlyMarket">${Localize.getString("menu.itemEarlyMarket")}</option>`;
    out += `<option value="copyData">${Localize.getString("menu.itemCopyData")}</option>`;

    return out;
}

function setVisibility() {
    const theVis = visibility[God.phase];
    for (const eKey in theVis) {
        const vis = theVis[eKey];
        document.getElementById(eKey).style.display = vis;
    }
}

function makeHeaderGuts() {
    const me = God.godData;
    const tGame = Game.gameData;
    const god = me ? `${me.handle}` : ``;
    const year = isNaN(tGame.year) ? "" : tGame.year;
    const game = tGame.gameCode ? `<span class="pill">${tGame.gameCode}</span>` : ``;
    const biomass = Math.round(Game.gameData.biomass);
    return `${god} ${year} | ${God.phase} | biomass: ${biomass} ${game}`;
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
            out = Localize.getString("advice.debriefGod");
            break;
        default:
            out = "some advice might appear here!"
            break;
    }

    return out;

}

function makeDebriefGuts() {
    let out = `<h2>${Localize.getString("end.head")}</h2>`;
    out += "<p>" + Localize.getString("end.meanBalance", Localize.getString("currency"), Math.round(Game.gameEndSummary.meanBalance)) + "</p>"
    out += "<p>" + Localize.getString("end.biomass", Math.round(Game.gameEndSummary.biomass)) + "<br>";
    out += Localize.getString("end.initialBiomass", Math.round(Nature.initialBiomass)) + "</p>";
    out += Localize.getString("end.because");        //  the game ended because
    out += "<ul>";
    Game.gameEndSummary.broke.forEach(pb => {
        out += `<li>${Localize.getString("end.broke", pb)}</li>`;
    })
    if (Game.gameEndSummary.time) {
        out += `<li>${Localize.getString("end.time", Game.gameEndSummary.time)}</li>`;
    }
    out += "</ul>";
    return out;
}

function makeDebriefText(iInfo) {
    return "debrief text goes here";
}

function makePlayers() {
    let out = Localize.getString("noPlayersYet");

    if (Object.keys(Game.players).length > 0) {
        out = `<table class="tableOfPlayers"><tr><th>player</th><th>balance</th><th>harvest</th></tr>`;
        for (let p in Game.players) {
            const who = Game.players[p];
            const theBalance = Math.round(who.balance);
            const theHarvest = who.harvest.join(", ");      //  string version with nice spaces
            out += `<tr><td>${who.handle} (${who.id})</td><td>${theBalance}</td><td>${(who.harvest.length > 0) ? theHarvest : "-"}</td></tr>`;
        }
        out += "</table>"
        if (Game.waitingFor.length && God.phase === godPhases.kCollectMoves) {
            out += `Waiting for ${Game.waitingFor.join(", ")}`;
        }
    }
    return out;
}

function makeConfigurationMenuGuts() {
    let out = "";
    for (const config in gameConfigs) {
        out += `<option value="${config}">${Localize.getString(config)}</option> `;
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
        "debrief": "none"
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
        "debrief": "none"
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
        "debrief": "none"

    },
    "collectingMoves": {
        "header": "flex",
        "advice": "flex",
        "signin": "none",
        "getGame": "none",
        "startGameControls": "none",
        "playGameControls": "none",
        "players": "block",
        "trees": "flex",
        "debrief": "none"

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
        "debrief": "none"

    },
    "debriefing": {
        "header": "flex",
        "advice": "flex",
        "signin": "none",
        "getGame": "none",
        "startGameControls": "none",
        "playGameControls": "none",
        "players": "block",
        "trees": "flex",
        "debrief": "block"

    }
}
