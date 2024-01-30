const handlers = {

    currentlyDraggingCODAPAttribute : false,

    getPluginState : function() {
        return {
            success: true,
            values: {
                store: wason.state,
            }
        };
    },

    restorePluginFromStore: function(iStorage) {
        if (iStorage) {
            wason.state = iStorage.store;
        }
    },

    //  control handlers

    prove : function(iChoice) {
        wason.choice(iChoice);
    },

    pressCountButton : function() {
        wason.state.buttonCount++;
        wason.cycle();
    },


    showObverse : function(theButton, iWhich)  {
        //  wason.state.turned.push(iWhich);
        const card = wason.cards[iWhich];
        const newValue = card.obverse;
        theButton.value = newValue;
        theButton.classList.replace('reverse', 'obverse');
        console.log(`button for ${iWhich} now ${theButton.classList.toString()}`)
    },

    showReverse : function(theButton, iWhich)  {
        wason.state.turned.push(iWhich);
        console.log(`pressed ${iWhich} `);
        const card = wason.cards[iWhich];

        const newValue = card.reverse;
        theButton.value = newValue;
        theButton.classList.replace('obverse', 'reverse');
        console.log(`button for ${iWhich} now ${theButton.classList.toString()}`)
    },

    changeRuleTrue : function(theButton) {
        wason.state.ruleTrue = theButton.value;
    },

    changeGameMode : function(theButton) {
        wason.state.gameMode = theButton.value;
    },

    //  drag and drop, subscribed to events

    handleDragDrop : async function(iMessage) {

        switch(iMessage.values.operation) {
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
                wason.copeWithAttributeDrop(
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

    handleDrag : function(iPosition) {

    },
    highlightNone : function() {

    },
    highlightNear : function() {

    },

}