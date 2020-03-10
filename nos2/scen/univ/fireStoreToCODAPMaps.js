/*
==========================================================================

 * Created by tim on 3/9/20.
 
 
 ==========================================================================
CODAPidMaps in nos2

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


fireStoreToCODAPMaps = {
    caseIDMap : {},     //  keys are fireStore dbids, values are CODAP caseIDs
    itemIDMap : {},     //  keys are fireStore dbids, values are CODAP itemIDs

    initialize : function() {
        this.caseIDMap = {};
        this.itemIDMap = {};

    },

    /**
     * Adds the relevant data to the two maps in this object
     * @param iResults      an ARRAY of the Results, capital R.
     * @param iResponse     an OBJECT containg the two ARRAYs of (case, item) IDs.
     */
    addResultsAndResponses : function(iResults, iResponse) {
        const caseIDs = iResponse.caseIDs;
        const itemIDs  = iResponse.itemIDs;

        const nResults = iResults.length;
        const nResponses = caseIDs.length;

        if (nResults !== nResponses) {
            alert("fireStoreToCODAPMaps: the array lengths don't match.");
            return;
        }

        for (let i = 0; i < nResults; i++) {
            const theDBID = iResults[i].dbid;

            this.caseIDMap[theDBID] = caseIDs[i];
            this.itemIDMap[theDBID] = itemIDs[i];
        }
    },

    /**
     * Given an object filled with Results, which of them are NOT in our maps?
     *
     * @param iResults  an OBJECT (usually nos2.theResults) keyed by fireStore dbids, containing Results
     * @returns {[]}    an ARRAY of the Results that were not in the maps.
     */
    findUnmappedResults : function(iResults) {

        let outResults = [];

        Object.keys(iResults).forEach( rk => {
            const thisResult = iResults[rk];
            if (!this.caseIDMap.hasOwnProperty(thisResult.dbid)) {
                outResults.push(thisResult)
            }
        });

        return outResults;
    },
};