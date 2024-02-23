

const nature = {

    forest: [],
    markedTrees: {},       //  arrays of marked trees, keyed by name

    players: {},        //  Players, keyed by name (Player instances)

    currentTransactions : [],

    initialize : function() {

    },

    grow: function () {
        let growth = [];
        this.forest.forEach(tree => {
            const myNeighbors = this.neighbors(tree);
            let neighborAgeSum = 0;
            myNeighbors.forEach(t => {
                neighborAgeSum += (t.age > god.gameParams.yearsToAdult ? god.gameParams.yearsToAdult : t.age);
            });
            const neighborAgeFactor = neighborAgeSum / 4 / god.gameParams.yearsToAdult;
            growth[tree.index] = 0.6 + 0.4 * neighborAgeFactor;
        })

        console.log(`age factors : ${growth.map((a) => a.toFixed(2))}`);

        this.forest.forEach(tree => {
            if (tree.age > 0) {
                tree.age += growth[tree.index];
            } else {
                if (Math.random() < tree.seedlingProbability) {
                    tree.age = Math.random();
                }
            }
        })
    },

    newForest: function () {
        this.forest = [];
        let index = 0;

        for (let col = 0; col < god.gameParams.columns; col++) {
            for (let row = 0; row < god.gameParams.rows; row++) {
                const theAge = Math.floor(2 * god.gameParams.yearsToAdult * Math.random());
                this.forest.push(new Tree(index, theAge));
                index++;
            }
        }
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
            const salary = new Transaction(pName, god.gameParams.year, -god.gameParams.salary, "salary");
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
            out.push({
                age : this.forest[i].age,
                hue : this.forest[i].hue,
                seedlingProbability : this.forest[i].seedlingProbability,
                index : i
            });
        }
        return out;
    },
}