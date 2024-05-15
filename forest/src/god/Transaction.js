class Transaction {

    constructor(iPlayerID, date, biomass, amount, reason) {
        this.playerID = iPlayerID;
        this.date = date;
        this.biomass = biomass;
        this.amount = amount;
        this.reason = reason;
        this.notes = {};

/*
        iPlayer.balance += amount;
        this.balanceAfter = iPlayer.balanceAfter;
*/
    }

    toString() {
        const amount = new Intl.NumberFormat(treePre.state.lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.amount);
        const biomass = new Intl.NumberFormat(treePre.state.lang, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(this.biomass);
        return `${this.date}, ${biomass} | ${this.playerID}, ${localize.getString('moneySymbol')}${amount}, ${this.reason}`;
    }

}