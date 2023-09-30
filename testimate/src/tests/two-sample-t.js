class TwoSampleT extends Test {

    constructor(iID, iGrouping) {
        super(iID);
        this.grouping = iGrouping;
        this.results.groups = [];       //  names of the two groups to be displayed (depends on grouping)
        if (this.grouping) {
            const theValues = [...data.yAttData.valueSet];  //  possible values for groups
            if (!testimate.restoringFromSave) {
                testimate.setNewGroupingValue(theValues[0]);
                //  testimate.state.testParams.group = theValues[0];   //  the first, by default
            }
        } else {
            testimate.state.testParams.group = null;
        }
    }

    updateTestResults() {

        const theCIparam = 1 - testimate.state.testParams.alpha / 2;
        let A = data.xAttData.theArray;
        let B = data.yAttData.theArray;
        this.results.groups[0] = data.xAttData.name;
        this.results.groups[1] = data.yAttData.name;

        if (this.grouping) {
            [A, B] = Test.splitByGroup(A, B, testimate.state.testParams.group);
            console.log(`A = ${A}, B = ${B}`);
            this.results.groups[0] = testimate.state.testParams.group;     //  the name of a value in the second att
            this.results.groups[1] = data.yAttData.isBinary() ?
                handlers.nextValueInList([...data.yAttData.valueSet], testimate.state.testParams.group) :  //  the OTHER value
                `not ${testimate.state.testParams.group}`          //   or a more general label, NOT "a"
        }

        const j0 = jStat(A);
        const j1 = jStat(B);

        this.results.N1 = j0.cols();
        this.results.N2 = j1.cols();
        this.results.N = this.results.N1 + this.results.N2;

        this.results.df = this.results.N1 + this.results.N2 - 1;
        this.results.mean1 = j0.mean();
        this.results.mean2 = j1.mean();
        this.results.s1 = j0.stdev(true);    //      true means SAMPLE SD
        this.results.s2 = j1.stdev(true);    //      true means SAMPLE SD
        this.results.SE1 = this.results.s1 / Math.sqrt(this.results.N1);
        this.results.SE2 = this.results.s2 / Math.sqrt(this.results.N2);

        /*
        See https://en.wikipedia.org/wiki/Student%27s_t-test#Independent_two-sample_t-test.
        I'm using "Equal or unequal sample sizes, similar variance."
        Maybe we should go one further and use Welch's, which follows
        in that wikipedia article.
         */
        const sArg = ((this.results.N1 - 1) * this.results.s1 ** 2 +
                (this.results.N2 - 1) * this.results.s2 ** 2) /
            (this.results.N1 + this.results.N2 - 2);
        this.results.s = Math.sqrt(sArg);       //  pooled SD
        this.results.SE = this.results.s * Math.sqrt((1 / this.results.N1) + (1 / this.results.N2));
        this.results.diff = this.results.mean1 - this.results.mean2;
        this.results.t = (this.results.diff - testimate.state.testParams.value) / this.results.SE;

        const var1oN = j0.variance(true) / this.results.N1;
        const var2oN = j1.variance(true) / this.results.N2;     //  sample variance/N = s^2/N
        const df2 = (var1oN + var2oN) ** 2 / (var1oN ** 2 / (this.results.N1 - 1) + var2oN ** 2 / (this.results.N2)); //  variance for
        const df1 = this.results.N1 + this.results.N2 - 1;

        this.results.df = df2;

        this.results.tCrit = jStat.studentt.inv(theCIparam, this.results.df);    //  1.96-ish for 0.95
        const tAbs = Math.abs(this.results.t);
        this.results.P = jStat.studentt.cdf(-tAbs, this.results.df);
        if (testimate.state.testParams.sides === 2) this.results.P *= 2;

        this.results.CImax = this.results.diff + this.results.tCrit * this.results.SE;
        this.results.CImin = this.results.diff - this.results.tCrit * this.results.SE;

    }

    makeResultsString() {
        //  const testDesc = `mean of ${testimate.state.x.name}`;

        const N = this.results.N;
        const diff = ui.numberToString(this.results.diff, 3);
        const s = ui.numberToString(this.results.s);
        const SE = ui.numberToString(this.results.SE);

        const mean1 = ui.numberToString(this.results.mean1);
        const mean2 = ui.numberToString(this.results.mean2);
        const P = (this.results.P < 0.0001) ?
            `P < 0.0001` :
            `P = ${ui.numberToString(this.results.P)}`;
        const CImin = ui.numberToString(this.results.CImin);
        const CImax = ui.numberToString(this.results.CImax);
        const tCrit = ui.numberToString(this.results.tCrit, 3);
        const df = ui.numberToString(this.results.df, 3);
        const t = ui.numberToString(this.results.t, 3);
        const conf = ui.numberToString(testimate.state.testParams.conf);
        const alpha = ui.numberToString(testimate.state.testParams.alpha);

        let out = "<pre>";

        const DSdetails = document.getElementById("DSdetails");
        const DSopen = DSdetails && DSdetails.hasAttribute("open");

        const comparison = `${testimate.state.testParams.theSidesOp} ${testimate.state.testParams.value}`;

        const resultHed = (this.grouping) ?
            `Is the difference of means of (${testimate.state.x.name}): group ${this.results.groups[0]} - group ${this.results.groups[1]} ${comparison}?` :
            `Is the difference mean(${testimate.state.x.name}) - mean(${testimate.state.y.name}) ${comparison}?`;

        out += `${resultHed} <br>`;
        out += `<br>    N = ${N}, t = ${t}, ${P}`;
        out += `<br>    diff = ${diff},  ${conf}% CI = [${CImin}, ${CImax}] `;

        out += `<details id="DSdetails" ${DSopen ? "open" : ""}>`;
        out += `<summary>Difference of means, <i>t</i> procedure</summary>`;
        out += this.makeTwoSampleTable();
        out += `<br>    df = ${df}, &alpha; = ${alpha},  t* = ${tCrit}`
        out += `</details>`;

        out += `</pre>`;

        return out;
    }

    makeTwoSampleTable() {
        const N2 = this.results.N2;
        const N1 = this.results.N1;
        const s1 = ui.numberToString(this.results.s1);
        const s2 = ui.numberToString(this.results.s2);
        const SE1 = ui.numberToString(this.results.SE1);
        const SE2 = ui.numberToString(this.results.SE2);
        const mean1 = ui.numberToString(this.results.mean1);
        const mean2 = ui.numberToString(this.results.mean2);

        const N = this.results.N;
        const diff = ui.numberToString(this.results.diff, 3);
        const s = ui.numberToString(this.results.s);
        const SE = ui.numberToString(this.results.SE);

        const groupColHed = this.grouping ? `${testimate.state.y.name}` : "group";
        const meanColHead = this.grouping ? `mean(${testimate.state.x.name})` : `mean`;

        let out = "";
        out += `<table class="test-results"><tr class="headerRow"><th>${groupColHed}</th><th>N</th><th>${meanColHead}</th><th>s</th><th>SE</th></tr>`;
        out += `<tr><td>${this.results.groups[0]}</td><td>${N1}</td><td>${mean1}</td><td>${s1}</td><td>${SE1}</td></tr>`;
        out += `<tr><td>${this.results.groups[1]}</td><td>${N2}</td><td>${mean2}</td><td>${s2}</td><td>${SE2}</td></tr>`;
        out += `<tr><td>pooled</td><td>${N}</td><td>diff = <br>${diff}</td><td>${s}</td><td>${SE}</td></tr>`;
        out += `</table>`;
        return out;
    }

    makeTestDescription() {
        return (this.grouping) ?
            `two-sample t difference of means of (${testimate.state.x.name}): ${this.results.groups[0]} - ${this.results.groups[1]}` :
            `two-sample t difference of means: ${testimate.state.x.name} - ${testimate.state.y.name}`;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString(iID) {
        if (iID === `NN02`) {
            return `two sample t difference of means: ${testimate.state.x.name} vs ${testimate.state.y.name} `;
        } else {
            return `two-sample t difference of means: ${testimate.state.x.name} grouped by ${testimate.state.y.name}`;
        }
    }

    makeConfigureGuts() {
//  todo: make it so the groups[0] value (the label) can be changed with a button.
        const group0rep = (this.grouping) ?
            this.results.groups[0] :
            this.results.groups[0];

        const intro = (this.grouping) ?
            `difference of means of ${testimate.state.x.name}: ${group0rep} - ${this.results.groups[1]}` :
            `difference of means: ${testimate.state.x.name} - ${testimate.state.y.name}`;
        const sides = ui.sidesBoxHTML(testimate.state.testParams.sides);
        const value = ui.valueBoxHTML(testimate.state.testParams.value);
        const conf = ui.confBoxHTML(testimate.state.testParams.conf);
        let theHTML = `Testing ${intro} ${sides} ${value} ${conf}`;

        return theHTML;
    }

}