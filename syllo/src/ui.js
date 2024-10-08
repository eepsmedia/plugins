const ui = {

    statusDIV: null,

    initialize: function () {
        this.statusDIV = document.getElementById('status');
        this.storyDIV = document.getElementById('story');
        this.cardsDIV = document.getElementById('cards');
        this.decisionDIV = document.getElementById('decision');
        this.needsUserDIV = document.getElementById(`needsUserName`);
        this.hasUserDIV = document.getElementById(`hasUserName`);
        this.greetingDIV = document.getElementById(`greeting`);
        this.configDIV = document.getElementById(`config`);

        this.appendScenarioMenuGuts();
    },

    redraw: function () {

        const button = ` button count ${syllo.state.buttonCount}`;
        const datasetInfo = syllo.state.datasetName ? `dataset: ${syllo.state.datasetName}` : `no dataset`;

        this.statusDIV.innerHTML = syllo.username ? syllo.howDidIDo : localize.getString("pleaseEnterName");
        this.storyDIV.innerHTML = `${syllo.state.scenario.story}`;
        this.cardsDIV.innerHTML = this.makeCardsHTML();
        this.greetingDIV.innerHTML = localize.getString('greeting', syllo.username) + '&emsp;';

        this.setVisibility();
    },


    setVisibility : function() {
        if (syllo.username) {
            this.needsUserDIV.style.display = 'none';
            this.hasUserDIV.style.display = 'flex';
            this.storyDIV.style.display = 'block';
            this.cardsDIV.style.display = 'flex';   //  makes them line up correctly!
            this.decisionDIV.style.display = 'block';
            this.configDIV.style.display = 'block';
        } else {
            this.needsUserDIV.style.display = 'block';
            this.hasUserDIV.style.display = 'none';
            this.storyDIV.style.display = 'none';
            this.cardsDIV.style.display = 'none';
            this.decisionDIV.style.display = 'none';
            this.configDIV.style.display = 'none';
        }
    },


    makeCardsHTML: function () {
        let out = "";
        const theKeys = scramble(["P", "notP", "Q", "notQ"]);
        const cardClass = syllo.state.scenario.cardClass;

        for (let i = 0; i < theKeys.length; i++) {
            const tWhich = theKeys[i];

            const card = syllo.cards[tWhich];
            const mousedown = `onmousedown = "handlers.showReverse(this, '${tWhich}')"`;
            const mouseup = `onmouseup = "handlers.showObverse(this, '${tWhich}')"`;
            const mouseout = `onmouseout = "handlers.showObverse(this, '${tWhich}')"`;

            out += `<input type="button" class="card ${cardClass} obverse" 
                        ${mousedown} ${mouseout} ${mouseup} 
                        value="${card.obverse}"> `
        }
        return out;
    },

    appendScenarioMenuGuts: function() {
        theMenu = document.getElementById("scenarioMenu");

        for (let setKey in scenarioSets) {
            const theDisplayName = localize.getString(`scenarioSets.${setKey}.displayName`);
            theMenu.add(new Option(theDisplayName, setKey));
        }
    },

}


scramble = function (iArray) {
    let N = iArray.length;

    for (let i = 0; i < N; i++) {
        let j = Math.floor(Math.random() * N);
        let save = iArray[i];
        iArray[i] = iArray[j];
        iArray[j] = save;
    }

    return iArray;
}