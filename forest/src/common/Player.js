class Player {

    constructor(iID, iHandle) {
        this.id = iID;
        this.handle = iHandle;
        this.balance = 0;
        this.gameCode = null;
        this.harvest = null;
    }

    toString() {
        return(`${this.handle} (${this.id}) bal: ${this.balance}`);
    }

    asObject() {
        return {
            id : this.id,
            handle: this.handle,
            balance: this.balance,
            gameCode : this.gameCode,
            harvest : this.harvest
        }
    }
}