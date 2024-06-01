//  import * as Temple from '../common/temple.js';
import * as Player from './player.js';
import * as Financials from './financials.js';
//  import * as UI from './ui.js';
//      import * as Fire from "../common/fire.js";

export function initialize() {

    document.getElementById("buttonPlayerLogin").addEventListener('click', playerLogin);
    document.getElementById("buttonJoinGame").addEventListener('click', joinGame);
    document.getElementById("buttonHarvest").addEventListener('click', harvest);
    document.getElementById("buttonDebriefNewGame").addEventListener('click', playerResetPlayer);

    document.getElementById("menuFinancialYears").addEventListener('change', Financials.onSelectYear);

    console.log(`Handlers initialized`);
}

function playerResetPlayer() {
    Player.doResetPlayer();
}

async function playerLogin() {
    Player.doLogin();
}

async function joinGame() {
    Player.doJoinGame();
}


async function harvest() {
    Player.doHarvest();
}

let processedMessages = [];

export function gotAllMessages(theMessages) {
    console.log(`player got all ${theMessages.length} message(s)...`);

    theMessages.forEach(async mSnapData => {

        //  look only at new messages...
        if (!processedMessages.includes(mSnapData.id)) {
            processedMessages.push(mSnapData.id);

            const m = mSnapData.data;   //  already in object form

            switch (m.subject) {
                case "startGame":
                    Player.doStartGame(m.contents);
                    break;

                case "endGame":
                    Player.doEndGame(m.contents);
                    break;

                case 'newYear':
                    Player.doNewYear(m.contents);
                    break;

                case 'endYear':
                    Player.doEndYear(m.contents);
                    break;

                default:
                    break;
            }
        }
    })
}