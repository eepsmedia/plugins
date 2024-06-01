# Forest: a commons game

This pair of apps constitute a commons game suitable for middle grades and up (and up). 

**Aranyani** is the "teacher" app that lets you create a game.

**Forest** is the "player" or "student" app.

## Forest: instructions for students

### Getting started 

When you open the game, you will see a box for your handle. Enter your name.
Then you see another box for the **game code**. 
The teacher (or game leader) will give you that code. 
It will consist of three words separated by periods, such as `house.dog.limit`.

Enter that code, press **Join**. 
For now, it's essential that no one else uses the same name in that particular game...so be sure that's organized in your game or class!

### Regular game play
Then you'll see a display that tells you the year (such as 2025) and shows you a forest of (triangular) trees.
Click the trees you want to harvest (limit: 10) and press **Harvest**. 
Now you wait for
* Everyone else to harvest their trees.
* Then, the teacher has to end the turn by selling all the trees you cut down.

At that point, all the trees are sold, you receive your money, and the year changes to the next year.
You will see a financial report for the previous year.

Then you decide, again, how many trees to cut, and the cycle continues until the game is over.

### Ending the game, etc.
When does the game end? 
What's the object of the game?

Those are great questions. 
See if you can figure out answers to those questions and more as you play.
You will probably need to play more than one game to understand how to play well.


## Forest: instructions for the teacher

Aranyani is a Hindu goddess of the forests. And today, that's you! 
You are in charge of this game.

### Getting set up

To begin, enter a username ("handle") and press **login**. 
For now, this game is ridiculously low-security. 
There is no password.

To create a new game, choose a "level" from the menu (start with `vanilla`) and click **new game**.
You might want to make a short game first so students learn the mechanics.

You will see the game code, which consists of three words separated by periods, as in `house.dog.limit`.

Tell all the players that code. 
They need to enter it into their computers to join the game.

## Game play
As they join, you will see their names appearing in a table on your screen. 
You will also see when they decide which trees they want to harvest.

When everyone is done harvesting, you can press the **market** button to activate the wood market.
Then everyone's trees are sold. 
On their computers, students see their money arrive, and they get another chance to decide on a number of trees to cut down.

The cycle continues until the game ends. 

### Using data to help understand
You might also want to analyze some of the data that appear on the screen.
To do that, use CODAP.

For example, you might see how **seen** (the number of fish you see during the year) varies with **year**.
1. Make a graph by pressing the **Graph** button on the toolbar.
2. Drag the column heading **year** to the graph's horizontal axis.
3. Drag **seen** to the vertical axis.

As you play, the graph will update.
Consider making more graphs, for example, a graph of **before** with **year**.

### Some data definitions:

| term               | definition                                           |
|--------------------|------------------------------------------------------|
| **year**           | the game year                                        |
| **biomass**        | the total "mass" of all the trees in the forest      |
| **averageBalance** | the mean balance (money) of all the teams            |

## What else?
Everyone has to press their **Harvest** button or no one can move forward. 
So you may have to remind a student (player) to do that.

It is deliberately unclear how the game ends. 
Do your best not to tell students what you think or know, 
but rather ask them what they think.
Promote a discussion about that.

Notice that the discussion might center on two very different topics:
* What are the *game* rules, that is, what happens for the game to decide if you have won or lost?
* What do the game rules *mean*, that is, what winning or losing has to do with the forestry business and the health of the forest?

Also, students may eventually notice that when the game ends, 
it's the whole group that has either won or lost---not an individual. 

# Forest programmer's guide

## Firebase is the database

This app uses Google's `firebase` as a no-SQL database. 
It's pretty terrific, but with luck, you will not have to deal with it.
All calls to the database are isolated within `common/fire.js` (and the credentialing file, `cred.js`, which is not in github by design).

The app uses two "collections" named `games` and `gods`. 
 * The `gods` collection records information about _teacher_ users, that is, people using the "arnayani" app.
 * The `games` collection is the workhorse: it holds one _document_ (record) for each game that is played.

