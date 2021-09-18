strings = {

    initializeStrings: async function (iLang = "en") {

        //  load text for the "help" tab

        const helpFileName = `src/help/help.${iLang}.html`;
        const response = await fetch(helpFileName);
        const theHelp = await response.text();
        document.getElementById("help").innerHTML = theHelp;

        const theStrings = strings[iLang];

        for (const theID in theStrings.staticStrings) {
            if (theStrings.staticStrings.hasOwnProperty(theID)) {
                const theValue = theStrings.staticStrings[theID];
                try {
                    document.getElementById(theID).innerHTML = theValue;
                    console.log(`Set string for ${theID} in ${iLang}`);
                } catch (msg) {
                    console.log(msg + ` on ID = ${theID}`);
                }
            }
        }
        return theStrings;
    },

    languageNames: {
        en: "English",
        de: "Deutsch",
        es: "Español",
    },


    nextLanguage: function (iLang = "en") {
        let out = "en";
        if (iLang === "en") {
            out = "de"
        }
        console.log(`changed language to ${this.languageNames[out]}`);
        return out;
    },

    en: {
        staticStrings: {
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
            changeLanguageButton: "English",
            "truth-head": "truth",
            "pred-head": "prediction",
            "no-pred-head": "no prediction",
        },
        sIs: "is",
        sOr: "or",
        sAnd: "and",
        sThenWeAskAbout: `Then we ask about`,
        sAllCasesText: `all of the cases`,
        sPredict: `Predict`,
        sNoPrediction: `no prediction`,
        sNoCasesToProcess: `no cases to process`,
        sYourBestGuess: `your best guess for these cases:`,
        sLeafNoDiagnosis: `You have not assigned a diagnosis yet. Click to assign!`,
        sMoreCategories: `more categories`,    //  used in the labels for links
        sNoCategories: `no categories`,    //  used in the labels for links

        sfIsAre : function(howMany) {
            return (howMany === 1) ? "is" : "are";
        },

        sfPositiveNegativeNodeDescription: function () {
            const tSplit = arbor.state.dependentVariableSplit;

            let out = "In this scenario, <br>";
            out += "'Positive' means " + tSplit.leftLabel + " and 'negative' means " + tSplit.rightLabel + ".";

            return out;
        },

        sfNodeCasesDescription: function (iNode) {
            const tDependentClause = arbor.informalDVBoolean;
            return (`
This node represents ${iNode.denominator} ${(iNode.denominator === 1) ? "case" : "cases"}.
These are ${iNode.friendlySubsetDescription()}.
Of these, ${iNode.numerator} ${this.sfIsAre(iNode.numerator)} (${tDependentClause}). 
`
            );
        },

        sfGetStripeToolTipText: function (iStripe) {
            var tVariableName = "";
            if (iStripe.parent.myNode.attributeSplit) {
                tVariableName = iStripe.parent.myNode.attributeSplit.attName;
            }

            return {
                "plusMinus": `change the diagnosis in this 'leaf' node from + to – or vice versa`,
                "leftRight": `swap the labels for ${iStripe.sText}`,
                "trash": `remove the children of this node (get rid of ${iStripe.sText} here)`,
                "configure": `configure this attribute: ${tVariableName}`,
                "dependent": `change positive diagnoses to negative and vice versa`,
            }
        },
    },

    de: {
        staticStrings: {
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
            changeLanguageButton: "Deutsch",
            "truth-head": "Wahrheit",
            "pred-head": "Vorhersage",
            "no-pred-head": "keine Vorhersage",        //  todo: 2021-09-18 not appearing. Why not?

        },
        sIs: "ist",
        sOr: "oder",
        sAnd: "und",
        sThenWeAskAbout: `Dann fragen wir über`,
        sAllCasesText: `alle Fälle`,
        sPredict: `Vorhersagen`,
        sNoPrediction: `keine Vorhersage`,
        sNoCasesToProcess: `keine Fälle zu bearbeiten`,
        sYourBestGuess: `Ihre beste Vermutung für diese Fälle:`,
        sLeafNoDiagnosis: `Sie haben noch keine Diagnose zugeordnet. Zum Zuweisen klicken!`,
        sMoreCategories: `weitere Kategorien`,
        sNoCategories: `keine Kategorien`,

        sfIsAre : function(howMany) {
            return (howMany === 1) ? "ist" : "sind";
        },

        sfPositiveNegativeNodeDescription: function () {
            const tSplit = arbor.state.dependentVariableSplit;

            let out = "In diesem Szenario, <br>";
            out += "'positiv' bedeutet " + tSplit.leftLabel + " und 'negativ' bedeutet " + tSplit.rightLabel + ".";

            return out;
        },

        sfNodeCasesDescription: function (iNode) {
            const tDependentClause = arbor.informalDVBoolean;
            return (`
Dieser Knoten repräsentiert ${iNode.denominator} ${(iNode.denominator === 1) ? "Fall" : "Fälle"}. <br>
Das sind ${iNode.friendlySubsetDescription()}. <br>
Von diesen, ${iNode.numerator}  ${this.sfIsAre(iNode.numerator)} (${tDependentClause}). 
`
            );

        },

        sfGetStripeToolTipText: function (iStripe) {
            var tVariableName = "";
            if (iStripe.parent.myNode.attributeSplit) {
                tVariableName = iStripe.parent.myNode.attributeSplit.attName;
            }

            return {
                "plusMinus": `Ändere die Diagnose in diesem 'Blatt'-Knoten von + auf – oder umgekehrt`,
                "leftRight": `tausche die Etiketten gegen ${iStripe.sText}`,
                "trash": `entferne die Kinder dieses Knotens (werde ${iStripe.sText} hier los)`,
                "configure": `dieses Attribut konfigurieren: ${tVariableName}`,
                "dependent": `positive Diagnosen in negative umwandeln und umgekehrt`,
            }
        },


    },

    es: {},

}
