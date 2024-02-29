class Transaction {

    constructor(pName, date, biomass, amount, reason) {
        this.pName = pName;
        this.date = date;
        this.biomass = biomass;
        this.amount = amount;
        this.reason = reason;

        const thePlayer = nature.players[pName];
        thePlayer.balance += amount;

        this.balance = thePlayer.balance;
    }

    toString() {
        const amount = new Intl.NumberFormat(treePre.state.lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.amount);
        const biomass = new Intl.NumberFormat(treePre.state.lang, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(this.biomass);
        return `${this.date}, ${biomass} | ${this.pName}, ${localize.getString('moneySymbol')}${amount}, ${this.reason}`;
    }

}