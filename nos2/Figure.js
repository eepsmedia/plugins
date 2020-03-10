/*
==========================================================================

 * Created by tim on 9/28/18.
 
 
 ==========================================================================
DataPack in nos2

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


class Figure {

    constructor(iGuts = null) {
        if (iGuts) {
            this.guts = iGuts;
        } else {
            this.guts = {
                image: {
                    contents: "",
                    width: 500,
                    height: 300,
                    format: "svg",
                },
                text: {
                    title: "",
                    caption: "",
                    notes: "",
                },
                creator: nos2.state.teamCode,
                epoch: nos2.epoch,
                created: new Date(),
                results: [],        //      results used to make the figure
                citation: null,     //      dbid of published paper
                dbid: null,
            }
        }
    }

    setText() {
        const theCaptionBox = document.getElementById("snapshotCaption");
        const theTitleBox = document.getElementById("snapshotTitle");
        const theNotesBox = document.getElementById("snapshotNotes");
        this.guts.text.caption = theCaptionBox.value;
        this.guts.text.title = theTitleBox.value;
        this.guts.text.notes = theNotesBox.value;
    }

    viewBoxString() {
        return `0 0 ${this.guts.image.width} ${this.guts.image.height}`;
    }

    displayImageIn(iDOMName) {
        const theThumbnail = document.getElementById(iDOMName);
        theThumbnail.innerHTML = this.guts.image.contents;
        theThumbnail.setAttribute("viewBox", this.viewBoxString());

    }
}

figureConverter = {
    toFirestore: function (iFigure) {
        return iFigure.guts;
    },
    fromFirestore: function (iSnap, options) {
        const theData = iSnap.data( );
        return new Figure(theData);
    }
};