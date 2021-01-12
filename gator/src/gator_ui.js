/*
==========================================================================

 * Created by tim on 10/1/20.
 
 
 ==========================================================================
gator_ui in gator

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


const gator_ui = {

    currentClumpName : "",

    initialize: async function () {
        //  set up the dataset menu
        await this.datasetMenu.install();      //  async but we can go on...
        this.update();
    },

    update: async function () {
        this.attributeCheckboxes.install();

    },

    changeAttributeClumpNameInput : function(e) {
        const theNameBox = document.getElementById("clump-name-text-input");
        this.currentClumpName = theNameBox.value;

        this.attributeCheckboxes.install();
    },

    /*
        attribute checkbox section
    */

    attributeCheckboxes: {
        divID: "chooseAttributeDiv",

        preprocessAttributes: function (iCollInfo) {
            let out = {};
            out[gator.constants.noClumpString] = [];

            iCollInfo.forEach(coll => {
                coll.attrs.forEach(att => {
                    const theClump = att.clump ? att.clump : gator.constants.noClumpString;
                    if (!out[theClump]) {
                        out[theClump] = [];     //  fresh array for new clump
                    }
                    out[theClump].push(att);
                })
            })

            return out;
        },

        make: function () {
            let tGuts = "";

            if (gator.datasetInfo.collections) {
                const hierarchy = (gator.datasetInfo.collections.length !== 1);

                const mungedAttributes = this.preprocessAttributes(gator.datasetInfo.collections);

                if (hierarchy) {
                }

                for (const theClumpName in mungedAttributes) {
                    const theArrayOfAttributes = mungedAttributes[theClumpName];
                    const theAttributeBoxCode = this.makeAttrClumpCode(theArrayOfAttributes, theClumpName);
                    if (theClumpName === gator.constants.noClumpString) {
                        tGuts += `${theAttributeBoxCode}`;
                    } else {
                        tGuts += `<details><summary>${theClumpName}</summary>`;
                        tGuts += `${theAttributeBoxCode}`;
                        tGuts += `</details>`;
                    }
                }       //  end of for-in loop over clumps
            } else {
                tGuts = "No attributes to work with here";
            }
            return tGuts;
        },

        /**
         * Create the checkboxes for an entire clump of attributes.
         * Called by `make()`
         * @param iClumpOfAttributes    array of attribute infos
         * @param iClumpName    the name of this clump, a string
         * @returns {string}
         */
        makeAttrClumpCode(iClumpOfAttributes, iClumpName) {
            let tGuts = "";
            const isCurrentClump = iClumpName === gator_ui.currentClumpName;

            iClumpOfAttributes.forEach(att => {
                const attrInfoButton = this.makeAttrInfo(att);
                const visibilityButton = this.makeVisibilityButton(att);
                const addSubtractClumpButton = this.makeAddSubtractClumpButton(att);
                const isHiddenNow = att.hidden;
                const checkedText = isHiddenNow ? "" : "checked";
                tGuts += `<div class="a-checkbox">`;
                tGuts += `<span class="checkbox-and-text">`;
                tGuts += `<input id="att_${att.name}" type="checkbox" ${checkedText} 
                                onchange="gator_ui.attributeCheckboxes.handle('${att.name}')">`;
                tGuts += `<label for="att_${att.name}" class="att_label">${att.title}</label>`;
                tGuts += `</span>`;
                tGuts += attrInfoButton;
                tGuts += visibilityButton;
                tGuts += addSubtractClumpButton;
                tGuts += `</div>`;

            })
            return tGuts;
        },

        makeVisibilityButton(iAttr) {

            const isHidden = iAttr.hidden;
            const visibilityIconPath = isHidden ?
                "../../common/art/visibility-no.png" :
                "../../common/art/visibility.png";

            const theHint = isHidden ? `click to make ${iAttr.title} visible in the table` :
                `click to hide ${iAttr.title} in the table`;

            const theImage = `&emsp;<img class="vertically-centered-image image-button" 
                    src=${visibilityIconPath} width="14" title="${theHint}" 
                    onclick="gator_ui.attributeCheckboxes.makeSweetAlert('${iAttr.title}', '${theHint}')" 
                    alt = "visibility image"  
                    />`;

            return theImage;
        },

        makeAddSubtractClumpButton(iAttr) {

            const destClump =  (iAttr.clump && iAttr.clump !== gator.constants.noClumpString) ?
                gator.constants.noClumpString : gator_ui.currentClumpName ;

            const clumpIconPath = (destClump === gator.constants.noClumpString) ?
                "../../common/art/clear.png" :
                "../../common/art/add.png";

            const theHint = (destClump === gator.constants.noClumpString) ?
                `click to remove ${iAttr.title} from clump ${iAttr.clump}` :
                `click to add ${iAttr.title} to clump ${gator_ui.currentClumpName}`;

            const theImage = `&emsp;<img class="vertically-centered-image image-button" 
                    src=${clumpIconPath} width="14" title="${theHint}" 
                    onclick="gator.addAttributeToClump('${iAttr.name}', '${destClump}')" 
                    alt = "clump toggle image"  
                    />`;

            return theImage;

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
                const theImage = `&emsp;<img class="vertically-centered-image image-button" 
                    src="art/info.png" width="14" title="${theHint}" 
                    onclick="gator_ui.attributeCheckboxes.makeSweetAlert('${iAttr.title}', '${theHint}')" 
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
            document.getElementById(this.divID).innerHTML = this.make();
        },

        handle: function (iAtt) {
            console.log(`=   handling a checkbox for [${iAtt}]`);

            const domName = `att_${iAtt}`;
            const isChecked = document.getElementById(domName).checked;
            connect.showHideAttribute(gator.state.datasetName, iAtt, !isChecked);
        },
    },


    /*
        dataset menu section
    */

    datasetMenu: {
        divID: "chooseDatasetDIV",
        menuID: "datasetMenu",

        install: async function () {
            document.getElementById(this.divID).innerHTML = await this.make();
            const tDatasetMenu = document.getElementById(this.menuID);
            if (tDatasetMenu) {     //  set its value if we already have a dataset chosen, e.g., back from save
                tDatasetMenu.value = gator.state.datasetName;
            }
        },

        handle: function () {
            const tElement = document.getElementById(this.menuID);
            if (tElement) {
                const theName = tElement.value;
                if (theName !== gator.datasetInfo.title) {
                    console.log(`∂  switching from [${gator.datasetInfo.title}] to [${theName}]`);
                    gator.setTargetDatasetByName(theName);
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
                const theDataSet = theList[0];    //  the only one
                await gator.setTargetDatasetByName(theDataSet.name);
                tGuts = `<h3>Dataset: <strong>${gator.datasetInfo.title}</strong></h3>`;

            } else {
                tGuts = `<select id="${this.menuID}" onchange="gator_ui.datasetMenu.handle()">`;
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