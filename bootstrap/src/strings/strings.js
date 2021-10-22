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


    en : {
        name : "English",
        flags : ["🇬🇧", "🇺🇸", "🇳🇿", "🇨🇦"],

        staticStrings : {
            bootstrapTitle : `bootstrap`,
            cantBootstrapStripe : `Fix that to proceed.`,
            howManyLabel : `how many?`,
        },

        sBootstrap : `bootstrap`,
        sNoAttribute : `no attribute :(`,
        sIterationAttName : `batch`,
        sIterationAttDescription : `Which "run" of data. Increases every time you bootstrap.`,
        sBootstrappedAttName : `bootstrapped att`,
        sBootstrappedAttDescription : `Which attribute was bootstrapped.`,

        sNoDataset : `Find a dataset and drag the attribute here that you want to bootstrap!`,
        sNoBootstrapAttribute : `What attribute do you want to bootstrap? Drag it in here. `,

        sfOKtoBootstrap : (tDSTitle) => {
            return  `OK to bootstrap dataset "${tDSTitle}"`},

        sfNoMeasure : (tDSTitle) => { return `Your dataset, "${tDSTitle}," needs a measure, 
                which is probably an attribute with a formula. 
                Drag that attribute to the left so you have something to collect!`},

        sfFormulaProblem : (tAttName, lastCollName, suchAs) => {
            return `Bootstrapping ${tAttName} won't work because it has a formula. 
                        Drag in a different attribute from the last collection (${lastCollName}), such as ${suchAs}.`
        },

        sfNotALeafProblem : (tAttName, lastCollName, suchAs) => {
            return `Bootstrapping ${tAttName} won't work because it's not in the last collection (${lastCollName}). 
                        Drop an attribute here from ${lastCollName}, such as ${suchAs}.`
        },

    },

    es : {
        name : "Español",
        flags : ["🇲🇽", "🇪🇸", "🇨🇷"],

        staticStrings : {
            bootstrapTitle : `mezcladora`,  //  bootstrap
            cantBootstrapStripe :  `Arreglar eso para continuar`,  //  `Fix that to proceed.`,
            howManyLabel :  `cuántos?` //  `how many?`,
        },

        sBootstrap : `mezclar`,      //  `bootstrap`,
        sNoAttribute : `sin atributo :(`,
        sIterationAttName : `lote`,
        sIterationAttDescription : `Cuál "lote" de datos. Se aumenta cada mezclado.`,   //  `Which "run" of data. Increases every time you bootstrap.`,
        sBootstrappedAttName : `atr mezclado`,     //  `bootstrapped att`, (the name of the bootstrapped att)
        sBootstrappedAttDescription : `Qué atributo fue mezclado.`,

        sNoDataset : `¡Busque un conjunto de datos y arrastre el atributo aquí que desea mezclar!`,
        sNoBootstrapAttribute : `¿Qué atributo desea mezclar? Arrástrelo aquí. `,

        sfOKtoBootstrap : (tDSTitle) => {
            return  `OK para mezclar el conjunto de datos "${tDSTitle}"`},

        sfNoMeasure : (tDSTitle) => { return `Su conjunto de datos, "${tDSTitle}," necesita una medida, 
                probablemente un atributo con fórmula. 
                Arrastre eso atributo a la izquierda para obtener algo de acumular!`},

        sfFormulaProblem : (tAttName, lastCollName, suchAs) => {
            return `Mezclar ${tAttName} no funcionará porque tiene una fórmula. 
                        Arrastre un atributo diferente, de la última colección (${lastCollName}), por ejemplo ${suchAs}.`
        },

        sfNotALeafProblem : (tAttName, lastCollName, suchAs) => {
            return `Mezclar ${tAttName} no funcionará porque no está en la última colleción (${lastCollName}). 
                        Ponga un atributo aquí de la colección ${lastCollName}, por ejemplo ${suchAs}.`
        }
    },

    de : {
        name : "Deutsch",
        flags : ["🇩🇪"],

    },
}