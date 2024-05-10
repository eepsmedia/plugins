import * as Player from '../player/player.js';
import * as God from '../god/god.js';
import * as Game from '../god/game.js';
import * as Fire from '../common/fire.js';
import {subscribeToPlayerMessages} from "../common/fire.js";


/**
 * moderates communication between the player and God.
 */

export async function playerSpeaksToGod(type, iContents = {}) {
    let message = null;

    switch (type) {
        case "join":
            const tGameCode = document.getElementById("inputGameCode").value;
            const exists = await Fire.getGameFromCode(tGameCode);

            if (exists) {
                message = new Message(
                    Player.me.id, true, Player.gameState.year, "join", {gameCode: tGameCode, handle: Player.me.data.handle}
                );
                subscribeToPlayerMessages(Player.me.id, tGameCode); //  so we'll know when the game starts

            } else {
                console.log(`*** Game ${tGameCode} does not exist *** (temple)`);
                swal("oops!",`game "${tGameCode}" does not exist`,"error");
            }
            break;
        case "harvest":
            message = new Message(
                Player.me.id, true, Player.gameState.year, "harvest", iContents
            );
            break;

        default:
            break;
    }
    if (message) Fire.sendMessage(message.asObject());
}

export function godSpeaksToPlayer(type, iPlayerID, iContents = {}) {
    let message = null;

    switch (type) {

        case 'startGame' :
            message = new Message(iPlayerID, false, Game.gameData.year, 'startGame', iContents);
            break;

        case 'newYear' :
            message = new Message(iPlayerID, false, Game.gameData.year, 'newYear', iContents);
            break;

        case 'endYear':
            message = {
                type: 'endYear',
                content: {
                    year: god.gameParams.year,
                    biomass: nature.biomass,
                    players: nature.players,
                    trees: nature.treeAgesAndIndicesArray(),
                    transactions: nature.currentTransactions,
                }
            }
            break;

/*
        case 'newYear':
            message = {
                type: 'newYear',
                content: {
                    year: god.gameParams.year,
                    biomass: nature.biomass,
                    players: nature.players,
                    trees: nature.treeAgesAndIndicesArray(),
                    transactions: nature.currentTransactions,
                }
            }
            break;
*/

        case 'endGame' :
            const content = {
                year: god.gameParams.year,
                biomass: nature.biomass,
                players: nature.players,
                trees: nature.treeAgesAndIndicesArray(),
                transactions: nature.allTransactions
            };

            const endContent = {...god.debriefInfo, ...content};
            message = {
                type: 'endGame',
                content: endContent
            }
            break;

        default:
            break;
    }

    Fire.sendMessage(message.asObject());
}