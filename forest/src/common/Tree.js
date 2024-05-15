/**
 * Class Tree.
 * Maintains a single Tree.
 * A lot of this is about the visual representation.
 *
 * `nature.forest` is an array of Trees.
 */
class Tree {

    constructor(index, iAge, iParams) {
        this.index = index;
        this.age = iAge;
        this.params = iParams;
        this.seedlingProbability = this.params.seedlingProbability;
        this.harvesters = [];     //  no one has marked this tree
        this.hue = (1/360) * Math.round(100 + Math.random() * 40);     //  green between 100° and 140°

        //  dimensions: x and y of base, h and w.
        this.dim = this.makeBaseCoordinates();
        this.sizeFromAge();     //  sets h and w

    }

    /**
     * The information you need to display a tree (but none of the other stuff)
     */
    getDisplayData() {
        let out = {
            index : this.index,
            age : this.age,
            hue : this.hue,
            dim : this.dim
        }
        return out;
    }

    /**
     * Find x and y view coordinates for the base of the tree.
     * This is random within a rectangle determined by row and column.
     *
     * @returns {{x: number, y: number}}
     */
    makeBaseCoordinates() {
        const kColumns = this.params.forestDimensions.columns;
        const kRows = this.params.forestDimensions.rows;
        const kHeight = this.params.forestDimensions.cellHeight;
        const kWidth = this.params.forestDimensions.cellWidth;

        //  base x and y, upper left of its grid cell
        const bX = (this.index % kColumns) * kWidth;
        const bY = Math.floor(this.index / kColumns) * kHeight;

        return {
            x : Math.round(bX + Math.random() * kWidth * this.params.forestDimensions.ranFrac + kWidth/2),
            y : Math.round(bY + Math.random() * kHeight * this.params.forestDimensions.ranFrac + kHeight)
        }
    }

    growBy(idAge) {
        this.age += idAge;
        this.sizeFromAge();
    }

    getBiomass()  {
        return this.age;
    }

    sizeFromAge( ) {
        let vAge = this.age;    //  virtual age, linearly related to height
        if (this.age > this.params.yearsToAdult) {
            vAge = this.params.yearsToAdult + 0.2 * (this.params.yearsToAdult - this.age);
        }
        const smallest = 0.2;
        const theFrac = this.age / this.params.yearsToAdult;
        const fracTwo = (smallest + (1-smallest) * theFrac);

        this.dim.h = Math.round(fracTwo * this.params.forestDimensions.cellHeight),
        this.dim.w = Math.round(fracTwo * this.params.forestDimensions.cellWidth)
    }


    treeValue() {
        let out = 0;
        const ATP = this.params.adultTreePrice;
        const YTA = this.params.yearsToAdult;
        const MSA = this.params.minSalesAge;

        if (this.age >= YTA) {
            out = ATP;
        } else {
            out = (this.age < MSA) ? 0 : ATP * (this.age - MSA) / (YTA - MSA);
        }
        return out;
    }

    harvestMe(iYear, iHarvestCost) {
        let oneTreeTransactions = [];

        const doom = this.harvesters.length
        if (doom) {
            let money = this.treeValue();
            if (doom > 1) {
                money /= (doom);
            }
            this.harvesters.forEach( player => {
                const transIn = new Transaction(
                    /*
                        note: removed 3d argument, "nature.biomass" because it was hard to get;
                        and we may not need it. I think we used it in treePre in order to
                        attach biomass to all emitted transactions. But really we only need it every year.
                     */
                    player, iYear, null, money, "harvest"
                );
                transIn.notes = {treeNo : this.index, totalValue : this.treeValue(), harvesters : this.harvesters};
                const transOut = new Transaction(
                    player, iYear, null, -iHarvestCost, "wages"
                );
                transOut.notes = {treeNo : this.index};
                oneTreeTransactions.push(transOut);
                oneTreeTransactions.push(transIn);
            })
            this.age = 0;
            this.sizeFromAge();
        }
        this.harvesters = [];

        return oneTreeTransactions;
    }

    toString() {
        return `<${Math.round(this.age, 2)}>`;
    }
}



