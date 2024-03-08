const handlers = {

    currentlyDraggingCODAPAttribute : false,

    getPluginState : function() {
        return {
            success: true,
            values: {
                store: ranger.state,
            }
        };
    },

    restorePluginFromStore: function(iStorage) {
        if (iStorage) {
            ranger.state = iStorage.store;
        }
    },

    //  control handlers

    doSliderChange : function() {
        const theSliderMode = document.querySelector("input[name='modeRadio']:checked").value;

        if (theSliderMode === "none") {

        } else {
            //  find the number and do the selection
            ranger.state.sliderValue = Number(ui.slider.value);
            const tFrom = ranger.state.sliderValue - ranger.state.rangeHalfWidth;
            const tTo = ranger.state.sliderValue + ranger.state.rangeHalfWidth;

            if (theSliderMode === "setAside") {
                if (!connect.doingSetAside) {
                    connect.showOnlyFromTo(tFrom, tTo);
                }
            } else if (theSliderMode === "select") {
                connect.selectFromTo(tFrom, tTo);
            }
            ranger.cycle();
        }
    },

    pressCountButton : function() {
        ranger.state.buttonCount++;
        ranger.cycle();
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
                ranger.copeWithAttributeDrop(
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