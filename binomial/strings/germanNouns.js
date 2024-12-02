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
    const thePlural =  await getNoun_de(iSingular, true);
    return thePlural;
}

/**
 *
 * @param iSingular the singular form we're looking at
 * @param pPlural   is this plural? Boolean
 * @param pArtikel  do we get an article? "kein" | "def | "indef"
 * @param pCase  what case are we in? "Nom" | "Acc" or "Akk" | "Dat" | "Gen"
 * @returns {Promise<void>}
 */
export async function getNoun_de(iSingular, pPlural = false, pArtikel = "kein", pCase = "Nom") {
    let theEntry = await getEntryFromDictionary(iSingular);

    const out = assembleWordAndArticle(theEntry,pPlural, pArtikel, pCase);

    return out;
}

async function getEntryFromDictionary(iSingular) {
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

function assembleWordAndArticle(iEntry, pPlural, pArtikel, pCase) {
    let theWord, theDefArticle, theIndefArticle;

    theWord = pPlural ? iEntry.plural : iEntry.singular;

    switch(iEntry.gender) {
        case "M":
            switch (pCase) {
                case "Nom":
                    theDefArticle = pPlural ? "die" : "der";
                    theIndefArticle = pPlural ? "keine" : "ein";
                    break;
                case "Acc":
                case "Akk":
                    theDefArticle = pPlural ? "die" : "den";
                    theIndefArticle = pPlural ? "keine" : "einen";
                    break;
                default:
                    theDefArticle = "de";
                    theDefArticle = "de";
            }
            break;

        case "F":
            switch (iEntry.case) {
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
            switch (iEntry.case) {
                case "Nom":
                    theDefArticle = pPlural ? "die" : "das";
                    theIndefArticle = pPlural ? "keine" : "ein";
                    break;
                case "Acc":
                case "Akk":
                    theDefArticle = pPlural ? "die" : "das";
                    theIndefArticle = pPlural ? "keine" : "ein";
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

    switch(pArtikel) {
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