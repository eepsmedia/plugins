import * as Player from '../player/player.js';
import * as Game from '../god/game.js';
import * as Fire from '../common/fire.js';
import * as Localize from "../../strings/localize.js"


/**
 * moderates communication between the player and God.
 */

export async function playerSpeaksToGod(type, iContents = {}) {
    let message = null;
    let success = false;

    switch (type) {
        case "join":
            const tGameCode = document.getElementById("inputGameCode").value.toLowerCase();     //  important for iPad
            const exists = await Fire.getGameFromCode(tGameCode);

            if (exists) {
                message = new Message(
                    Player.me.id, true, Player.year, "join", {gameCode: tGameCode, handle: Player.me.data.handle}
                );
                Fire.subscribeToPlayerMessages(Player.me.id, tGameCode); //  so we'll know when the game starts
                success = true;
            } else {
                const theText = 
                console.log(`*** Game ${tGameCode} does not exist *** (temple)`);
                //  swal("oops!",`game "${tGameCode}" does not exist`,"error");
                swal({
                    title : Localize.getString("oops"),
                    text : Localize.getString("alerts.gameDoesNotExistText", tGameCode),
                    icon : "error"
                });
            }
            break;
        case "harvest":
            message = new Message(
                Player.me.id, true, Player.year, "harvest", iContents
            );
            success = true;
            break;

        default:
            break;
    }
    if (message) Fire.sendMessage(message.asObject());
    return success;
}

export function godSpeaksToPlayer(type, iPlayerID, iContents = {}) {
    let message;

    switch (type) {

        case 'startGame' :
            message = new Message(iPlayerID, false, Game.gameData.year + 1, 'startGame', iContents);
            break;

        case 'newYear' :
            message = new Message(iPlayerID, false, Game.gameData.year, 'newYear', iContents);
            break;

        case 'endYear' :
            message = new Message(iPlayerID, false, Game.gameData.year, 'endYear', iContents);
            break;

        case 'endGame':
            message = new Message(iPlayerID, false, Game.gameData.year, 'endGame', iContents);
            break;

        default:
            const theText = Localize.getString("alerts.badMessageType", type);
            swal({
                title : Localize.getString("oops"),
                text : theText,
                icon : 'error'
            });
            break;
    }

    Fire.sendMessage(message.asObject());
}