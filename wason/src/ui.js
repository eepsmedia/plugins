
const ui = {

    statusDIV : null,

    initialize : function () {
        this.statusDIV = document.getElementById('status');
        this.storyDIV = document.getElementById('story');
        this.cardsDIV = document.getElementById('cards');
    },

    redraw : function() {

        const button = ` button count ${wason.state.buttonCount}`;
        const datasetInfo = wason.state.datasetName ? `dataset: ${wason.state.datasetName}` : `no dataset`;

        this.statusDIV.innerHTML = wason.eval;
        this.storyDIV.innerHTML = `${wason.state.scenario.story}`;
        this.cardsDIV.innerHTML = this.makeCardsHTML();
    },

    makeCardsHTML : function() {
        let out = "";
        const theKeys = scramble(["P","notP","Q","notQ"]);
        for (let i = 0; i < theKeys.length; i++) {
            const tWhich = theKeys[i];

            const card = wason.cards[tWhich];
            const mousedown = `onmousedown = "handlers.showReverse(this, '${tWhich}')"`;
            const mouseup = `onmouseup = "handlers.showObverse(this, '${tWhich}')"`;
            const mouseout = `onmouseout = "handlers.showObverse(this, '${tWhich}')"`;

            out += `<input type="button" class="card obverse" 
                        ${mousedown} ${mouseout} ${mouseup} 
                        value="${card.obverse}"> `
        }
        return out;
    },
}

scramble = function(iArray) {
    let N = iArray.length;

    for (let i = 0; i < N; i++) {
        let j = Math.floor(Math.random() * N);
        let save = iArray[i];
        iArray[i] = iArray[j];
        iArray[j] = save;
    }

    return iArray;
}