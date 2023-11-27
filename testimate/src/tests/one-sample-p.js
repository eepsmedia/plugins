
class OneSampleP extends Test {

    constructor(iID) {
        super(iID);

        //  get a default "group" -- the value we count as "success" for proportions
        const theValues = [...data.xAttData.valueSet];
        if (!testimate.restoringFromSave) {
            testimate.setNewGroupingValue(theValues[0]);
            testimate.state.testParams.value = 0.5;
        }
    }

    updateTestResults() {
        //  todo: use exact binomial for small N, prop near 0 or 1
        const A = data.xAttData.theArray;
        const G = testimate.state.testParams.group;

        let N = 0;
        let successes = 0;
        A.forEach( x => {
            N++;
            if (x === G) successes++;
        })

        const theCIparam = 1 - testimate.state.testParams.alpha / 2;

        if (N > 0) {
            this.results.N = N;
            this.results.prop = successes / N;
            this.results.SE = Math.sqrt((this.results.prop) * (1 - this.results.prop) / this.results.N);
            this.results.z = (this.results.prop - testimate.state.testParams.value) / this.results.SE;

            this.results.zCrit = jStat.normal.inv(theCIparam, 0, 1);    //  1.96-ish for 0.95
            const zAbs = Math.abs(this.results.z);
            this.results.P = jStat.normal.cdf(-zAbs, 0, 1);
            if (testimate.state.testParams.sides === 2) this.results.P *= 2;

            this.results.CImax = this.results.prop + this.results.zCrit * this.results.SE;
            this.results.CImin = this.results.prop - this.results.zCrit * this.results.SE;
        }
    }

    makeResultsString() {
        const testDesc = localize.getString("tests.oneSampleP.testDescription",
            data.xAttData.name, testimate.state.testParams.group, testimate.state.testParams.theSidesOp,testimate.state.testParams.value);

        const N = this.results.N;
        const prop = ui.numberToString(this.results.prop, 4);
        const SE = ui.numberToString(this.results.SE);
        const P = (this.results.P < 0.0001) ?
            `P < 0.0001` :
            `P = ${ui.numberToString(this.results.P)}`;
        const CImin = ui.numberToString(this.results.CImin);
        const CImax = ui.numberToString(this.results.CImax);
        const zCrit = ui.numberToString(this.results.zCrit, 3);
        const z = ui.numberToString(this.results.z, 3);
        const conf = ui.numberToString(testimate.state.testParams.conf);
        const alpha = ui.numberToString(testimate.state.testParams.alpha);
        let out = "<pre>";

        out += `Is the ${testDesc}? `;
        out += `<br><br>    sample proportion = ${prop}, N = ${N}`;
        out += `<br>    z = ${z}, ${P}`;
        out += `<br>    ${conf}% CI = [${CImin}, ${CImax}]`;
        out += `<br>    SE = ${SE}, &alpha; = ${alpha}, z* = ${zCrit}`;
        out += `<br> `;

        out += `</pre>`;
        return out;
    }

    makeTestDescription(iTestID, includeName) {
        return `mean of ${testimate.state.x.name}`;
        return
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        const valueSet = data.xAttData.valueSet;
        const theValues = [...valueSet];
        //  return `one-sample proportion of ${testimate.state.x.name} = ${theValues[0]}`;
        //  return `one-sample proportion of ${testimate.state.x.name} = ${testimate.state.testParams.group}`;
        return localize.getString("tests.oneSampleP.menuString", testimate.state.x.name, testimate.state.testParams.group);
    }

    makeConfigureGuts() {
        const sides = ui.sidesBoxHTML(testimate.state.testParams.sides);
        const value = ui.valueBoxHTML(testimate.state.testParams.value, 0.0, 1.0, 0.05);
        const conf = ui.confBoxHTML(testimate.state.testParams.conf);
        const group = ui.group0ButtonHTML(testimate.state.testParams.group);
        let theHTML = `Testing prop(${data.xAttData.name} = ${group}) ${sides} ${value} ${conf}`;

        return theHTML;
    }


}