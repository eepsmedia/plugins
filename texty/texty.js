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
        version: "001a",
        kTextyDataSetName: "text",
        kTextyDataSetTitle: "text data",
        kTextySampleCollectionName: "samples",
        kTextyLetterCollectionName: "letters"
    },

    state: {
        sampleNumber: 0,
        theText: ""
    },

    initialize: function () {
        texty.connect.initialize();
    },

    analyze: function () {
        texty.state.sampleNumber++;

        texty.state.theText = texty.preprocessText(texty.state.theText);

        let tValues = [];
        texty.state.theText.forEach((e, i, a) => {
            let aValue = {};
            const letter = e;
            const digraph = (i + 1 < a.length) ? e + a[i + 1] : "";

            aValue["sample"] = texty.state.sampleNumber;
            aValue["letter"] = letter;
            aValue["digraph"] = digraph;

            tValues.push(aValue);
        });

        texty.connect.sendCases(tValues);
        texty.connect.makeTableAppear();
    },

    /**
     * Convert the input string into an ARRAY of suitable characters
     * @param iTextArray
     */
    preprocessText : function( iTextArray ) {
        const pre =  Array.from(document.getElementById("theText").value.toLowerCase());
        let out = [];

        pre.forEach( L => {
            if ('abcdefghijklmnopqrstuvwxyz'.includes(L)) {
                out.push(L);
            } else if (L === " " ) {
                out.push('_');
            }
        });

        return out;
    }
};