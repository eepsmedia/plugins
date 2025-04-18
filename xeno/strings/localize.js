
let DG = {
    plugins : null,
};

function replaceSubstrings(originalString, ...substitutions) {
    // Use a regular expression to find substrings of the form "•n•"
    const regex = /•(\d+)•/g;

    // Replace each match with the corresponding substitution
    const resultString = originalString.replace(regex, (match, index) => {
        const substitutionIndex = parseInt(index, 10) - 1; // Adjust index to zero-based
        let theSub = substitutions[substitutionIndex];
        if (theSub === 0) theSub = "0";
        return theSub || match; // Use substitution or original match if not available
    });

    return resultString;
}


const localize = {

    defaultStrings : {},
    languages : [],

    fileNameMap : {
        en : "strings/xeno_en.json",
        es : "strings/xeno_es.json",
        de : "strings/xeno_de.json",
        fr : "strings/xeno_fr.json",
        it : "strings/xeno_it.json",
    },

    initialize : async function(iLang) {
        DG.plugins = await this.loadLanguage(iLang);
        this.defaultStrings = await this.loadLanguage('en');    //  defaults to English; may not be necessary

        console.log("done loading language strings");
        this.setStaticStrings();
    },

    loadLanguage : async function(iLang) {
        let theFileName = `strings/xeno_${iLang}.json`;
            //  this.fileNameMap[iLang];
        let response;

        try {
            response = await fetch(theFileName);
            if (!response.ok) {
                alert (`language "${iLang}" is not available. Reverting to English.`);
                theFileName = `strings/xeno_en.json`;
                response = await fetch(theFileName);
            }
        } catch (msg) {
            console.error(msg);
        }
        const theText = await response.text();
        return JSON.parse(theText)
    },

    getString : function(iID, ...theArgs) {
        const theRawString = eval(`DG.plugins.xeno.${iID}`);
        let out = "";
        if (theRawString) {
            out = replaceSubstrings(theRawString, ...theArgs);
        } else {
            const theDefaultString = eval(`this.defaultStrings.xeno.${iID}`);
            if (theDefaultString) {
                out = replaceSubstrings(theDefaultString, ...theArgs);
            }
        }
        return `${out}`;    //  add gunk to this statement to check if we're localizing correctly!
    },

    setStaticStrings: async function () {

        //  substitute all the static strings in the UI (by `id`)
        const theStaticStrings = DG.plugins.xeno.staticStrings;
        for (const theID in theStaticStrings) {
            if (theStaticStrings.hasOwnProperty(theID)) {
                const theValue = this.getString(`staticStrings.${theID}`); // theStaticStrings[theID];
                const element = document.getElementById(theID);
                if (theID.includes("Button") || theID.includes("button")) {
                    try {
                        element.value = theValue;
                        //  console.log(`Set string for ${theID} in ${iLang}`);
                    } catch (msg) {
                        console.log(msg + ` on ID = ${theID}`);
                    }

                } else {
                    try {
                        element.innerHTML = theValue;
                        //  console.log(`Set string for ${theID} in ${iLang}`);
                    } catch (msg) {
                        console.log(msg + ` on ID = ${theID}`);
                    }
                }
            }
        }
    },

    /**
     * Get a two-letter language code from a variety of sources.
     *
     * @param iDefaultLanguage  the default laguage in case none of the following work
     * @param iSupportedLanguages an array of two-letter codes for the languages the plugin supports
     * @returns {*}     resulting two-letter code
     */
    figureOutLanguage:  function (iDefaultLanguage) {

        this.languages = Object.keys(this.fileNameMap);
        let lOut = iDefaultLanguage;

        //  find the user's favorite language that's actually in our list

        const userLanguages = Array.from(navigator.languages).reverse();

        userLanguages.forEach((L) => {
            console.log(`user has lang ${L}`);
            const twoLetter = L.slice(0, 2).toLowerCase();
            if (this.languages.includes(twoLetter)) {
                if (lOut !== twoLetter) {
                    lOut = twoLetter;
                    console.log(`    change lang to ${lOut} from user preferences`);
                }
            }
        })

        lOut = this.getLangFromURL() || lOut;   //  lang from URL has priority

        console.log(`localize: use language "${lOut}"`);

        //  final catch
        if (!this.languages.includes(lOut)) {
            lOut = iDefaultLanguage;
            console.log(`localize: final catch, use language "${lOut}"`);
        }

        return lOut;
    },

    /**
     * Finds the two-letter code in a `lang` URL parameter if it exists. Returns `null` if none.
     * @returns {null}
     */
    getLangFromURL : function() {
        const params = new URLSearchParams(document.location.search.substring(1));
        const langParam = params.get("lang");

        if (langParam) {
            console.log(`Got language ${langParam} from input parameters`);
        } else {
            console.log(`No "lang" parameter in URL`);
        }
        return langParam;
    },


}