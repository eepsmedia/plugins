Forest: a commons game
This pair of apps constitute a commons game suitable for middle grades and up (and up).

Aranyani is the "teacher" app that lets you create a game.

Forest is the "player" or "student" app.

Forest programmer's guide
Firebase is the database
This app uses Google's firebase as a no-SQL database. It's pretty terrific, but with luck, you will not have to deal with it. All calls to the database are isolated within common/fire.js (and the credentialing file, cred.js, which is not in github by design).

The app uses two "collections" named games and gods.

The gods collection records information about teacher users, that is, people using the "arnayani" app.
The games collection is the workhorse: it holds one document (record) for each game that is played.
Each games document is keyed by the gameCode, the three-random-word code used to identify the game.

This document also has a sub-collection called messages. Each message is a communication about a change in the game state, either a communication from god to a player or from a player to god. These are set up in common/temple.js and actually implemented in Fire.sendMessage( mess ).

Messages and message types
Messages themselves are instances of the Message class (common/Message.js). Here is its defining constructor:

    constructor(iPlayerID, iToGod, iDate, iSubject, iContents) {
        this.playerID = iPlayerID;  //  the player ID
        //  etc
    }
As you can see, it specifies the playerID (e.g., tim85624); whether the message is to God (Boolean true; or from God, false); the date in game years; the "subject", which is the type of the message; and the contents, which is an Object containing the actual message.

The message types are:

From God to a player (toGod = false)
startGame The game you signed up to is now starting, so set your phase to kMarkTrees and display accordingly.

endYear God has sold your trees, so you have a new balance, which appears in the contents of the message.

This is automatically followed by either a newYear or endGame message. This happens in god/god.js in the method doEndYear( end ).

newYear A new year has begun, so (again) set your phase to kMarkTrees and display accordingly. The contents include the current state of the forest.

endGame While updating the game state (during the sell-trees operation), God checks the game-end criteria. If the game has ended, this message gets sent with information about why the game ended.

From a player to God (toGod = true)
join Hey, God, I have joined your game! The contents include my handle and playerID.

harvest I have specified which trees I will cut down this year. They appear in an array in the contents.

How messages are received
When an app initializes firebase (Fire.initialize()), it sets up listeners to the appropriate messages and types. These get captured in handlers.js and then immediately shipped off to God or Player.

Example of subscribing to the notification (fire.js):

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
Example of catching notifications (PHandlers, i.e., player/handlers.js):

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
Game phases
In both the god and player apps, the principal module (god/god.js and player/player.js) has a phase global set to a constant, as in

    phase = godPhases.kCollectMoves;    //  now we're looking for all players to submit moves
The game phase determines some aspects of functionality, and has a huge impact on what is displayed using the "visibility" function in the "ui" modules.

These constants are defined in constants/gameConfigs.js. Names of the constants describe the "phase" the game is in.

God phases
kBegin The app has started, but God has not logged in, so she cannot create a new game. Therefore, all that shows is a box for signing in (or authentication)/
kMakeGame God has a name and can choose the scenario and click a button to make the game. This provides a game code, which god tells to the students.
kRecruit The game exists but has not begun. Students sign in to the game; god sees this in a table. When everyone is ready, she clicks a button to start the game.
kCollectMoves Students make their moves (identifying trees for harvest). God sees who has done this.
kReadyForMarket When all have completed their moves, a button appears for selling the trees. This ends the year. Trees are cut, the remainder grow, and students are informed.
kDebrief The game is over and everyone can discuss the game. If she wants, the teacher can start a new game, returning to kMakeGame.
Game events
A player joins the game
Player enters a handle and clicks set name.
In player.js, the name is recorded and a five-digit code is appended as the playerID. This is to help avoid collisions of two kids with the same name; throughout the programs, players are identified by this ID, not the original handle.

The player data is stored locally in me, an object with two fields: id and data. The me.data.handle field holds the original handle. Note that in god, the Data module holds a collection of Player instances. We don't need them in the player app.

Player enters the game code given by the teacher and joins the game.
In Player.doJoinGame(), we call Temple.playerSpeaksToGod("join"). That invokes the message mechanism, and a message gets sent to the messages table in the database, where it is picked up by God.

God receives the join message.
This calls God.doPlayerJoin(id, handle), which calls the parallel function, Game.makeNewPlayer(id, handle). There we create the Player instance, give it the gameCode, and add it to the internal collection, Game.players, keyed by the playerID.