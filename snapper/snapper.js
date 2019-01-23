/*
==========================================================================

 * Created by tim on 2019-01-22.
 
 
 ==========================================================================
snapper in snapper

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

let snapper = {
    
    state : {
        
    },

    constants : {
        version : "000"
    },

    initialize : async function() {
        await snapper.connect.initialize();

        const theGuts = await snapper.connect.makeDataContextMenuGuts();

        console.log("The guts: " + theGuts.guts);

        const theDataContextMenu = document.getElementById("dataContextMenu");
        theDataContextMenu.innerHTML = theGuts.guts;
        
        //  $("#dataContextMenu").empty().append(theGuts);   // put them into the DOM 
    },
    
}