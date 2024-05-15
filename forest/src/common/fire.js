import {db} from "../../cred.js";
import * as Game from "../god/game.js"
import * as Handlers from "../god/handlers.js"
import * as PHandlers from "../player/handlers.js"

import  * as FB from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

//  let db = null;
let gamesCR = null;     //      = all games collection reference
let godsCR = null;
let playersCR = null;   //  collection ref for the players collection the game.
let messagesCR = null;   //  collection ref for the players collection the game.

let gameDR = null;      //  document reference for our particular game.
let playerDR = null;      //  document reference for our particular player.

//  unsubscribers
let unsubGodMessages = null;
let unsubPlayerMessages = null;

export async function initialize() {
    gamesCR = FB.collection(db, "games");
    godsCR = FB.collection(db, "gods");

    await listAllGods();
}

export async function sendMessage(iMessage) {
    console.log(iMessage);
    if (!messagesCR && iMessage.contents.gameCode) {
        messagesCR = FB.collection(db, `games/${iMessage.contents.gameCode}/messages`);
    }
    const messDR = FB.doc(messagesCR);
    iMessage.timestamp =  FB.Timestamp.fromDate(new Date());
    await FB.setDoc(messDR, iMessage);
}

/**
 * Given a game code, get the associated data (but not subcollections).
 * Returns null if the code doesn't exist in `games`.
 * Therefore useful for checking existence.
 *
 * @param iGameCode
 * @returns {Promise<null>}
 */
export async function getGameFromCode(iGameCode) {
    let out = null;

    const gameRef = FB.doc(gamesCR, iGameCode);
    const gameSnap = await FB.getDoc( gameRef );
    if (gameSnap.exists()) {
        out = gameSnap.data();
    }
    return out;
}

async function listAllGods() {
    let out = "List of Gods\n";
    const querySnapshot = await FB.getDocs(godsCR);

    querySnapshot.forEach( snap => {
        const data = snap.data();
        out += `${snap.id} (${data.handle}): ${data.name} <${data.email}>\n`;
    })

    console.log(out);
}

/**
 * Given a God handle, either return the data or make a new record and return it.
 *
 * @param iHandle       the proposed handle for the god.
 * @returns {Promise<null>}
 */
export async function setGodWithHandle( iHandle ) {
    let out = null;
    const q =  FB.query(godsCR, FB.where("handle", "==", iHandle));
    const querySnapshot = await FB.getDocs(q);

    if (querySnapshot.size == 1) {
        const theSnap = querySnapshot.docs[0];
        out = theSnap.data();
    } else if (querySnapshot.size == 0) {
        out = {handle : iHandle};             //  todo: get email and name
        const newGodRef = FB.doc(godsCR, iHandle);
        FB.setDoc(newGodRef, out);
    }

    return out;
}

export async function createFirebaseGameRecord(iGameData )  {

    //  add a `.created` field as a timestamp
    iGameData["created"] = FB.Timestamp.fromDate(new Date());
    gameDR = FB.doc(gamesCR, iGameData.gameCode);   //  document reference for the new game

    try {
        await FB.setDoc(gameDR, iGameData);
        messagesCR = FB.collection(gameDR, "messages");     //   can define once we know the game
        subscribeToMessagesToGod( );
    } catch (e) {
        console.log(`creating game record failed : ${e}`);
        gameDR = null;
    }
}

export function subscribeToMessagesToGod( ) {
    const q =  FB.query(messagesCR, FB.where("toGod", "==", true));

    unsubGodMessages = FB.onSnapshot(q, (qss) => {
        let allMessages = [];
        qss.forEach( messageSnap => {         //  each of these is a doc snapshot, but already datified
            const theMessageID = messageSnap.id;
            allMessages.push({id : theMessageID, data : messageSnap.data()});
        })
        Handlers.gotAllMessages(allMessages);
    })
}

export function subscribeToPlayerMessages( iPlayerID, iGameCode) {
    messagesCR = FB.collection(db, `games/${iGameCode}/messages`);
    const q = FB.query(messagesCR,FB.where("playerID", "==", iPlayerID));

    unsubPlayerMessages = FB.onSnapshot(q, (qss) => {
        let allMessages = [];
        qss.forEach( messageSnap => {         //  each of these is a doc snapshot, but already datified
            const theMessageID = messageSnap.id;
            allMessages.push({id : theMessageID, data : messageSnap.data()});
        })
        PHandlers.gotAllMessages(allMessages);
    })
}

/**
 * The player is responsible only for verifying that the game exists.
 * Only then can we send a join request to God.
 * We assume that this will be accepted.
 *
 * God makes any adjustment to the player handle occurs for uniqueness and adds a document to the players subcollection.
 * Then, when the game finally begins, the player will be informed of any change in name.
 *
 * If the join fails (game does not exist), we return false.
 *
 * @param iPlayer   a Player handle
 * @param iGame     the game handle
 * @returns {Promise<boolean>}      boolean `success`
 *//*
export async function playerJoinsGame(iPlayer, iGame) {
    let success = false;
    let aResult = await getGameFromCode(iGame);

    if (aResult) {
        const theMessage = new Message(iPlayer, true, null, 'join', {});
        sendMessage(theMessage);
        success = true;
    }

    return success;
}
*/

/**
 * God calls this to add a Player (instance) to the `game.players` subcollection
 *
 * @param iPlayer       the Player instance to be added
 * @returns {Promise<boolean>}      tru or false
 */
export async function godAddsPlayer(iPlayer){
    let success = false;

        playersCR = FB.collection(gameDR, "players");
        playerDR = FB.doc(playersCR, iPlayer.id);

        try {
            await FB.setDoc(playerDR, iPlayer.asObject());
            success = true;
            console.log(`Success! ${iPlayer} joined ${Game.gameData.gameCode}`);
        } catch (e) {
            console.log(`creating player record failed : ${e}`);
        }

    return success;
}