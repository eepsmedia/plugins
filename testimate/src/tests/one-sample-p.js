
class OneSampleP extends Test {

    usingBinomial = false;

    constructor(iID) {
        super(iID);

        //  get a default "group" -- the value we count as "success" for proportions
        if (!testimate.restoringFromSave || !testimate.state.testParams.focusGroup) {
            testimate.state.testParams.value = 0.5;
            testimate.state.testParams.focusGroup = testimate.state.focusGroupDictionary[data.xAttData.name];
        }
    }

    async updateTestResults() {
        //  todo: use exact binomial for small N, prop near 0 or 1
        const A = data.xAttData.theArray;
        const G = testimate.state.testParams.focusGroup;

        let N = 0;
        this.results.successes = 0;
        A.forEach( x => {
            N++;
            if (x === G) this.results.successes++;
        })

        const theCIparam = 1 - testimate.state.testParams.alpha / 2;

        if (N > 0) {
            this.results.N = N;
            this.results.prop = this.results.successes / N;

            this.usingBinomial = (N < 30);

            if (this.usingBinomial) {

                const binomialResult = binomial.CIbeta(N, this.results.successes, testimate.state.testParams.alpha);
                this.results.CImin = binomialResult[0];
                this.results.CImax = binomialResult[1];

                const zAbs = Math.abs(this.results.z);
                this.results.P = jStat.normal.cdf(-zAbs, 0, 1);     //  todo: fix this for binomial
                if (testimate.state.testParams.sides === 2) this.results.P *= 2;

                this.results.SE = Math.sqrt((this.results.prop) * (1 - this.results.prop) / this.results.N);
                this.results.z = "";
                this.results.zCrit = "";

            } else {        //  not using binomial

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
    }

    makeResultsString() {

        const N = this.results.N;
        const successes = ui.numberToString(this.results.successes);
        const prop = ui.numberToString(this.results.prop, 4);
        const P = (this.results.P < 0.0001) ?
            `P < 0.0001` :
            `P = ${ui.numberToString(this.results.P)}`;
        const CImin = ui.numberToString(this.results.CImin);
        const CImax = ui.numberToString(this.results.CImax);
        const conf = ui.numberToString(testimate.state.testParams.conf);
        const alpha = ui.numberToString(testimate.state.testParams.alpha);
        const value = ui.numberToString(testimate.state.testParams.value);
        const sidesOp = testimate.state.testParams.theSidesOp;

        let out = "<pre>";
        const testQuestion = localize.getString("tests.oneSampleP.testQuestion",
            data.xAttData.name, testimate.state.testParams.focusGroup, sidesOp, value);
        const r1 = localize.getString( "tests.oneSampleP.resultsLine1", prop, successes, N);

        out += testQuestion;
        out += `<br><br>    ${r1}`;

        if (this.usingBinomial) {
            out += `<br>    ${conf}% ${localize.getString("CI")} = [${CImin}, ${CImax}]`;
            out += `<br>        (${localize.getString("tests.oneSampleP.usingBinomialProc")})`;

        } else {
            const SE = ui.numberToString(this.results.SE);
            const zCrit = ui.numberToString(this.results.zCrit, 3);
            const z = ui.numberToString(this.results.z, 3);

            out += `<br>    z = ${z}, ${P}`;
            out += `<br>    ${conf}% ${localize.getString("CI")} = [${CImin}, ${CImax}]`;
            out += `<br>    SE = ${SE}, &alpha; = ${alpha}, z* = ${zCrit}`;
            out += `<br>        (${localize.getString("tests.oneSampleP.usingZProc")})`;
        }

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
        if(!testimate.state.focusGroupDictionary[data.xAttData.name]) {
            testimate.setFocusGroup(data.xAttData, null);
        }
        const rememberedGroup = testimate.state.focusGroupDictionary[data.xAttData.name];

        return localize.getString("tests.oneSampleP.menuString",
            testimate.state.x.name, rememberedGroup);
    }

    makeConfigureGuts() {
        const configStart = localize.getString("tests.oneSampleP.configurationStart");

        const sides = ui.sidesBoxHTML(testimate.state.testParams.sides);
        const value = ui.valueBoxHTML(testimate.state.testParams.value, 0.0, 1.0, 0.05);
        const conf = ui.confBoxHTML(testimate.state.testParams.conf);
        const group = ui.focusGroupButtonHTML(ui.getFocusGroupName());
        let theHTML = `${configStart}(${data.xAttData.name} = ${group}) ${sides} ${value} ${conf}`;

        return theHTML;
    }


}