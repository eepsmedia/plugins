

let ui;


ui = {

    xDIV : null,
    yDIV : null,
    xType : null,
    yType : null,
    resDIV : null,

    initialize : function()  {
        this.xDIV = document.getElementById(`xDIV`);
        this.yDIV = document.getElementById(`yDIV`);
        this.xType = document.getElementById(`xCNbutton`);
        this.yType = document.getElementById(`yCNbutton`);

        this.testHeaderDIV = document.getElementById(`testHeaderDIV`);
        this.resDIV = document.getElementById(`resultsDIV`);
    },

    redraw : async function() {

        await data.updateData();        //  make sure we have the current data
        this.updateAttributeBlocks();

        //  update the tests as necessary

        const possibleTestIDs = tests.confirmTestID();

        if (testimate.state.test) {
            data.removeInappropriateCases();    //  depends on the test's parameters being known (paired, numeric, etc)
            tests.updateTestResults();      //  with the right data and the test, we can calculate these results.
        }

        this.testHeaderDIV.innerHTML = this.makeTestHeaderGuts(possibleTestIDs);   //  includes the choice

        this.resDIV.innerHTML = this.makeResultsString();
        this.updateConfig();    //  reset the appearance of the configuration DIV
        this.setVisibility();
    },

    setVisibility : function() {
        document.getElementById('Ybackdrop').style.display = (testimate.state.xName) ? 'block' : 'none';
        document.getElementById('testHeaderDIV').style.display = (testimate.state.xName) ? 'block' : 'none';

    },

    updateAttributeBlocks : function() {
        this.xDIV.textContent = testimate.state.xName || `outcome/primary attribute`;
        this.yDIV.textContent = testimate.state.yName || `predictor/secondary attribute`;
        if (testimate.state.xName) {
            this.xType.textContent = testimate.state.dataTypes[testimate.state.xName];
        }
        if (testimate.state.yName) {
            this.yType.textContent = testimate.state.dataTypes[testimate.state.yName];
        }
    },

    makeResultsString : function() {
        let results = ``;

        if (testimate.state.xName) {
            results += this.makeXString();
        } else {

        }

        return results;
    },

    /**
     * Called by makeResultsString, above
     *
     * @returns {string}
     */
    makeXString : function() {
        let theSidesOp = "≠";
        if (tests.parameters.sides === 1) {
            theSidesOp =  (tests.results.xbar > tests.parameters.value ? ">" : "<");
        }
        const testDesc = this.testDescriptionString();

        const N = tests.results.N;
        const xbar = this.numberToString(tests.results.xbar, 3);
        const s = this.numberToString(tests.results.s);
        const SE = this.numberToString(tests.results.SE);
        const P = (tests.results.P < 0.0001) ? `P < 0.0001` : `P = ${this.numberToString(tests.results.P)}`;
        const CImin = this.numberToString(tests.results.CImin);
        const CImax = this.numberToString(tests.results.CImax);
        const tCrit = this.numberToString(tests.results.tCrit, 3);
        const df = this.numberToString(tests.results.df, 3);
        const conf = this.numberToString(tests.parameters.conf);
        const alpha = this.numberToString(tests.parameters.alpha);
        const t = this.numberToString(tests.results.t);
        const n1 = this.numberToString(tests.results.N1);
        const n2 = this.numberToString(tests.results.N2);
        const mean1 = this.numberToString(tests.results.mean1);
        const mean2 = this.numberToString(tests.results.mean2);
        const s1 = this.numberToString(tests.results.s1);
        const s2 = this.numberToString(tests.results.s2);
        const SE1 = this.numberToString(tests.results.SE1);
        const SE2 = this.numberToString(tests.results.SE2);
        const slope = this.numberToString(tests.results.slope);
        const intercept = this.numberToString(tests.results.intercept);

        let out = `<pre>`;

        switch (testimate.state.test) {
            case "N_01":
            case "NN01":    //  paired t
                out += `N = ${N}, mean = ${xbar}, s = ${s}, SE = ${SE}<br>`;
                out += `testing ${testDesc} ${theSidesOp} ${tests.parameters.value} <br>    t = ${t}, &alpha; = ${alpha}, ${P}<br>`;
                out += `estmating ${testDesc} <br>    ${conf}% CI = [${CImin}, ${CImax}]<br>    t* = ${tCrit} df = ${df}`;
                break;
            case "NN02":
                out += `<h3>Descriptive Stats</h3>`;
                out += `<table><tr class="headerRow"><th></th><th>N</th><th>mean</th><th>s</th><th>SE</th></tr>`;
                out += `<tr><td>${testimate.state.xName}</td><td>${n1}</td><td>${mean1}</td><td>${s1}</td><td>${SE1}</td></tr>`;
                out += `<tr><td>${testimate.state.yName}</td><td>${n2}</td><td>${mean2}</td><td>${s2}</td><td>${SE2}</td></tr>`;
                out += `</table>`;
                out += `<h3>Test</h3>`;
                out += `<p>diff = ${xbar}, SE = ${SE}, t = ${t}, df = ${df}, ${P}</p>`

                out += `This code has not been checked!`;
                break;
            case "NN03":    //      regression
                const CISmin = this.numberToString(tests.results.slopeCImin);       //  CI of slope
                const CISmax = this.numberToString(tests.results.slopeCImax);
                const CIImin = this.numberToString(tests.results.interceptCImin);   //  CI of intercept
                const CIImax = this.numberToString(tests.results.interceptCImax);
                const r = this.numberToString(tests.results.r);
                const rsq = this.numberToString(tests.results.rsq);

                const theSign = intercept >= 0 ? "+" : '-';
                out += `${testimate.state.xName} = ${slope} ${testimate.state.yName} ${theSign} ${Math.abs(intercept)} <br>`;  //  note reversal!
                out += `N = ${N}, r = ${r}, r^2 = ${rsq}, t* = ${tCrit}, df = ${df}<br>`;
                out += `slope:      ${conf}% CI = [${CISmin}, ${CISmax}]<br>`;
                out += `intercept:  ${conf}% CI = [${CIImin}, ${CIImax}]<br>`;
                out += `testing ${testDesc} ${theSidesOp} ${tests.parameters.value} <br>    t = ${t}, &alpha; = ${alpha}, ${P}<br>`;
                break;
            default:
                out += `sorry, no code yet for ${tests.testConfigurations[testimate.state.test].name}`;
                break;
        }

        out += `</pre>`;

        return out;
    },

    testDescriptionString : function() {
        let out = ``;
        switch (testimate.state.test) {
            case `N_01`:
                out += `µ(${testimate.state.xName})`;
                break;
            case `NN01`:
                out += `µ(${testimate.state.yName} - ${testimate.state.xName})`;
                break;
            case `NN02`:
                out += `µ(${testimate.state.yName}) - µ(${testimate.state.xName})`;
                break;
            case `NN03`:    //regressions
                out += `slope`;
                break;
            default:
                out += `default: ${tests.testConfigurations[testimate.state.test].name}`;
                break;
        }

        return out;
    },

    numberToString : function(iValue, iFigs = 4) {
        return new Intl.NumberFormat(
            testimate.constants.lang,
            {maximumSignificantDigits : iFigs}
        ).format(iValue);
    },

    updateConfig : function() {
        let theSidesOp = "≠";
        if (tests.parameters.sides === 1) {
            theSidesOp =  (tests.results.xbar > tests.parameters.value ? ">" : "<");
        }
        document.getElementById(`configStart`).textContent = `Testing ${this.testDescriptionString()} `;
        document.getElementById(`valueBox`).value = tests.parameters.value;
        //  document.getElementById(`alphaBox`).value = data.parameters.alpha;
        document.getElementById(`sidesButton`).value = theSidesOp;
    },

    makeTestHeaderGuts : function(iPossibleIDs) {
        let out = "";

        const theTestConfig = tests.testConfigurations[testimate.state.test];
        let thePhrase = this.makeTestDescription(testimate.state.test);

        if (iPossibleIDs.length === 1) {
            out += thePhrase;
        } else if (iPossibleIDs.length > 1) {
            let theMenu = `<select id='testMenu' onchange='handlers.changeTest()'>`;
            iPossibleIDs.forEach( theID => {
                let chosen = testimate.state.test === theID ? "selected" : "";
                theMenu += `<option value='${theID}' ${chosen}> ${this.makeTestDescription(theID)} </option>`;
            })
            theMenu += `</select>`;
            out += theMenu;
        }

        return out;
    },

    makeTestDescription: function(iTest) {
        let out = "";
        switch ( iTest ) {
            case "N_01":
                out += `one-sample t, mean of ${testimate.state.xName}`;
                break;
            case "NN01":
                out += `paired t, mean of (${testimate.state.yName} - ${testimate.state.xName})`;
                break;
            case "NN02":
                out += `two-sample t, compare µ(${testimate.state.yName}) to µ(${testimate.state.xName})`;
                break;
            case "NN03":
                out += `regression: ${testimate.state.xName} as a function of ${testimate.state.yName}`;
                break;
            default:
                out += `default description for ${tests.testConfigurations[iTest].name} (${iTest})`;
                break;
        }
        return out;
    },
}