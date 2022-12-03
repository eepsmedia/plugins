const panzer = {

    experimentNumber: 0,

    initialize: async function () {
        await panzer.connect.initialize();
    },

    go: function () {
        this.experimentNumber++;

        console.log(`go!`);

        const nTanks = document.getElementById("numberOfTanksInput").value;
        const nSerials = document.getElementById("numberOfSerialNumbers").value;
        const nRepetitions = document.getElementById("numberOfRepetitions").value;

        let theSerials = [];
        for (let i = 0; i < nTanks; i++) {
            theSerials[i] = i + 1;            //  start with 1, not 0
        }

        let theValues = [];
        for (let rep = 0; rep < nRepetitions; rep++) {
            theSerials.scramble();
            for (let ser = 0; ser < nSerials; ser++) {
                const aValue = {
                    run: this.experimentNumber,
                    rep: rep + 1,
                    truth: nTanks,
                    nSerials : nSerials,
                    serial: theSerials[ser],
                }
                theValues.push(aValue);
            }
        }

        panzer.connect.emitSerials(theValues);
    },

    constants: {
        version: "2022a",
    },

}


/**
 * Scramble the values in the array. Defined at the bottom of `panzer.js`.
 */
Array.prototype.scramble = function () {
    const N = this.length;

    for (let i = 0; i < N; i++) {
        const other = Math.floor(Math.random() * N);
        const temp = this[i];
        this[i] = this[other];
        this[other] = temp;
    }
};