Each `games` document is keyed by the `gameCode`, the three-random-word code used to identify the game.

This document also has a sub-collection called `messages`.
Each message is a communication about a change in the game state,
either a communication from god to a player or from a player to god.
These are set up in `common/temple.js` and actually implemented in `Fire.sendMessage( mess )`.

### Messages and message types
Messages themselves are instances of the `Message` class (`common/Message.js`).
Here is its defining constructor:
```javascript
    constructor(iPlayerID, iToGod, iDate, iSubject, iContents) { 
        //  etc
    }
```
As you can see, it specifies the playerID (e.g., `tim85624`);
whether the message is to God (Boolean `true`; or from God, `false`);
the date in game years;
the "subject", which is the type of the message;
and the contents, which is an Object containing the actual message.

The types are:

#### From God to a player

**startGame**
The game you signed up to is now starting,
so set your `phase` to `kMarkTrees` and display accordingly.

**endYear**
God has sold your trees, so you have a new balance,
which appears in the contents of the message.

This is automatically followed by either a `newYear`
or `endGame` message.
This happens in `god/god.js` in the method `doEndYear( end )`.

**newYear**
A new year has begun, so (again)
set your `phase` to `kMarkTrees` and display accordingly.
The contents include the current state of the forest.


**endGame** 
While updating the game state (during the sell-trees operation), 
God checks the game-end criteria. 
If the game has ended, this message gets sent
with information about why the game ended.

#### From a player to God

**join** 
Hey, God, I have joined your game!
The contents include my handle and playerID.

**harvest**
I have specified which trees I will cut down this year.
They appear in an array in the contents.

## Game phases

In both the `god` and `player` apps, the principal module (`god/god.js` and `player/player.js`)
has a `phase` global set to a constant, as in

```javascript
    phase = godPhases.kCollectMoves;    //  now we're looking for all players to submit moves
```

The game `phase` determines some aspects of functionality,
and has a huge impact on what is displayed using the "visibility" function in the "ui" modules.

These constants are defined in `constants/gameConfigs.js`. 
Names of the constants describe the "phase" the game is in.

### God phases

* **kBegin** The app has started, but God has not logged in, so she cannot create a new game. Therefore, all that shows is a box for signing in (or authentication)/
* **kMakeGame** God has a name and can choose the scenario and click a button to make the game. This provides a game code, which god tells to the students.
* **kRecruit** The game exists but has not begun. Students sign in to the game; god sees this in a table. When everyone is ready, she clicks a button to start the game.
* **kCollectMoves** Students make their moves (identifying trees for harvest). God sees who has done this.
* **kReadyForMarket** When all have completed their moves, a button appears for selling the trees. This ends the year. Trees are cut, the remainder grow, and students are informed.
* **kDebrief** The game is over and everyone can discuss the game. If she wants, the teacher can start a new game, returning to **kMakeGame**.


## Game events

### A player joins the game

* Player enters a handle and clicks **set name**. 
> In `player.js`, the name is recorded and a five-digit code is appended as the playerID. 
> This is to help avoid collisions of two kids with the same name;
> throughout the programs, players are identified by this ID, not the original handle. 
> 
> The player data is stored locally in `me`, an object with two fields: `id` and `data`. 
> The `me.data.handle` field holds the original handle. 
> Note that in `god`, the `Data` module holds a collection of `Player` instances. 
> We don't need them in the `player` app.

* Player enters the game code given by the teacher and joins the game.
> In `Player.doJoinGame()`, we call `Temple.playerSpeaksToGod("join")`. 
> That invokes the message mechanism, and a message gets sent to the `messages` table in the database,
> where it is picked up by God.

* God receives the join message. 
> This calls `God.doPlayerJoin(id, handle)`, which calls the parallel function,
> `Game.makeNewPlayer(id, handle)`.
> There we create the `Player` instance, give it the `gameCode`,
> and add it to the internal collection, `Game.players`, keyed by the playerID. 