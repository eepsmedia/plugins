import * as CONNECT from "./connect.js"
import * as HANDLERS from "./handlers.js"
import * as UI from "./ui.js"

export let state = {};
let then = null;

export async function initialize() {
    console.log(`initializing templ8`);
    await HANDLERS.initialize();        //  initialize event handlers

    state.lang = localize.figureOutLanguage('en');
    await localize.initialize(state.lang);

    await CONNECT.initialize();        //  initialize the connection with CODAP
    UI.initialize();
    state = {...constants.defaultState, ...state};   //  have all fields from default!
    cycle();
}

export function doButton() {
    const now = new Date();



    state.buttonCount++;
    const theValues = {
        time : now,
        interval : then ? (now.getTime() - then.getTime()) / 1000 : null ,
        count : state.buttonCount
    }

    CONNECT.emitData(theValues);

    then = now;
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
    pluginName: `templ8`,
    version: `0.1a`,
    dimensions: {height: 333, width: 222},
    outputDatasetName : "templ8_out",

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
