/*
==========================================================================

 * Created by tim on 2019-06-25.
 
 
 ==========================================================================
texty in texty

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

let texty = {

    constants: {
        version: "001c",
        kTextyDataSetName: "text",
        kTextyDataSetTitle: "text data",
        kTextySampleCollectionName: "samples",
        kTextyLetterCollectionName: "letters"
    },

    state: {
        sampleNumber: 0,
        doDigraphs: false,
        theText: ""
    },

    initialize: function () {
        texty.connect.initialize();
    },

    analyze: function () {
        texty.state.sampleNumber++;
        this.state.doDigraphs = document.getElementById("do-digraphs-box").checked;

        texty.state.theText = texty.preprocessText();

        let tValues = [];
        texty.state.theText.forEach((e, i, a) => {
            let aValue = {};
            const letter = e;
            const digraph = (i + 1 < a.length) ? e + a[i + 1] : "";

            aValue["sample"] = texty.state.sampleNumber;
            aValue["letter"] = letter;
            if (this.state.doDigraphs) {
                aValue["digraph"] = digraph;
            }

            tValues.push(aValue);
        });

        texty.connect.sendCases(tValues);   //  no need to await
        texty.connect.makeTableAppear();
    },

    /**
     * Convert the string in the textarea into an ARRAY of suitable characters
     */
    preprocessText : function( ) {
        const theText = document.getElementById("theText").value;
        const noAccents = theText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const pre =  Array.from(noAccents.toLowerCase());
        let out = [];
        let previousLetter = "";

        pre.forEach( L => {
            const isLetter = 'abcdefghijklmnopqrstuvwxyz'.includes(L);
            const isWhite = ' \n\t—\r,;.:'.includes(L);
            if (isLetter) {
                out.push(L);
                previousLetter = L;
            } else if (isWhite && previousLetter !== "_") {   //  no double spaces
                out.push('_');
                previousLetter = "_";
            }
        });

        return out;
    }
};