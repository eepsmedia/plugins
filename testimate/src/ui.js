

let ui;


ui = {

    xDIV: null,
    yDIV: null,
    xType: null,
    yType: null,
    resultsDIV: null,      //  results DIV

    theTest: null,

    initialize: function () {
        this.xDIV = document.getElementById(`xDIV`);
        this.yDIV = document.getElementById(`yDIV`);
        this.xType = document.getElementById(`xCNbutton`);
        this.yType = document.getElementById(`yCNbutton`);

        this.testHeaderDIV = document.getElementById(`testHeaderDIV`);
        this.resultsDIV = document.getElementById(`resultsDIV`);
        this.configDIV = document.getElementById(`configureDIV`);
    },

    redraw: async function () {
        await data.updateData();        //  make sure we have the current data
        this.updateAttributeBlocks();

        //  update the tests as necessary
        const possibleTestIDs = Test.checkTestConfiguration(); //  we now have a test ID
        this.theTest = testimate.theTest;

        if (this.theTest && this.theTest.testID) {
            data.removeInappropriateCases();    //  depends on the test's parameters being known (paired, numeric, etc)
            this.theTest.updateTestResults();      //  with the right data and the test, we can calculate these results.
            this.testHeaderDIV.innerHTML = this.makeTestHeaderGuts(possibleTestIDs);   //  includes the choice
            this.resultsDIV.innerHTML = this.theTest.makeResultsString();
            this.configDIV.innerHTML = this.theTest.makeConfigureGuts();
            //  this.updateConfig();    //  reset the appearance of the configuration DIV
        }

        this.setVisibility();
    },

    setVisibility: function () {

        //  many things are invisible if there is no x-variable, therefore no test

        document.getElementById('Ybackdrop').style.display = (testimate.state.xName) ? 'inline' : 'none';
        document.getElementById('xCNbutton').style.display = (testimate.state.xName) ? 'inline' : 'none';
        document.getElementById('testHeaderDIV').style.display = (testimate.state.xName) ? 'block' : 'none';
        document.getElementById('resultsDIV').style.display = (testimate.state.xName) ? 'block' : 'none';
        document.getElementById('configureDIV').style.display = (testimate.state.xName) ? 'block' : 'none';

    },

    updateAttributeBlocks: function () {
        this.xDIV.textContent = testimate.state.xName || `outcome/primary attribute`;
        this.yDIV.textContent = testimate.state.yName || `predictor/secondary attribute`;

        //  set the text in the "types" buttons

        if (testimate.state.xName) {
            this.xType.textContent = testimate.state.dataTypes[testimate.state.xName];
        }
        if (testimate.state.yName) {
            this.yType.textContent = testimate.state.dataTypes[testimate.state.yName];
        }
    },

    /*
        makeResultsString : function() {
            let results = ``;

            if (testimate.state.xName) {
                results += this.makeXString();
            } else {

            }

            return results;
        },
    */

    /**
     * Called by redraw, above
     *
     * @returns {string}
     */
/*
    makeResultsString: function () {
        const theConfig = Test.configs[Test.testID];

        tests.parameters.theSidesOp = "≠";
        if (tests.parameters.sides === 1) {
            tests.parameters.theSidesOp = (tests.results[theConfig.testing] > tests.parameters.value ? ">" : "<");
        }
        const testDesc = this.makeTestDescription(testimate.state.testID, false);

        const N = tests.results.N;
        const xbar = this.numberToString(tests.results.xbar, 3);
        const diff = this.numberToString(tests.results.diff, 3);
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

        switch (testimate.state.testID) {
            case "N_01":
            case "NN01":    //  paired t
                out += `N = ${N}, mean = ${xbar}, s = ${s}, SE = ${SE}<br>`;
                out += `testing ${testDesc} ${tests.parameters.theSidesOp} ${tests.parameters.value} <br>    t = ${t}, &alpha; = ${alpha}, ${P}<br>`;
                out += `estmating ${testDesc} <br>    ${conf}% CI = [${CImin}, ${CImax}]<br>    t* = ${tCrit} df = ${df}`;
                break;
            case "NN02":
            case `NB01`:    //  two-sample t
                            // out += sprintf(`Descriptive stats\n`);
                            // out += sprintf(`%10s%5s%10s%10s%10s\n`,'group','N', 'mean','s','SE');
                            // out += sprintf(`%10s%5d%10.3f%10.3f%10.3f\n`,tests.results.groups[0],n1, mean1,s1,SE1);
                            // out += sprintf(`%10s%5d%10.3f%10.3f%10.3f\n`,tests.results.groups[1],n2, mean2,s2,SE2);
                out += `<table class="test-results"><tr class="headerRow"><th></th><th>N</th><th>mean</th><th>s</th><th>SE</th></tr>`;
                out += `<tr><td>${tests.results.groups[0]}</td><td>${n1}</td><td>${mean1}</td><td>${s1}</td><td>${SE1}</td></tr>`;
                out += `<tr><td>${tests.results.groups[1]}</td><td>${n2}</td><td>${mean2}</td><td>${s2}</td><td>${SE2}</td></tr>`;
                out += `</table>`;
                out += `<p>Test: diff = ${diff}, SE = ${SE}, t = ${t}, df = ${df}, ${P}</p>`

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
                out += `testing ${testDesc} ${tests.parameters.theSidesOp} ${tests.parameters.value} <br>    t = ${t}, &alpha; = ${alpha}, ${P}<br>`;
                break;

            default:
                out += `sorry, no display code yet for ${tests.testConfigurations[testimate.state.testID].name}`;
                break;
        }

        out += `</pre>`;

        return out;
    },
*/

    numberToString: function (iValue, iFigs = 4) {
        return new Intl.NumberFormat(
            testimate.constants.lang,
            {maximumSignificantDigits: iFigs}
        ).format(iValue);
    },

    sidesBoxHTML: function (iSides) {
        this.theTest.parameters.theSidesOp = "≠";
        if (iSides === 1) {
            const testStat = this.theTest.results[this.theTest.theConfig.testing];  //  testing what? mean? xbar? diff? slope?
            this.theTest.parameters.theSidesOp = (testStat > this.theTest.parameters.value ? ">" : "<");
        }

        return `<input id="sidesButton" type="button" onclick="handlers.changeTestSides()" 
                value="${this.theTest.parameters.theSidesOp}">`
    },

    group0ButtonHTML : function(iGroup) {
        return `<input id="group0Button" type="button" onclick="handlers.changeGroup0()" 
                value="${iGroup}">`
    },

    valueBoxHTML : function(iVal, iMax, iStep) {
        const maxPhrase = iMax ? `max="${iMax}"` : "";
        const stepPhrase = iStep ? `step="${iStep}"` : "";
        return `<input id="valueBox" class="short_number_field" onchange="handlers.changeValue()"
               ${maxPhrase} ${stepPhrase} type="number" value="${iVal}">`;
    },

    confBoxHTML : function(iConf) {
        return `<label for="confBox" id="conf_label">conf&nbsp;=&nbsp;</label>
        <input id="confBox" class="short_number_field" onchange="handlers.changeConf()"
               type="number" value="${iConf}" step="1" min="0" max="100">%`
    },

    updateConfig: function () {
        const theConfig = Test.configs[testimate.theTest.testID];

        document.getElementById(`configStart`).textContent = `${testimate.theTest.makeTestDescription(this.theTestID, false)} `;
        document.getElementById(`valueBox`).value = this.theTest.parameters.value;
        document.getElementById(`sidesButton`).value = this.theTest.parameters.theSidesOp;
    },

    makeTestHeaderGuts: function (iPossibleIDs) {
        let out = `<div class = "hBox">`;

        if (this.theTest) {
            const theTestConfig = Test.configs[testimate.theTest.testID];
            let thePhrase = this.theTest.makeTestDescription( );

            if (iPossibleIDs.length === 1) {
                out += thePhrase;
            } else if (iPossibleIDs.length > 1) {
                const name0 = testimate.state.xName;
                const name1 = testimate.state.yName;
                let theMenu = `<select id='testMenu' onchange='handlers.changeTest()'>`;
                iPossibleIDs.forEach(theID => {
                    let chosen = testimate.theTest.testID === theID ? "selected" : "";
                    const menuString = Test.configs[theID].makeMenuString();
                    theMenu += `<option value='${theID}' ${chosen}> ${menuString} </option>`;
                })
                theMenu += `</select>`;
                out += theMenu;
            }

            out += `<div id="emitButton" class="testimateButton" onclick="handlers.emit()">emit</div>`;
        } else {
            out = "no tests available with these settings!";
        }

        out += `</div>`;    //  close the hBox DIV
        return out;
    },
}
