

let ui;


ui = {

    xDIV : null,
    yDIV : null,
    resDIV : null,

    initialize : function()  {
        this.xDIV = document.getElementById(`xDIV`);
        this.yDIV = document.getElementById(`yDIV`);
        this.testHeaderDIV = document.getElementById(`testHeaderDIV`);
        this.resDIV = document.getElementById(`resultsDIV`);
    },

    redraw : async function() {

        await data.updateData();        //  make sure we have the current data
        const possibleTestIDs = tests.confirmTestID();

        if (testimate.state.test) {
            data.removeInappropriateCases();    //  depends on the test's parameters being known (paired, numeric, etc)
            tests.updateTestResults();      //  with the right data and the test, we can calculate these results.
        }

        this.xDIV.textContent = testimate.state.xName || `drag an attribute in`;
        this.yDIV.textContent = testimate.state.yName || `drag an attribute in`;

        this.testHeaderDIV.innerHTML = this.makeTestHeaderGuts(possibleTestIDs);   //  includes the choice

        this.resDIV.innerHTML = this.makeResultsString();
        this.updateConfig();    //  reset the appearance of the configuration DIV
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

        let out = `<pre>`;

        switch (testimate.state.test) {
            case "N_01":
            case "NN01":    //  paired t
                out += `N = ${N}, mean = ${xbar}, s = ${s}, SE = ${SE}<br>`;
                out += `testing ${testDesc} ${theSidesOp} ${tests.parameters.value} <br>    t = ${t}, &alpha; = ${alpha}, ${P}<br>`;
                out += `estmating ${testDesc} <br>    ${conf}% CI = [${CImin}, ${CImax}]<br>    t* = ${tCrit} df = ${df}`;
                break;
            case "NN02":
                out += `Sorry, no code yet for a two-sample t test in this configuration.`;
                break;
            case "NN03":
                out += `Sorry, no code yet for a linear regression.`;
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
            default:
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
        out = "";
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
                out += "no test specified";
                break;
        }
        return out;
    },
}