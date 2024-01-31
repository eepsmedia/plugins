const handlers = {

    currentlyDraggingCODAPAttribute: false,

    getPluginState: function () {
        return {
            success: true,
            values: {
                store: sillo.state,
            }
        };
    },

    restorePluginFromStore: function (iStorage) {
        if (iStorage) {
            sillo.state = iStorage.store;
        }
    },

    //  control handlers

    changeUserName: function () {
        sillo.username = document.getElementById("userNameBox").value;
        sillo.newGame();
    },

    userDone : function() {
        sillo.username = null;
        sillo.cycle();
    },

    prove: function (iChoice) {
        sillo.choice(iChoice);
    },

    pressCountButton: function () {
        sillo.state.buttonCount++;
        sillo.cycle();
    },


    showObverse: function (theButton, iWhich) {
        //  sillo.state.turned.push(iWhich);
        const card = sillo.cards[iWhich];
        const newValue = card.obverse;
        theButton.value = newValue;
        theButton.classList.replace('reverse', 'obverse');
        console.log(`button for ${iWhich} now ${theButton.classList.toString()}`)
    },

    showReverse: function (theButton, iWhich) {
        sillo.state.turned.push(iWhich);
        console.log(`pressed ${iWhich} `);
        const card = sillo.cards[iWhich];

        const newValue = card.reverse;
        theButton.value = newValue;
        theButton.classList.replace('obverse', 'reverse');
        console.log(`button for ${iWhich} now ${theButton.classList.toString()}`)
    },

    changeRuleTrue: function (theButton) {
        sillo.state.ruleTrue = theButton.value;
    },

    changeGameMode: function (theButton) {
        sillo.state.gameMode = theButton.value;
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
                sillo.copeWithAttributeDrop(
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