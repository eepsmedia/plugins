class Paired extends Test {

    constructor(iID) {
        super(iID);
    }

    updateTestResults() {
        const X = data.xAttData.theArray;
        const Y = data.yAttData.theArray;
        const N = X.length;
        if (N !== Y.length) {
            alert(`Paired arrays are not the same length! Bogus results ahead!`);
        }
        let Z = [];

        for (let i = 0; i < N; i++) {
            Z[i] = X[i] - Y[i];
        }

        const jX = jStat(Z);      //  jStat version of difference array

        const theCIparam = 1 - this.parameters.alpha / 2;

        this.results.N = jX.cols();
        this.results.df = this.results.N - 1;
        this.results.mean = jX.mean();
        this.results.s = jX.stdev(true);    //      true means SAMPLE SD
        this.results.SE = this.results.s / Math.sqrt(this.results.N);
        this.results.P = jX.ttest(this.parameters.value, this.parameters.sides);
        this.results.tCrit = jStat.studentt.inv(theCIparam, this.results.df);    //  1.96-ish for 0.95
        this.results.CImax = this.results.mean + this.results.tCrit * this.results.SE;
        this.results.CImin = this.results.mean - this.results.tCrit * this.results.SE;
        this.results.t = (this.results.mean - this.parameters.value) / this.results.SE;
    }

    makeResultsString() {
        const testDesc = `${testimate.state.x.name} - ${testimate.state.y.name} `;

        const N = this.results.N;
        const mean = ui.numberToString(this.results.mean, 3);
        const s = ui.numberToString(this.results.s);
        const SE = ui.numberToString(this.results.SE);
        const P = (this.results.P < 0.0001) ?
            `P < 0.0001` :
            `P = ${ui.numberToString(this.results.P)}`;
        const CImin = ui.numberToString(this.results.CImin);
        const CImax = ui.numberToString(this.results.CImax);
        const tCrit = ui.numberToString(this.results.tCrit, 3);
        const df = ui.numberToString(this.results.df, 3);
        const t = ui.numberToString(this.results.t, 3);
        const conf = ui.numberToString(this.parameters.conf);
        const alpha = ui.numberToString(this.parameters.alpha);
        let out = "<pre>";

        out += `N = ${N}, mean = ${mean}, s = ${s}, SE = ${SE}`;
        out += `<br>paired test of ${testDesc} ${this.parameters.theSidesOp} ${this.parameters.value}`;
        out += `<br>    t = ${t},  df = ${df}, ${P}`;
        out += `<br>estmating ${testDesc} `
        out += `<br>    &alpha; = ${alpha}, t* = ${tCrit} ${conf}% CI = [${CImin}, ${CImax}]`;

        out += `</pre>`;
        return out;
    }

    makeTestDescription( ) {
        return `paired test of ${data.xAttData.name} - ${data.yAttData.name}`;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        return `paired test of ${data.xAttData.name} - ${data.yAttData.name}`;
    }

    makeConfigureGuts() {
        const sides = ui.sidesBoxHTML(this.parameters.sides);
        const value = ui.valueBoxHTML(this.parameters.value);
        const conf = ui.confBoxHTML(this.parameters.conf);
        let theHTML = `Paired test of (${data.xAttData.name} - ${data.yAttData.name}) ${sides} ${value} ${conf}`;

        return theHTML;
    }

}