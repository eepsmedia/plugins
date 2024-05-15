class Player {

    constructor(iID, iHandle) {
        this.id = iID;
        this.handle = iHandle;
        this.balance = 0;
        this.gameCode = null;
        this.harvest = [];
        this.currentFinance = {};
    }

    receives(amount) {
        this.balance += amount;
    }

    toString() {
        return(`${this.handle} (${this.id})`);
    }

    asObject() {
        return {
            id : this.id,
            handle: this.handle,
            balance: this.balance,
            gameCode : this.gameCode,
            harvest : this.harvest,
            currentFinance : this.currentFinance
        }
    }
}