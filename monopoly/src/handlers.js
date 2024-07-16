import * as MONOPOLY from "./monopoly.js"
import * as UI from "./ui.js"


let currentlyDraggingCODAPAttribute = false;

export function initialize() {
    document.getElementById("rollButton").addEventListener('click', pressRollButton);
    document.getElementById("copyButton").addEventListener('click', pressCopyButton);
}

function getPluginState() {
    return {
        success: true,
        values: {
            store: MONOPOLY.state,
        }
    };
}

function restorePluginFromStore(iStorage) {
    if (iStorage) {
        MONOPOLY.state = iStorage.store;
    }
}

//  control handlers

function pressRollButton() {
    MONOPOLY.run(40000);
    MONOPOLY.cycle();
}

function pressCopyButton() {
    MONOPOLY.copyToClipboard();
}

//  drag and drop, subscribed to events

async function handleDragDrop(iMessage) {

    switch (iMessage.values.operation) {
        case   `dragstart`:
            currentlyDraggingCODAPAttribute = true;
            console.log(`    drag start`);
            break;
        case   `dragend`:
            currentlyDraggingCODAPAttribute = false;
            highlightNone();
            console.log(`    drag end`);
            break;
        case   `drag`:
            handleDrag(iMessage.values.position);
            break;
        case   `drop`:
            MONOPOLY.copeWithAttributeDrop(
                iMessage.values.context,
                iMessage.values.collection,
                iMessage.values.attribute,
                iMessage.values.position
            );
            UI.redraw();
            break;
        case   `dragenter`:
            console.log(`    drag enter`);
            highlightNear();
            break;
        case   `dragleave`:
            highlightNone();
            console.log(`    drag leave`);
            break;
    }
}

function handleDrag(iPosition) {

}

function highlightNone() {

}

function highlightNear() {

}
