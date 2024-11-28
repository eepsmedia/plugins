import * as Fire from "../common/fire.js"
import * as Localize from "../../strings/localize.js"
import * as Handlers from "./handlers.js"
import * as UI from "./ui.js"
import * as Temple from "../common/temple.js";
import * as ForestView from "../common/forestView.js"

export let phase ;

export let year = 1967;

export let markedTrees = [];

export let forest = [];

export let gameEndSummary = {};

let CSVsummary = "";        //      text in CSV format to be assembled here, then copied for pasting into CODAP etc

let biomass;

let gameData = {};

export let annualReportData = {};

export let debriefInfo = "debrief info goes here";

export let me = {
    id: "",
    data: {
        id: null,
        handle: "",
        gameCode: "",
        balance: 0
    }
}

export async function doLogin() {
    const theHandle = document.getElementById("inputHandle").value;
    console.log(`logging in ${theHandle} as a player`);
    me.id = theHandle + Math.round(100000 * Math.random());
    me.data.handle = theHandle;
    me.data.id = me.id;
    phase = playerPhases.kEnterGame;
    document.title = me.id;

    UI.update();
}

export async function doJoinGame() {
    const success = await Temple.playerSpeaksToGod("join");
    if (success) {
        phase = playerPhases.kWaitForStart;
    }
    UI.update();
}

/**
 * Receive a message to start the game.
 *
 * @param contents  has the information we need, including the forest
 */
export function doStartGame(contents) {
    console.log(`Player.doStartGame(contents)`);
    phase = playerPhases.kMarkTrees;

    me.data = {...contents.me};
    me.id = contents.me.id;     //  where we learn what out ID is.
    forest = contents.forest.trees;     //  the forest data!
    year = contents.year;
    gameData = contents.gameData;
    CSVsummary = Localize.getString("summaryTableHead");

    ForestView.setParams(gameData);     //  includes forest dimensions
    ForestView.newForest(forest);

    console.log(`Game start! Got a forest with ${forest.length} trees.`)
    swal({
        //  title : "Game starts!",
        title : Localize.getString("alerts.startGameTitle"),
        //  text : `The game has begun, it's ${year} and your ID is ${me.id}.`,
        text : Localize.getString("alerts.startGameMessage", year, me.id),
        icon : 'success'
    });

    document.getElementById("checkboxShowFinancialsOnNewYear").checked = true;  //  fix that checkbox
    UI.update();
}

function resetPlayerData() {
    annualReportData = {};      //  resets financial data
    markedTrees = [];
    forest = [];
}

/**
 * Having completed a game, the player resets. They keep their id and handle, but lose their
 * game code, so go back to that state.
 */
export function doResetPlayer() {
    phase = playerPhases.kEnterGame;
    resetPlayerData();
    document.getElementById("inputGameCode").value = "";
    UI.update();
}

export async function doHarvest() {
    phase = playerPhases.kWaitForMarket;
    await Temple.playerSpeaksToGod("harvest", markedTrees);

    UI.update();
}

export function doEndYear(contents) {

    me.data.balance = contents.me.balance;     //  update balance at end of year
    markedTrees =  [];

    //  annualReportData is an object with year, startingBalance, and lineItems.
    //  lineItems is an array. Each lineItem is an object with amount, reason, notes, balanceAfter.
    //  for tree income, notes is an object created in Tree.js with treeNo, totalValue, and harvesters (an Array)

    if (contents.me.currentFinance.year) {
        annualReportData[contents.me.currentFinance.year] = contents.me.currentFinance;
    }
    UI.update();
}

export function doNewYear(contents) {
    phase = playerPhases.kMarkTrees;

    me.data = {...contents.me};     //  includes balance
    forest = contents.forest.trees;
    biomass = contents.forest.biomass;
    year = contents.year;
    console.log(`Player•doNewYear(contents), year ${year}, biomass = ${biomass}`);

    const showFinancials = document.getElementById("checkboxShowFinancialsOnNewYear").checked;
    UI.update(showFinancials);
}

export function doEndGame(contents) {
    phase = playerPhases.kDebrief;

    me.data = {...contents.me};     //  includes balance
    gameEndSummary = contents.end;     //  from Game.gameEndSummary.
    CSVsummary = contents.CSVsummary;

    UI.update();
}

export async function initialize() {
    console.log(`player init in progress`);

    await Fire.initialize();

    await Localize.initialize(Localize.figureOutLanguage('en'));
    //  await Localize.initialize('en');

    await Handlers.initialize();
    await UI.initialize();

    phase = playerPhases.kBegin;

    UI.update();
    console.log(`player init complete`);
}

export function isThereCSVData() {
    return CSVsummary.includes("\n");
}

export async function doCopyData() {
    const theData = CSVsummary;
    const lineCount = (theData.match(/\n/g) || []).length;

    try {
        await navigator.clipboard.writeText(theData);
        swal({
            icon : "info",
            title: Localize.getString("alerts.titleCopyDone"),
            text: Localize.getString("alerts.textCopyDone", lineCount)
        })
    } catch (error) {
        console.error(error.message);
    }
}

