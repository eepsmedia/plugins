
class OneSampleP extends Test {

    constructor(iID) {
        super(iID);

        //  get a default "group" -- the value we count as "success" for proportions
        const theValues = [...data.xAttData.valueSet];
        this.parameters.group = theValues[0];   //  the first, by default
        this.parameters.value = 0.5;
    }

    updateTestResults() {
        const A = data.xAttData.theArray;
        const G = this.parameters.group;

        let N = 0;
        let successes = 0;
        A.forEach( x => {
            N++;
            if (x === G) successes++;
        })

        const theCIparam = 1 - this.parameters.alpha / 2;

        if (N > 0) {
            this.results.N = N;
            this.results.p = successes / N;
            this.results.SE = Math.sqrt((this.results.p) * (1 - this.results.p) / this.results.N);
            this.results.z = (this.results.p - this.parameters.value) / this.results.SE;

            this.results.zCrit = jStat.normal.inv(theCIparam, 0, 1);    //  1.96-ish for 0.95
            const zAbs = Math.abs(this.results.z);
            this.results.P = jStat.normal.cdf(-zAbs, 0, 1);
            if (this.parameters.sides === 2) this.results.P *= 2;

            this.results.CImax = this.results.p + this.results.zCrit * this.results.SE;
            this.results.CImin = this.results.p - this.results.zCrit * this.results.SE;
        }
    }

    makeResultsString() {
        const testDesc = `proportion of ${data.xAttData.name} = ${this.parameters.group}`;

        const N = this.results.N;
        const p = ui.numberToString(this.results.p, 4);
        const SE = ui.numberToString(this.results.SE);
        const P = (this.results.P < 0.0001) ?
            `P < 0.0001` :
            `P = ${ui.numberToString(this.results.P)}`;
        const CImin = ui.numberToString(this.results.CImin);
        const CImax = ui.numberToString(this.results.CImax);
        const zCrit = ui.numberToString(this.results.zCrit, 3);
        const z = ui.numberToString(this.results.z, 3);
        const conf = ui.numberToString(this.parameters.conf);
        const alpha = ui.numberToString(this.parameters.alpha);
        let out = "<pre>";

        out += `N = ${N}, p = ${p}, SE = ${SE}<br>`;
        out += `testing ${testDesc} ${this.parameters.theSidesOp} ${this.parameters.value} <br>    `;
        out += `z = ${z}, &alpha; = ${alpha}, ${P}<br>`;
        out += `estmating ${testDesc} <br>   z* = ${zCrit}, ${conf}% CI = [${CImin}, ${CImax}]<br>`

        out += `</pre>`;
        return out;
    }

    makeTestDescription(iTestID, includeName) {
        return `mean of ${testimate.state.xName}`;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        const valueSet = data.xAttData.valueSet;
        const theValues = [...valueSet];
        return `one-sample proportion of ${testimate.state.xName} = ${theValues[0]}`;
    }

    makeConfigureGuts() {
        const sides = ui.sidesBoxHTML(this.parameters.sides);
        const value = ui.valueBoxHTML(this.parameters.value, 1.0, 0.05);
        const conf = ui.confBoxHTML(this.parameters.conf);
        const group = ui.group0ButtonHTML(this.parameters.group);
        let theHTML = `Testing p(${data.xAttData.name} = ${group}) ${sides} ${value} ${conf}`;

        return theHTML;
    }


}