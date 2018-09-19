
/*
==========================================================================

 * Created by tim on 5/22/18.
 
 
 ==========================================================================
promiseHelper in fish

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

function pif(promise, test, consequent, alternate) {
    return promise.then(function(value) {
        return test(value)? consequent(value) : alternate(value)
    })
}

function identity(a){ return a }

function pwhen(promise, test, f) {
    return pif(promise, test, f, identity)
}

function punless(promise, test, f) {
    return pif(promise, test, identity, f)
}
