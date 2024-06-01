import * as Player from './player.js';
import * as Localize from "../../strings/localize.js"
import * as ForestView from "../common/forestView.js"
import * as Financials from './financials.js';


const financeDIV = document.getElementById("finance");
const headerDIV = document.getElementById("header");
const adviceDIV = document.getElementById("advice");
const debriefDIV = document.getElementById("debrief");
const forestStatusDIV = document.getElementById("forestStatus");

export let viewingFinance = false;

export async function initialize() {
    ForestView.initialize(d3.select("#forestSVG"));
}

export function update(iFinancial = false) {
    viewingFinance = iFinancial;

    headerDIV.innerHTML = makeHeader();
    adviceDIV.innerHTML = makeAdvice();
    forestStatusDIV.innerHTML = makeForestStatus();
    ForestView.redraw(Player.forest, Player.markedTrees);

    if (viewingFinance) {
        const anyFinancialData = Financials.update();
        if (!anyFinancialData) {
            viewingFinance = false;     //  no financials? Show the trees.
        }
    }

    if (Player.phase === playerPhases.kDebrief) {
        debriefDIV.innerHTML = makeDebriefGuts();
    }

    addSpecialHandlers();
    makeOtherTexts();
    setVisibility();
}

function makeHeader() {
    const myData = Player.me.data;
    const tGameCode = myData.gameCode;

    const tYear = Player.year > 2020 ? Player.year : "";
    const tBalance = isNaN(myData.balance) ? "" : `${Localize.getString('currency')}${Math.round(myData.balance)}`;
    const thePlayer = myData.handle ? `${myData.handle}` : ``;
    const theGame = tGameCode ? `&nbsp;<span class="pill">${tGameCode}</span>&nbsp;` : `no game yet`;
    const buttonFinance = `<input type='button' id='buttonFinance'></input>`;
    return `${thePlayer} ${tYear} ${tBalance} | ${theGame} (${Player.phase}) ${buttonFinance} `;

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
            out = Localize.getString("advice.debriefPlayer");
            break;
        default:
            out = "some advice might appear here!"
            break;
    }

    return out;

}

function makeForestStatus() {
    let out = "";
    if (Player.markedTrees.length) {
        out = Localize.getString("markedTreeList", Player.markedTrees.join(", "));
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

function makeDebriefGuts() {
    let out = `<h2>${Localize.getString("end.head")}</h2>`;
    out += "<p>" + Localize.getString("end.myBalance", Localize.getString("currency"), Math.round(Player.me.data.balance)) + "<br>"
    out += Localize.getString("end.meanBalance", Localize.getString("currency"), Math.round(Player.gameEndSummary.meanBalance)) + "</p>"
    out += "<p>" + Localize.getString("end.biomass", Math.round(Player.gameEndSummary.biomass)) + "<br>";
    out += Localize.getString("end.initialBiomass", Math.round(Player.gameEndSummary.initialBiomass))  + "</p>";

    out += Localize.getString("end.because");        //  the game ended because
    out += "<ul>";
    Player.gameEndSummary.broke.forEach(pb => {
        out += `<li>${Localize.getString("end.broke", pb)}</li>`;
    })
    if (Player.gameEndSummary.time) {
        out += `<li>${Localize.getString("end.time", Player.gameEndSummary.time)}</li>`;
    }
    out += "</ul>";
    return out;
}

function addSpecialHandlers() {
    document.getElementById("buttonFinance").addEventListener('click', () => {
        viewingFinance = !viewingFinance;
        update(viewingFinance);
    });
}


const visibility = {
    "begin" : {
        "header" : "flex",
        "advice" : "flex",
        "signin" : "flex",
        "getGame" : "none",
        "forestSVG" :  "none",
        "forestStatus" :  "none",
        "playGameControls" :  "none",
        "debrief" : "none",
    },
    "enteringGame" : {
        "header" : "flex",
        "advice" : "flex",
        "signin" : "none",
        "getGame" : "flex",
        "forestSVG" :  "none",
        "forestStatus" :  "none",
        "playGameControls" :  "none",
        "debrief" : "none",
    },
    "waitingForStart" : {
        "header" : "flex",
        "advice" : "flex",
        "signin" : "none",
        "getGame" : "none",
        "forestSVG" :  "none",
        "forestStatus" :  "none",
        "playGameControls" :  "none",
        "debrief" : "none",
    },
    "markingTrees" : {
        "header" : "flex",
        "advice" : "flex",
        "signin" : "none",
        "getGame" : "none",
        "forestSVG" :  "flex",
        "forestStatus" :  "flex",
        "playGameControls" :  "flex",
        "debrief" : "none",
    },
    "waitingForMarket" : {
        "header" : "flex",
        "advice" : "flex",
        "signin" : "none",
        "getGame" : "none",
        "forestSVG" :  "flex",
        "forestStatus" :  "flex",
        "playGameControls" :  "none",
        "debrief" : "none",
    },
    "debriefing" : {
        "header" : "flex",
        "advice" : "flex",
        "signin" : "none",
        "getGame" : "none",
        "forestSVG" :  "flex",
        "forestStatus" :  "flex",
        "playGameControls" :  "none",
        "debrief" : "block",
    }
}