const think = {

    memory : {},

    collate : function(iHistory) {

        iHistory.forEach( gg => {   //      gg is a game, an Array of moves
            gg.forEach( mm => {     //      mm is a single move, fields: before, after, player, winner.
                const canonicalAfter = this.canonize(mm.after);     //  string canonical rep of "board"
                const goodMove = (mm.player === mm.winner);

                if (think.memory[canonicalAfter]) {
                    think.memory[canonicalAfter] += goodMove ? 1 : -1;
                } else {
                    think.memory[canonicalAfter] = goodMove ? 1 : -1;
                }
            })
        })
        return think.memory;
    },

    canonize : function(iBoard) {
        return (iBoard.sort((a, b) => (a - b) )).join('-')
    },

    findAllLegalMoves: function () {
        out = [];
        for (let i = 0; i < grundy.state.nBlox - 1; i++) {
            if (grundy.state.theSpaces[i] === 'legal') {
                out.push(i);
            }
        }
        return out;
    },
}