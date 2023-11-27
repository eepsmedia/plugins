
let DG = {
    plugins : null,
};

function replaceSubstrings(originalString, ...substitutions) {
    // Use a regular expression to find substrings of the form "@%n"
    const regex = /•(\d+)•/g;

    // Replace each match with the corresponding substitution
    const resultString = originalString.replace(regex, (match, index) => {
        const substitutionIndex = parseInt(index, 10) - 1; // Adjust index to zero-based
        return substitutions[substitutionIndex] || match; // Use substitution or original match if not available
    });

    return resultString;
}


const localize = {

    fileNameMap : {
        en : "strings/testimate_English_US.json",
    },

    initialize : async function(iLang) {

        let theFileName = this.fileNameMap[iLang];
        const response = await fetch(theFileName);
        const theText = await response.text();

        DG.plugins = JSON.parse(theText);

        console.log("done");

    },

    getString : function(iID, ...theArgs) {
        const theRawString = eval(`DG.plugins.testimate.${iID}`);
        if (theRawString) {
            const theCookedString = replaceSubstrings(theRawString, ...theArgs);
            return theCookedString;
        } else {
            return "";
        }
    }

}