import * as Game from './game.js';

let forest = [];
let initialBiomass = null;
export let biomass = 0;
let markedTrees = {};      //  arrays of marked trees, keyed by player ID

let currentTransactions = [];

export function initialize() {
}

export function getForest() {
    return forest;
}

/**
 * Grow each of the Trees in forest
 */
export function grow() {
    biomass = calculateBiomass();
    const growthFactor = biomass / initialBiomass;

    //  let growth = [];
    forest.forEach(tree => {

        if (tree.age > 0) {
            tree.growBy(growthFactor);
        } else {
            if (Math.random() < growthFactor) {     //  probability of seedling sprouting
                tree.growBy(Math.random());   //  seedlings between 0 and 1 year old
            }
        }

    })
    //  console.log(`age factors : ${growth.map((a) => a.toFixed(2))}`);
    console.log(`year ${Game.gameData.year} growth factor ${growthFactor}`);

}

export function recordHarvestAtTree(iPlayerID, iTreeIndex) {
    const theTree = forest[iTreeIndex];
    theTree.harvesters.push(iPlayerID);
}

export function harvestMarkedTrees() {
    let allHarvestTransactions = [];

    forest.forEach(tree => {
        const newTransactions = tree.harvestMe(Game.gameData.year, Game.gameData.harvestCost);
        allHarvestTransactions = [...allHarvestTransactions, ...newTransactions];
    })

    return allHarvestTransactions;
}

/**
 * Simple calculation of biomass, a standin for the forest health
 * @returns {number}
 */
function calculateBiomass() {
    let biomass = 0;

    forest.forEach(tree => {
        biomass += tree.getBiomass();
    })
    return biomass;
}

/**
 * Create a new version of the forest (the Array `forest`)
 */
export function newForest() {
    const kColumns = Game.gameData.forestDimensions.columns;
    const kRows = Game.gameData.forestDimensions.rows;

    //  create array of ages and scramble it
    let ages = [];
    const nTrees = kColumns * kRows;
    for (let i = 0; i < nTrees; i++) {
        ages[i] = i * 1.5 * Game.gameData.yearsToAdult / nTrees
    }
    ages.scramble();

    //  make .forest array and make new Trees to fill it
    forest = [];
    let index = 0;

    for (let col = 0; col < kColumns; col++) {
        for (let row = 0; row < kRows; row++) {
            const theAge = ages[index];
            forest.push(new Tree(index, theAge, Game.gameData));
            index++;
        }
    }
    initialBiomass = calculateBiomass();
    biomass = calculateBiomass();
}


/**
 * Process the data in `forest` into a similar array, but without the `harvesters` member.
 *
 * @returns {*[]}
 */
export function getForestDataForDisplay() {
    let out = [];
    for (let i = 0; i < forest.length; i++) {
        let theTree = forest[i];
        out.push(theTree.getDisplayData());
    }
    return out;
}

/**
 * Scramble the values in the array. Found at the bottom of `scrambler.js`.
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