/*
==========================================================================

 * Created by tim on 2019-06-25.
 
 
 ==========================================================================
sentimento in sentimento

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

LOCAL: http://localhost:8000/plugins/sentimento/
*/

let sentimento = {

    constants: {
        version: "001a",
        kSentiDataSetName: "text",
        kSentiDataSetTitle: "text data",
        kSentiTextCollectionName: "texts",
        kSentiWordCollectionName: "words",
    },

    state: {
        sampleNumber: 0,
        theText: ""
    },

    initialize: function () {
        sentimento.connect.initialize();
    },

    analyze: function () {
        sentimento.state.sampleNumber++;

        sentimento.state.theText = sentimento.preprocessText();
        const theWords = sentimento.state.theText.split(" ");
        let tSentimentWords = [];
        theWords.forEach((w) => {
            const foundSentimentWord = sentimentWordList.find(swobject => {
                return swobject.word === w
            });
            if (foundSentimentWord) {
                tSentimentWords.push(foundSentimentWord)
            }
        });

        const theTextValues = {
            textNumber: sentimento.state.sampleNumber,
            text: sentimento.state.theText,
            nWords: theWords.length,
        };

        if (tSentimentWords.length !== 0) {
            tSentimentWords.forEach(sw => {
                const theValues = theTextValues;
                theTextValues["sWord"] = sw.word;
                theTextValues["sentiment"] = sw.sentiment;
                sentimento.connect.sendCases(theValues);   //  no need to await
            });
        } else {
            sentimento.connect.sendCases(theTextValues);   //  no sentiment words.
            theTextValues["sentiment"] = 0;
        }
        sentimento.connect.makeTableAppear();
    },

    /**
     * Convert the string in the textarea into an ARRAY of suitable characters
     */
    preprocessText : function( ) {
        const punct =  /[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]/g;
        const theText = document.getElementById("theText").value;
        const noApostrophes = theText.replace(/'/g, "");
        const noAccents = noApostrophes.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const punctuationToSpace = noAccents.replace(punct," ");
        const removeDoubleSpaces = punctuationToSpace.replace(/\s\s+/g," ");
        return removeDoubleSpaces.toLowerCase();
    }
};