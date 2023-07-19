class Goodness extends Test {

    constructor(iID) {
        super(iID);
        this.results.expected = {};
        this.results.observed = {};
        this.results.values = [];

    }

    updateTestResults() {

        const A = data.xAttData.theArray;
        this.results.N = A.length;
        this.results.values = [...data.xAttData.valueSet];

        this.results.values.forEach( v => {
            this.results.observed[v] = 0;
            this.results.expected[v] = this.results.N / this.results.values.length;
        })

        //`count the observed values in each category
        A.forEach( a => {
            this.results.observed[a]++;
        })

        //  counts array now has all counts.

        this.results.chisq = 0;

        this.results.values.forEach( v => {
            const cellValue = (this.results.observed[v] - this.results.expected[v])**2
                / this.results.expected[v];
            this.results.chisq += cellValue;
        })

        const theCIparam = 1 - this.parameters.alpha / 2;   //  the large number
        this.results.df = this.results.values.length - 1;
        this.results.chisqCrit = jStat.chisquare.inv(theCIparam, this.results.df);    //
        this.results.P = 1 - jStat.chisquare.cdf(this.results.chisq, this.results.df);


/*
        this.results.mean = jX.mean();
        this.results.s = jX.stdev(true);    //      true means SAMPLE SD
        this.results.SE = this.results.s / Math.sqrt(this.results.N);

        this.results.tCrit = jStat.studentt.inv(theCIparam, this.results.df);    //  1.96-ish for 0.95
        this.results.CImax = this.results.mean + this.results.tCrit * this.results.SE;
        this.results.CImin = this.results.mean - this.results.tCrit * this.results.SE;
        this.results.t = (this.results.mean - this.parameters.value) / this.results.SE;
*/
    }

    makeResultsString() {
        const testDesc = `goodness of fit for ${testimate.state.xName}`;

        const N = this.results.N;
        const chisq = ui.numberToString(this.results.chisq);
        const chisqCrit = ui.numberToString(this.results.chisqCrit);
        const P = (this.results.P < 0.0001) ?
            `P < 0.0001` :
            `P = ${ui.numberToString(this.results.P)}`;
        const df = ui.numberToString(this.results.df, 3);
        const conf = ui.numberToString(this.parameters.conf);
        const alpha = ui.numberToString(this.parameters.alpha);


        let out = "<pre>";
        out += this.makeGoodnessTable();
        out += `<br>Testing goodness of fit. N = ${N}, ${this.results.values.length} values <br>`;
        out += `    chisq* = ${chisqCrit}, df = ${df}, &alpha; = ${alpha} <br>`;
        out += `    chisquare = ${chisq}, ${P}`;

        out += `</pre>`;
        return out;
    }

    makeGoodnessTable() {

        let nameRow = `<tr><th>${data.xAttData.name} =</th>`;
        let observedRow = `<tr><td>observed</td>`;
        let expectedRow = `<tr><td>expected</td>`;

        this.results.values.forEach( v => {
            nameRow += `<th>${v}</th>`;
            observedRow += `<td>${this.results.observed[v]}</td>`;
            expectedRow += `<td>${ui.numberToString(this.results.expected[v], 3)}</td>`;
        })

        nameRow += `</tr>`;
        observedRow += `</tr>`;
        expectedRow += `</tr>`;

        return `<table class="test-results">${nameRow}${observedRow}${expectedRow}</table>`;
    }

    makeTestDescription( ) {
        return `goodness of fit: ${testimate.state.xName}`;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        return `goodness of fit for ${testimate.state.xName}`;
    }

    makeConfigureGuts() {
        const sides = ui.sidesBoxHTML(this.parameters.sides);
        const value = ui.valueBoxHTML(this.parameters.value);
        const conf = ui.confBoxHTML(this.parameters.conf);
        let theHTML = `Testing mean(${data.xAttData.name}) ${sides} ${value} ${conf}`;

        return `Goodness of fit configuration (not yet!)`;
    }

}