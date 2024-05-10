import * as Fire from "../common/fire.js"
import * as Game from "./game.js"
import * as Localize from "../../strings/localize.js"
import * as Handlers from "./handlers.js"
import * as UI from "./ui.js"

export let godData = null;
export let phase;     //   no god yet

export async function initialize() {
    console.log(`init in progress`);

    await Fire.initialize();
    await Handlers.initialize();
    await Localize.initialize('en');
    phase = godPhases.kGodless;         //  need someone to log in
    UI.update();
}

export async function setGodData(iHandle) {
    godData = await Fire.setGodWithHandle(iHandle);
    phase = godPhases.kNoGame;     //      we have a God, but still no actual game.
    UI.update();
}

export async function doNewGame() {
    const tGameCode = eepsWords.newGameCode(47);
    console.log(`new game code: ${tGameCode}`);
    phase = godPhases.kRecruit;        //  we have a game, now we're recruiting players

    Game.makeNewGame(godData.handle, tGameCode);
    UI.update();
}

export function doPlayerJoin(iID, iHandle) {
    const result = Game.makeNewPlayer(iID, iHandle);
    UI.update();
}

export function doStartGame() {
    Game.startGame();
    phase = godPhases.kCollectingMoves;    //  now we're looking for all players to submit moves
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
    await Game.doMarket();
    await endYear();
    //  no update needed because we now call `endYear()`
}

async function endYear()   {
    Game.newYear();
    phase = godPhases.kCollectingMoves;
    UI.update();
}


