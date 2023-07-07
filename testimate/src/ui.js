

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
        let theSidesOp = "≠";
        if (data.parameters.sides === 1) {
            theSidesOp =  (data.results.xbar > data.parameters.value ? ">" : "<");
        }

        const N = data.results.N;
        const xbar = this.numberToString(data.results.xbar, 3);
        const s = this.numberToString(data.results.s);
        const SE = this.numberToString(data.results.SE);
        const P = (data.results.P < 0.0001) ? `P < 0.0001` : `P = ${this.numberToString(data.results.P)}`;
        const CImin = this.numberToString(data.results.CImin);
        const CImax = this.numberToString(data.results.CImax);
        const tCrit = this.numberToString(data.results.tCrit, 3);
        const df = this.numberToString(data.results.df, 3);
        const confPct = this.numberToString(data.parameters.conf * 100);

        let out = ``;
        out += `N = ${N}, xbar = ${xbar}, s = ${s}, SE = ${SE}<br>`;
        out += `testing µ(${testimate.state.xName}) ${theSidesOp} ${data.parameters.value} gives ${P}<br>`
        out += `${confPct}% CI = [${CImin}, ${CImax}]  t* = ${tCrit} df = ${df}`;

        return out;
    },

    numberToString : function(iValue, iFigs = 4) {
        return new Intl.NumberFormat(
            testimate.constants.lang,
            {maximumSignificantDigits : iFigs}
        ).format(iValue);
    },

    makeResultsString : function() {
        let results = ``;

        if (testimate.state.xName) {
            results += this.makeXString();
        } else {

        }

        return results;
    },

    updateConfig : function() {
        let theSidesOp = "≠";
        if (data.parameters.sides === 1) {
            theSidesOp =  (data.results.xbar > data.parameters.value ? ">" : "<");
        }
        document.getElementById(`configStart`).textContent = `Testing ${testimate.state.xName} `;
        document.getElementById(`valueBox`).value = data.parameters.value;
        document.getElementById(`alphaBox`).value = data.parameters.alpha;
        document.getElementById(`sidesButton`).value = theSidesOp;
    },

}