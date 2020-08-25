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

    findZipsFromString(iString,
                            pCounty = true,
                            pPrincipal = false,
                            pAcceptable = false,
                            pUnacceptable = false) {

        let out= new Set();

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
                if (pUnacceptable && (z.unacceptable_cities.toLowerCase()).includes(iString.toLowerCase())) {
                    if (lens.state.data[z.zip]) {
                        out.add(z);
                    }
                }
            })
        }

        return out;
    }
}