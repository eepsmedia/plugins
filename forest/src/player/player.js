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

    UI.update();
}

export async function doJoinGame() {
    const success = await Temple.playerSpeaksToGod("join");
    if (success) {
        phase = playerPhases.kWaitForStart;
    }
    UI.update();
}

export function doStartGame(contents) {
    phase = playerPhases.kMarkTrees;

    me.data = {...contents.me};
    me.id = contents.me.id;     //  where we learn what out ID is.
    forest = contents.forest;     //  the forest data!
    year = contents.year;
    gameData = contents.gameData

    ForestView.setParams(gameData);     //  includes forest dimensions
    ForestView.newForest(forest);

    console.log(`Game start! Got a forest with ${forest.length} trees.`)
    swal({
        title : "Game starts!",
        text : `The game has begun, it's ${year} and your ID is ${me.id}.`,
        icon : 'success'
    });
    UI.update();
}

export async function doHarvest() {
    phase = playerPhases.kWaitForMarket;
    await Temple.playerSpeaksToGod("harvest", markedTrees);

    //  chop down these trees and display the result even before the year is over.
    markedTrees.forEach(T => {
        const theTree = forest[T];
        theTree.age = 0;
        theTree.dim.h = 0;
        theTree.dim.w = 0;
    })

    UI.update();
}

export function doNewYear(contents) {
    console.log(`doNewYear, year ${year}`);
    phase = playerPhases.kMarkTrees;
    me.data = {...contents.me};     //  includes balance
    forest = contents.forest;
    year = contents.year;
    markedTrees =  [];

    //  annualReportData is an object with year, startingBalance, and lineItems.
    //  lineItems is an array. Each lineItem is an object with amount, reason, notes, balanceAfter.
    //  for tree income, notes is an object created in Tree.js with treeNo, totalValue, and harvesters (an Array)
    //  todo: we would not need this check if we had a separate endYear message.
    if (contents.me.currentFinance.year) {
        annualReportData[contents.me.currentFinance.year] = contents.me.currentFinance;
    }

    UI.update();
}

export function doEndGame(contents) {
    phase = playerPhases.kDebrief;
    UI.update();
}

export async function initialize() {
    console.log(`player init in progress`);

    await Fire.initialize();
    await Localize.initialize('en');
    await Handlers.initialize();
    await UI.initialize();

    phase = playerPhases.kBegin;

    UI.update();
    console.log(`player init complete`);
}


