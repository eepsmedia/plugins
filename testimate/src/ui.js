let ui;

ui = {

    xDIV: null,
    xNameDIV: null,
    yDIV: null,
    yNameDIV: null,
    xType: null,
    yType: null,
    resultsDIV: null,      //  results DIV

    emitMode : "single",

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
        this.emitControls = document.getElementById(`emitControls`);
    },

    /**
     * Main UI function. Redraws the screen.
     *
     * @returns {Promise<void>}
     */
    redraw: async function () {

        if (testimate.state.dataset) {
            /**
             * This makes sure data is current, and also creates the `data.xAttData` and `data.yAttData` arrays,
             * and evaluates the values to tell whether the attributes are numeric or categorical.
             * We need this in order to figure out which tests are appropriate,
             * and (importantly) to set a test if it has not yet been set.
             */
            await data.updateData();        //  make sure we have the current data
            await data.makeXandYArrays(testimate.state.x.name, testimate.state.y.name, data.dataset);

            //  update the tests as necessary
            const possibleTestIDs = Test.checkTestConfiguration(); //  we now have a testimate.Test and test ID
            this.theTest = testimate.theTest;

            if (this.theTest && this.theTest.testID) {
                //  set the sides op universally
                testimate.state.testParams.theSidesOp = "≠";
                if (testimate.state.testParams.sides === 1) {
                    testimate.state.testParams.theSidesOp = (this.theTest.results[this.theTest.theConfig.testing] > testimate.state.testParams.value ? ">" : "<");
                }

                data.removeInappropriateCases();    //  depends on the test's parameters being known (paired, numeric, etc)
                await this.theTest.updateTestResults();      //  with the right data and the test, we can calculate these results.

                //      create the text and other display information for the results

                this.datasetDIV.innerHTML = await this.makeDatasetGuts();
                this.testHeaderDIV.innerHTML = this.makeTestHeaderGuts(possibleTestIDs);   //  includes the choice menu
                this.resultsDIV.innerHTML = this.theTest.makeResultsString();
                this.configDIV.innerHTML = this.theTest.makeConfigureGuts();
                document.getElementById("randomEmitNumberBox").value = testimate.state.randomEmitNumber;
                this.adjustEmitGuts();
            }
        }

        this.updateAttributeBlocks();
        this.setVisibility();
    },

    setVisibility: function () {

        //  many things are invisible if there is no x-variable, therefore no test

        document.getElementById('Ybackdrop').style.display = (testimate.state.x) ? 'inline' : 'none';
        // document.getElementById('xCNbutton').style.display = (testimate.state.x) ? 'inline' : 'none';
        document.getElementById('testHeaderDIV').style.display = (testimate.state.x) ? 'block' : 'none';
        document.getElementById('emitDIV').style.display = (testimate.state.x) ? 'block' : 'none';
        document.getElementById('resultsDIV').style.display = (testimate.state.x) ? 'block' : 'none';
        document.getElementById('configureDIV').style.display = (testimate.state.x) ? 'block' : 'none';

        //  emit mode visibility

        switch (this.emitMode) {
            case "single":
                document.getElementById('emitSingleControls').style.display = 'block';
                document.getElementById('chooseEmitSingle').checked = true;
                document.getElementById('emitRandomControls').style.display = 'none';
                document.getElementById('emitHierarchyControls').style.display = 'none';
                break;
            case "random":
                document.getElementById('chooseEmitRandom').checked = true;
                document.getElementById('emitSingleControls').style.display = 'none';
                document.getElementById('emitRandomControls').style.display = 'block';
                document.getElementById('emitHierarchyControls').style.display = 'none';
                break;
            case "hierarchy":
                document.getElementById('chooseEmitHierarchy').checked = true;
                document.getElementById('emitSingleControls').style.display = 'none';
                document.getElementById('emitRandomControls').style.display = 'none';
                document.getElementById('emitHierarchyControls').style.display = 'block';
                break;
            default:
                alert(`unexpected emit mode: [${this.emitMode}]`);
                break;
        }
    },

    updateAttributeBlocks: function () {
        const xType = document.getElementById(`xCNbutton`);
        const yType = document.getElementById(`yCNbutton`);
        const xTrash = document.getElementById(`xTrashAttButton`);
        const yTrash = document.getElementById(`yTrashAttButton`);

        if (testimate.state.x && testimate.state.x.name) {
            this.xNameDIV.textContent = testimate.state.x.name;
            xType.value = testimate.state.dataTypes[testimate.state.x.name] === 'numeric' ? '123' : 'abc';
            xTrash.style.display = "inline";
            xType.style.display = "inline";
            this.xDIV.className = "drag-none";
        } else { // x attribute waiting for drop!
            this.xNameDIV.textContent = localize.getString("dropAttributeHere");
            xTrash.style.display = "none";
            xType.style.display = "none";
            this.xDIV.className = "drag-empty";
        }
        if (testimate.state.y && testimate.state.y.name) {
            this.yNameDIV.textContent = testimate.state.y.name;
            yType.value = testimate.state.dataTypes[testimate.state.y.name] === 'numeric' ? '123' : 'abc';
            yTrash.style.display = "inline";
            yType.style.display = "inline";
            this.yDIV.className = "drag-none";
        } else {
            this.yNameDIV.textContent = localize.getString("dropAttributeHere");
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

        if (iValue === "" || iValue === null || typeof iValue === "undefined") {
            out = "";
        } else if (iValue === 0) {
            out = "0";
        } else {
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
        }
        return `${out}${suffix}`;       //  empty if null or empty
    },

    /**
     * returns the "sides" button HTML, which controls whether this is a 1- or 2-sided test.
     * The button therefore changes from "≠" to either ">" or "<", and back again.
     * This is in the form of a clickable button so you can change it.
     *
     * @param iSides
     * @returns string containing the html for that button
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
     * (we will call this group "group0"
     * (when a categorical app needs to be made binary)
     * @param iGroup
     * @returns {`<input id="group0Button" type="button" onclick="handlers.changeGroup0()"
                value="${string}">`}
     */
    group0ButtonHTML: function (iGroup) {
        return `<input id="group0Button" type="button" onclick="handlers.changeGroup0()" 
                value="${iGroup}">`
    },

    getGroup0Name : function() {
        if (!testimate.state.testParams.group) {
            handlers.changeGroup0();
        }
        return testimate.state.testParams.group;
    },

    makeLogisticGraphButtonHTML: function (iGroup) {
        const theLabel = localize.getString("showGraph");
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
    valueBoxHTML: function (iVal, iMin, iMax, iStep) {
        const minPhrase = iMin ? `min="${iMin}"` : "";
        const maxPhrase = iMax ? `max="${iMax}"` : "";
        const stepPhrase = iStep ? `step="${iStep}"` : "";
        return `<input id="valueBox" class="short_number_field" onchange="handlers.changeValue()"
               ${minPhrase} ${maxPhrase} ${stepPhrase} type="number" value="${iVal}">`;
    },

    iterBoxHTML: function (iVal, iMax, iStep) {
        const maxPhrase = iMax ? `max="${iMax}"` : "";
        const stepPhrase = iStep ? `step="${iStep}"` : "";
        return `<input id="iterBox" class="short_number_field" onchange="handlers.changeIterations()"
               ${maxPhrase} ${stepPhrase} type="number" value="${iVal}">`;
    },

    rateBoxHTML: function (iVal, iMax, iStep) {
        const maxPhrase = iMax ? `max="${iMax}"` : "";
        const stepPhrase = iStep ? `step="${iStep}"` : "";
        return `<input id="rateBox" class="short_number_field" onchange="handlers.changeRate()"
               ${maxPhrase} ${stepPhrase} type="number" value="${iVal}">`;
    },

    logisticRegressionProbeBoxHTML: function (iVal, iMax, iStep) {
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
    confBoxHTML: function (iConf) {
        return `<label for="confBox" id="conf_label">conf&nbsp;=&nbsp;</label>
        <input id="confBox" class="short_number_field" onchange="handlers.changeConf()"
               type="number" value="${iConf}" step="1" min="0" max="100">%`;
    },

    /*
        updateConfig: function () {
            const theConfig = Test.configs[testimate.theTest.testID];
            const theParams = testimate.state.testParams;

            document.getElementById(`configStart`).textContent = `${testimate.theTest.makeTestDescription(this.theTestID, false)} `;
            document.getElementById(`valueBox`).value = theParams.value;
            document.getElementById(`sidesButton`).value = theParams.theSidesOp;
        },
    */

    makeTestHeaderGuts: function (iPossibleIDs) {
        let out = `<div class = "hBox">`;

        if (this.theTest) {
            const theTestConfig = Test.configs[testimate.theTest.testID];
            let thePhrase = theTestConfig.makeMenuString();

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

        } else {
            out = "no tests available with these settings!";
        }

        out += `</div>`;    //  close the hBox DIV
        return out;
    },

    makeDatasetGuts: async function () {
        const randomPhrase = ui.hasRandom ? localize.getString('hasRandom') : localize.getString('noRandom');

        return localize.getString("datasetDIV", testimate.state.dataset.title, data.dataset.length, randomPhrase);
    },

    adjustEmitGuts: function () {
        const summaryClause = `<summary>${localize.getString("tests.emitSummary")}</summary>`
        const singleEmitButtonTitle = localize.getString("emit");
        const randomEmitButtonTitle = localize.getString("emitRR", testimate.state.randomEmitNumber);
        const hierarchyEmitButtonTitle = localize.getString("emitHierarchy", data.topCases.length);

        document.getElementById("emitSingleButton").value = singleEmitButtonTitle;
        document.getElementById("emitRandomButton").value = randomEmitButtonTitle;
        document.getElementById("emitHierarchyButton").value = hierarchyEmitButtonTitle;

/*        const emitClause = `<input type="button" id="emitButton"
            value="${emitButtonTitle}" 
            onclick="handlers.emit()"></input>
`;
        const emitRRButton = `<input type="button"  id="rrEmitButton" 
            value="${emitRRButtonTitle}" 
            onclick="handlers.rrEmit(${testimate.state.rrEmitNumber})"></input>`;
        const emitRRBox =  `<input type="number" id="rrEmitBox" value="${testimate.state.rrEmitNumber}"
               onclick="handlers.changeRREmit()" min="0" max = "100" step="1"
               class="short_number_field">
               <label for="rrEmitBox">times</label> 
            `;

        let randomClause = "";
        if (ui.hasRandom) {
            randomClause = `${emitRRButton} &emsp; ${emitRRBox}`;
        }

        let hierarchicalClause = "";
        if (this.hierarchyInfo && this.hierarchyInfo.nCollections > 1) {
            const emitHierarchyButtonTitle = localize.getString("emitHierarchy", this.hierarchyInfo.topLevelCases.length);
            const emitHierarchyButton =
                `<input type="button"  id="hierarchyEmitButton" 
                    value="${emitHierarchyButtonTitle}" 
                    onclick="handlers.hierarchyEmit()">
                </input>`;
            hierarchicalClause = emitHierarchyButton;
        }*/
    },


}
