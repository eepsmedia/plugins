/*
==========================================================================

 * Created by tim on 9/3/19.
 
 
 ==========================================================================
phpHelper in poseidon

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

import poseidon from "./constants.js";

let sendRequest = async function (iRequest) {

    console.log("in sendRequest with " + JSON.stringify(iRequest));

    let theBody = new FormData();
    for (let key in iRequest) {
        if (iRequest.hasOwnProperty(key)) {
            theBody.append(key, JSON.stringify(iRequest[key]))
        }
    }
    const theRequest = new Request(
        poseidon.constants.kBaseURL[iRequest.whence],
        {method: 'POST', body: theBody, header: new Headers()}
    );

    const theResponse = await fetch(theRequest);
    if (theResponse.ok) {
        try {
            const out = await theResponse.json();
            return out;
        } catch (msg) {
            console.log('fetch response decoding error : ' + msg);
        }
    } else {
        alert("problem with database access -- icky respose");
    }
};

export default sendRequest;