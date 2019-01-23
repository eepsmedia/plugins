/*
==========================================================================

 * Created by tim on 2019-01-22.
 
 
 ==========================================================================
snapperCODAPConnector in snapper

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


snapper.connect = {

    initialize : async function() {
        await codapInterface.init(this.iFrameDescriptor, null);
        this.getEnvironment();
    },
    
    getEnvironment : async function() {

        let message = {
            "action": "get",
            "resource": "dataContextList"
        }

        const tDataContextListResult = await codapInterface.sendRequest(message);

    },

    iFrameDescriptor: {
        version: snapper.constants.version,
        name: 'snapper',
        title: 'Snapper!',
        dimensions: {width: 222, height: 222}
    },

    makeDataContextMenuGuts : async function() {
        let out = "";
        let chosenDataContextName = null;

        let message = {
            "action": "get",
            "resource": "dataContextList"
        };

        const tDataContextListResult = await codapInterface.sendRequest(message);

        if (tDataContextListResult.values.length > 0) {
            tDataContextListResult.values.forEach( v => {
                out += "<option value='" + v.name + "'>" + v.title + "</option>";
            })
        } else {
            out = "<option value='null' disabled>No data!</option>";
        }

        return {guts : out}
    }

}