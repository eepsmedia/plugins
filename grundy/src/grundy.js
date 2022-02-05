const grundy = {

    state: {},

    blox: 10,

    freshState: function (gameSize) {
        return {
            nBlox: gameSize,
            theBoard: [4, 6],
        }
    },

    initialize: function () {
        this.state = this.freshState(this.blox);   //  fix this later :)
        this.constructBoard(this.state.nBlox);
        this.adjustBoard(this.state.theBoard);
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
                console.log(`made space ${i}`);
            }
        }
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
                        console.log(`space ${b} is halfway through`);
                    } else {
                        this.setSpaceClass(thisSpace, "space");
                    }
                } else {    //  we are at the end of this clump
                    if (b < grundy.state.nBlox - 1) {   //  still inside.
                        this.setSpaceClass(thisSpace, "wide-space");
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

