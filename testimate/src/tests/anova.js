class ANOVA extends Test {

    constructor(iID) {
        super(iID);
        this.results.expected = {};
        this.results.observed = {};
        this.results.values = [];

    }

    updateTestResults() {

        const A = data.xAttData.theArray;
        const G = data.yAttData.theArray;
        this.results.groupNames = [...data.yAttData.valueSet];

        this.results.N = A.length;

        if (this.results.N) {
            this.results.sum = 0;
            this.results.groupNs = new Array(this.results.groupNames.length).fill(0);


            //      calculate group means
            this.results.groupSums = new Array(this.results.groupNames.length).fill(0);
            this.results.groupMeans = new Array(this.results.groupNames.length).fill(0);

            for (let ix = 0; ix < A.length; ix++) {
                let group = this.results.groupNames.indexOf(G[ix]);
                this.results.groupNs[group]++;
                this.results.groupSums[group] += A[ix];
                this.results.sum += A[ix];
            }

            this.results.mean = this.results.sum / this.results.N;      //  grand mean
            this.results.SSR = 0;       //  between-group error (sum of squares of regression)

            //  calculate group means (loop over groups...)
            for (let ix = 0; ix < this.results.groupNames.length; ix++) {
                if (this.results.groupNs[ix]) {
                    const theGM = this.results.groupSums[ix] / this.results.groupNs[ix];
                    this.results.groupMeans[ix] = theGM;
                } else {
                    this.results.groupMeans[ix] = null; //  the group mean is null if there are no cases in the group.
                }
            }

            //  calculate within-group errors, add between-group errors

            this.results.SSE = 0;       //  sum of squares of error (within group)

            for (let ix = 0; ix < A.length; ix++) {
                let group = this.results.groupNames.indexOf(G[ix]);
                const treat = this.results.groupMeans[group] - this.results.mean; //  between
                const err = A[ix] - this.results.groupMeans[group];     //  within
                this.results.SSE += err * err;
                this.results.SSR += treat * treat;
            }

            this.results.SST = this.results.SSR + this.results.SSE;
            const theCIparam = 1 - this.parameters.alpha / 2;   //  the large number

            this.results.dfTreatment = this.results.groupNames.length - 1;      //  "numerator" between groups
            this.results.dfError = this.results.N - this.results.groupNames.length; //  "denominator" within
            this.results.dfTotal = this.results.dfError + this.results.dfTreatment;

            this.results.MSTreatment = this.results.SSR / this.results.dfTreatment;
            this.results.MSError = this.results.SSE / this.results.dfError;

            this.results.F = this.results.MSTreatment / this.results.MSError;

            this.results.FCrit = jStat.centralF.inv(theCIparam, this.results.dfTreatment, this.results.dfError);    //
            this.results.P = 1 - jStat.centralF.cdf(this.results.F, this.results.dfTreatment, this.results.dfError);
        }
    }

    makeResultsString() {

        const N = this.results.N;
        const F = ui.numberToString(this.results.F);
        const FCrit = ui.numberToString(this.results.FCrit);
        const P = (this.results.P < 0.0001) ?
            `P < 0.0001` :
            `P = ${ui.numberToString(this.results.P)}`;
        const conf = ui.numberToString(this.parameters.conf);
        const alpha = ui.numberToString(this.parameters.alpha);


        let out = "<pre>";
        out += this.makeDescriptiveTable();
        out += `<br>`;
        out += this.makeANOVATable();
        out += `N = ${N}, F* = ${FCrit}, F = ${F}, ${P}`;
        out += `</pre>`;
        return out;
    }

    makeANOVATable() {
        const dfT = ui.numberToString(this.results.dfTreatment, 3);
        const dfE = ui.numberToString(this.results.dfError, 3);
        const dfTotal = ui.numberToString(this.results.dfTotal, 3);
        const SSR = ui.numberToString(this.results.SSR, 5);
        const SSE = ui.numberToString(this.results.SSE, 5);
        const SST = ui.numberToString(this.results.SST, 5);
        const MST = ui.numberToString(this.results.MSTreatment, 5);
        const MSE = ui.numberToString(this.results.MSError, 5);
        const F = ui.numberToString(this.results.F);
        const P = (this.results.P < 0.0001) ?
            `P < 0.0001` :
            `P = ${ui.numberToString(this.results.P)}`;

        let theHTML = "<table class = 'test-results'>";
        theHTML += "<tr><th>Source</th><th>Sum of Squares (SS)</th><th>df</th><th>Mean Squares (MS)</th><th>F</th><th>P</th></tr>";
        theHTML += `<tr><th>Treatment</th><td>${SSR}</td><td>${dfT}</td><td>${MST}</td><td>${F}</td><td>${P}</td></tr>`
        theHTML += `<tr><th>Error</th><td>${SSE}</td><td>${dfE}</td><td>${MSE}</td><td></td></tr>`
        theHTML += `<tr><th>Total</th><td>${SST}</td><td>${dfTotal}</td><td></td><td></td></tr>`
        theHTML += `</table>`

        return theHTML;
    }

    makeDescriptiveTable() {
        let nameRow = `<tr><th>${data.yAttData.name} =</th>`;
        let countRow = `<tr><td>count</td>`;
        let meanRow = `<tr><td>mean</td>`;

        for (let ix = 0; ix < this.results.groupNames.length; ix++) {
            nameRow += `<th>${this.results.groupNames[ix]}</th>`;
            countRow += `<td>${this.results.groupNs[ix]}</td>`;
            meanRow += `<td>${ui.numberToString(this.results.groupMeans[ix], 3)}</td>`;

        }

        nameRow += `</tr>`;
        countRow += `</tr>`;
        meanRow += `</tr>`;

        return `<table class="test-results">${nameRow}${countRow}${meanRow}</table>`;

    }

    makeTestDescription() {
        return `ANOVA: ${testimate.state.x.name} by ${testimate.state.y.name}`;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        return `ANOVA: ${testimate.state.x.name} by ${testimate.state.y.name}`;
    }

    makeConfigureGuts() {
        const sides = ui.sidesBoxHTML(this.parameters.sides);
        const value = ui.valueBoxHTML(this.parameters.value);
        const conf = ui.confBoxHTML(this.parameters.conf);
        let theHTML = `Goodness of fit test on ${data.xAttData.name}: ${conf}`;

        return theHTML;
    }

}