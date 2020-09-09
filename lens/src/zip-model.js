/*
==========================================================================

 * Created by tim on 8/23/20.
 
 
 ==========================================================================
zip-model in lens

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

//  the array of objects is global, called "`zips`

zip = {

    /**
     * Return a js "Set" of records that contain the input string.
     *
     * @param iString       the input string
     * @param pCounty       look in the county field?
     * @param pPrincipal    look in the principal city field?
     * @param pAcceptable   look in th e"acceptable city" field?
     * @param pZIP          look in the ZIP field itself?
     * @param pUnacceptable look in the "unacceptable city" field?
     * @returns {Set<any>}  the set of records. NOTE: it's a Set!
     */
    findZIPsFromString(iString,
                       pCounty = true,
                       pPrincipal = false,
                       pAcceptable = false,
                       pZIP = false,
                       pUnacceptable = false) {

        let out = new Set();

        if (iString) {

            zips.forEach(z => {

                if (pCounty && (z.county.toLowerCase()).includes(iString.toLowerCase())) {
                    if (lens.state.data[z.zip]) {
                        out.add(z);
                    }
                }
                if (pPrincipal && (z.primary_city.toLowerCase()).includes(iString.toLowerCase())) {
                    if (lens.state.data[z.zip]) {
                        out.add(z);
                    }
                }
                if (pAcceptable && (z.acceptable_cities.toLowerCase()).includes(iString.toLowerCase())) {
                    if (lens.state.data[z.zip]) {
                        out.add(z);
                    }
                }
                if (pZIP && (z.zip.toString()).includes(iString.toLowerCase())) {
                    if (lens.state.data[z.zip]) {
                        out.add(z);
                    }
                }
                if (pUnacceptable && (z.unacceptable_cities.toLowerCase()).includes(iString.toLowerCase())) {
                    if (lens.state.data[z.zip]) {
                        out.add(z);
                    }
                }
            })
        }

        return out;
    },

    findRecordsFromArrayOfZIPs(iZIPs) {
        let out = new Set();

        zips.forEach( z => {
            if (iZIPs.includes(z.zip)) {
                out.add(z)
            }
        })

        return out;
    },
}