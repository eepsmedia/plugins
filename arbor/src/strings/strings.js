
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
        sThenWeAskAbout : `Then we ask about`,
        sAllCasesText : `all of the cases`,

        sfPositiveNegativeNodeDescription : function() {
            const tSplit = arbor.state.dependentVariableSplit;

            let out = "In this scenario, <br>";
            out += "'Positive' means " + tSplit.leftLabel + " and 'negative' means " + tSplit.rightLabel + ".";

            return out;
        },

        sfNodeCasesDescription : function(iNode) {
            const tDependentClause = arbor.informalDVBoolean;
            return `This node represents ${iNode.denominator} cases. <br>` +
                `These are ${iNode.friendlySubsetDescription()}. <br> ` +
                `Of these, ${iNode.numerator } are (${tDependentClause}). `;

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
        sThenWeAskAbout : `Dann fragen wir über`,
        sAllCasesText : `alle Fälle`,

        sfPositiveNegativeNodeDescription : function() {
            const tSplit = arbor.state.dependentVariableSplit;

            let out = "In diesem Szenario, <br>";
            out += "'positiv' bedeutet " + tSplit.leftLabel + " und 'negativ' bedeutet " + tSplit.rightLabel + ".";

            return out;
        },

        sfNodeCasesDescription : function(iNode) {
            const tDependentClause = arbor.informalDVBoolean;
            return `Dieser Knoten repräsentiert ${iNode.denominator} Fälle. <br>` +
                `Das sind ${iNode.friendlySubsetDescription()}. <br>` +
                `Von diesen, ${iNode.numerator } sind (${tDependentClause}). `;

        }



    },

    es : {

    },

}
