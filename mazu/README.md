# Mazu/fish: a commons game

This pair of apps constitute a commons game suitable for middle grades and up (and up). 

**Mazu** is the "teacher" app that lets you create a game.

**Fish** is the "player" or "student" app.

## fish: instructions for students

### Getting started 

When you open the game, you will see a box for the **game code**. 
The teacher (or game leader) will give you that code. 
It will consist of three words separated by periods, such as `house.dog.limit`.

Enter that code, press **Join**, then enter your name in the box that follows. 
For now, it's essential that no one else uses the same name in that particular game...so be sure that's organized in your game or class!

### Regular game play
Then you'll see a display that tells you the year (such as 2022, in a yellow box) and asks how many fish you want to catch.
Type a number and click **Catch**. 
You may see some data in a CODAP table while you wait for two things:
* Everyone else to decide how many fish they want and press **Catch**.
* Then, the teacher has to end the turn by running the fish market.

At that point, all the fish are sold, you receive your money, and the year changes to the next year.

Then you decide, again, how many fish to catch, and the cycle continues until the game is over.

### Ending the game, etc.
When does the game end? 
What's the object of the game?

Those are great questions. 
See if you can figure out answers to those questions and more as you play.
You will probably need to play more than one game to understand how to play well.

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

| term | definition |
| ---- | ---------- |
| **year** | the game year |
|**seen** | how many fish you saw from your boat |
|**want** | how many fish you said you wanted to catch |
|**caught** | how many you caught |
|**before** | how much money you had at the beginning of the year |
|**after** | how much you had at the end |
|**expenses**| how much is cost to keep your business open |
|**unitPrice**|how much money you got for each fish |
|**income**|you total income, that is, **caught** x **unitPrice** |

## Mazu: instructions for the teacher

Mazu is a Chinese goddess of the sea. And today, that's you! 
You are in charge of this game.

### Getting set up

To begin, enter a username and press **login**. 
For now, this game is ridiculously low-security. 
There is no password.
Just remember your name so you can find your games again later.

Then decide if you want a new game or an old game. 
For an old game, pick its code from the menu and click **join game**.
If you want a new game, press that button, choose a "level" from the menu (start with `albacore`) and click **new game**.

You will see the game code, which consists of three words separated by periods, as in `house.dog.limit`.

Tell all the players that code. 
They need to enter it into their computers to join the game.

## Game play
As they join, you will see their names appearing in a table on your screen. 
You will also see when they decide how many fish they want, 
and you will see their "status" change from `fishing` to `selling`.

When everyone is done fishing, you can press the **sell fish** button to activate the fish market.
Then everyone's fish are sold, 
and on their computers, they see their money arrive and they get another chance to decide on a number of fish and go catch them.

You will see your table change as they do so.
When everyone has fished, you press **sell fish**, and the cycle continues until the game ends. 

## What else?
Everyone has to press their **Catch** button or no one can move forward. 
So you may have to remind a student (player) to do that.

It is deliberately unclear how the game ends. 
Do your best not to tell students what you think or know, 
but rather ask them what they think.
Promote a discussion about that.

Notice that the discussion might center on two very different topics:
* What are the *game* rules, that is, what happens for the game to decide if you have won or lost.
* What do the game rules *mean*, that is, what winning or losing has to do with the fishing business and the health of the sea.

Also, students may eventually notice that when the game ends, 
it's the whole group that has either won or lost---not an individual. 

## Additional game design comments from Tim

For programming simplicity in the networked games, 
I chose to make two separate apps: one for the teacher and one for the students. 
This is an overview:

1.  The teacher actually creates the games and receives a game code that they give to the students. 
1.  The students enter the game code in order to be part of that game. 
1.  Players can immediately start catching fish (or chopping trees in Forester). 
1.  When they have a year’s worth of products, they send them to the market, and wait for their products to sell. 

Meanwhile, the teacher can see, in real time, what each player is currently doing, 
in order to see when they are all ready to sell their products. 
When all teams are ready, the teacher presses the button to activate the market, the products are sold, 
and the new bank balances and other information are transmitted to the student apps, 
which now update and unlock, so they can go back to fishing and chopping. 

Both apps have “automation” settings to just keep going automatically 
if the players or teacher want. 
This is useful when everyone agrees to keep the same policy every year, 
for example, when the class is conducting an experiment (what happens if we all just take 30 fish every time?). 

As to the data, each student receives data on their own actions after every move. 
The teacher gets data about everyone, 
including the true population of fish. 
But at the end of the game, students receive historical data about everybody. 

This can be controversial. 
It is OK to "out" players that decide they want a lot of money, that is, they defect?
Two comments:
*  The first time through the game, nobody knows what's happening,
so although everybody sees you took 120 fish every time, nobody cares.
That means that the next time, if you know you want to do that again, you know in advance that everyone will know.
*  As a teacher, you need to be prepared for such an eventuality.
I recommend defusing it without blaming the defector.
One possibility:

> “You can see in your data that Julia kept taking 100 fish every year, even though you all agreed to take only 27. She made a lot of money, and the rest of you did not. Now: this is a game, so what she did didn’t hurt anybody. But how would you have felt about it if you all really made you living by fishing, and it was real money?”

That is, you take Julia off the hook by turning her actions into a useful hypothetical. 
You can follow that up with something like, 
“what have you seen or heard in the news that reminds you of what happened here?”

Finally, because of programming issues, 
it’s best of there are no more than about 10 “players” altogether. 
(Note that you can play effectively with only one!) 
But if you have a typical classroom, make teams of 2 to 4 students. 
The discussion at the shared computers will actually improve learning.
