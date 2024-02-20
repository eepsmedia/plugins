class Tree {

    constructor(index, iAge) {
        this.index = index;
        this.age = iAge;
        this.seedlingProbability = god.gameParams.seedlingProbability;
        this.harvesters = [];     //  no one has marked this tree
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
                const transIn = new Transaction(playerName, god.gameParams.year, money, "harvest");
                const transOut = new Transaction(playerName, god.gameParams.year, -god.gameParams.harvestCost, "wages");
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
