/*
==========================================================================

 * Created by tim on 3/5/20.
 
 
 ==========================================================================
Journal.js in nos2

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

nos2.journal = {

    name: "",       //  title of the journal
    selectedDBIDs : [],

    initialize: function (iName) {
        this.name = iName;
        this.selectedDBIDs = [];
    },

    clearSelectedPapers : function() {
        this.selectedDBIDs = [];
    },

    selectDBIDs : function(iDBIDs) {
        if (!Array.isArray(iDBIDs)) {iDBIDs = [iDBIDs]}

        iDBIDs.forEach( id => {
            if (this.selectedDBIDs.includes(id)) {
                this.selectedDBIDs.push(id);
            }
        })
    },

    assemblePublishedPapers: function ( ) {
        let publishedPapers = [];       //  to be an array of entire Papers (not just dbids)

        //  first, get only the published ones, make an array

        Object.keys(nos2.thePapers).forEach( pk =>{
            const p = nos2.thePapers[pk];
            if (p.guts.status === nos2.constants.kPaperStatusPublished) {
                publishedPapers.push(p);
            }
        });

        //  now sort by publication date

        publishedPapers.sort( (a,b) =>  {
            return (a.guts.pubTime - b.guts.pubTime)
        });

        return publishedPapers;

    },

    constructCheckboxesForPapers :  function(thePapers) {
        if (nos2.currentPaper) {
            let boxes = [];

            //  jcbid is "journal checkbox id" where the dbid is the dbid of the Paper
            thePapers.forEach(p => {
                const dbid = p.guts.dbid;
                const jcbid = "jcb_" + dbid;
                const checkedThing = (nos2.currentPaper.guts.references.includes(dbid)) ? "checked" : "";
                boxes.push(
                    `<input type="checkbox" value="${dbid}" id="${jcbid}" ${checkedThing} 
                    onchange="nos2.currentPaper.handleReferenceCheckboxChange(this)">
                    <label for="${jcbid}">${p.guts.citation}</label>`
                );
            });
            return boxes.join("<br>");
        } else {
            return "";
        }
    },

    constructJournalHTML : async function () {
        out = `<span class="bigHeadline">${this.name}</span>`;

        const arrayOfPapers = nos2.journal.assemblePublishedPapers( );

        if (arrayOfPapers.length) {
            arrayOfPapers.forEach(p => {
                out += `<details><summary>${p.guts.citation}</summary>`;
                out += p.asHTML();
                out += "</details>";
                //  console.log("display paper for entire journal");
            });
        } else {
            out += `<p>Sadly, there are no papers yet.</p>`;
        }
        return out;
    },

};