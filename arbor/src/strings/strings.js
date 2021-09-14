
strings = {

    initializeStrings: async function (iLang = "en") {

        //  load text for the "help" tab

        const helpFileName = `src/help/help.${iLang}.html`;
        const response = await fetch(helpFileName);
        const theHelp = await response.text();
        document.getElementById("help").innerHTML = theHelp;

        const theStrings = strings[iLang];

        for (const theID in theStrings.staticStrings) {
            if(theStrings.staticStrings.hasOwnProperty(theID)) {
                const theValue = theStrings.staticStrings[theID];
                document.getElementById(theID).innerHTML = theValue
            }
        }
        return theStrings;
    },

    languageNames : {
        en : "English",
        de : "Deutsch",
        es : "Español",
    },

    nextLanguage: function(iLang = "en") {
        let out = "en";
        if (iLang === "en") {
            out = "de"
        }
        console.log(`changed language to ${this.languageNames[out]}`);
        return out;
    },

    en : {
        staticStrings : {
            sShowPredictionLeaves: `show prediction "leaves"`,
            sTreeTab: `tree`,
            sTableTab: `table`,
            sSettingsTab: `settings`,
            sHelpTab: `help!`,
            refreshAllButton: `refresh all`,
            refreshDataButton: `refresh data`,
            emitDataButton: `emit data`,
            refreshAllButton2: `refresh all`,
            refreshDataButton2: `refresh data`,
            emitDataButton2: `emit data`,
            changeLanguageButton : "English",
        },


    },

    de : {
        staticStrings : {
            sShowPredictionLeaves: `zeigen die "Blätter"`,
            sTreeTab: `Baum`,
            sTableTab: `Tabelle`,
            sSettingsTab: `Optionen`,
            sHelpTab: `Hilfe`,
            refreshAllButton: `alle erfrischen`,
            refreshDataButton: `Daten erfrischen`,
            emitDataButton: `Daten ausgeben`,
            refreshAllButton2: `alle erfrischen`,
            refreshDataButton2: `Daten erfrischen`,
            emitDataButton2: `Daten ausgeben`,
            changeLanguageButton : "Deutsch",

        },



    },

    es : {

    },

}
