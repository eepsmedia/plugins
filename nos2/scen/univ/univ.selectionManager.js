/*
==========================================================================

 * Created by tim on 9/25/18.
 
 
 ==========================================================================
univ.selectionManager in nos2

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


univ.selectionManager = {

    codapSelectsCases : function( iCommand ) {
        console.log("Got selection in univ! ... " );

        let theDBIDs = [];

        if (iCommand.values.operation === "selectCases" && iCommand.values.result.success) {
            const theCases = iCommand.values.result.cases;
            const selectedDBIDs = [];

            //  make an array of the selected dbids. Relies on the dbids in CODAP to be correct
            theCases.forEach((c) => {
                const thedbid = c.values.dbid;
                if (thedbid) {
                    selectedDBIDs.push(thedbid);
                }
            });
            console.log("   selected dbids:  " + JSON.stringify(selectedDBIDs) );

            //  update the Results in dataView (not ALL Results) to relflect the selection
            univ.dataView.results.forEach( res => {
                res.selected = (selectedDBIDs.includes(res.dbid));
            })
        }

        univ.dataView.redraw();   //  because we might change what we display
    }
};