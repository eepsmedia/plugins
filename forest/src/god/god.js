import * as Fire from "../common/fire.js"
import * as Game from "./game.js"
import * as Localize from "../../strings/localize.js"
import * as Handlers from "./handlers.js"
import * as UI from "./ui.js"

let testGameNumber = 47;

export let godData = null;
export let phase;     //   no god yet

export let theLang = 'en';

export async function initialize() {
    console.log(`god • init in progress`);

    theLang = Localize.figureOutLanguage(theLang);

    await Fire.initialize();
    await Handlers.initialize();
    await Localize.initialize('en');
    await UI.initialize();
    phase = godPhases.kBegin;         //  need someone to log in
    UI.update();
}

export async function setGodData(iHandle) {
    godData = await Fire.setGodWithHandle(iHandle);
    phase = godPhases.kMakeGame;     //      we have a God, but still no actual game.
    UI.update();
}

export async function doNewGame() {
    console.log(`god • doNewGame()()`);

    const tGameCode = eepsWords.newGameCode(testGameNumber);
    testGameNumber++;

    console.log(`new game code: ${tGameCode}`);
    phase = godPhases.kRecruit;        //  we have a game, now we're recruiting players

    Game.makeNewGame(godData.handle, tGameCode);
    UI.update();
}

export async function doPlayerJoin(iID, iHandle) {
    console.log(`god • doPlayerJoin() • ${iID}`);

    const result = await Game.makeNewPlayer(iID, iHandle);
    UI.update();
}

export function doStartGame() {
    console.log(`god • doStartGame()`);

    Game.startGame();
    //  doNewYear();    //  includes update
    UI.update();
}

export function doNewYear() {
    console.log(`god • doNewYear()`);

    phase = godPhases.kCollectMoves;    //  now we're looking for all players to submit moves
    Game.newYear();
    UI.update();
}

export function doPlayerHarvest(id, contents) {
    const waitingFor = Game.recordHarvest(id, contents);
    if (waitingFor.length === 0) {
        phase = godPhases.kReadyForMarket;
    }

    UI.update();
}


export async function doMarket() {
    console.log(`god • doMarket()`);

    const end = await Game.market();
    await doEndYear(end);
    //  no update needed because we now call `endYear()`
}

function doEndGame(iEnd) {
    console.log(`god • doEndGame()`);

    phase = godPhases.kDebrief;
    Game.endGame(iEnd);
    UI.update();
}

async function doEndYear(iEnd)   {
    console.log(`god • doEndYear()`);

    Game.endYear();

    if (iEnd.end) {
        doEndGame(iEnd);
    } else {
        doNewYear();
    }
}

export async function doAbandonGame() {
    console.log(`Abandoning game `);
}

export async function doEarlyMarket() {
    console.log(`Early market`);
}

export async function doCopyData() {
    console.log("copying god data to clipboard");
    const theData = Game.getDataForCODAP();
    try {
        await navigator.clipboard.writeText(theData);
    } catch (error) {
        console.error(error.message);
    }
}

