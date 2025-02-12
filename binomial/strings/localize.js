import * as Root from '../src/binomial.js'
import * as Deutsch from "./germanNouns.js"

let DG = {
    plugins: null,
};

let defaultStrings = {};
let languages = [];

export async function initialize() {

    const theLang = figureOutLanguage('en');

    DG.plugins = await loadLanguage(theLang);
    defaultStrings = await loadLanguage(theLang);    //  defaults to English; may not be necessary

    console.log(`done loading language strings for ${theLang}  `);
    setStaticStrings();

    if (theLang === "de") {
        try {
            await Deutsch.initialize();     //  currently does nothing!
            //      console.log(`success opening the German plurals database!`);
        } catch (err) {
            //      console.error(`error opening the German plurals database: ${err}`);
        }
    }

    return theLang;
}

export function getString(iID, ...theArgs) {
    const stringLoc = `DG.plugins.binomial.${iID}`;
    const theRawString = eval(stringLoc);
    let out = "";
    if (theRawString) {
        out = replaceSubstrings(theRawString, ...theArgs);
    } else {
        const theDefaultString = eval(`defaultStrings.binomial.${iID}`);
        if (theDefaultString) {
            out = replaceSubstrings(theDefaultString, ...theArgs);
        }
    }
    return `${out}`;    //  add gunk to this statement to check if we're localizing correctly!
}

function replaceSubstrings(originalString, ...substitutions) {
    // Use a regular expression to find substrings of the form "•n•"
    const regex = /•(\d+)•/g;

    // Replace each match with the corresponding substitution
    const resultString = originalString.replace(regex, (match, index) => {
        const substitutionIndex = parseInt(index, 10) - 1; // Adjust index to zero-based
        let theSub = substitutions[substitutionIndex];
        if (theSub === 0) theSub = "0";     //  special case for falsy value!
        return theSub || match; // Use substitution or original match if not available
    });

    return resultString;
}


const fileNameMap = {
    en: "strings/binomial_English.json",
    de: "strings/binomial_German.json",
}


async function loadLanguage(iLang) {
    let theFileName = fileNameMap[iLang];
    const response = await fetch(theFileName);
    const theText = await response.text();

    if (iLang === "de") {   await Deutsch.loadWortschatz();   }

    return JSON.parse(theText)
}

async function setStaticStrings() {

    //  substitute all the static strings in the UI (by `id`)
    const theStaticStrings = DG.plugins.binomial.staticStrings;
    for (const theID in theStaticStrings) {
        if (theStaticStrings.hasOwnProperty(theID)) {
            const theValue = getString(`staticStrings.${theID}`); // theStaticStrings[theID];
            if (theID.includes("Button") || theID.includes("button")) {
                try {
                    const tButton = document.getElementById(theID);
                    if (tButton) tButton.value = theValue;
                    //  console.log(`Set string for ${theID} in ${iLang}`);
                } catch (msg) {
                    console.log(msg + ` on ID = ${theID}`);
                }

            } else {
                try {
                    const tElement = document.getElementById(theID);
                    if (tElement) tElement.innerHTML = theValue;
                    //  console.log(`Set string for ${theID} in ${iLang}`);
                } catch (msg) {
                    console.log(msg + ` on ID = ${theID}`);
                }
            }
        }
    }
}

/**
 * Get a two-letter language code from a variety of sources.
 *
 * @param iDefaultLanguage  the default language in case none of the following work
 * @returns {*}     resulting two-letter code
 */
export function figureOutLanguage(iDefaultLanguage) {

    languages = Object.keys(fileNameMap);
    let lOut = iDefaultLanguage;

    //  find the user's favorite language that's actually in our list

    const userLanguages = Array.from(navigator.languages).reverse();

    userLanguages.forEach((L) => {
        console.log(`user has lang ${L}`);
        const twoLetter = L.slice(0, 2).toLowerCase();
        if (languages.includes(twoLetter)) {
            if (lOut !== twoLetter) {
                lOut = twoLetter;
                console.log(`    change lang to ${lOut} from user preferences`);
            }
        }
    })

    lOut = getLangFromURL() || lOut;   //  lang from URL has priority

    console.log(`localize: use language "${lOut}"`);

    //  final catch
    if (!languages.includes(lOut)) {
        lOut = iDefaultLanguage;
        console.log(`localize: final catch, use language "${lOut}"`);
    }

    return lOut;
}

/**
 * Finds the two-letter code in a `lang` URL parameter if it exists. Returns `null` if none.
 * @returns {null}
 */
