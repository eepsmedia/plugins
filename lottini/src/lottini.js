

const lottini = {

    scenario : null,
    showingOptions : false,
    theGame : null,
    scenarioStrings : null,

    results : {},

    initialize : async function() {
        await localize.initialize(localize.figureOutLanguage('en'));
        await connect.initialize();   //  connect to CODAP, define dataset

        this.theGame = d3.select("#game");
        this.setUpState();      //      remembers scenario name, and options, if available.
        ui.initialize();        //      defines scenario menu, so has to precede setScenario()
        this.setScenario();      //      choose the default scenario or the saved one
    },

    doChoice :  async function(iWhichSide) {
        const tPlainResult = this.scenario.result(iWhichSide, this.scenario.left, this.scenario.right);
        const tUnitString = tPlainResult === 1 ? lottini.scenarioStrings.resultUnitSingular : lottini.scenarioStrings.resultUnitPlural;
        const tChoiceText = (iWhichSide === 'left') ? lottini.scenarioStrings.leftLabel : lottini.scenarioStrings.rightLabel;
        const theDoor =  (iWhichSide === 'left') ? ui.leftDoorCanvas : ui.rightDoorCanvas;
        const theResult =  (iWhichSide === 'left') ? ui.leftResult : ui.rightResult;

        lottini.results[tChoiceText].sum += tPlainResult;
        lottini.results[tChoiceText].turns += 1;

        //      set the text "behind the door"
        ui.displayResultBehindTheDoor(theResult, tPlainResult, tUnitString);

        const theEnglishValues = {
            scenario : lottini.scenarioStrings.label,
            choice : tChoiceText,
            result : tPlainResult,
            units : lottini.scenarioStrings.resultUnitPlural,
        }
        const theValues = connect.translateTurnToLocalLanguage(theEnglishValues);

        connect.codap_emit(theValues);
        ui.showResults();
        ui.openAndCloseDoor(theDoor);
    },

    setScenario : async function(iScenarioName) {

        if (!iScenarioName) {
            iScenarioName = document.getElementById("scenarioMenu").value;
        }
        this.state.scenarioName = iScenarioName;

        lottini.scenario = lottini.allScenarios[this.state.scenarioName];
        this.scenarioStrings = localize.defaultStrings.lottini.scenarioStrings[this.state.scenarioName];    //   DG.plugins.lotti.scenarioStrings[this.state.scenarioName];
        await connect.setNewDataset();
        this.resetResults();        //      zero this.results for the new scenario
        ui.SetScenarioUIObjects();
    },

    /**
     * resets the property `lottini.results`
     */
    resetResults : function() {
        lottini.results[lottini.scenarioStrings.leftLabel] = {turns : 0, sum : 0};
        lottini.results[lottini.scenarioStrings.rightLabel] = {turns : 0, sum : 0};
        ui.showResults();
    },

    rememberShowAllScenariosOption : function() {
        lottini.state.optShowAllScenarios = document.getElementById("showAllScenariosCheckbox").checked;
        ui.initialize();        //  redraws the menu
    },

    rememberEmitCODAPOption : function() {
        lottini.state.optEmitToCODAP = document.getElementById("emittingCheckbox").checked;
        lottini.resetResults();
    },

    rememberShowResultsOption : function() {
        lottini.state.optShowResults = document.getElementById("showResultsCheckbox").checked
    },

    setUpState : function() {
        lottini.state = codapInterface.getInteractiveState();
        if (Object.keys(lottini.state).length === 0) {
            lottini.state = lottini.constants.freshState;
            codapInterface.updateInteractiveState(lottini.state);
        } 
    },

    constants : {
        version : "2024a",
        dsName : "lottiDataset",
        collName : "records",

        freshState : {
            optEmitToCODAP : false,
            optShowResults : false,
            optShowAllScenarios : true,
            scenarioName : null,
        },
    }

}
