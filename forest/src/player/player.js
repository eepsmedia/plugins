import * as Fire from "../common/fire.js"
import * as Localize from "../../strings/localize.js"
import * as Handlers from "./handlers.js"
import * as UI from "./ui.js"
import * as Temple from "../common/temple.js";

export let phase ;

export let me = {
    id: "",
    data: {
        id: null,
        handle: "",
        gameCode: "",
        balance: 0
    }
}

export let gameState = {
    year: 1967,
    forest: null,
    markedTrees: []
}

export async function doLogin() {
    const theHandle = document.getElementById("inputHandle").value;
    console.log(`logging in ${theHandle} as a player`);
    me.id = theHandle + Math.round(100000 * Math.random());
    me.data.handle = theHandle;
    me.data.id = me.id;
    phase = playerPhases.kEnteringGame;

    UI.update();
}

export async function doJoinGame() {
    await Temple.playerSpeaksToGod("join");
    phase = playerPhases.kWaitForStart;
    UI.update();
}

export async function doHarvest() {
    const harvestData = { one : 1, two : 42};
    phase = playerPhases.kWaitingForMarket;
    await Temple.playerSpeaksToGod("harvest", harvestData);
    UI.update();
}

export function doStartGame(contents) {
    console.log(`doStartGame, year ${gameState.year}`);
    phase = playerPhases.kMarkingTrees;

    me.data = {...contents.me};
    me.id = contents.me.id;
    gameState.forest = contents.forest;
    UI.update();
}

export function doNewYear(contents) {
    console.log(`doNewYear, year ${gameState.year}`);
    phase = playerPhases.kMarkingTrees;
    me.data = {...contents.me};
    gameState = {
        forest: contents.forest,
        year: contents.year,
        markedTrees: []
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

    phase = playerPhases.kBegin;

    UI.update();
    console.log(`player init complete`);
}


