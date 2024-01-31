wason = {

    username: null,
    playing: false,
    state: {},
    cards: {
        P: {obverse: null, reverse: null},
        notP: {obverse: null, reverse: null},
        Q: {obverse: null, reverse: null},
        notQ: {obverse: null, reverse: null},
    },

    initialize: async function () {
        console.log(`initializing wason`);
        await localize.initialize(localize.figureOutLanguage('en'));
        await connect.initialize();        //  initialize the connection with CODAP

        ui.initialize();
        this.state = {...this.constants.defaultState, ...this.state};   //  have all fields in default!
        this.newGame();
    },

    newGame: function () {
        this.eval = localize.getString("eval.instructions");
        this.setScenario("vowels");
        this.playing = true;
        this.cycle();
    },

    choice: function (iChoice) {
        this.eval = iChoice === "right" ?
            localize.getString("eval.choseRight") : localize.getString("eval.choseWrong");
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
            this.eval += localize.getString("eval.noChoseNotQ", this.cards.Q.obverse);
            wrong++;
        }
        if (this.state.turned.includes("Q")) {
            this.eval += localize.getString("eval.choseQ", this.cards.Q.obverse);
            wrong++;
        }
        if (this.state.turned.includes("notP")) {
            this.eval += localize.getString("eval.choseNotP", this.cards.notP.obverse);
            wrong++;
        }
        console.log(`${this.state.turned.toString()} eval: ${this.eval}`);

        this.playing = false;       //      game is over, ui will show new game button.
        this.cycle();
    },

    cycle: function () {
        ui.redraw();
    },

    restoreState: function () {
    },

    //      game controllers

    setScenario: function (iKey) {
        this.state.scenario = scenarios[iKey];
        this.state.scenario.story = localize.getString(`${this.state.scenario.storyKey}`);

        //  correct PP
        this.cards.P.obverse = randomPick(this.state.scenario.glyphs.P);
        this.cards.P.reverse = randomPick(this.state.scenario.glyphs.Q);

        this.cards.Q.obverse = randomPick(this.state.scenario.glyphs.Q);
        this.cards.Q.reverse = randomPick(this.state.scenario.glyphs.notP);

        this.cards.notP.obverse = randomPick(this.state.scenario.glyphs.notP);
        this.cards.notP.reverse = randomPick(this.state.scenario.glyphs.Q);

        //  correct TT
        this.cards.notQ.obverse = randomPick(this.state.scenario.glyphs.notQ);
        this.cards.notQ.reverse = randomPick(this.state.scenario.glyphs.notP);

        this.cycle();
    },

    //      handlers

    copeWithAttributeDrop: function (iDataset, iCollection, iAttribute, iPosition) {
        this.state.datasetName = iDataset.name;
    },

    constants: {
        pluginName: `wason`,
        version: `2024a`,
        dimensions: {height: 366, width: 444},

        defaultState: {
            buttonCount: 0,
            scenario: null,
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
