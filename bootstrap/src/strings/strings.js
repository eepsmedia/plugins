/*
==========================================================================

 * Created by tim on 10/16/21.
 
 
 ==========================================================================
strings in bootstrap

Author:   Tim Erickson

Copyright (c) 2018 by The Concord Consortium, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==========================================================================

*/

bootstrapStrings = {
    initializeStrings: async function (iLang = "en") {

        const theStrings = bootstrapStrings[iLang];

        //  substitute all the static strings in the IU (by `id`)
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

    languages : ['en', 'es', 'de'],

    en : {
        name : "English",
        flags : ["🇬🇧", "🇺🇸", "🇳🇿", "🇨🇦"],

        staticStrings : {
            bootstrapTitle : `bootstrap`,
            cantBootstrapStripe : `Fix that to proceed.`,
            howManyLabel : `how many?`,
        },

        sOr : `or`,
        sBootstrap : `bootstrap`,
        sNoAttribute : `no attribute :(`,
        sIterationAttName : `batch`,
        sIterationAttDescription : `Which "run" of data. Increases every time you bootstrap.`,
        sBootstrappedAttName : `bootstrapped att`,
        sBootstrappedAttDescription : `Which attribute was bootstrapped.`,

        sNoDataset : `Find a dataset you want to bootstrap, and drag an attribute here!`,

        sfOKtoBootstrap : (tDSTitle) => {
            return  `Sample with replacement from "${tDSTitle}"`},

        sfNoMeasure : (tDSTitle) => { return `Your dataset, "${tDSTitle}," needs a measure, 
                which is probably an attribute with a formula. 
                Drag that attribute to the left so you have something to collect!`},

        sfNoFormulaProblem : (tDSTitle) => {
            return `Bootstrapping "${tDSTitle}" won't work because there are no formulas in the measures.`
        },

        sfOnlyInLeafProblem : (tDSTitle, lastCollName, suchAs) => {
            return `Bootstrapping "${tDSTitle}" won't work because there are no formulas among the measures. 
             Nothing will vary. Drag a formula attribute leftwards from the last collection ("${lastCollName}"), such as ${suchAs}.`
        },

    },

    es : {
        name : "Español",
        flags : ["🇲🇽", "🇪🇸", "🇨🇷"],

        staticStrings : {
            bootstrapTitle : `reemplazo`,  //  bootstrap
            cantBootstrapStripe :  `Arreglar eso para continuar`,  //  `Fix that to proceed.`,
            howManyLabel :  `cuántos?` //  `how many?`,
        },

        sOr : `o`,
        sBootstrap : `reemplazo`,      //  `bootstrap`,
        sNoAttribute : `sin atributo :(`,
        sIterationAttName : `lote`,
        sIterationAttDescription : `Cuál "lote" de datos. Se aumenta cada mezclado.`,   //  `Which "run" of data. Increases every time you bootstrap.`,
        sBootstrappedAttName : `atr mezclado`,     //  `bootstrapped att`, (the name of the bootstrapped att)
        sBootstrappedAttDescription : `Qué atributo fue mezclado.`,

        sNoDataset : `¡Busque un conjunto de datos y arrastre un atributo aquí!`,

        sfOKtoBootstrap : (tDSTitle) => {
            return  `Muestre con reemplazo del conjunto de datos "${tDSTitle}"`},

        sfNoMeasure : (tDSTitle) => { return `Su conjunto de datos, "${tDSTitle}," necesita una medida, 
                probablemente un atributo con fórmula. 
                Arrastre eso atributo a la izquierda para obtener algo de acumular!`},

        sfNoFormulaProblem : (tDSTitle) => {
            return `Reemplazar en "${tDSTitle}" no funcionará porque no hay fórmulas en sus medidas.`
        },

        sfOnlyInLeafProblem : (tDSTitle, lastCollName, suchAs) => {
            return `Reemplazar en "${tDSTitle}" no funcionará porque sus medidas no tienen fórmulas. 
             ¡Nada puede cambiar! 
             Arrastre un atributo con fórmula (por ejemplo ${suchAs})
             desde la colección "${lastCollName}" hasta la izquierda.`
        }
    },

    de : {
        name : "Deutsch",
        flags : ["🇩🇪"],

    },
}