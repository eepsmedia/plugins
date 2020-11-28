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
        };

        const tDataContextListResult = await codapInterface.sendRequest(message);

    },

    iFrameDescriptor: {
        version: snapper.constants.version,
        name: 'snapper',
        title: 'Snapper!',
        dimensions: {width: 222, height: 333}
    },

    destroyAnyExistingDataContextNamed : async  function(iName) {
        const message = {
            "action": "delete",
            "resource": "dataContext[" + iName + "]"
        };
        await codapInterface.sendRequest(message);
    },

    getListOfSliders : async function() {
        const tAllComponents = await codapInterface.sendRequest({ "action": "get", "resource": "componentList"});
        let theSliders = [];

        tAllComponents.values.forEach(async c => {
            if (c.type == "slider") {
                const tMessage = {"action" : "get", "resource" : "component[" + c.id + "]"};
                //  const sliderResult = await codapInterface.sendRequest(tMessage);
                theSliders.push({id : c.id, title : c.title});

            }
        });

        return theSliders;
    },

    /**
     * get the value of the slider
     * @param iSlider   the slider. This is an object with .id and .title.
     * @returns {Promise<*>}
     */
    getSliderValue : async function(iSlider) {
        const theResource = "global[" + iSlider.title + "]";
        const globalResult = await codapInterface.sendRequest({"action" : "get", "resource" : theResource});
        return globalResult.values.value;
    },

    makeResultsDataContext : async function() {
        await this.destroyAnyExistingDataContextNamed(snapper.state.resultsDataContextName);

        let attrGuts = [];

        //  first we get the list of sliders (globals), then we add the attributes
        /*
        const tGlobalsResult = await codapInterface.sendRequest({ "action": "get", "resource": "globalList"});
*/

        snapper.state.theSliders = await this.getListOfSliders();

        snapper.state.theSliders.forEach(s => {
            const tSliderAtt = {
                name : s.title + snapper.state.sliderSuffix,
                editable : false
            };
            attrGuts.push(tSliderAtt);
            //  register for events

            codapInterface.on(
                'notify',
                'global[' + s.title + ']',       //  was s.name or s.id
                null,
                snapper.sliderChanged
            );

        });

        snapper.state.collectedAttrs.forEach(a => {
            const oneAttr = {
                name : a.name,
                description : a.description,
                editable : false,
                unit : a.unit
            };
            attrGuts.push(oneAttr);
        });

        let resultsDataContextSetupObject = {
            name : snapper.state.resultsDataContextName,
            title : snapper.state.resultsDataContextName,
            description : 'Collected data',
            collections : [
                {
                    name : "measurements",
                    attrs : attrGuts
                }
            ]
        };

        await pluginHelper.initDataSet(resultsDataContextSetupObject);

        codapInterface.sendRequest({
            "action" : "create",
            "resource" : "component",
            "values" : {
                "type" : "caseTable",
                "name" : snapper.state.resultsDataContextName
            }
        })

        //  register to receive notifications about val;ue changes (i.e., slider moves)
/*
        codapInterface.on(
            'notify',
            'dataContextChangeNotice[' + snapper.state.dcName + ']',
            'dependentCases',
            snapper.sliderChanged
        );
*/


    },

    makeDataContextMenuGuts : async function(iName) {
        let out = "";

        let message = {
            "action": "get",
            "resource": "dataContextList"
        };

        const tDataContextListResult = await codapInterface.sendRequest(message);

        if (tDataContextListResult.values.length > 0) {
            tDataContextListResult.values.forEach( v => {
                let selectedText = v.name == iName ? "selected" : "";
                out += "<option value='" + v.name + "' " + selectedText + ">" + v.title + "</option>";
            })
        } else {
            out = "<option value='null' disabled>No data!</option>";
        }

        return out;
    },

    emitOneCase : function(iValues) {
        pluginHelper.createItems(iValues, snapper.state.resultsDataContextName);

    }

};