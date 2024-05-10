let DG = {
    plugins: null,
};

let defaultStrings = {};
let languages = [];

export async function initialize(iLang) {
    DG.plugins = await loadLanguage(iLang);
    defaultStrings = await loadLanguage('en');    //  defaults to English; may not be necessary

    console.log("done loading language strings");
    setStaticStrings();
}

export function getString(iID, ...theArgs) {
    const stringLoc = `DG.plugins.forest.${iID}`;
    const theRawString = eval(stringLoc);
    let out = "";
    if (theRawString) {
        out = replaceSubstrings(theRawString, ...theArgs);
    } else {
        const theDefaultString = eval(`defaultStrings.forest.${iID}`);
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
        return substitutions[substitutionIndex] || match; // Use substitution or original match if not available
    });

    return resultString;
}


const fileNameMap = {
    en: "strings/forest_English.json",
    es: "strings/forest_Spanish.json",
    de: "strings/forest_German.json",
    fr: "strings/forest_French.json",
    it: "strings/forest_Italian.json",
}


async function loadLanguage(iLang) {
    let theFileName = fileNameMap[iLang];
    const response = await fetch(theFileName);
    const theText = await response.text();
    return JSON.parse(theText)
}


async function setStaticStrings() {

    //  substitute all the static strings in the UI (by `id`)
    const theStaticStrings = DG.plugins.forest.staticStrings;
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
function figureOutLanguage(iDefaultLanguage) {

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