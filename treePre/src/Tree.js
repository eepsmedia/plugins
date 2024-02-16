class Tree {

    constructor(index, iAge) {
        this.index = index;
        this.age = iAge;
        this.seedlingProbability = god.gameParams.seedlingProbability;
        this.harvesters = [];     //  no one has marked this tree
    }

    treeValue() {
        let out = 0;

        if (this.age >= god.gameParams.yearsToAdult) {
            out = god.gameParams.adultTreePrice;
        } else {
            out = god.gameParams.adultTreePrice * (this.age / god.gameParams.yearsToAdult);
        }
        return out;
    }

    harvestMe() {
        const doom = this.harvesters.length
        if (doom) {
            const money = this.treeValue();     //  todo: alter for >1 player
            this.harvesters.forEach( playerName => {
                god.players[playerName].receives(money);
            })
            this.age = 0;
        }
        this.harvesters = [];
    }

    toString() {
        return `<${Math.round(this.age, 2)}>`;
    }
}
