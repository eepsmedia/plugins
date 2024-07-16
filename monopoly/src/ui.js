
import {state} from "./monopoly.js"

let statusDIV = null;

export function initialize() {
    statusDIV = document.getElementById('status');
}

export function redraw() {

    const button = ` button count ${state.buttonCount}`;
    const datasetInfo = state.datasetName ? `dataset: ${state.datasetName}` : `no dataset`;

    statusDIV.innerHTML = `${button}<br>${datasetInfo}<br>&nbsp; `;     //  of course, replace this!
}