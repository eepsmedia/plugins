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
                    //  console.log(`Set string for ${theID} in ${iLang}`);
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
            changeLanguageButton: "English",
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
            "truth-head": "truth",
            "pred-head": "prediction",
            "no-pred-head": `no prediction`,
            sOmitProportionLabel : `(none)`,
            sAutoOpenAttributeSplitLabel : `automatically open attribute configuration`,

            //  configuration panel
            sConfConfigure : `Configure`,
            sConfDoneButton : `Done`,
            sConfLeftHeaderText : `left branch`,
            sConfRightHeaderText : `right branch`,
            sConfLeftLabelLabel : `label:`,
            sConfRightLabelLabel : `label:`,
            sConfAttributeTypeLabel : `attribute type:`,
            sConfSwapLandRLabel : `swap left and right:`,
            sConfContinuousOptionText : `continuous`,
            sConfCategoricalOptionText : `categorical`,

        },
        sIs: "is",
        sOr: "or",
        sAnd: "and",
        sOf : "of",
        sThenWeAskAbout: `Then we ask about`,
        sAllCasesText: ` of the cases`,
        sPredict: `Predict`,
        sNoPrediction: `no prediction`,
        sNoCasesToProcess: `no cases to process`,
        sYourBestGuess: `your best guess for these cases:`,
        sLeafNoDiagnosis: `You have not assigned a diagnosis yet. Click to assign!`,
        sMoreCategories: `more categories`,    //  used in the labels for links
        sNoCategories: `no categories`,    //  used in the labels for links

        //  tree and collection names

        sClassTreeCollectionName: "classTrees",
        sClassTreeDataSetTitle: "Classification Tree Records",
        sClassTreeDataSetDescription : `Data about classification trees`,

        sRegressTreeCollectionName: "regressTrees",
        sRegressTreeDataSetTitle: "Regression Tree Records",
        sClassTreeDataSetDescription : `Data about regression trees`,

        //  emitted data attribute names and descriptions. Prefixes; `san` and `sad`

        sanPredict : `predict`,
        sanN : `N`,
        sanNodes : `nodes`,
        sanDepth : `depth`,
        sanBaseRate : `base`,
        sanTP : `TP`,
        sanFN : `FN`,
        sanFP : `FP`,
        sanTN : `TN`,
        sanNPPos : `NPPos`,
        sanNPNeg : `NPNeg`,
        sanSensitivity : `sens`,
        sanMisclassificationRate : `MCR`,
        sanSumSSD : `sumSSD`,

        sadPredict : `what does this tree try to predict?`,
        sadN : `total number of cases`,
        sadNodes : `total number of nodes`,
        sadDepth : `depth of tree`,
        sadBaseRate : `base rate`,
        sadTP : `number of true positives`,
        sadFN : `number of false negatives`,
        sadFP : `number of false positives`,
        sadTN : `number of true negatives`,
        sadNPPos : `number of positives without a prediction`,
        sadNPNeg : `number of negatives without a prediction`,
        sadSensitivity : `sensitivity (calculated): the proportion of positive cases that are diagnosed positive`,
        sadMisclassificationRate : `misclassification rate: the proportion of predictions we did not get correct`,
        sadSumSSD : `total (normalized) sum of the squares of the deviations`,


        sfIsAre : function(howMany) {
            return (howMany === 1) ? "is" : "are";
        },

        sfPositiveNegativeNodeDescription: function () {
            return(
`In this scenario, we call 
${arbor.informalDVBoolean} 'positive' and 
${arbor.informalDVBooleanReversed} 'negative'.`
            );
        },

        sfNodeCasesDescription: function (iNode) {
            const theRest = iNode.denominator - iNode.numerator;
            return (
`
This node represents ${iNode.denominator} ${(iNode.denominator === 1) ? "case" : "cases"}.
These are all ${iNode.friendlySubsetDescription()}.
Of these, ${iNode.numerator} ${this.sfIsAre(iNode.numerator)} (${arbor.informalDVBoolean}). 
The rest, ${theRest}, ${this.sfIsAre(theRest)} (${arbor.informalDVBooleanReversed}).`
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

        sfClassificationSummary : function( iRes ) {
            return `TP = ${iRes.TP}, TN = ${iRes.TN}, FP = ${iRes.FP}, FN = ${iRes.FN}`;
        },

        sfConfusionCaseCount : function( iResults) {
            return `<span class='confusionHed'> ${arbor.state.dependentVariableName}</span><br> ${iResults.sampleSize} cases`
        },
    },

    de: {
        staticStrings: {
            changeLanguageButton: "Deutsch",
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
            "truth-head": "Wahrheit",
            "pred-head": "Vorhersage",
            "no-pred-head": `keine Vorhersage`,        //  todo: 2021-09-18 not appearing. Why not?
            sOmitProportionLabel : `(keine)`,
            sAutoOpenAttributeSplitLabel : `Attributkonfiguration automatisch öffnen`,

            //  configuration panel
            sConfConfigure : `Konfigurieren`,
            sConfDoneButton : `Fertig!`,
            sConfLeftHeaderText : `linker Zweig`,
            sConfRightHeaderText : `rechter Zweig`,
            sConfLeftLabelLabel : `Etikett:`,
            sConfRightLabelLabel : `Etikett:`,
            sConfAttributeTypeLabel : `Art des Attributs:`,
            sConfSwapLandRLabel : `links und rechts tauschen:`,
            sConfContinuousOptionText : `kontinuierlich`,
            sConfCategoricalOptionText : `kategorisch`,

        },
        sIs: "ist",
        sOr: "oder",
        sAnd: "und",
        sOf : "von",
        sThenWeAskAbout: `Dann fragen wir über`,
        sAllCasesText: `Fälle`,
        sPredict: `Vorhersagen`,
        sNoPrediction: `keine Vorhersage`,
        sNoCasesToProcess: `keine Fälle zu bearbeiten`,
        sYourBestGuess: `Ihre beste Vermutung für diese Fälle:`,
        sLeafNoDiagnosis: `Sie haben noch keine Diagnose zugeordnet. Zum Zuweisen klicken!`,
        sMoreCategories: `weitere Kategorien`,
        sNoCategories: `keine Kategorien`,

        //  tree and collection names

        sClassTreeCollectionName: "klassBäume",
        sClassTreeDataSetTitle: "Klassifikationsbaum Datensätze",
        sClassTreeDataSetDescription : `Daten über Klassifikationsbäume`,

        sRegressTreeCollectionName: "regressBäume",
        sRegressTreeDataSetTitle: "Regressionsbaum Datensätze",
        sRegressTreeDataSetDescription : `Daten über Regressionsbäume`,


        //  emitted data attribute names and descriptions. Prefixes; `san` and `sad`

        sanPredict : `Vorhersage`,
        sanN : `N`,
        sanNodes : `Knoten`,
        sanDepth : `Tiefe`,
        sanBaseRate : `Basissatz`,
        sanTP : `RP`,
        sanFN : `FN`,
        sanFP : `FP`,
        sanTN : `RN`,
        sanNPPos : `PoV`,
        sanNPNeg : `NoV`,
        sanSensitivity : `sens`,
        sanMisclassificationRate : `FKR`,
        sanSumSSD: `GQA`,

        sadPredict : `Was versucht dieser Baum vorherzusagen?`,
        sadN : `Gesamtzahl der Fälle`,
        sadNodes : `Gesamtzahl der Knotenpunkte`,
        sadDepth : `Tiefe des Baumes`,
        sadBaseRate : `der Basissatz`,
        sadTP : `Anzahl der richtig positiv`,
        sadFN : `Anzahl der falsch negativ`,
        sadFP : `Anzahl der falsch positiv`,
        sadTN : `Anzahl der richtig negativ`,
        sadNPPos : `Anzahl der Positivmeldungen ohne Vorhersage`,
        sadNPNeg : `Anzahl der Negativmeldungen ohne Vorhersage`,
        sadSensitivity : `die (berechnete) Sensitivität ist der Anteil der positiven Fälle, die positiv diagnostiziert werden`,
        sadMisclassificationRate : `Fehlklassifizierungsrate (berechnet): der Anteil der Vorhersagen, die nicht korrekt waren`,
        sadSumSSD : `Gesamtsumme der (normierten) Quadrate der Abweichungen`,


        sfIsAre : function(howMany) {
            return (howMany === 1) ? "ist" : "sind";
        },

        sfPositiveNegativeNodeDescription: function () {
            return(
`In diesem Szenario, wir nennen 
(${arbor.informalDVBoolean}) 'positiv' und 
(${arbor.informalDVBooleanReversed}) 'negativ'.`
            );
        },

        sfNodeCasesDescription: function (iNode) {
            const theRest = iNode.denominator - iNode.numerator;
            return (
`
Dieser Knoten repräsentiert ${iNode.denominator} ${(iNode.denominator === 1) ? "Fall" : "Fälle"}. 
Das sind alle ${iNode.friendlySubsetDescription()}.
Von diesen, ${iNode.numerator}  ${this.sfIsAre(iNode.numerator)} (${arbor.informalDVBoolean}). 
Die anderen, ${theRest}, ${this.sfIsAre(theRest)} (${arbor.informalDVBooleanReversed}).`
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

        sfClassificationSummary : function( iRes ) {
            return  `RP = ${iRes.TP}, RN = ${iRes.TN}, FP = ${iRes.FP}, FN = ${iRes.FN}`;
        },

        sfConfusionCaseCount : function( iResults) {
            return `<span class='confusionHed'> ${arbor.state.dependentVariableName}</span><br> ${iResults.sampleSize} Fälle`
        },

    },

    es: {},

}
