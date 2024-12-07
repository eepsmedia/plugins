import * as Fire from "../src/fire.js"

let theDictionary = [];

const germanNounsModal = document.getElementById("germanNounsModal");
const pluralInput = document.getElementById("pluralInput");
const singularInput = document.getElementById("singularInput");
const doneButton = document.getElementById("doneButton");
const singularArticleMenu = document.getElementById("singularArticleMenu");


export async function initialize() {
    theDictionary = await Fire.initialize();
    console.log(`done loading German plurals from database`);
}

export async function pluralize(iSingular) {
    const thePlural =  await getNoun(iSingular, true);
    return thePlural;
}

/**
 *
 * @param iSingular the singular form we're looking at
 * @param pPlural   is this plural? Boolean
 * @param iArtikel  do we get an article? "kein" | "def | "indef"
 * @param iCase  what case are we in? "Nom" | "Acc" or "Akk" | "Dat" | "Gen"
 * @returns {Promise<void>}
 */
export async function getNoun(
    iSingular,
    pPlural = false,
    iArtikel = "kein",
    iCase = "Nom"
) {
/*
    if (iSingular[0].toLowerCase() === iSingular[0]) {
        return iSingular;   //  it's not a noun
    }
*/

    let theEntry = await getEntryFromDictionary(iSingular);

    const out = assembleWordAndArticle(theEntry,pPlural, iArtikel, iCase);

    return out;
}

export async function getEntryFromDictionary(iSingular) {
    if (theDictionary.length === 0) {
        Swal.fire({
            icon: "warning",
            title: Language.getString("oops"),
            text: `Ich konnte das deutsche Pluralwörterbuch nicht finden. Die Plurale und Artikel werden falsch sein!`
        })
        return {
            singular : iSingular,
            plural : iSingular + "en",
            article : "der",
            gender : "M"
        };
    }

    let entry = theDictionary.find( e => (e.singular === iSingular));
    if (!entry) {
        return await getEntryFromUser(iSingular);
    } else {
        return entry;
    }
}

function getEntryFromUser(iSingular) {
    return new Promise(resolve => {
        germanNounsModal.showModal();
        const theSingular = iSingular.trim();       //      just in case
        singularInput.value = theSingular;      //  display in the box
        pluralInput.value = ""; // Clear previous input

        doneButton.addEventListener('click', function onDone() {
            const thePlural = pluralInput.value.trim();
            if (thePlural) {
                const theArticle = singularArticleMenu.value;
                const theGender = genderFromArticle(theArticle);
                const theEntry = {
                    singular: theSingular,
                    plural: thePlural,
                    article: theArticle,
                    gender: theGender
                }
                console.log(`new dictionary entry: ${JSON.stringify(theEntry)}`);

                // Add the new word to the local dictionary
                theDictionary.push(theEntry);

                //  Add the new word to the Firebase repository
                Fire.addPlural(theEntry);

                //  clean up
                germanNounsModal.close();
                doneButton.removeEventListener('click', onDone);
                resolve(theEntry);
            }
        });
    });
}

function genderFromArticle(iArt) {
    if (iArt == "der") return "M"
    else if (iArt == "die") return "F"
    else return "N";
}

function assembleWordAndArticle(iEntry, pPlural, iArtikel, iCase) {
    let theWord, theDefArticle, theIndefArticle;

    theWord = pPlural ? iEntry.plural : iEntry.singular;
    const lastLetterOfPlural = iEntry.plural.slice(-1);

    if (pPlural && iCase === "Dat") {
        switch (lastLetterOfPlural) {
            case "n":
            case "s":
                break;
            default:
                theWord += "n";
                break;
        }
    }

    switch(iEntry.gender) {
        case "M":
            switch (iCase) {
                case "Nom":
                    theDefArticle = pPlural ? "die" : "der";
                    theIndefArticle = pPlural ? "keine" : "ein";
                    break;
                case "Acc":
                case "Akk":
                    if (lastLetterOfPlural === "n") theWord = iEntry.plural;
                    theDefArticle = pPlural ? "die" : "den";
                    theIndefArticle = pPlural ? "keinen" : "einen";
                    break;
                case "Dat":
                    if (lastLetterOfPlural === "n") theWord = iEntry.plural;
                    theDefArticle = pPlural ? "den" : "dem";
                    theIndefArticle = pPlural ? "keinem" : "einer";
                    break;
                default:
                    theDefArticle = "de";
                    theDefArticle = "de";
            }
            break;

        case "F":
            switch (iCase) {
                case "Nom":
                    theDefArticle = pPlural ? "die" : "die";
                    theIndefArticle = pPlural ? "keine" : "eine";
                    break;
                case "Acc":
                case "Akk":
                    theDefArticle = pPlural ? "die" : "die";
                    theIndefArticle = pPlural ? "keine" : "eine";
                    break;
                default:
                    theDefArticle = "de";
                    theDefArticle = "de";
            }
            break;

        case "N":
            switch (iCase) {
                case "Nom":
                    theDefArticle = pPlural ? "die" : "das";
                    theIndefArticle = pPlural ? "keine" : "ein";
                    break;
                case "Acc":
                case "Akk":
                    theDefArticle = pPlural ? "die" : "das";
                    theIndefArticle = pPlural ? "keine" : "ein";
                    break;
                case "Dat":
                    if (theWord === "Herz") theWord = "Herzen"
                    theDefArticle = pPlural ? "den" : "dem";
                    theIndefArticle = pPlural ? "keinen" : "einem";
                    break;
                default:
                    theDefArticle = "de";
                    theDefArticle = "de";
            }
            break;

        default:
            theDefArticle = "de";
            theDefArticle = "de";
    }       //  end switch on gender

    switch(iArtikel) {
        case "def":
            return theDefArticle + " " + theWord;
            break;
        case "indef":
            return theIndefArticle + " " + theWord;
            break;
        default:    //      no article, "kein"
            return theWord;
            break;
    }
    return "";
}

