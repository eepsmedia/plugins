import * as CONNECT from "./connect.js"
import * as HANDLERS from "./handlers.js"
import * as UI from "./ui.js"

export let state = {};

let runNumber = 0;

export async function initialize() {
    console.log(`initializing cboxx`);
    await HANDLERS.initialize();        //  initialize event handlers

    state.lang = localize.figureOutLanguage('en');
    await localize.initialize(state.lang);

    await CONNECT.initialize();        //  initialize the connection with CODAP
    UI.initialize();
    state = {...constants.defaultState, ...state};   //  have all fields from default!
    cycle();
}

export async function doRuns(iTypes, iRuns) {

    console.log(`run ${iRuns} simulations with ${iTypes} card types`);

    for (let i = 0; i < iRuns; i++ ) {
        runNumber++;
        let theCards = [];
        let theCardSet = new Set();

        while (theCardSet.size < iTypes) {
            const newCard = Math.floor(iTypes * Math.random());
            theCards.push(newCard);
            theCardSet.add(newCard);
        }

        const theCount = theCards.length;
        let theValues = [];
        theCards.forEach(c => {
            theValues.push({run : runNumber, count : theCount, types : iTypes, card : c});
        })

        await CONNECT.emitData(theValues);
    }
    cycle();
}
/**
 * Generally update the plugin because of a change.
 * Especially, redraw the UI.
 */
export function cycle() {
    UI.redraw();
}

/**
 * Any extra processing when you read the plugin state from a saved file goes here.
 */
function restoreState() {

}

/**
 * User has dropped an attribute into the plugin.
 * We get useful information about what was dropped.
 *
 * @param iDataset
 * @param iCollection
 * @param iAttribute
 * @param iDropCoordinates
 * @returns {Promise<void>}
 */
export async function copeWithAttributeDrop(iDataset, iCollection, iAttribute, iDropCoordinates) {
    if (iDataset.name !== state.datasetName) {
        await setDataset(iDataset.name);
    }
    state.attributeName = iAttribute.name;
    state.collectionName = iCollection.name;
}

/**
 * Called from the handler.
 * User has changed the data in CODAP, so we refresh our copy of the data.
 * @returns {Promise<void>}
 */
export async function copeWithCaseChange() {
    await refreshData();
}

/**
 * User has specified a CODAP dataset to use,
 * so we record that,
 * register our interest in changes,
 * and call `refreshData()` to get a copy of al the data.
 *
 * @param iName
 * @returns {Promise<void>}
 */
async function setDataset(iName) {
    state.datasetName = iName;
    console.log(`dataset changed to ${state.datasetName}`);
    HANDLERS.registerForCaseChanges(state.datasetName);

    refreshData();
}

/**
 * Ask CONNECT to get us a copy of all items in the current dataset.
 * We also translate that array of Items into an array of Values,
 * that is, just the values, not the other stuff in the API such as itemID.
 *
 * @returns {Promise<void>}
 */
async function refreshData(){
    state.allItems = await CONNECT.getAllItems(state.datasetName);
    state.allValues = [];
    state.allItems.forEach( item => {state.allValues.push(item.values)} );
    cycle();
}

export const constants = {
    pluginName: `cboxx`,
    datasetName: `cereal box simulation`,
    version: `0.1a`,
    dimensions: {height: 166, width: 300},

    defaultState: {
        buttonCount: 0,
        lang: `en`,
        allItems : [],
        allValues : [],
        datasetName: null,     //  the name of the dataset we're working with
        collectionName: null,     //  the name of the collection we're working with
        attributeName: null,     //  the name of the attribute we're working with
    }
}
