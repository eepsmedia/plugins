class Regression extends Test {

    constructor(iID, iGrouping) {
        super(iID);
    }

    updateTestResults() {

        const theCIparam = 1 - this.parameters.alpha / 2;

        let sumXY = 0;
        let sumX = 0;
        let sumXX = 0;
        let sumYY = 0;
        let sumY = 0;
        let N = data.xAttData.theArray.length;

        if (N > 2) {
            for (let i = 0; i < N; i++) {
                //  Note how these definitions are REVERSED.
                //  we want to look at the var in the first position (xAttData) as the dependent variable (Y)
                const X = data.yAttData.theArray[i];
                const Y = data.xAttData.theArray[i];
                sumX += X;
                sumY += Y;
                sumXY += X * Y;
                sumXX += X * X;
                sumYY += Y * Y;
            }

            const slope = (N * sumXY - sumX * sumY) / (N * sumXX - sumX ** 2);
            const intercept = (sumY - slope * sumX) / N;
            const SDsqError = 1 / (N * (N - 2)) * (N * sumYY - sumY ** 2 - slope ** 2 * (N * sumXX - sumX ** 2));
            const SDsqSlope = N * SDsqError / (N * sumXX - sumX ** 2);
            const SDsqIntercept = SDsqSlope / N * sumXX;
            const r = (N * sumXY - sumX * sumY) /
                Math.sqrt((N * sumXX - sumX ** 2) * (N * sumYY - sumY ** 2));
            const rsq = r * r;


            this.results.N = N;
            this.results.slope = slope;
            this.results.intercept = intercept;
            this.results.df = N - 2;
            this.results.tCrit = jStat.studentt.inv(theCIparam, this.results.df);    //  1.96-ish for 0.95
            this.results.SEslope = SDsqSlope;
            this.results.SEintercept = SDsqIntercept;
            this.results.r = r;
            this.results.rsq = rsq;

            const SDslope = Math.sqrt(SDsqSlope);
            const SDintercept = Math.sqrt(SDsqIntercept);

            this.results.slopeCImin = slope - this.results.tCrit * SDslope;
            this.results.slopeCImax = slope + this.results.tCrit * SDslope;
            this.results.interceptCImin = intercept - this.results.tCrit * SDintercept;
            this.results.interceptCImax = intercept + this.results.tCrit * SDintercept;

            //   test slope against value
            this.results.t = (this.results.slope - this.parameters.value) / SDslope;
            const tAbs = Math.abs(this.results.t);
            this.results.P = jStat.studentt.cdf(-tAbs, this.results.df);
            if (this.parameters.sides === 2) this.results.P *= 2;
        }

    }

    makeResultsString() {
        //  const testDesc = `mean of ${testimate.state.x.name}`;
        const N = this.results.N;

        const slope = ui.numberToString(this.results.slope);       //  CI of slope
        const intercept = ui.numberToString(this.results.intercept);       //  CI of slope
        const CISmin = ui.numberToString(this.results.slopeCImin);       //  CI of slope
        const CISmax = ui.numberToString(this.results.slopeCImax);
        const CIImin = ui.numberToString(this.results.interceptCImin);   //  CI of intercept
        const CIImax = ui.numberToString(this.results.interceptCImax);
        const df = ui.numberToString(this.results.df);
        const r = ui.numberToString(this.results.r);
        const rsq = ui.numberToString(this.results.rsq);
        const t = ui.numberToString(this.results.t, 3);
        const tCrit = ui.numberToString(this.results.tCrit, 3);
        const conf = ui.numberToString(this.parameters.conf);
        const alpha = ui.numberToString(this.parameters.alpha);
        const P = (this.results.P < 0.0001) ?
            `P < 0.0001` :
            `P = ${ui.numberToString(this.results.P)}`;

        const theSign = intercept >= 0 ? "+" : '-';


        let out = "<pre>";
        out += `${testimate.state.x.name} = ${slope} ${testimate.state.y.name} ${theSign} ${Math.abs(intercept)} <br>`;  //  note reversal!
        out += `N = ${N}, r = ${r}, r^2 = ${rsq}, t* = ${tCrit}, df = ${df}<br>`;
        out += `slope:      ${conf}% CI = [${CISmin}, ${CISmax}]<br>`;
        out += `intercept:  ${conf}% CI = [${CIImin}, ${CIImax}]<br>`;
        out += `testing slope ${this.parameters.theSidesOp} ${this.parameters.value} `
        out += `<br>    t = ${t}, &alpha; = ${alpha}, ${P}`;
        out += `</pre>`;

        return out;
    }

    makeTestDescription() {
        return `linear regression of (${testimate.state.x.name}) as a function of (${testimate.state.y.name})`;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        return `linear regression of (${testimate.state.x.name}) as a function of (${testimate.state.y.name})`;
    }

    makeConfigureGuts() {
        const sides = ui.sidesBoxHTML(this.parameters.sides);
        const value = ui.valueBoxHTML(this.parameters.value);
        const conf = ui.confBoxHTML(this.parameters.conf);
        let theHTML = `Testing slope ${sides} ${value} ${conf}`;

        return theHTML;
    }

}