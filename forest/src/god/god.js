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
    if (navigator.clipboard) {
        console.log('Clipboard API available');
    } else {
        console.log('Clipboard API NOT available');
    }

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

/**
 * Having completed a game, God resets to make a new game.
 * We keep God's handle; no need to make a new FB record.
 * God still has to make a new game, after which she will see players join.
 */
export function doResetGod() {
    phase = godPhases.kMakeGame;
    Game.resetAllData(); //  as if there's no game. Salient: erases Game.players.
    UI.update();
}

export async function doNewGame() {
    console.log(`god • doNewGame()()`);

    testGameNumber = Math.round(Math.random() * 1234567890123);     //      comment out for local testing
    const tGameCode = eepsWords.newGameCode(testGameNumber);
    testGameNumber++;

    console.log(`new game code: ${tGameCode}`);
    phase = godPhases.kRecruit;        //  we have a game, now we're recruiting players

    Game.makeNewGame(godData.handle, tGameCode);
    UI.update();
}

export async function doPlayerJoin(iID, iHandle) {
    console.log(`god • doPlayerJoin() • ${iID}`);

    const thePlayer = Game.makeNewPlayer(iID, iHandle);
    UI.update();
}

export async function doStartGame() {
    console.log(`god • doStartGame()`);
    phase = godPhases.kCollectMoves;    //  now we're looking for all players to submit moves

    await Game.startGame();
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

async function doEndYear(iEnd)   {
    console.log(`god • doEndYear()`);

    Game.endYear();

    if (iEnd.end) {
        doEndGame(iEnd);
    } else {
        doNewYear();
    }
}

function doEndGame(iEnd) {
    console.log(`god • doEndGame()`);

    phase = godPhases.kDebrief;
    Game.endGame(iEnd);
    UI.update();
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
    const lineCount = (theData.match(/\n/g) || []).length;

    try {
        await navigator.clipboard.writeText(theData);
        swal({
            icon : "info",
            title: Localize.getString("messages.titleCopyDone"),
            text: Localize.getString("messages.textCopyDone", lineCount)
        })
    } catch (error) {
        console.error(error.message);
    }
}


