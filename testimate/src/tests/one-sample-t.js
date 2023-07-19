class OneSampleT extends Test {

    constructor(iID) {
        super(iID);
    }

    updateTestResults() {
        const jX = jStat(data.xAttData.theArray);      //  jStat version of x array

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
        const testDesc = `mean of ${testimate.state.xName}`;

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

        out += `N = ${N}, mean = ${mean}, s = ${s}, SE = ${SE}<br>`;
        out += `testing ${testDesc} ${this.parameters.theSidesOp} ${this.parameters.value} <br>    `;
        out += `t = ${t}, &alpha; = ${alpha}, ${P}<br>`;
        out += `estmating ${testDesc} <br>    ${conf}% CI = [${CImin}, ${CImax}]<br>`
        out += `t* = ${tCrit} df = ${df}`;

        out += `</pre>`;
        return out;
    }

    makeTestDescription( ) {
        return `mean of ${testimate.state.xName}`;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        return `one-sample t mean of ${testimate.state.xName}`;
    }

    makeConfigureGuts() {
        const sides = ui.sidesBoxHTML(this.parameters.sides);
        const value = ui.valueBoxHTML(this.parameters.value);
        const conf = ui.confBoxHTML(this.parameters.conf);
        let theHTML = `Testing mean(${data.xAttData.name}) ${sides} ${value} ${conf}`;

        return theHTML;
    }

}