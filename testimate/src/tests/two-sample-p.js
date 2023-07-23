class TwoSampleP extends Test {

    constructor(iID, iGrouping) {
        super(iID);
        this.grouping = iGrouping;
        this.results.groupA = null;      //  label for principal value for A
        this.results.groupB = null;      //  label for principal value for B
        if (this.grouping) {
            const theValues = [...data.xAttData.valueSet];  //  possible values for groups ("birds" "mammals")
            this.parameters.group = theValues[0];   //  the default principal group = the first, by default
        } else {
            this.parameters.group = null;       //  we're comparing two attributes, not split by a grouping var
        }
    }

    updateTestResults() {
        const theCIparam = 1 - this.parameters.alpha / 2;

        let A = data.xAttData.theArray;
        let B = data.yAttData.theArray;
        this.results.groups[0] = data.xAttData.name;
        this.results.groups[1] = data.yAttData.name;

        if (this.grouping) {
            [A, B] = Test.splitByGroup(A, B, this.parameters.group);
            console.log(`A = ${A}, B = ${B}`);
            this.results.groups[0] = this.parameters.group;     //  the name of a value in the second att
            this.results.groups[1] = data.yAttData.isBinary() ?
                handlers.nextValueInList([...data.yAttData.valueSet], this.parameters.group) :  //  the OTHER value
                `not ${this.parameters.group}`          //   or a more general label, NOT "a"
        }


        const principalValueA = this.parameters.group;

        this.results.N1 = 0;
        let successesA = 0;
        A.forEach( a => {
            this.results.N1++;
            if (a === principalValueA) successesA++
        })


        this.results.N2 = 0;
        let successesB = 0;
        B.forEach( b => {
            this.results.N2++;
            if (b === labelB) successesB++
        })




        let N = 0;
        let successes = 0;
        A.forEach( x => {
            N++;
            if (x === G) successes++;
        })

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
        //  const testDesc = `mean of ${testimate.state.x.name}`;

        const N = this.results.N;
        const N2 = this.results.N2;
        const N1 = this.results.N1;
        const diff = ui.numberToString(this.results.diff, 3);
        const s = ui.numberToString(this.results.s);
        const SE = ui.numberToString(this.results.SE);

        const mean1 = ui.numberToString(this.results.mean1);
        const mean2 = ui.numberToString(this.results.mean2);
        const s1 = ui.numberToString(this.results.s1);
        const s2 = ui.numberToString(this.results.s2);
        const SE1 = ui.numberToString(this.results.SE1);
        const SE2 = ui.numberToString(this.results.SE2);
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

        out += `<table class="test-results"><tr class="headerRow"><th></th><th>N</th><th>mean</th><th>s</th><th>SE</th></tr>`;
        out += `<tr><td>${this.results.groups[0]}</td><td>${N1}</td><td>${mean1}</td><td>${s1}</td><td>${SE1}</td></tr>`;
        out += `<tr><td>${this.results.groups[1]}</td><td>${N2}</td><td>${mean2}</td><td>${s2}</td><td>${SE2}</td></tr>`;
        out += `</table>`;

        out += `<p>Difference of means test: <br>`
        out += `    diff = ${diff}, pooled SE = ${SE}<br>`;
        out += `    t = ${t}, t* = ${tCrit}, df = ${df}, ${P}</p>`

        out += `<p>Estimate: ${conf}% CI = [${CImin}, ${CImax}]  </p>`;
        out += `This code has not been checked!`;

        out += `</pre>`;

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
        const sides = ui.sidesBoxHTML(this.parameters.sides);
        const value = ui.valueBoxHTML(this.parameters.value);
        const conf = ui.confBoxHTML(this.parameters.conf);
        let theHTML = `Testing ${intro} ${sides} ${value} ${conf}`;

        return theHTML;
    }

}