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

https://localhost/plugins/sentimento
        http://localhost/codap/static/dg/en/cert/index.html?di=https://localhost/plugins/sentimento
*/

let sentimento = {

    constants: {
        version: "2022a",
        kSentiDataSetName: "text",
        kSentiDataSetTitle: "text data",
        kSentiTextCollectionName: "texts",
        kSentiWordCollectionName: "words",
    },

    sentimentWordList : [],

    state: {
        sampleNumber: 0,
        theText: ""
    },

    initialize: function () {
        this.setWordList("vader");
        sentimento.connect.initialize();
    },

    setWordList : function() {
        const theListName = document.getElementById("dictionaryChoice").value;
        switch (theListName) {
            case 'afinn':
                this.sentimentWordList = afinnWordList;
                break;
            case 'vader':
                this.sentimentWordList = vaderWordList;
                break;
            case 'afinn.es':
                this.sentimentWordList = afinnWordListSpanish;
                break;
            default:
                alert('Problem loading the word list!');
                break;

        }
    },

    analyze: function () {
        sentimento.state.sampleNumber++;
        const stop = document.getElementById("doStopWords").checked;

        sentimento.state.theText = sentimento.preprocessText();

        //  convert to an array
        const theWords = sentimento.state.theText.split(" ");
        let wordCount = 0;
        let tSentimentWords = [];
        let tStoppedWords = [];
        theWords.forEach((w) => {
            w = w.trim();
            if (w) {
                const foundSentimentWord = this.sentimentWordList.find(swobject => {
                    return swobject.word === w
                });
                if (foundSentimentWord) {
                    tSentimentWords.push(foundSentimentWord)
                }
                if (stop) {
                    if (stopWords.includes(w)) {
                        if (!tStoppedWords.includes(w)) {
                            tStoppedWords.push(w);
                        }
                        console.log(`    stopped ${w}`)
                    } else {
                        console.log(`    OK ${w}`)
                        wordCount++;
                    }
                } else {
                    wordCount++
                }
            }
        });

        this.displayStoppedWords(tStoppedWords);

        const theTextValues = {
            textNumber: sentimento.state.sampleNumber,
            text: sentimento.state.theText,
            nWords: wordCount,
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
     * Convert the string in the textarea by
     *   * removing apostrophes
     *   * removing accents
     *   * removing punctuation
     *   * removing double spaces
     *   * transforming everything to lower case
     */
    preprocessText : function( ) {
        const punct =  /[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]/g;
        const theText = document.getElementById("theText").value;
        const noApostrophes = theText.replace(/'/g, "");
        const noAccents = noApostrophes.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const punctuationToSpace = noAccents.replace(punct," ");
        const removeDoubleSpaces = punctuationToSpace.replace(/\s\s+/g," ");
        return removeDoubleSpaces.toLowerCase();
    },

    displayStoppedWords : function(iWords) {
        const stopText = iWords.join(`, `);
        const stoppedWordsDisplay = document.getElementById("stoppedWordsDisplay");

        stoppedWordsDisplay.style.display = (stopText.length > 0) ? "flex" : "none";

        stoppedWordsDisplay.innerHTML = `stopped words: ${stopText}`;
    },
};