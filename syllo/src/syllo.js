syllo = {

    username: null,
    playing: false,
    ruleTrue : true,
    state: {},
    cards: {
        P: {obverse: null, reverse: null},
        notP: {obverse: null, reverse: null},
        Q: {obverse: null, reverse: null},
        notQ: {obverse: null, reverse: null},
    },

    initialize: async function () {
        console.log(`initializing syllo`);
        await localize.initialize(localize.figureOutLanguage('en'));
        await connect.initialize();        //  initialize the connection with CODAP

        ui.initialize();
        this.state = {...this.constants.defaultState, ...this.state};   //  have all fields in default!
        this.state.scenario = scenarios[this.state.scenarioKey];

        this.newGame();
    },

    newGame: function () {
        this.eval = localize.getString("eval.instructions");
        const ruleTrueSetting = document.querySelector("input[name='ruleTrueGroup']:checked").value;
        this.ruleTrue = (ruleTrueSetting === "true") ? true : (Math.random() < 0.5);

        this.state.turned = [];
        this.playing = true;

        this.implementScenario( );    //  this.cycle(); //    unnecessary
    },


    cycle: function () {
        ui.redraw();
    },

    restoreState: function () {
    },

    //      game controllers

    choice: function (iChoice) {
        const overallChoice = (iChoice === "right");    //  true if they chose rule is correct
        this.eval = overallChoice ?
            localize.getString("eval.choseRight") : localize.getString("eval.choseWrong");

        const correctOverallChoice = overallChoice === syllo.ruleTrue;  //  did they choose correctly?
        const ruleCorrectnessStatement = syllo.ruleTrue ?
            localize.getString("eval.ruleIsCorrect") : localize.getString("eval.ruleIsNotCorrect");
        this.eval += correctOverallChoice ?
            localize.getString("eval.userOverallEvaluationRight", ruleCorrectnessStatement) :
            localize.getString("eval.userOverallEvaluationWrong", ruleCorrectnessStatement);

        const turnSet = new Set(this.state.turned);
        let right = 0;
        let wrong = 0;
        if (this.state.turned.includes("P")) {
            //  if (turnSet.includes("P")) {
            this.eval += localize.getString("eval.choseP", this.cards.P.obverse);
            right++;
        } else {
            this.eval += localize.getString("eval.noChoseP", this.cards.P.obverse);
            wrong++;
        }
        if (this.state.turned.includes("notQ")) {
            this.eval += localize.getString("eval.choseNotQ", this.cards.notQ.obverse);
            right++;
        } else {
            this.eval += localize.getString("eval.noChoseNotQ", this.cards.notQ.obverse);
            wrong++;
        }
        if (this.state.turned.includes("Q")) {
            this.eval += localize.getString("eval.choseQ", this.cards.Q.obverse);
            wrong++;
        } else {
            this.eval += localize.getString("eval.noChoseQ", this.cards.Q.obverse);
            wrong++;
        }
        if (this.state.turned.includes("notP")) {
            this.eval += localize.getString("eval.choseNotP", this.cards.notP.obverse);
            wrong++;
        } else {
            this.eval += localize.getString("eval.noChoseNotP", this.cards.notP.obverse);
            wrong++;
        }
        console.log(`${this.state.turned.toString()} eval: ${this.eval}`);

        this.playing = false;       //      game is over, ui will show new game button.
        this.cycle();
    },

    implementScenario: function ( ) {
        this.state.scenario.story = localize.getString(`${this.state.scenario.storyKey}`);
        const proofOfWrong = randomPick(["P","notQ"]);  //  if necessary!

        let cardInfoSet = {}

        switch(this.state.scenario.cardClass) {
            case "glyphOnly":
                cardInfoSet = this.state.scenario.glyphs;
                break;
            case "textOnly":
                //  todo: fix this so it makes Arrays and replaces text with localized text!
                cardKeys = this.state.scenario.textKeys;    //  object keyed by P, notP, etc
                for (let k in cardKeys) {
                    cardInfoSet[k] = [localize.getString(cardKeys[k])]; //  one-element array
                }
                break;
            default:
                cardInfoSet = null;
                break;
        }

        //  fronts of cards
        this.cards.P.obverse = randomPick(cardInfoSet.P);
        this.cards.Q.obverse = randomPick(cardInfoSet.Q);
        this.cards.notP.obverse = randomPick(cardInfoSet.notP);
        this.cards.notQ.obverse = randomPick(cardInfoSet.notQ);

        //  backs of cards
        //  correct PP
        this.cards.P.reverse = (!syllo.ruleTrue && proofOfWrong === "P") ?
            randomPick(cardInfoSet.notQ) :       //  the rule is wrong and this is how we know
            randomPick(cardInfoSet.Q);

        this.cards.Q.reverse = randomPick(cardInfoSet.notP);

        this.cards.notP.reverse = randomPick(cardInfoSet.Q);

        //  correct TT
        this.cards.notQ.reverse = (!syllo.ruleTrue && proofOfWrong === "notQ") ?
            randomPick(cardInfoSet.P) :     //  the rule is wrong and this is how we know
            randomPick(cardInfoSet.notP);

        this.cycle();
    },

    //      handlers

    copeWithAttributeDrop: function (iDataset, iCollection, iAttribute, iPosition) {
        this.state.datasetName = iDataset.name;
    },

    constants: {
        pluginName: `syllo`,
        version: `2024b`,
        dimensions: {height: 400, width: 444, minWidth: 444, maxWidth: 444},

        defaultState: {
            buttonCount: 0,
            scenarioKey: "vowels",
            scenario: {},
            lang: `en`,
            datasetName: null,     //  the name of the dataset we're working with
            ruleTrue: true,
            gameMode: "sandbox",
            turned: [],            //  array of turns
        }
    }

}

randomPick = function (a) {
    var tL = a.length;
    var tR = Math.floor(Math.random() * tL);
    return a[tR];
}
