let ui;

ui = {

    xDIV: null,
    xNameDIV : null,
    yDIV: null,
    yNameDIV: null,
    xType: null,
    yType: null,
    resultsDIV: null,      //  results DIV

    theTest: null,

    initialize: function () {
        this.xDIV = document.getElementById(`xDIV`);
        this.yDIV = document.getElementById(`yDIV`);
        this.xType = document.getElementById(`xCNbutton`);
        this.yType = document.getElementById(`yCNbutton`);

        this.xNameDIV = document.getElementById(`xAttributeName`);
        this.yNameDIV = document.getElementById(`yAttributeName`);
        this.datasetDIV = document.getElementById(`datasetDIV`);
        this.testHeaderDIV = document.getElementById(`testHeaderDIV`);
        this.resultsDIV = document.getElementById(`resultsDIV`);
        this.configDIV = document.getElementById(`configureDIV`);
    },

    /**
     * Main UI function. Redraws the screen.
     *
     * @returns {Promise<void>}
     */
    redraw: async function () {
        await data.updateData();        //  make sure we have the current data
        this.updateAttributeBlocks();

        //  update the tests as necessary
        const possibleTestIDs = Test.checkTestConfiguration(); //  we now have a testimate.Test and test ID
        this.theTest = testimate.theTest;
        const theParams = testimate.state.testParams;

        if (this.theTest && this.theTest.testID) {
            //  set the sides op universally
            theParams.theSidesOp = "≠";
            if (theParams.sides === 1) {
                theParams.theSidesOp = (this.theTest.results[this.theTest.theConfig.testing] > testimate.state.testParams.value ? ">" : "<");
            }

            data.removeInappropriateCases();    //  depends on the test's parameters being known (paired, numeric, etc)
            await this.theTest.updateTestResults();      //  with the right data and the test, we can calculate these results.
            this.testHeaderDIV.innerHTML = this.makeTestHeaderGuts(possibleTestIDs);   //  includes the choice
            this.resultsDIV.innerHTML = this.theTest.makeResultsString();
            this.configDIV.innerHTML = this.theTest.makeConfigureGuts();
            this.datasetDIV.innerHTML = this.makeDatasetGuts();
            //  this.updateConfig();    //  reset the appearance of the configuration DIV
        }

        this.setVisibility();
    },

    setVisibility: function () {

        //  many things are invisible if there is no x-variable, therefore no test

        document.getElementById('Ybackdrop').style.display = (testimate.state.x) ? 'inline' : 'none';
       // document.getElementById('xCNbutton').style.display = (testimate.state.x) ? 'inline' : 'none';
        document.getElementById('testHeaderDIV').style.display = (testimate.state.x) ? 'block' : 'none';
        document.getElementById('resultsDIV').style.display = (testimate.state.x) ? 'block' : 'none';
        document.getElementById('configureDIV').style.display = (testimate.state.x) ? 'block' : 'none';

    },

    updateAttributeBlocks: function () {
        const xType = document.getElementById(`xCNbutton`);
        const yType = document.getElementById(`yCNbutton`);
        const xTrash = document.getElementById(`xTrashAttButton`);
        const yTrash = document.getElementById(`yTrashAttButton`);

        if (testimate.state.x && testimate.state.x.name) {
            this.xNameDIV.textContent = testimate.state.x.name;
            xType.value = testimate.state.dataTypes[testimate.state.x.name] == 'numeric' ? '123' : 'abc';
            xTrash.style.display = "inline";
            xType.style.display = "inline";
            this.xDIV.className = "drag-none";
        } else { // x attribute waiting for drop!
            this.xNameDIV.textContent = `drop attribute here`;
            xTrash.style.display = "none";
            xType.style.display = "none";
            this.xDIV.className = "drag-empty";
        }
        if (testimate.state.y && testimate.state.y.name) {
            this.yNameDIV.textContent = testimate.state.y.name;
            yType.value = testimate.state.dataTypes[testimate.state.y.name] == 'numeric' ? '123' : 'abc';
            yTrash.style.display = "inline";
            yType.style.display = "inline";
            this.yDIV.className = "drag-none";
        } else {
            this.yNameDIV.textContent = `drop attribute here`;
            yTrash.style.display = "none";
            yType.style.display = "none";
            this.yDIV.className = "drag-empty";
        }

    },

    numberToString: function (iValue, iFigs = 4) {
        let out = "";
        let multiplier = 1;
        let suffix = "";
        let exponential = false;

        if (Math.abs(iValue) > 1.0e15) {
            exponential = true;
        } else if (Math.abs(iValue) < 1.0e-4) {
            exponential = true;
        } else if (Math.abs(iValue) > 1.0e10) {
            multiplier = 1.0e9;
            iValue /= multiplier;
            suffix = " B";
        } else if (Math.abs(iValue) > 1.0e7) {
            multiplier = 1.0e6;
            iValue /= multiplier;
            suffix = " M";
        }


        out = new Intl.NumberFormat(
            testimate.constants.lang,
            {maximumSignificantDigits: iFigs, useGrouping: false}
        ).format(iValue);

        if (exponential) {
            out = Number.parseFloat(iValue).toExponential(iFigs);
        }

        return `${out}${suffix}`;
    },

    /**
     * returns the "sides" HTML, as in, is this a 1 or 2-sided test,
     * and what does that mean?
     * This is in the form of a clickable button so you can change it.
     *
     * @param iSides
     * @returns {"<input id=\"sidesButton\" type=\"button\" onclick=\"handlers.changeTestSides()\"
                value=\"≠\">"}
     */
    sidesBoxHTML: function (iSides) {
        const theParams = testimate.state.testParams;
        theParams.theSidesOp = "≠";
        if (iSides === 1) {
            const testStat = this.theTest.results[this.theTest.theConfig.testing];  //  testing what? mean? xbar? diff? slope?
            theParams.theSidesOp = (testStat > theParams.value ? ">" : "<");
        }

        return `<input id="sidesButton" type="button" onclick="handlers.changeTestSides()" 
                value="${theParams.theSidesOp}">`
    },

    /**
     * Button that changes which group is compared to everybody else
     * (when a categorical app needs to be made binary)
     * @param iGroup
     * @returns {`<input id="group0Button" type="button" onclick="handlers.changeGroup0()"
                value="${string}">`}
     */
    group0ButtonHTML : function(iGroup) {
        return `<input id="group0Button" type="button" onclick="handlers.changeGroup0()" 
                value="${iGroup}">`
    },

    showLogisticGraphButtonHTML : function(iGroup) {
        const theLabel = "show graph";
        return `<input id="logisticGraphButton" type="button" 
                onclick="handlers.showLogisticGraph()" 
                value="${theLabel}">`
    },

    /**
     * Construct a number <input> to receive a value such as
     * the value to be compared to
     *
     * @param iVal
     * @param iMax
     * @param iStep
     * @returns {`<input id="valueBox" class="short_number_field" onchange="handlers.changeValue()"
               ${string|string} ${string|string} type="number" value="${string}">`}
     */
    valueBoxHTML : function(iVal, iMax, iStep) {
        const maxPhrase = iMax ? `max="${iMax}"` : "";
        const stepPhrase = iStep ? `step="${iStep}"` : "";
        return `<input id="valueBox" class="short_number_field" onchange="handlers.changeValue()"
               ${maxPhrase} ${stepPhrase} type="number" value="${iVal}">`;
    },

    iterBoxHTML : function(iVal, iMax, iStep) {
        const maxPhrase = iMax ? `max="${iMax}"` : "";
        const stepPhrase = iStep ? `step="${iStep}"` : "";
        return `<input id="iterBox" class="short_number_field" onchange="handlers.changeIterations()"
               ${maxPhrase} ${stepPhrase} type="number" value="${iVal}">`;
    },

    rateBoxHTML : function(iVal, iMax, iStep) {
        const maxPhrase = iMax ? `max="${iMax}"` : "";
        const stepPhrase = iStep ? `step="${iStep}"` : "";
        return `<input id="rateBox" class="short_number_field" onchange="handlers.changeRate()"
               ${maxPhrase} ${stepPhrase} type="number" value="${iVal}">`;
    },

    logisticRegressionProbeBoxHTML : function(iVal, iMax, iStep) {
        const maxPhrase = iMax ? `max="${iMax}"` : "";
        const stepPhrase = iStep ? `step="${iStep}"` : "";
        return `<input id="logisticRegressionProbeBox" class="short_number_field" onchange="handlers.changeLogisticRegressionProbe()"
               ${maxPhrase} ${stepPhrase} type="number" value="${iVal}">`;
    },

    /**
     * Construct a number <input> to receive a
     * a confidence level. Also includes a <label>
     *
     * @param iConf
     * @returns {`<label for="confBox" id="conf_label">conf&nbsp;=&nbsp;</label>
        <input id="confBox" class="short_number_field" onchange="handlers.changeConf()"
               type="number" value="${string}" step="1" min="0" max="100">%`}
     */
    confBoxHTML : function(iConf) {
        return `<label for="confBox" id="conf_label">conf&nbsp;=&nbsp;</label>
        <input id="confBox" class="short_number_field" onchange="handlers.changeConf()"
               type="number" value="${iConf}" step="1" min="0" max="100">%`;
    },

    updateConfig: function () {
        const theConfig = Test.configs[testimate.theTest.testID];
        const theParams = testimate.state.testParams;

        document.getElementById(`configStart`).textContent = `${testimate.theTest.makeTestDescription(this.theTestID, false)} `;
        document.getElementById(`valueBox`).value = theParams.value;
        document.getElementById(`sidesButton`).value = theParams.theSidesOp;
    },

    makeTestHeaderGuts: function (iPossibleIDs) {
        let out = `<div class = "hBox">`;

        if (this.theTest) {
            const theTestConfig = Test.configs[testimate.theTest.testID];
            let thePhrase = this.theTest.makeTestDescription( );

            if (iPossibleIDs.length === 1) {
                out += thePhrase;
            } else if (iPossibleIDs.length > 1) {
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

    makeDatasetGuts : function() {
        return `Dataset: <strong>${testimate.state.dataset.name}</strong>, ${data.dataset.length} cases`;
    },
}
