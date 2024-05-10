import {update} from './ui.js';
import * as Fire from '../common/fire.js';
import * as God from './god.js';
import * as Game from './game.js';

export function initialize() {
    /*
        document.getElementById("buttonGodLogin").addEventListener('click', () => {
            godLogin()
    */
    document.getElementById("buttonGodLogin").addEventListener('click', godLogin);
    document.getElementById("buttonNewGame").addEventListener('click', newGame);
    document.getElementById("buttonStartGame").addEventListener('click', startGame);
    document.getElementById("buttonDoMarket").addEventListener('click', doMarket);

    console.log(`Handlers initialized`);
}

async function godLogin() {
    const theHandle = document.getElementById("inputHandle").value;
    console.log(`logging in ${theHandle} as God`);
    God.setGodData(theHandle);
}

function newGame() {
    const theName = "foo";
    console.log(`New game:  ${theName}`);
    God.doNewGame();
}

function startGame() {
    God.doStartGame();
}

function doMarket() {
    God.doMarket();
}

let processedMessages = [];

export  function gotAllMessages(theMessages) {
    console.log(`got all ${theMessages.length} message(s)...`);

    theMessages.forEach(async mSnap => {
        if (!processedMessages.includes(mSnap.id)) {
            processedMessages.push(mSnap.id);

            const m = mSnap.data;   //  m is now the Message structure data

            switch (m.subject) {
                case "join" :
                    console.log(`message to God: ${m.playerID} asks to join`);
                    God.doPlayerJoin(m.playerID, m.contents.handle);
                    break;

                case "harvest":
                    console.log(`${m.playerID} sent a harvest`);
                    God.doPlayerHarvest(m.playerID, m.contents);
                    break;

                default:
                    break;
            }
        }
    })


}