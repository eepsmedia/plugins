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

    displayPlaces: function (thePlaces, theText) {
        const zipListLimit = 3;
        const placeType = document.querySelector("input[name='place-type']:checked").value;

        let zipCityList = "";
        let countySummary = "";
        let tCounties = new Set();
        let nZips = thePlaces.size;

        if (thePlaces.size > 0) {
            let nCities = 0;
            thePlaces.forEach(place => {
                tCounties.add(place.county);

                if (nCities < zipListLimit) {
                    const placeString = place.primary_city +
                        (place.acceptable_cities ? ` (${place.acceptable_cities})` : "");
                    zipCityList += `&emsp;${place.zip}: ${placeString}<br>`;
                }
                nCities++;
            })
        } else {
            zipCityList = `No places match "${theText}"`;
        }
        const zipCountText = (nZips === 1) ? `1 ZIP code` : `${nZips} ZIP codes`;
        const zipTag = (nZips > zipListLimit) ? ", for example:" : ":";
        const countyCount = `${tCounties.size} counties`;
        let countyList = "";

        tCounties.forEach(c=>{
            countyList += `&emsp;${c}<br>`;
        })

        if (placeType == "county") {
            switch (tCounties.size) {
                case 0:
                    countySummary = `no counties match "${theText}"`;
                    zipCityList = "";
                    break;
                case 1:
                    countySummary = `${[...tCounties][0]}. ${zipCountText} ${zipTag}`;
                    break;
                default:
                    countySummary = `${zipCountText} in ${countyCount}:<br>${countyList}`;
                    zipCityList = "";
                    break;
            }
        } else {            //  the place is just a place: i.e., a city name
            switch (tCounties.size) {
                case 0:
                    countySummary = ""
                    break;
                case 1:
                    countySummary = `${zipCountText} in ${[...tCounties][0]}${zipTag}`;
                    break;
                default:
                    countySummary = `${zipCountText} in ${countyCount}${zipTag}`;
                    break;
            }
        }

        document.getElementById("place-result").innerHTML = `${countySummary}<br>${zipCityList}`;
    },

    /*
    attribute checkbox section
     */

    attributeCheckboxes: {
        domID: "chooseAttributeDiv",

        preprocessAttributes: function (iCollInfo) {
            let out = {};
            out[lens.constants.noGroupString] = [];

            iCollInfo.forEach(coll => {
                coll.attrs.forEach(att => {
                    const theGroup = att.group ? att.group : lens.constants.noGroupString;
                    if (!out[theGroup]) {
                        out[theGroup] = [];     //  fresh array for new group
                    }
                    out[theGroup].push(att);
                })
            })

            return out;
        },

        make: function () {
            let tGuts = "";

            if (lens.state.datasetInfo.collections) {
                const hierarchy = (lens.state.datasetInfo.collections.length !== 1);

                const mungedAttributes = this.preprocessAttributes(lens.state.datasetInfo.collections);

                if (hierarchy) {
                }

                for (const theGroup in mungedAttributes) {
                    const theArrayOfAttributes = mungedAttributes[theGroup];
                    const theAttributeBoxCode = this.makeAttrGroupCode(theArrayOfAttributes);
                    if (theGroup === lens.constants.noGroupString) {
                        tGuts += `${theAttributeBoxCode}`;
                    } else {
                        tGuts += `<details><summary>${theGroup}</summary>`;
                        tGuts += `${theAttributeBoxCode}`;
                        tGuts += `</details>`;
                    }
                }       //  end of for-in loop over groups
            } else {
                tGuts = "No attributes to work with here";
            }
            return tGuts;
        },

        makeAttrGroupCode(iGroupAfAttributes) {
            let tGuts = "";
            iGroupAfAttributes.forEach(att => {
                const attrInfoButton = this.makeAttrInfo(att);
                const isHiddenNow = att.hidden;
                const checkedText = isHiddenNow ? "" : "checked";
                tGuts += `<div class="a-checkbox">`;
                tGuts += `<span class="checkbox-and-text">`;
                tGuts += `<input id="att_${att.name}" type="checkbox" ${checkedText} 
                                onchange="lens_ui.attributeCheckboxes.handle('${att.collection}', '${att.name}')">`;
                tGuts += `<label for="att_${att.name}" class="att_label">${att.title}</label>`;
                tGuts += `</span>`;
                tGuts += attrInfoButton;
                tGuts += `</div>`;

                if (attrInfoButton) {
                    //  console.log(`å   attrInfoButton: ${attrInfoButton}`)
                }
            })
            return tGuts;
        },

        makeAttrInfo(iAttr) {
            let out = "";

            if (iAttr.description || iAttr.unit) {
                let theHint = ``;

                if (iAttr.description) {
                    theHint += `${iAttr.description}`;
                }
                if (iAttr.unit) {
                    theHint += ` (${iAttr.unit})`;
                }
                const theImage = `&emsp;<img class="vertically-centered-image" 
                    src="art/info.png" width="14" title="${theHint}" 
                    onclick="lens_ui.attributeCheckboxes.makeSweetAlert('${iAttr.title}', '${theHint}')" 
                    alt = "circular information button image"  
                    />`;
                out += theImage;
            }
            return out;
        },

        makeSweetAlert: function (iTitle, iText, iIcon = 'info') {
            Swal.fire({
                icon: iIcon,
                title: iTitle,
                text: iText,
            })
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

    /*
        dataset menu section
     */

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