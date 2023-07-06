

let ui;


ui = {

    redraw : async function() {

        const xDIV = document.getElementById(`xDIV`);
        const resultsDIV = document.getElementById(`resultsDIV`);
        if (data.dirtyData) {
            await data.constructXArray();
        }

        data.updateResults();

        xDIV.textContent = testimate.state.xName || `drag an attribute in`;
        resultsDIV.innerHTML = this.makeResultsString();
        this.updateConfig();
    },

    makeXString : function() {
        let out = `about ${testimate.state.xName} <br>`;

        const N = data.results.N;
        const mu = this.numberToString(data.results.mu, 3);
        const s = this.numberToString(data.results.s);
        const P = this.numberToString(data.results.P);


        out += `N = ${N}, µ = ${mu}, s = ${s}, P = ${P}`;

        return out;
    },

    numberToString : function(iValue, iFigs = 4) {
        return new Intl.NumberFormat(
            testimate.constants.lang,
            {maximumSignificantDigits : iFigs}
        ).format(iValue);
    },

    makeResultsString : function() {
        let results = '---<br>results: <br>';

        if (testimate.state.xName) {
            results += this.makeXString();
        } else {

        }

        return results;
    },

    updateConfig : function() {
        let theSidesOp = "≠";
        if (data.parameters.sides === 1) {
            theSidesOp =  (data.results.mu > data.parameters.value ? ">" : "<");
        }
        document.getElementById(`configStart`).textContent = `Testing ${testimate.state.xName} `;
        document.getElementById(`valueBox`).value = data.parameters.value;
        document.getElementById(`alphaBox`).value = data.parameters.alpha;
        document.getElementById(`sidesButton`).value = theSidesOp;
    },

}