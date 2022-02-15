const grundy = {

    state: {},

    blox: 4,

    freshState: function (gameSize) {
        return {
            nBlox: grundy.blox,
            theBoard: [grundy.blox],
            theSpaces: [],
            whoseTurn: null,
            playing: false,
            winner: null,
            thisGame: [],   //  Array of moves, Objects: `{player: , before: , after: , winner: }`
            history: [],    //  Array of Arrays of form `thisGame`
        }
    },

    initialize: function () {
        this.state = this.freshState(this.blox);   //  fix this later :)
        this.constructBoard(this.state.nBlox);
        this.adjustBoard(this.state.theBoard);
        this.updateUI();
    },

    forget : function() {
        this.state.history = [];
    },

    startGame: function (iWho) {
        grundy.state.whoseTurn = (iWho === 'human') ? 'human' : 'grundy';
        grundy.state.theBoard = [grundy.blox];
        grundy.adjustBoard(grundy.state.theBoard);
        grundy.state.playing = true;
        grundy.state.winner = null;
        grundy.state.thisGame = [];
        d3.select("#startGame").style("display", "none");   //  hide the buttons
        d3.select(`#record`).html(null);
        this.updateUI();
    },

    constructBoard: function (iNumBoxes) {
        const thePaper = d3.select(`#paperDiv`);
        thePaper.html("");

        for (let i = 0; i < iNumBoxes; i++) {   //  i is the box number
            const thisBox = thePaper.append("div");
            thisBox.attr("class", "box");
            thisBox.attr("id", `box${i}`);
            if (i < iNumBoxes - 1) {    //  not the space after the last box
                const thisSpace = thePaper.append("div");
                thisSpace.classed(`space`, true);
                thisSpace.attr("id", `space${i}`);
                thisSpace.on("click", grundy.clickSpace);
                const tData = [i];
                thisSpace.data(tData);
            }
        }
    },

    /**
     * event handler for a click on a space
     * @param event
     * @param d
     * @param i
     */
    clickSpace: function (event, d, i) {
        if (grundy.state.whoseTurn === 'human') {
            const tData = d;
            console.log(`human clicks space #${tData}`);
            if (grundy.state.theSpaces[d] === 'legal') {
                grundy.doMove(d);
            }
        }
    },

    doMove: function (iSpace) {

        let aMove = {
            player: grundy.state.whoseTurn,
            before: grundy.state.theBoard,     //  the array
        }

        let b = 0;
        let newBoard = []

        grundy.state.theBoard.forEach(c => {
            const firstSpaceNumber = b;     //  first space in this clump, looking at box b
            const lastSpaceNumber = b + c - 2;
            if (iSpace >= firstSpaceNumber && iSpace <= lastSpaceNumber) {
                //  it's in this clump!
                const firstClump = iSpace - b + 1;
                newBoard.push(firstClump);
                newBoard.push(c - firstClump);
            } else {
                newBoard.push(c);
            }
            b += c;
        });
        grundy.state.theBoard = newBoard;
        aMove['after'] = grundy.state.theBoard;
        grundy.state.thisGame.push(aMove);          //  record this move in `state.thisGame`.

        grundy.adjustBoard(grundy.state.theBoard);
        const done = grundy.checkForEnd();

        if (!done) {
            grundy.state.whoseTurn = (grundy.state.whoseTurn === 'human') ? 'grundy' : 'human';
        }
        grundy.updateUI(done);
    },

    updateUI: function (iDone) {
        const tRecord = d3.select(`#record`);
        const tOldRecord = tRecord.html();      //  get the current html
        const tWon = iDone ? `<br>${grundy.state.winner} won!` : "";
        const tThisRecord = `${grundy.state.whoseTurn}'s turn. State now ${grundy.state.theBoard.join('-')}.`
        const tNewRecord = `${tOldRecord}<br>${tThisRecord}${tWon}`
        tRecord.html(tNewRecord);

        const promptThing = d3.select("#prompt");

        d3.select("#makeGrundyMove").style("display", (grundy.state.whoseTurn === 'grundy') ? "block" : "none");
        d3.select("#startGame").style("display", grundy.state.playing ? "none" : "block");   //  hide the start game buttons

        if (grundy.state.playing) {
            promptThing.html(`${grundy.state.whoseTurn} to move!`)
        } else {

            if (grundy.state.winner) {
                promptThing.html(`${grundy.state.winner} won the last game!`)
            } else {
                promptThing.html(`Waiting to start a game.`)

            }
        }

    },

    doGrundyMove: function () {
        const memory = think.collate(grundy.state.history);
        const tPossibles = think.findAllLegalMoves();
        const tIndex = Math.floor(Math.random() * tPossibles.length);
        grundy.doMove(tPossibles[tIndex]);      //  this also checks for end
        console.log(`Grundy picks ${tPossibles[tIndex]} from [${tPossibles.join(', ')}]`)
    },

    checkForEnd: function () {
        const tPossibles = this.findAllLegalMoves();
        if (tPossibles.length === 0) {
            this.endGame();
            return true;
        }
        return false;
    },

    endGame: function () {
        this.state.playing = false;
        this.state.winner = (this.state.whoseTurn === 'human') ? 'human' : 'grundy';
        this.state.thisGame.forEach(aMove => {
            aMove['winner'] = this.state.winner;
        })
        this.state.history.push(this.state.thisGame);
    },

    /**
     * All of the "board" <div>s exist; they just need to have their styles set correctly.
     * @param iBoard
     */
    adjustBoard: function (iBoard) {
        const thePaper = d3.select(`#paperDiv`);
        const nClumps = iBoard.length;
        let b = 0;      //  the box number, overall

        for (let c = 0; c < nClumps; c++) {
            const nInClump = iBoard[c];

            //  i is the index within the clump

            for (let i = 0; i < nInClump; i++) {
                const thisSpace = d3.select(`#space${b}`);

                if (i < nInClump - 1) {        //  there is a space within this clump
                    const halfway = nInClump / 2 - 1;
                    if (i === halfway) {
                        this.setSpaceClass(thisSpace, "unbreakable-space");
                        this.state.theSpaces[b] = "unbreakable";
                    } else {
                        this.setSpaceClass(thisSpace, "space");
                        this.state.theSpaces[b] = "legal";
                    }
                } else {    //  we are at the end of this clump
                    if (b < grundy.state.nBlox - 1) {   //  still inside.
                        this.setSpaceClass(thisSpace, "wide-space");
                        this.state.theSpaces[b] = "clump";
                    }
                }
                b++;
            }

        }
    },

    setSpaceClass: function (iSpace, iClass) {
        iSpace.classed("unbreakable-space", false);
        iSpace.classed("space", false);
        iSpace.classed("wide-space", false);

        iSpace.classed(iClass, true);


    },
}

