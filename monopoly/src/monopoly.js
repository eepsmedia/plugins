import * as CONNECT from "./connect.js"
import * as HANDLERS from "./handlers.js"
import * as UI from "./ui.js"
import {board} from "./board.js"

export let state = {};
let counts = new Array(40).fill(0);
const doublesToJail = 2;

export function run(iTurns) {
    let spot = 0;
    let doubles = 0;

    for (let i = 0; i < iTurns; i++) {
        const roll = twoDice();
        spot += roll.value;
        doubles = (roll.doubles) ? doubles + 1 : 0;
        if (spot >= 40) spot -= 40;

        if (doubles >= doublesToJail) {
            spot = 10;
            doubles = 0;
            console.log(`${doublesToJail} doubles! Go to Jail!`);
        }
        if (spot === 30) {
            spot = 10;
            doubles = 0;
            console.log(`Go to Jail!`);
        }

        counts[spot]++;
        // console.log(`roll ${roll.value}${roll.doubles ? `*${doubles} ` : " "} to ${spot}`);
    }
}

function twoDice() {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    return {
        value : die1 + die2,
        doubles : (die1 == die2)
    }
}

export async function initialize() {
    console.log(`initializing monopoly`);
    state.lang = localize.figureOutLanguage('en');
    await localize.initialize(state.lang);
    await CONNECT.initialize();        //  initialize the connection with CODAP
    await HANDLERS.initialize();        //  initialize the connection with CODAP

    UI.initialize();
    state = {...constants.defaultState, ...state};   //  have all fields in default!
    cycle();
}

export function cycle() {
    UI.redraw();
}

export async function copyToClipboard() {
    let theText = "space,name,count\n";
    for (let i = 0; i < 40; i++) {
        theText += `${i},${board[i].name},${counts[i]}\n`;
    }
    try {
        await navigator.clipboard.writeText(theText);
    } catch (error) {
        console.error(error.message);
    }

}
function restoreState() {

}

export function copeWithAttributeDrop(iDataset, iCollection, iAttribute, iPosition) {
    state.datasetName = iDataset.name;
}

export const constants = {
    pluginName: `monopoly`,
    version: `0.1a`,
    dimensions: {height: 333, width: 222},

    defaultState: {
        buttonCount: 0,
        lang: `en`,
        datasetName: null,     //  the name of the dataset we're working with
    }
}
