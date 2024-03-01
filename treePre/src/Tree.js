class Tree {

    constructor(index, iAge) {
        this.index = index;
        this.age = iAge;
        this.seedlingProbability = god.gameParams.seedlingProbability;
        this.harvesters = [];     //  no one has marked this tree
        this.hue = (1/360) * Math.round(100 + Math.random() * 40);     //  green between 100° and 140°

        this.makeCoordinates(index);
    }

    makeCoordinates(index) {
        const kColumns = god.gameParams.forestDimensions.columns;
        const kRows = god.gameParams.forestDimensions.rows;
        const kHeight = god.gameParams.forestDimensions.cellHeight;
        const kWidth = god.gameParams.forestDimensions.cellWidth;

        const bX = (index % kColumns) * kWidth;
        const bY = Math.floor(index / kColumns) * kHeight;

        this.x = bX + Math.random() * kWidth * god.gameParams.forestDimensions.ranFrac;
        this.y = bY + Math.random() * kHeight * god.gameParams.forestDimensions.ranFrac;
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
        }
        this.harvesters = [];
    }

    toString() {
        return `<${Math.round(this.age, 2)}>`;
    }
}



