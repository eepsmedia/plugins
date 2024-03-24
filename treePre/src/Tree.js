/**
 * Class Tree.
 * Maintains a single Tree.
 * A lot of this is about the visual representation.
 *
 * `nature.forest` is an array of Trees.
 */
class Tree {

    constructor(index, iAge) {
        this.index = index;
        this.age = iAge;
        this.seedlingProbability = god.gameParams.seedlingProbability;
        this.harvesters = [];     //  no one has marked this tree
        this.hue = (1/360) * Math.round(100 + Math.random() * 40);     //  green between 100° and 140°

        //  dimensions: x and y of base, h and w.
        this.dim = this.makeBaseCoordinates();
        this.sizeFromAge();     //  sets h and w

    }

    /**
     * Find x and y view coordinates for the base of the tree.
     * This is random within a rectangle determined by row and column.
     *
     * @returns {{x: number, y: number}}
     */
    makeBaseCoordinates() {
        const kColumns = god.gameParams.forestDimensions.columns;
        const kRows = god.gameParams.forestDimensions.rows;
        const kHeight = god.gameParams.forestDimensions.cellHeight;
        const kWidth = god.gameParams.forestDimensions.cellWidth;

        //  base x and y, upper left of its grid cell
        const bX = (this.index % kColumns) * kWidth;
        const bY = Math.floor(this.index / kColumns) * kHeight;

        return {
            x : Math.round(bX + Math.random() * kWidth * god.gameParams.forestDimensions.ranFrac + kWidth/2),
            y : Math.round(bY + Math.random() * kHeight * god.gameParams.forestDimensions.ranFrac + kHeight)
        }
    }

    growBy(idAge) {
        this.age += idAge;
        this.sizeFromAge();
    }

    sizeFromAge( ) {
        let vAge = this.age;    //  virtual age, linearly related to height
        if (this.age > god.gameParams.yearsToAdult) {
            vAge = god.gameParams.yearsToAdult + 0.2 * (god.gameParams.yearsToAdult - this.age);
        }
        const smallest = 0.2;
        const theFrac = this.age / god.gameParams.yearsToAdult;
        const fracTwo = (smallest + (1-smallest) * theFrac);

        this.dim.h = Math.round(fracTwo * god.gameParams.forestDimensions.cellHeight),
        this.dim.w = Math.round(fracTwo * god.gameParams.forestDimensions.cellWidth)
    }


    treeValue() {
        let out = 0;
        const ATP = god.gameParams.adultTreePrice;
        const YTA = god.gameParams.yearsToAdult;
        const MSA = god.gameParams.minSalesAge;

        if (this.age >= YTA) {
            out = ATP;
        } else {
            //  out = god.gameParams.adultTreePrice * (this.age / god.gameParams.yearsToAdult)^2;
            out = (this.age < MSA) ? 0 : ATP * (this.age - MSA) / (YTA - MSA);
        }
        return out;
    }

    harvestMe() {
        const doom = this.harvesters.length
        if (doom) {
            let money = this.treeValue();
            if (doom > 1) {
                money /= (doom + 1);
            }
            this.harvesters.forEach( playerName => {
                const transIn = new Transaction(
                    playerName, god.gameParams.year, nature.biomass, money, "harvest"
                );
                const transOut = new Transaction(
                    playerName, god.gameParams.year, nature.biomass, -god.gameParams.harvestCost, "wages"
                );
                nature.currentTransactions.push(transOut);
                nature.currentTransactions.push(transIn);
            })
            this.age = 0;
            this.sizeFromAge();
        }
        this.harvesters = [];
    }

    toString() {
        return `<${Math.round(this.age, 2)}>`;
    }
}



