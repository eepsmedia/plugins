/*
==========================================================================

 * Created by tim on 8/20/20.
 
 
 ==========================================================================
lens_ui in lens

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

lens_ui = {

    initialize: async function () {
        //  set up the dataset menu
        await this.datasetMenu.install();      //  async but we can go on...
        this.update();
    },

    update: async function () {

    },


    displayPlaces : function( ) {
        const theText = document.getElementById("place-input").value;
        const thePlaces = zip.findZipsFromString(theText);

        let zipCityList = "";
        let countySummary = "";
        let tCounties = new Set();
        let nZips = thePlaces.length;

        if (thePlaces.length > 0) {

            thePlaces.forEach(place => {
                tCounties.add(place.county);

                const placeString = place.primary_city +
                    (place.acceptable_cities ? ` (${place.acceptable_cities})` : "");
                zipCityList += `${place.zip}: ${placeString}<br>`;
            })
        } else {
            zipCityList = `No places match "${theText}"`;
        }

        switch(tCounties.size) {
            case 0:
                countySummary = "no counties"
                break;
            case 1:
                countySummary = `${[...tCounties][0]} with ${nZips} ZIP codes`;
                break;
            default:
                countySummary = `${tCounties.size} counties with ${nZips} ZIP codes`;
                break;
        }
        
        document.getElementById("place-result").innerHTML = `${countySummary}<br>${zipCityList}`;
    },

    /*
    dataset menu section
     */

    attributeCheckboxes: {
        domID: "chooseAttributeDiv",

        make: function () {
            let tGuts = "";
            const sit = model.situation;

            if (lens.state.datasetInfo.collections) {
                const hierarchy = (lens.state.datasetInfo.collections.length !== 1);

                lens.state.datasetInfo.collections.forEach(coll => {
                    const collectionName = coll.name;       //      collection.name;
                    tGuts += `<h3>Attributes in "${coll.title}"</h3>`;

                    if (hierarchy) {
                    }

                    coll.attrs.forEach( theAttr => {
                        const attrInfoButton = this.makeAttrInfo(theAttr);
                        const isHiddenNow = theAttr.hidden;
                        const checkedText = isHiddenNow ? "" : "checked";
                        tGuts += `<div class="a-checkbox">`;
                        tGuts += `<span class="checkbox-and-text">`;
                        tGuts += `<input id="att_${theAttr.name}" type="checkbox" ${checkedText} 
                onchange="lens_ui.attributeCheckboxes.handle('${collectionName}', '${theAttr.name}')">`;
                        tGuts += `<label for="att_${theAttr.name}" class="att_label">${theAttr.title}</label>`;
                        tGuts += `</span>`;
                        tGuts += attrInfoButton;
                        tGuts += `</div>`;

                        if (attrInfoButton) {console.log(`å   attrInfoButton: ${attrInfoButton}`)};

                    });
                })
            } else {
                tGuts = "No attributes to work with here";
            }
            return tGuts;
        },

        makeAttrInfo(iAttr) {
            let out = "";

            if (iAttr.description || iAttr.unit) {
                let theHint = "";
                if (iAttr.description) {
                    theHint += iAttr.description + " ";
                }
                if (iAttr.unit) {
                    theHint += `(${iAttr.unit})`;
                }
                const theImage = `&emsp;<img class="vertically-centered-image" src="../common/art/info.png" width="14" title="${theHint}"/>`;
                out += theImage;
            }
            return out;
        },

        install: function () {
            document.getElementById(this.domID).innerHTML = this.make();
        },

        handle: function (iColl, iAtt) {
            console.log(`=   handling a checkbox for ${iAtt} in ${iColl}`);

            const domName = `att_${iAtt}`;
            const isChecked = document.getElementById(domName).checked;
            connect.showHideAttribute(lens.state.datasetInfo.name, iColl, iAtt, !isChecked);
        },
    },

    datasetMenu: {
        install: async function () {
            const tMenuGuts = await this.make();        //  this is datasetMenu?
            document.getElementById("chooseDataset").innerHTML = tMenuGuts;
            tDatasetMenu = document.getElementById("datasetMenu");
            if (tDatasetMenu) {     //  set its value if we already have a dataset chosen, e.g., back from save
                tDatasetMenu.value = lens.state.datasetinfo.name;
            }
        },

        handle: function () {
            const tElement = document.getElementById("datasetMenu");
            if (tElement) {
                const theName = tElement.value;
                if (theName !== lens.state.datasetInfo.name) {
                    lens.setTargetDatasetByName(theName);
                }
            } else {
                console.log(`NB: no dataset menu`);
            }
        },

        make: async function () {
            const theList = await connect.getListOfDatasets();
            let tGuts;

            if (theList.length === 0) {
                tGuts = "<h3>No datasets</h3>";

            } else if (theList.length === 1) {
                theDataSet = theList[0];    //  the only one
                await lens.setTargetDatasetByName(theDataSet.name);
                tGuts = `<h3>Dataset: <strong>${lens.state.datasetInfo.title}</strong></h3>`;

            } else {
                tGuts = `<select id="datasetMenu" onchange="lens_ui.datasetMenu.handle()">`;
                tGuts += `<option value="">choose a dataset</option>`;
                theList.forEach(ds => {
                    console.log(`making menu:  ds ${ds.id} named [${ds.name}] title [${ds.title}]`);
                    tGuts += `<option value="${ds.name}">${ds.title}</option>`;
                })
                tGuts += `</select>`;
            }
            console.log(tGuts);
            return tGuts;
        },
    },
}