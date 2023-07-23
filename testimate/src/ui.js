

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

        document.getElementById('Ybackdrop').style.display = (testimate.state.x) ? 'inline' : 'none';
        document.getElementById('xCNbutton').style.display = (testimate.state.x) ? 'inline' : 'none';
        document.getElementById('testHeaderDIV').style.display = (testimate.state.x) ? 'block' : 'none';
        document.getElementById('resultsDIV').style.display = (testimate.state.x) ? 'block' : 'none';
        document.getElementById('configureDIV').style.display = (testimate.state.x) ? 'block' : 'none';

    },

    updateAttributeBlocks: function () {
        if (testimate.state.x && testimate.state.x.name) {
            this.xDIV.textContent = testimate.state.x.name;
            this.xType.textContent = testimate.state.dataTypes[testimate.state.x.name];
        } else {
            this.xDIV.textContent = `outcome/primary attribute`;
        }
        if (testimate.state.y && testimate.state.y.name) {
            this.yDIV.textContent = testimate.state.y.name;
            this.yType.textContent = testimate.state.dataTypes[testimate.state.y.name];
        } else {
            this.yDIV.textContent = `predictor/secondary attribute`;
        }

    },

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
