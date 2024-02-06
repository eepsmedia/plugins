

class MoveLog {

    static newline = '\n';

    record = {};
    constructor(iWhy, iData) {
        this.record = {
            when : new Date(),
            who : syllo.username,
            why : iWhy,
        }

        this.record = {...this.record, ...iData};
    }

    static makeValues(iMoveArray) {
        let theValues = [];
        let theKeys = new Set(["when", "who", "why"]);
        let theTemplate = {};

        //  collect all possible keys
        iMoveArray.forEach( M => {
            for (let k in M) {
                theKeys.add(k);
            }
        })

        // make blank template object
        theKeys.forEach( K => {
            theTemplate[K] = null;
        })

        iMoveArray.forEach(M => {
            const item = {...theTemplate, ...M};    //  now object has all fields
            theValues.push(item);
        })

        return theValues;
    }

    static makeCSV(iMoveArray) {
        let out = "";

        const valueArray = this.makeValues(iMoveArray);
        const theKeys = Object.keys(valueArray[0]);

        //  key row
        out += theKeys.join(", ") + MoveLog.newline;

        valueArray.forEach( V => {
            let valuesOnly = [];
            for (let i = 0; i < theKeys.length; i++) {
                const k = theKeys[i];
                valuesOnly.push(V[k]);
            }
            out += valuesOnly.join(", ") + MoveLog.newline;
        })

        return out;
    }
}