import * as Player from './player.js';
import * as Localize from "../../strings/localize.js"
import * as ForestView from "../common/forestView.js"
import * as Financials from './financials.js';


const financeDIV = document.getElementById("finance");
const headerDIV = document.getElementById("header");
const adviceDIV = document.getElementById("advice");

let viewingFinance = false;

export async function initialize() {

    ForestView.initialize(d3.select("#forestSVG"));

}

export function update() {
    headerDIV.innerHTML = makeHeader();
    adviceDIV.innerHTML = makeAdvice();
    ForestView.redraw(Player.forest, Player.markedTrees);
    Financials.update();

    addSpecialHandlers();
    makeOtherTexts();
    setVisibility();
}

function makeHeader() {
    const myData = Player.me.data;
    const tGameCode = myData.gameCode;

    const tYear = Player.year > 2020 ? Player.year : "";
    const tBalance = isNaN(myData.balance) ? "" : `${Localize.getString('currency')}${Financials.numberToString(myData.balance)}`;

    const thePlayer = myData.handle ? `${myData.handle}` : ``;
    const theGame = tGameCode ? `&nbsp;<span class="pill">${tGameCode}</span>&nbsp;` : `no game yet`;
    const buttonFinance = `<input type='button' id='buttonFinance'></input>`;
    return `${thePlayer} ${tYear} ${tBalance} | ${theGame} (${Player.phase}) ${buttonFinance}`;

}

function makeAdvice() {
    let out;
    let buttonTitle;

    switch (Player.phase) {
        case playerPhases.kBegin:
            buttonTitle = Localize.getString("staticStrings.buttonPlayerLogin");
            out = Localize.getString("advice.begin", buttonTitle);
            break;
        case playerPhases.kEnterGame:
            buttonTitle = Localize.getString("staticStrings.buttonJoinGame");
            out = Localize.getString("advice.enteringGame", buttonTitle);
            break;
        case playerPhases.kWaitForStart:
            out = Localize.getString("advice.waitingForStart");
            break;
        case playerPhases.kMarkTrees:
            out = Localize.getString("advice.markingTrees");
            break;
        case playerPhases.kWaitForMarket:
            out = Localize.getString("advice.waitingForMarket");
            break;
        case playerPhases.kDebrief:
            out = makeDebriefText(Player.debriefInfo);
            break;
        default:
            out = "some advice might appear here!"
            break;
    }

    return out;

}

function makeOtherTexts() {
    const markedL = Player.markedTrees.length;
    const harvestText = markedL === 1 ?
        Localize.getString("harvestOneTree") :
        Localize.getString("harvestNTrees", markedL.toString());
    document.getElementById("buttonHarvest").value = harvestText;

    const financeLabel = viewingFinance ? Localize.getString("viewTrees") : Localize.getString("viewFinance");
    document.getElementById("buttonFinance").value = financeLabel;
}

function makeDebriefText(iInfo) {
    return "debrief text goes here";
}

function setVisibility() {
    const theVis = visibility[Player.phase];

    if (viewingFinance) {
        for (const eKey in theVis) {
            document.getElementById(eKey).style.display = "none";
        }
        headerDIV.style.display = "flex";
        financeDIV.style.display = "block";
    } else {
        for (const eKey in theVis) {
            const vis = theVis[eKey];
            document.getElementById(eKey).style.display = vis;
        }
        financeDIV.style.display = "none";
    }
}

function addSpecialHandlers() {
    document.getElementById("buttonFinance").addEventListener('click', () => {
        viewingFinance = !viewingFinance;
        update();
    });
}


const visibility = {
    "begin" : {
        "header" : "flex",
        "advice" : "flex",
        "signin" : "flex",
        "getGame" : "none",
        "forestSVG" :  "none",
        "forest" :  "none",
        "playGameControls" :  "none",

    },
    "enteringGame" : {
        "header" : "flex",
        "advice" : "flex",
        "signin" : "none",
        "getGame" : "flex",
        "forestSVG" :  "none",
        "forest" :  "none",
        "playGameControls" :  "none",

    },
    "waitingForStart" : {
        "header" : "flex",
        "advice" : "flex",
        "signin" : "none",
        "getGame" : "none",
        "forestSVG" :  "none",
        "forest" :  "none",
        "playGameControls" :  "none",

    },
    "markingTrees" : {
        "header" : "flex",
        "advice" : "flex",
        "signin" : "none",
        "getGame" : "none",
        "forestSVG" :  "flex",
        "forest" :  "flex",
        "playGameControls" :  "flex",

    },
    "waitingForMarket" : {
        "header" : "flex",
        "advice" : "flex",
        "signin" : "none",
        "getGame" : "none",
        "forestSVG" :  "flex",
        "forest" :  "flex",
        "playGameControls" :  "none",
    },
    "debriefing" : {
        "header" : "flex",
        "advice" : "flex",
        "signin" : "none",
        "getGame" : "none",
        "forestSVG" :  "flex",
        "forest" :  "flex",
        "playGameControls" :  "none",

    }
}