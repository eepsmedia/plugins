

const nature = {

    forest: [],
    initialBiomass : null,
    biomass : 0,
    markedTrees: {},       //  arrays of marked trees, keyed by name

    players: {},        //  Players, keyed by name (Player instances)

    currentTransactions : [],

    initialize : function() {
    },

    grow: function () {
        this.biomass = this.calculateBiomass();
        const growthFactor = this.biomass / this.initialBiomass;

        //  let growth = [];
        this.forest.forEach(tree => {

            if (tree.age > 0) {
                tree.growBy(growthFactor);
            } else {
                if (Math.random() < growthFactor) {     //  probability of seedling sprouting
                    tree.growBy(Math.random());   //  seedlings between 0 and 1 year old
                }
            }

        })

        //  console.log(`age factors : ${growth.map((a) => a.toFixed(2))}`);

        console.log(`year ${god.gameParams.year} growth factor ${growthFactor}`);

    },

    calculateBiomass : function() {
        let biomass = 0;

        this.forest.forEach( tree => {
            biomass += tree.age;
        })
        return biomass;
    },

    newForest: function () {
        const kColumns = god.gameParams.forestDimensions.columns;
        const kRows = god.gameParams.forestDimensions.rows;

        //  create array of ages and scramble it
        let ages = [];
        const nTrees = kColumns * kRows;
        for (let i = 0; i < nTrees; i++) {ages[i] = i * 1.5 * god.gameParams.yearsToAdult / nTrees}
        ages.scramble();

        //  make .forest array and make new Trees to fill it
        this.forest = [];
        let index = 0;

        for (let col = 0; col < kColumns; col++) {
            for (let row = 0; row < kRows; row++) {
                const theAge = ages[index];
                this.forest.push(new Tree(index, theAge));
                index++;
            }
        }
        this.initialBiomass = this.calculateBiomass();
        this.biomass = this.calculateBiomass();
    },

    processHarvest: async function () {

        this.currentTransactions = [];

        let endGame = {
            end : false
        };

        //  look at all players' requests, mark the appropriate trees

        for (const playerName in this.markedTrees) {
            this.markedTrees[playerName].forEach(treeNumber => {
                this.forest[treeNumber].harvesters.push(playerName);
            })
        }

        //  harvest the trees, pay wages, receive income

        this.forest.forEach(tree => {
            tree.harvestMe();
        })

        //  pay all salaries

        let balanceSum = 0;

        for (const pName in this.players) {
            const salary = new Transaction(
                pName, god.gameParams.year, this.biomass, -god.gameParams.salary, "salary"
            );
            this.currentTransactions.push(salary);
            balanceSum += salary.balance;
            if (salary.balance < 0) {
                endGame.end = true;
                console.log(`****    GAME OVER: ${pName} went bankrupt ****`);
                endGame[pName] = "broke";
            }
        }

        if (god.gameParams.year >= god.gameParams.endingYear) {
            endGame.end = true;
            endGame["time"] = god.gameParams.year;
        }

        endGame["meanBalance"] = balanceSum / Object.keys(this.players).length;     //  for end-of-game information

        this.markedTrees = {};      //  blank these puppies

        return endGame;
    },

    neighbors : function(iTree) {
        out = [];

        [row, col] = ui.rowColFromIndex(iTree.index);

        out.push(this.forest[ui.indexFromRowColTorus(row + 1, col)]);
        out.push(this.forest[ui.indexFromRowColTorus(row, col + 1)]);
        out.push(this.forest[ui.indexFromRowColTorus(row - 1, col)]);
        out.push(this.forest[ui.indexFromRowColTorus(row, col - 1)]);

        return out;
    },

    treeAgesAndIndicesArray: function () {
        let out = [];
        for (let i = 0; i < this.forest.length; i++) {
            let theTree = {...this.forest[i]};
            theTree.harvesters = null;
            out.push(theTree);
        }
        return out;
    },
}

/**
 * Scramble the values in the array. Defined at the bottom of `scrambler.js`.
 */
Array.prototype.scramble = function () {
    const N = this.length;

    for (let i = 0; i < N; i++) {
        const other = Math.floor(Math.random() * N);
        const temp = this[i];
        this[i] = this[other];
        this[other] = temp;
    }
};