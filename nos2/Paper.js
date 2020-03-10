/*
==========================================================================

 * Created by tim on 10/2/18.
 
 
 ==========================================================================
Paper in nos2

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

class Paper {

    constructor(iGuts = null) {
        if (iGuts) {
            this.guts = iGuts;
        } else {
            this.guts = {
                dbid : null,
                visible : true,     //  visible to author? (yes, until explicitly hidden)
                title : "",
                authors : "",
                text : "",

                worldCode : nos2.state.worldCode,       //  not needed, but possibly interesting to überGods
                teamCode : nos2.state.teamCode,
                teamName : nos2.state.teamName,     //  redundant but useful
                created : new Date(),       //  when the user first created this Paper

                convo : [],     //  array of objects e.g.,  {from : "author", text : "WTF??"}

                figures : [],       //  array of dbids of Figures for This Paper

                status : nos2.constants.kPaperStatusDraft,
                pubYear : null,     //  publication epoch
                pubTime : null,     //  the Date() when it was published; used for chron sorting
                citation : null,      //  how we will be cited
                references : [],    //  dbids of relevant papers
            }
        }
    }

    isEditable() {
        return (
            this.guts.status === nos2.constants.kPaperStatusDraft ||
            this.guts.status === nos2.constants.kPaperStatusRevise
        );
    }

    setThisFigure(iFigureDBID) {
        this.guts.figures = [ iFigureDBID ];
        console.log("Set figure (dbid) " + iFigureDBID + " for paper " + this.guts.title);
    }

    /**
     * Not currently used because we're restricting papers to ONE figure; use setThisFigure().
     * @param iFigure
     */
    addFigure(iFigure) {

        if (this.guts.figures.includes( iFigure.dbid)) {
            console.log("Paper " + this.guts.title + " already has figure " + iFigure.guts.text.title);
        } else {
            this.guts.figures.push( iFigure.dbid );
            console.log("Added figure " + iFigure.guts.text.title + " to paper " + this.guts.title);
        }
    }

    removeAllFigures() {
        this.guts.figures = [];
    }

    /**
     * Used to find out how much knowledge this Paper carries
     * For now, looks only at the results in the first figure
     */
    resultsArray() {
        console.log("Paper.resultsArray()");
        if (this.guts.figures.length > 0) {
            const theFirstFigure = nos2.theFigures[this.guts.figures[0]];
            return theFirstFigure.guts.results;
        } else {
            return [];
        }
    }

    asHTML() {
        let figureHTML;
        let referencesHTML;
        const theResults = this.resultsArray();

        if (this.guts.figures.length > 0) {
            const theFigure = nos2.theFigures[this.guts.figures[0]];
            figureHTML = `<svg width="333" viewBox="${theFigure.viewBoxString()}">${theFigure.guts.image.contents}</svg>
                    <p>${theFigure.guts.text.caption}</p>`;

        } else {
            figureHTML = "<p>no figures</p>";
        }

        if (this.guts.references.length) {
            referencesHTML = "<h3>References</h3><ul>";
            this.guts.references.forEach( rid => {
                const paper = nos2.thePapers[rid];
                referencesHTML += `<li>${paper.guts.citation}</li>`;
            });
            referencesHTML += "</ul>";
        } else {
            referencesHTML = "<p>no references</p>";
        }

        const citationHTML = this.guts.citation ? `${this.guts.citation}` : `(${this.guts.status})`;

        const out = `
                    <div class="paper">
                    <h2>${this.guts.title} (${citationHTML})</h2>
                    <b>${this.guts.authors}</b><br>
                    <i>${this.guts.teamName}</i>
                    <p>${this.guts.text}</p>
                    ${figureHTML}
                    ${referencesHTML}
                    <button onclick="nos2.learnResults('${this.guts.figures}')">learn ${theResults.length} results</button>
                    </div>
                    `;
        
        return out;
    }

    createCitation() {
        return this.guts.authors + " " + nos2.epoch;
    }

    async publish() {
        this.guts.pubTime = new Date();
        this.guts.pubYear = nos2.epoch;
        this.guts.status = nos2.constants.kPaperStatusPublished;
        this.guts.citation = this.createCitation();

        this.addReferences(this.collectAutomaticReferences());  //  make sure all auto-adds are present

        //  set the "paper" or "citation" of all its results
        //  todo: possibly promise all or bundle the following

        let thePromises = [];

        this.guts.figures.forEach( (figDBID) => {
            const theFigure = nos2.theFigures[figDBID];
            if (!theFigure.guts.citation) {
                theFigure.guts.citation = this.guts.dbid;
                thePromises.push(fireConnect.saveFigureToDB(theFigure));
                theFigure.guts.results.forEach( (resDBID) => {
                    const theResult = nos2.theResults[resDBID];
                    if (!theResult.citation) {
                        theResult.citation = this.guts.dbid;
                        thePromises.push(fireConnect.saveResultToDB(theResult));
                    }
                })
            }
        });

        await Promise.all(thePromises);
    }

    collectAutomaticReferences() {

        let out = [];

        this.guts.figures.forEach( (figDBID) => {
            const theFigure = nos2.theFigures[figDBID];
            theFigure.guts.results.forEach( (resDBID) => {
                const theResult = nos2.theResults[resDBID];
                if (theResult.citation) {
                    out.push(theResult.citation);
                }
            })

        });

        return out;
    }

    addReferences(iRefs) {
        if (!Array.isArray(iRefs)) {iRefs = [iRefs]}

        iRefs.forEach( r => {
            if (!this.guts.references.includes(r)) {
                this.guts.references.push(r)
            }
        })
    }

    removeReferences(iRefs) {
        if (!Array.isArray(iRefs)) {iRefs = [iRefs]}

        iRefs.forEach( r => {
            const ix = this.guts.references.indexOf(r);
            if (ix >= 0) {
                this.guts.references.splice(ix, 1);
            }
        })
    }

    handleReferenceCheckboxChange(e) {
        const isChecked = e.checked;
        const theReference = e.value;
        if (isChecked) {
            this.addReferences(theReference);
        } else {
            this.removeReferences(theReference);
        }
    }

}


paperConverter = {
    toFirestore: function (iPaper) {
        return iPaper.guts;
    },
    fromFirestore: function (iSnap, options) {
        const theData = iSnap.data( );
        return new Paper(theData);
    }
};



