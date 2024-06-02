import * as UI from './ui.js';
//  import * as Fire from '../common/fire.js';
import * as God from './god.js';

//  import * as Game from './game.js';

export function initialize() {
    /*
        document.getElementById("buttonGodLogin").addEventListener('click', () => {
            godLogin()
    */
    document.getElementById("buttonGodLogin").addEventListener('click', godLogin);
    document.getElementById("buttonNewGame").addEventListener('click', newGame);
    document.getElementById("buttonStartGame").addEventListener('click', startGame);
    document.getElementById("buttonDoMarket").addEventListener('click', doMarket);
    document.getElementById("configurationMenu").addEventListener('change', doConfigChange);
    document.getElementById("buttonDebriefNewGame").addEventListener('click', godReset);

    // document.getElementById("menuExtras").addEventListener("change", doMenuExtras)
    document.getElementById("buttonCopyData").addEventListener("click", God.doCopyData)

    console.log(`Handlers initialized`);
}

async function godLogin() {
    const theHandle = document.getElementById("inputHandle").value;
    console.log(`logging in ${theHandle} as God`);
    God.setGodData(theHandle);
}

function godReset() {
    God.doResetGod();
}

function newGame() {
    God.doNewGame();
}

function startGame() {
    God.doStartGame();
}

function doMarket() {
    God.doMarket();
}

function doConfigChange() {
    UI.update();
}


function doMenuExtras() {
    const theMenu = document.getElementById("menuExtras");
    const theValue = theMenu.value;

    switch (theValue) {
        case "placeHolder":
            break;

        case "abandonGame":
            God.doAbandonGame();
            break;

        case "earlyMarket":
            God.doEarlyMarket();
            break;

        case  "copyData":
            God.doCopyData();
            break;

        default:
            swal({icon: "error", text: "bad item in extras menu"});
            break;
    }

    theMenu.value = "placeHolder";
}

let processedMessages = [];

export function gotAllMessages(theMessages) {
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