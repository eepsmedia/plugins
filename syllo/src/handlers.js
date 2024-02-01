const handlers = {

    currentlyDraggingCODAPAttribute: false,

    getPluginState: function () {
        return {
            success: true,
            values: {
                store: syllo.state,
            }
        };
    },

    restorePluginFromStore: function (iStorage) {
        if (iStorage) {
            syllo.state = iStorage.store;
        }
    },

    //  control handlers

    changeScenario: function(iMenu) {
        const theKey = document.getElementById("scenarioMenu").value;
        syllo.state.scenario = scenarios[theKey];        //  actual change

        syllo.newGame( );
        //  syllo.cycle();      //  unnecessary because of implementScenario
    },

    changeUserName: function () {
        syllo.username = document.getElementById("userNameBox").value;
        syllo.newGame();
    },

    userDone : function() {
        syllo.username = null;
        syllo.cycle();
    },

    prove: function (iChoice) {
        syllo.choice(iChoice);
    },

    pressCountButton: function () {
        syllo.state.buttonCount++;
        syllo.cycle();
    },


    showObverse: function (theButton, iWhich) {
        //  syllo.state.turned.push(iWhich);
        const card = syllo.cards[iWhich];
        const newValue = card.obverse;
        theButton.value = newValue;
        theButton.classList.replace('reverse', 'obverse');
        console.log(`button for ${iWhich} now ${theButton.classList.toString()}`)
    },

    showReverse: function (theButton, iWhich) {
        syllo.state.turned.push(iWhich);
        console.log(`pressed ${iWhich} `);
        const card = syllo.cards[iWhich];

        const newValue = card.reverse;
        theButton.value = newValue;
        theButton.classList.replace('obverse', 'reverse');
        console.log(`button for ${iWhich} now ${theButton.classList.toString()}`)
    },

    changeRuleTrue: function (theButton) {
        syllo.state.ruleTrue = theButton.value;
    },

    changeGameMode: function (theButton) {
        syllo.state.gameMode = theButton.value;
    },

    //  drag and drop, subscribed to events

    handleDragDrop: async function (iMessage) {

        switch (iMessage.values.operation) {
            case   `dragstart`:
                this.currentlyDraggingCODAPAttribute = true;
                console.log(`    drag start`);
                break;
            case   `dragend`:
                this.currentlyDraggingCODAPAttribute = false;
                handlers.highlightNone();
                console.log(`    drag end`);
                break;
            case   `drag`:
                handlers.handleDrag(iMessage.values.position);
                break;
            case   `drop`:
                syllo.copeWithAttributeDrop(
                    iMessage.values.context,
                    iMessage.values.collection,
                    iMessage.values.attribute,
                    iMessage.values.position
                );
                ui.redraw();
                break;
            case   `dragenter`:
                console.log(`    drag enter`);
                handlers.highlightNear();
                break;
            case   `dragleave`:
                handlers.highlightNone();
                console.log(`    drag leave`);
                break;
        }
    },

    handleDrag: function (iPosition) {

    },
    highlightNone: function () {

    },
    highlightNear: function () {

    },

}