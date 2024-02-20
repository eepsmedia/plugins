class Transaction {

    constructor(pName, date, amount, reason) {
        this.pName = pName;
        this.date = date;
        this.amount = amount;
        this.reason = reason;

        const thePlayer = nature.players[pName];
        thePlayer.balance += amount;

        this.balance = thePlayer.balance;

    }

    toString() {
        const amount = new Intl.NumberFormat(treePre.state.lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.amount);
        return `${this.date}, ${this.pName}, €${amount}, ${this.reason}`;
    }

}