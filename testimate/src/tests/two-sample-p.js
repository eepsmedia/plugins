class TwoSampleP extends Test {

    constructor(iID, iGrouping) {
        super(iID);
        this.grouping = iGrouping;
        this.results.successValueA = null;      //  label for principal value for group A
        this.results.successValueB = null;      //  label for principal value for B

    }

    static rotateSuccessValueA() {
        const initialValue = testimate.theTest.results.successValueA;
        const valueSet = [...data.xAttData.valueSet];
        testimate.theTest.results.successValueA = handlers.nextValueInList(valueSet, initialValue);

        if (testimate.theTest.grouping) {
            testimate.theTest.results.successValueB = testimate.theTest.results.successValueA;
        }
        ui.redraw();
    }
    static rotateSuccessValueB() {
        const initialValue = testimate.theTest.results.successValueB;
        const valueSet = [...data.yAttData.valueSet];
        testimate.theTest.results.successValueB = handlers.nextValueInList(valueSet, initialValue);
        ui.redraw();
    }

    updateTestResults() {
        const theCIparam = 1 - testimate.state.testParams.alpha / 2;

        let A = data.xAttData.theArray;
        let B = data.yAttData.theArray;

        if (this.grouping) {
            //  A (X) holds the data and values
            //  B (Y) holds the group membership.

            const theGroups = [...data.yAttData.valueSet];
            this.results.labelA = theGroups[0];
            this.results.labelB = data.xAttData.isBinary() ?
                handlers.nextValueInList(theGroups, this.results.labelA) :  //  the OTHER value
                `not ${this.results.labelA}`

            const theValues = [...data.xAttData.valueSet];
            this.results.successValueA = this.results.successValueA || theValues[0];   //  the default principal group = the first, by default
            this.results.successValueB = this.results.successValueB || theValues[0];   // must be the same as for A if we're grouped

            [A, B] = Test.splitByGroup(A, B, this.results.labelA);

        } else {
            this.results.labelA = data.xAttData.name;
            this.results.labelB = data.yAttData.name;

            const theAValues = [...data.xAttData.valueSet];
            this.results.successValueA = this.results.successValueA || theAValues[0];   //  the default principal group = the first, by default
            const theBValues = [...data.yAttData.valueSet];
            if (theBValues.includes(this.results.successValueA)) {
                //  we don't do the "or" here so that if the value exists in A,
                //  a change will "drag" B along.
                //  There is a chance this is not what the user wants.
                this.results.successValueB = this.results.successValueA;
            } else {
                this.results.successValueB =  this.results.successValueB || theBValues[0];
            }
        }

        //  count cases and successes in "A"
        this.results.N1 = 0;
        let successesA = 0;
        A.forEach( a => {
            this.results.N1++;
            if (a === this.results.successValueA) successesA++
        })

        //  count cases and successes in "B"
        this.results.N2 = 0;
        let successesB = 0;
        B.forEach( b => {
            this.results.N2++;
            if (b === this.results.successValueB) successesB++
        })

        this.results.N = this.results.N1 + this.results.N2;
        if (this.results.N1 > 0 && this.results.N2 > 0) {
            this.results.prop = (successesA + successesB) / this.results.N;
            this.results.prop1 = successesA /this.results.N1;
            this.results.prop2 = successesB /this.results.N2;
            this.results.SE1 = Math.sqrt(this.results.prop1 * (1 - this.results.prop1) / this.results.N1);
            this.results.SE2 = Math.sqrt(this.results.prop2 * (1 - this.results.prop2) / this.results.N2);

            this.results.SE = Math.sqrt(
                (this.results.prop1) * (1 - this.results.prop1) / this.results.N1 +
                (this.results.prop2) * (1 - this.results.prop2) / this.results.N2
            );

            //  the test p1 - p2
            this.results.pDiff = this.results.prop1 - this.results.prop2;

            //  test statistic = z
            this.results.z = (this.results.pDiff - testimate.state.testParams.value) / this.results.SE;
            this.results.zCrit = jStat.normal.inv(theCIparam, 0, 1);    //  1.96-ish for 0.95

            const zAbs = Math.abs(this.results.z);
            this.results.P = jStat.normal.cdf(-zAbs, 0, 1);
            if (testimate.state.testParams.sides === 2) this.results.P *= 2;

            this.results.CImax = this.results.pDiff + this.results.zCrit * this.results.SE;
            this.results.CImin = this.results.pDiff - this.results.zCrit * this.results.SE;
        }
    }

    makeResultsString() {
        //  const testDesc = `mean of ${testimate.state.x.name}`;

        const N = this.results.N;
        const N2 = this.results.N2;
        const N1 = this.results.N1;
        const pDiff = ui.numberToString(this.results.pDiff, 3);
        const SE = ui.numberToString(this.results.SE);

        const p1 = ui.numberToString(this.results.prop1);
        const p2 = ui.numberToString(this.results.prop2);

        const P = (this.results.P < 0.0001) ?
            `P < 0.0001` :
            `P = ${ui.numberToString(this.results.P)}`;
        const CImin = ui.numberToString(this.results.CImin);
        const CImax = ui.numberToString(this.results.CImax);
        const zCrit = ui.numberToString(this.results.zCrit, 3);

        const z = ui.numberToString(this.results.z, 3);
        const conf = ui.numberToString(testimate.state.testParams.conf);
        const alpha = ui.numberToString(testimate.state.testParams.alpha);

        const DSdetails = document.getElementById("DSdetails");
        const DSopen = DSdetails && DSdetails.hasAttribute("open");

        let out = "<pre>";

        const groupingPhrase = `(${testimate.state.x.name} = ${this.results.successValueA}): ${this.results.labelA} - ${this.results.labelB}`;
        const nonGroupingPhrase = `(${testimate.state.x.name} = ${this.results.successValueA}) - (${testimate.state.y.name} = ${this.results.successValueB})`;

        const comparison = `${testimate.state.testParams.theSidesOp} ${testimate.state.testParams.value}`;
        const resultHed = (this.grouping) ?
            `${localize.getString("tests.twoSampleP.testQuestionHead")} ${groupingPhrase} ${comparison}?` :
            `${localize.getString("tests.twoSampleP.testQuestionHead")} ${nonGroupingPhrase} ${comparison}?`;

        out += `${resultHed} <br>`;
        out += `<br>    N = ${N}, SE = ${SE}, z = ${z}, ${P}`;
        out += `<br>    diff = ${pDiff},  ${conf}% CI = [${CImin}, ${CImax}] `;

        out += `<details id="DSdetails" ${DSopen ? "open" : ""}>`;
        out += localize.getString("tests.twoSampleP.detailsSummary");
        out += this.makeTwoSampleTable();
        out += `<br>     &alpha; = ${alpha}, z* = ${zCrit}</p>`
        out += `</details>`;

        out += `</pre>`;

        return out;
    }

    makeTwoSampleTable() {
        const SE1 = ui.numberToString(this.results.SE1);
        const SE2 = ui.numberToString(this.results.SE2);
        const SE = ui.numberToString(this.results.SE);
        const N2 = this.results.N2;
        const N1 = this.results.N1;
        const N = this.results.N;
        const p1 = ui.numberToString(this.results.prop1);
        const p2 = ui.numberToString(this.results.prop2);
        const prop = ui.numberToString(this.results.prop);

        const groupColHead = this.grouping ?  `${data.yAttData.name}` : localize.getString("group");
        const ungroupedPropString = this.results.successValueA === this.results.successValueB ?
            `${localize.getString("value")} = ${this.results.successValueA}` :
            `${localize.getString("values")} = ${this.results.successValueA}, ${this.results.successValueB}`;
        const propColHead = this.grouping ?
            `${localize.getString("proportion")}<br>${data.xAttData.name} = ${this.results.successValueA}` :
            `${localize.getString("proportion")}<br>${ungroupedPropString}`;
        const pooled = localize.getString("pooled");

        let out = "";

        out += `<table class="test-results">`;
        out += `<tr class="headerRow"><th>${groupColHead}</th><th>N</th><th>${propColHead}</th><th>SE</th></tr>`;
        out += `<tr><td>${this.results.labelA}</td><td>${N1}</td><td>${p1}</td><td>${SE1}</td></tr>`;
        out += `<tr><td>${this.results.labelB}</td><td>${N2}</td><td>${p2}</td><td>${SE2}</td></tr>`;
        out += `<tr><td>${pooled}</td><td>${N}</td><td>${prop}</td><td></td></tr>`;
        out += `</table>`;

        return out
    }


    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString(iID) {
        if (iID === `BB02`) {
            return localize.getString("tests.twoSampleP.menuString1", testimate.state.x.name, testimate.state.y.name);
        } else {
            return localize.getString("tests.twoSampleP.menuString2", testimate.state.x.name, testimate.state.y.name);
        }
    }

    makeConfigureGuts() {
        const configStart = localize.getString("tests.twoSampleP.configStart");

        const intro = (this.grouping) ?
            `${configStart}: <br>&emsp;(${testimate.state.x.name} = ${this.successValueButtonA()}) : ${this.results.labelA} - ${this.results.labelB}` :
            `${configStart}: <br>&emsp;(${testimate.state.x.name} = ${this.successValueButtonA()}) - (${testimate.state.y.name} = ${this.successValueButtonB()}) `;
        const sides = ui.sidesBoxHTML(testimate.state.testParams.sides);
        const value = ui.valueBoxHTML(testimate.state.testParams.value, 0.0, 1.0, .05);
        const conf = ui.confBoxHTML(testimate.state.testParams.conf);
        let theHTML = `${intro} ${sides} ${value} <br>&emsp;${conf}`;

        return theHTML;
    }

    successValueButtonA( ) {
        return `<input id="successButtonA" type="button" onclick="TwoSampleP.rotateSuccessValueA()" 
                value="${this.results.successValueA}">`
    }

    successValueButtonB( ) {
        return `<input id="successButtonB" type="button" onclick="TwoSampleP.rotateSuccessValueB()" 
                value="${this.results.successValueB}">`
    }

}