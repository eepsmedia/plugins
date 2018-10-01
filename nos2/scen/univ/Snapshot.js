/*
==========================================================================

 * Created by tim on 9/28/18.
 
 
 ==========================================================================
Snapshot in nos2

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


class Snapshot {

    constructor() {
        this.theInnerSVG = "";
        this.theResults = [];
        this.theCaption = "a caption";
        this.theTitle = "a title";
        this.theNotes = "some notes";
        this.source = "local";
        this.theFormat = "svg";
    }

    setText() {
        const theCaptionBox = document.getElementById("snapshotCaption");
        const theTitleBox = document.getElementById("snapshotTitle");
        const theNotesBox = document.getElementById("snapshotNotes");
        this.theCaption = theCaptionBox.value;
        this.theTitle = theTitleBox.value;
        this.theNotes = theNotesBox.value;
    }
}