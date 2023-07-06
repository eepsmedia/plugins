

testimate.dropManager = {

    currentlyDraggingCODAPAttribute : false,

    handleDragDrop : async function(iMessage) {

        switch(iMessage.values.operation) {
            case   `dragstart`:
                this.currentlyDraggingCODAPAttribute = true;
                console.log(`    drag start`);
                break;
            case   `dragend`:
                this.currentlyDraggingCODAPAttribute = false;
                console.log(`    drag end`);
                break;
            case   `drag`:
                break;
            case   `drop`:
                testimate.copeWithAttributeDrop(
                    iMessage.values.context.name,
                    iMessage.values.attribute.name,
                    iMessage.values.position
                );
                break;
            case   `dragenter`:
                console.log(`    drag enter`);
                break;
            case   `dragleave`:
                console.log(`    drag leave`);
                break;
        }
    },

}