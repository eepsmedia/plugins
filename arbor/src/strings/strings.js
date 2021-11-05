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
            //  sShowPredictionLeaves: `show prediction "leaves"`,
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
            noTreeMessage : `Drag your target attribute here`,
            "truth-head": "truth",
            "pred-head": "prediction",
            sOmitProportionLabel : `(none)`,
            focusAttributeNameBoxLabel  : `label`,
            focusAttributeValueBoxLabel  : `value`,    //  `val`,

            tableSummaryDataControlDetailTitle : `in order to export...`,

            //  attribute configuration panel

            sConfConfigure : `Configure`,
            sConfDoneButton : `Done`,
            sConfLeftHeaderText : `left branch`,
            sConfRightHeaderText : `right branch`,
            sConfLeftLabelLabel : `label:`,
            sConfRightLabelLabel : `label:`,
            sConfAttributeTypeLabel : `attribute type:`,
            sConfSwapLandRLabel : `swap left and right:`,
            sConfContinuousOptionText : `numeric`,
            sConfCategoricalOptionText : `categorical`,
            numberEntryHint : ``,

            //  options panel

            classificationMenuItem : `classification`,
            regressionMenuItem : `regression`,
            treeTypeLabel : `tree type: `,
            howDoYouWantToDisplay : `How do you want to display...`,
            howManyCasesAreSuccesses : `... how many dots are blue?`,
            theProportionOfSuccesses : `... the proportion of dots are blue?`,
            threeOfFive : `3 of 5`,
            threeToTwo : `3 to 2`,        //      `3 to 2`,
            sAutoOpenAttributeSplitLabel : `automatically open attribute configuration`,
            //      sShowDiagnosisLeafControlLabel :  `never appear!`,
            sAutomaticallyShowSplitPointsInBranchLabelsLabel : `automatically show split points in branch labels`,


        },
        sIs: "is",
        sOr: "or",
        sAnd: "and",
        sOf : "of",
        sOthers : `others`,
        sTo : `to`,

        sThenWeAskAbout: `
        
Then we ask about`,

        sAllCasesText: ` of the cases`,
        sPredict: `Predict`,
        sNoPrediction: `no prediction`,
        sNoCasesToProcess: `no cases to process`,
        sYourBestGuess: `your best guess for these cases:`,
        sLeafNoDiagnosis: `You have not assigned a diagnosis yet. Click to assign!`,
        sMoreCategories: `more categories`,    //  used in the labels for links
        sNoCategories: `no categories`,    //  used in the labels for links
        sNoCases :  `no cases`,

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


        //      functions, that is, strings that have numbers, etc. substitutes in them

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
            const isRoot  = !(iNode.parentID);
            const sAll = isRoot ? "all " : "";
            const sBooleanIdentity = isRoot ? "" : `
These are all cases where (${iNode.friendlySubsetDescription()}).`;

            return (
`This node represents ${sAll}${iNode.denominator} ${(iNode.denominator === 1) ? "case" : "cases"}.${sBooleanIdentity}
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
            //  sShowPredictionLeaves: `"Label" anzeigen`,
            sTreeTab: `Baum`,
            sTableTab: `Tabelle`,
            sSettingsTab: `Einstellungen`,
            sHelpTab: `Hilfe`,
            refreshAllButton: `Baum zurücksetzen`,
            refreshDataButton: `Daten aktualisieren`,
            emitDataButton: `Daten ausgeben`,
            refreshAllButton2: `Baum zurücksetzen`,
            refreshDataButton2: `Daten aktualisieren`,
            emitDataButton2: `Daten ausgeben`,
            noTreeMessage : `Die Zielvariable hierher ziehen`,
            "truth-head": "tatsächlich",
            "pred-head" : "Vorhersage",
            sOmitProportionLabel : `(ohne)`,
            focusAttributeNameBoxLabel  : `Variable`,    //  `label`,
            focusAttributeValueBoxLabel  : `Wert`,    //  `val`,

            tableSummaryDataControlDetailTitle : `zum Ausgeben...`,

            //  configuration panel
            sConfConfigure : `Einstellungen für`,  
            sConfDoneButton : `Fertig!`,
            sConfLeftHeaderText : `linker Ast`,
            sConfRightHeaderText : `rechter Ast`,
            sConfLeftLabelLabel : `Label:`,
            sConfRightLabelLabel : `Label:`,
            sConfAttributeTypeLabel : `Art der Variable`,  
            sConfSwapLandRLabel : `links und rechts tauschen:`,
            sConfContinuousOptionText : `numerisch`,
            sConfCategoricalOptionText : `kategorial`,
            numberEntryHint : `Punkt statt Komma benutzen!`,

            //  options panel
            classificationMenuItem : `Klassifikation`,      //`classification`,
            regressionMenuItem : `Regression`,              //   `regression`,
            treeTypeLabel : `Art des Baums: `,
            howDoYouWantToDisplay : `Wie soll die Darstellung aussehen von...`,    //  `How do you want to display...`,
            howManyCasesAreSuccesses : `Wie viele Fälle sind blau?`,     //  `... how many cases are successes?`,
            theProportionOfSuccesses :  `Welcher Anteil ist blau?`,    //      `... the proportion of successes?`,
            threeOfFive : `3 von 5`,        //      `3 of 5`,
            threeToTwo : `3 zu 2`,        //      `3 to 2`,
            sAutoOpenAttributeSplitLabel : `Splitkonfiguration automatisch öffnen`,
            //  sShowDiagnosisLeafControlLabel :  `this should never appear!`,
            sAutomaticallyShowSplitPointsInBranchLabelsLabel : `Splitwerte an den Ästen anzeigen`,

        },
        sIs: "ist",
        sOr: "oder",
        sAnd: "und",
        sOf : "von",
        sOthers : `Sonstige`,
        sTo : `zu`,

        sThenWeAskAbout: `
        
Als nächstes wird betrachtet:`,  //insert an empty row before this line

        sAllCasesText: `der Fälle`,
        sPredict: `Vorhersage für`,
        sNoPrediction: `ohne Vorhersage`,
        sNoCasesToProcess: `keine Daten vorhanden`,
        sYourBestGuess: `Ihre Vorhersage für diese Fälle:`, 
        sLeafNoDiagnosis: `Sie haben noch keine Vorhersage getroffen. Wählen durch Anklicken!`,
        sMoreCategories: `mehrere Werte`,
        sNoCategories: `kein Wert`,
        sNoCases :  `keine Fälle`,   //  `no cases`,

        //  tree and collection names

        sClassTreeCollectionName: "klassBäume",
        sClassTreeDataSetTitle: "Daten zum Entscheidungsbaum",
        sClassTreeDataSetDescription : `Daten zum Entscheidungsbaum`,

        sRegressTreeCollectionName: "regressBäume",
        sRegressTreeDataSetTitle: "Daten zum Entscheidungsbaum",
        sRegressTreeDataSetDescription : `Daten zum Entscheidungsbaum`,


        //  emitted data attribute names and descriptions. Prefixes; `san` and `sad`

        sanPredict : `Zielvariable`,
        sanN : `N`,
        sanNodes : `Knoten`,
        sanDepth : `Tiefe`,
        sanBaseRate : `Zielwertanteil`,
        sanTP : `RP`,
        sanFN : `FN`,
        sanFP : `FP`,
        sanTN : `RN`,
        sanNPPos : `PoV`,
        sanNPNeg : `NoV`,
        sanSensitivity : `Sens`,
        sanMisclassificationRate : `FKR`,
        sanSumSSD: `GQA`,  //GERMAN What is that? How to translate?

        sadPredict : `Was soll dieser Baum vorhersagen?`,
        sadN : `Gesamtanzahl aller Fälle`,
        sadNodes : `Gesamtanzahl aller Knoten`,
        sadDepth : `Tiefe des Baums`,
        sadBaseRate : `Anteil der Fälle mit dem Zielwert (vorherzusagender Wert) an allen Fällen`,
        sadTP : `Anzahl der richtig positiven Fälle`,
        sadFN : `Anzahl der falsch negativen Fälle`,
        sadFP : `Anzahl der falsch positiven Fälle`,
        sadTN : `Anzahl der richtig negativen Fälle`,
        sadNPPos : `Anzahl der positiven Fälle ohne Vorhersage`,
        sadNPNeg : `Anzahl der negativen Fälle ohne Vorhersage`,
        sadSensitivity : `Die Sensitivität gibt an, welcher Anteil der tatsächlich positiven Fälle auch positiv vorhergesagt wird: RP/(RP+FN)`,
        sadMisclassificationRate : `Die Fehlklassifikationsrate gibt den Anteil der falschen Vorhersagen an: (FP+FN)`,
        sadSumSSD : `Gesamtsumme der (normierten) Quadrate der Abweichungen`,



        //      functions, that is, strings that have numbers, etc. substitutes in them



        sfIsAre : function(howMany) {
            return (howMany === 1) ? "ist" : "sind";
        },

        sfPositiveNegativeNodeDescription: function () {
            return(
`In diesem Baum bezeichnen wir  
(${arbor.informalDVBoolean}) als "positiv" und 
(${arbor.informalDVBooleanReversed}) als "negativ".`
            );
        },

        sfNodeCasesDescription: function (iNode) {
            const theRest = iNode.denominator - iNode.numerator;
            const isRoot  = !(iNode.parentID);
            const sAll = isRoot ? "alle " : "";
            const sBooleanIdentity = isRoot ? "" : `
Das sind alle Fälle mit (${iNode.friendlySubsetDescription()}).`;
            return (
`Dieser Knoten repräsentiert ${sAll}${iNode.denominator} ${(iNode.denominator === 1) ? "Fall" : "Fälle"}.${sBooleanIdentity}
Für ${iNode.numerator} davon gilt: (${arbor.informalDVBoolean}). 
Für ${theRest}, davon gilt: (${arbor.informalDVBooleanReversed}).`
            );
        },

        sfGetStripeToolTipText: function (iStripe) {
            var tVariableName = "";
            if (iStripe.parent.myNode.attributeSplit) {
                tVariableName = iStripe.parent.myNode.attributeSplit.attName;
            }

            return {
                "plusMinus": `Die Vorhersage dieses Labels ändern`,  //GERMAN? WHere does this all appear?
                "leftRight": `Label tauschen gegen ${iStripe.sText}`, //GERMAN?
                "trash": `Die nachfolgenden Knoten entfernen (${iStripe.sText} löschen)`,
                "configure": `Den Split für diese Variable konfigurieren: ${tVariableName}`,
                "dependent": `Positive Vorhersage in negative umwandeln und umgekehrt`, //GERMAN?
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
