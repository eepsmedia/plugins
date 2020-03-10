/*
==========================================================================

 * Created by tim on 9/25/18.
 
 
 ==========================================================================
dataView in nos2

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

/**
 * Displays, on a grid, where the observations are, and has "plaques" showing the results
 *
 * @type {{gridRight: number, drawArray: univ.dataView.drawArray, thePaper: null, makeUniformArray: (function(*): []), box: number, selectionOnly: boolean, colors: {R: string, B: string, G: string, Y: string, K: string, O: string}, redraw: univ.dataView.redraw, clearResults: univ.dataView.clearResults, displaySomeResults: univ.dataView.displaySomeResults, plaqueGridGap: number, theArray: [], initialize: univ.dataView.initialize, gridLeft: number, resultIDArray: (function(): []), results: []}}
 */
univ.dataView = {

    thePaper : null,    //  the SVG paper on which we draw
    results : [],       //  array of Results we are displaying. Contains whole Results, not just DBIDs.
    theArray : [],      //  12x12 array of colors for display (as single characters)
    gridLeft : 0,       //  left edge of the 12 x 12 grid
    gridRight : 100,    //  the right edge of the 12 x 12 grid
    box : 10,           //  size of one cell.
    plaqueGridGap : 3,

    selectionOnly : false,

    colors: {
        "R": "tomato",
        "B": "dodgerblue",
        "O": "orange",
        "G": "green",
        "K": "lightgray",
        "Y": "yellow"
    },

    initialize : function(iDOMobject) {
        this.thePaper = new Snap(iDOMobject);

        this.theArray = this.makeUniformArray("K");
        this.drawArray(this.theArray);

        const outerSVGText = this.thePaper.toString();
        const innerSVGText = this.thePaper.innerSVG();
    },

    clearResults : function() {
        this.results = [];
    },

    resultIDArray : function() {
        let out = [];

        this.results.forEach( (r) => {out.push(r.dbid)});   //  Results dbid is at top level
        return out;
    },

    redraw : async function() {
        let theDisplayedResults = [];   //  array of Result objects

        let tDataDisplayChoice = $('input[name=dataDisplayChoice]:checked').val();

        const allResults = await nos2.getKnownResults();  //  array

        if (tDataDisplayChoice === "selection") {
            allResults.forEach( r => {
                if (r.selected) {
                    theDisplayedResults.push(r)
                }
            });
        } else {
            theDisplayedResults = allResults;
        }

        if (theDisplayedResults) {
            univ.dataView.results = theDisplayedResults;
            univ.dataView.displaySomeResults(theDisplayedResults);

            //  see what might have to be added to CODAP (e.g., we learned something by reading)
            const theNewResults = fireStoreToCODAPMaps.findUnmappedResults(theDisplayedResults);
            await univ.CODAPconnect.saveResultsToCODAP(theNewResults);     //  add our known-from-before results to CODAP

        }
    },
/*
    addResult : function(iResult) {
        this.results.push(iResult);
    },
*/

    displaySomeResults : function( iResults ) {

        iResults.sort( (a,b) => { return a.data.row - b.data.row}); //  sort results by row
        this.results = iResults;
        this.thePaper.clear();
        this.drawArray(this.makeUniformArray("K"));

        let plaqueLevels = { left: 1, right : 1};
        this.results.forEach( r => {
            const pq = r.plaque();

            let plaqueX = null;
            let plaqueY = null;
            let lineStartX = 0;
            let lineStartY = 0;

            if (r.data.col < 6 ) {
                plaqueX  = univ.dataView.gridLeft - univ.dataView.plaqueGridGap - pq.attr("width");
                plaqueY = plaqueLevels.left;
                plaqueLevels.left += this.box;
                lineStartX = univ.dataView.gridLeft - univ.dataView.plaqueGridGap;
                lineStartY = plaqueY + pq.attr("height")/2;
            } else {
                plaqueX = univ.dataView.gridRight + univ.dataView.plaqueGridGap;
                plaqueY = plaqueLevels.right;
                plaqueLevels.right += this.box;
                lineStartX = univ.dataView.gridRight + univ.dataView.plaqueGridGap;
                lineStartY = plaqueY + pq.attr("height")/2;
            }

            //  draw the plaque
            this.thePaper.append(pq.attr({ x: plaqueX, y : plaqueY }));

            //  draw the shaded box in the grid
            const rectX = this.gridLeft + (r.data.col * this.box) + 1;
            const rectY = (r.data.row * this.box) + 1;
            const rectW = (Number(r.data.dim) * this.box) - 2;
            const theColor = r.selected ? univ.colors.selected : univ.colors.unselected;
            const theObservation = this.thePaper.rect(rectX, rectY, rectW, rectW).attr({fill : theColor, "fill-opacity" : 0.4});
            theObservation.click( e => r.toggleSelection() );   //  note the function call!

            const lineEndX = rectX + rectW/2;
            const lineEndY = rectY + rectW/2;

            //  finally, on top, draw the line connecting the plaque to the middle of the shaded box
            this.thePaper.line( lineStartX, lineStartY, lineEndX, lineEndY).attr({ stroke : "black"});
        })

    },

    makeUniformArray: function (iFill) {
        let out = [];

        for (let r = 0; r < univ.model.size; r++) {
            out[r] = [];
            for (let c = 0; c < univ.model.size; c++) {
                out[r][c] = iFill;
            }
        }

        return out;
    },

    drawArray : function(iArray) {
        const w = Number(this.thePaper.attr("width"));
        const h = Number(this.thePaper.attr("height"));
        const wh = w < h ? w : h;   //  smaller of the two, so everything fits
        this.box = wh/univ.model.size;

        //  assume w > h for this view.

        this.gridLeft = (w - h) / 2;
        this.gridRight = this.gridLeft + h;

        for (let row=0; row < univ.model.size; row++) {
            for (let col=0; col < univ.model.size; col++) {
                const tx = col * this.box + 1;
                const ty = row * this.box + 1;
                const theLetter = iArray[col][row];
                const tColor =  theLetter ? this.colors[theLetter] : "black";

                let tr = this.thePaper.rect(this.gridLeft + tx, ty, this.box - 2, this.box - 2).attr({"fill" : tColor});
                tr.mouseup( e => {
                    console.log("Mouse up in " + JSON.stringify([col, row]));
                    nos2.ui.update();

                }).mouseover(e => {
                    this.possiblePoint = [col, row];
/*
                    const tA = this.prepareArray();
                    this.drawArray(tA);
*/
                });
            }
        }
    },

};