function getLangFromURL() {
    const params = new URLSearchParams(document.location.search.substring(1));
    const langParam = params.get("lang");

    if (langParam) {
        console.log(`Got language ${langParam} from input parameters`);
    } else {
        console.log(`No "lang" parameter in URL`);
    }
    return langParam;
}

function getCaseFromFlags(pAcc, pDat, pGen) {
    let out = "Nom";

    if (pAcc) out = "Acc";
    else if (pDat) out = "Dat";
    else if (pGen) out = "Gen";

    return out;
}

function getArticleFromFlags(iDef, iIndef) {
    let out = "kein";       // no article
    if (iDef) out = "def";
    else if (iIndef) out = "indef";
    return out;
}


export function getNoun(iSingular, pPlural, iArticle = "", iCase = "") {
    const theLang = Root.state.lang || "en";
    let out;

    if (theLang === "de") {
        out = Deutsch.getNoun(iSingular, pPlural, iArticle, iCase);
    } else if (theLang === "en") {
        /*
            in English, iArticle will be "", "def", or "indef", iCase will be "".
         */
        out = "";
        //  construct the article
        if (iArticle === "def") out = "the ";   //  note trailing space
        if (iArticle === "indef") {
            out = "aeiouh".includes(iSingular[0]) ? "an " : "a ";   //  note trailing spaces
        }

        //  add the noun itsef
        if (pPlural) {
            out += pluralize(iSingular);
        } else {
            out += iSingular;
        }

    } else {
        out = `failure to get a noun!`;
    }

    return out
}


export async function pluralize(iSingular = "") {
    const theLang = Root.state.lang || "en";
    let out = iSingular;

    if (theLang === "de") {
        out = await Deutsch.pluralize(iSingular);
    } else if (theLang === "en") {
        out = pluralize_en(iSingular);
    } else {
        out = `plural failure!`;
    }

    return out
}


function pluralize_en(iSingular = "noun") {
    const specialNouns = [
        "fish", "deer", "series", "offspring", "sheep", "bison", "cod", "heads", "tails"
    ]

    let thePlural = iSingular;
    const theLength = thePlural.length;
    const lower = iSingular.toLocaleLowerCase();

    if (!specialNouns.includes(lower)) {
        const lastOne = lower.slice(-1);
        const lastTwo = lower.slice(-2);

        if (lower.slice(-5) === "craft") {
            thePlural = iSingular;
        } else if (thePlural === "man") {   //  todo: do that slice thing so frogman -> frogmen
            thePlural = "men";
        } else if (thePlural === 'woman') {
            thePlural = 'women';
        } else if (thePlural === 'child') {
            thePlural = 'children';
        } else if (thePlural === 'radius') {
            thePlural = 'radii';
        } else if (thePlural === 'die') {
            thePlural = 'dice';
            /*
                        } else if (lastTwo === 'um') {
                            thePlural = thePlural.slice(0, theLength - 2) + "a";
                        } else if (lastTwo === 'us') {
                            thePlural = thePlural.slice(0,theLength-2) + "i";
            */
        } else if (lastTwo === 'zz') {
            thePlural = thePlural + "es";
        } else if (lastOne === 's') {
            thePlural = thePlural + "es";
        } else if (lastOne === 'z') {
            thePlural = thePlural + "zes";
        } else if (lastOne === 'y' &&
            lastTwo === 'ly' || lastTwo === 'ty' || lastTwo === 'dy' || lastTwo === 'cy' ||
            lastTwo === 'fy' || lastTwo === 'gy' || lastTwo === 'zy' || lastTwo === 'ry' ||
            lastTwo === 'my' || lastTwo === 'ny' || lastTwo === 'py' || lastTwo === 'sy') {
            thePlural = thePlural.slice(0, theLength - 1) + "ies";
        } else {
            thePlural = thePlural + "s";
        }
    }

    return thePlural;
}

export async function eventTextWithNumberDative(iEventWord, iNumber) {
    let theWord;

    switch (Root.state.lang) {
        case 'en':
            theWord = pluralize_en(iEventWord)
            break;
        case 'de':
            const theEntry = await Deutsch.getEntryFromLocalDictionary(iEventWord);    //  entry from the singular word
            theWord = await Deutsch.getNoun(theEntry.singular, (iNumber !== 1) , "", "Dat");
            break;
        default:
            break;
    }

    return `<b>${iNumber}</b> ${theWord}`;
}