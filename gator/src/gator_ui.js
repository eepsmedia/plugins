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

    /**
     * An object keyed by clump names that records whether the details for that clump are open.
     */
    clumpRecord : {},

    initialize: async function () {
        //  set up the dataset menu
        await this.datasetMenu.install();      //  async but we can go on...
        //  this.update();
    },

    update: async function () {
        this.recordCurrentOpenDetailStates();
        gator.datasetInfo = await connect.refreshDatasetInfoFor(gator.state.datasetName);
        this.processDatasetInfoForAttributeClumps(gator.datasetInfo); //  get clumps and add the collection
        this.attributeControls.install();
    },

    changeAttributeClumpNameInput : function(e) {
        const theNameBox = document.getElementById("clump-name-text-input");
        this.currentClumpName = theNameBox.value;

        this.attributeControls.install();
    },

    recordCurrentOpenDetailStates   : function() {
        for (const clump in this.clumpRecord) {
            if (clump !== gator.constants.noClumpString) {
                const theID = "details-" + clump;
                const theElement = document.getElementById(theID);
                if (theElement) {   //  there might be an empty clump, so no element to be open or closed
                    this.clumpRecord[clump].open = theElement.hasAttribute("open");
                }
            }
        }
    },

    /**
     * Parse the attribute "clumps" indicated by bracketed clump names in the attribute descriptions.
     *
     * For example, `{work}Percent of people working in agriculture`
     * puts the attribute in a clump called "work" and then strips that tag from the description
     *
     * @param theInfo   the information on all collections and attributes
     */
    processDatasetInfoForAttributeClumps: function (theInfo) {
        theInfo.collections.forEach(coll => {
            coll.attrs.forEach(att => {
                let theDescription = att.description;
                let theClump = gator.constants.noClumpString;
                const leftB = theDescription.indexOf("{");
                const rightB = theDescription.indexOf("}");
                if (rightB > leftB) {
                    theClump = theDescription.substring(leftB + 1, rightB);
                    att["description"] = theDescription.substring(rightB + 1);  //  strip the bracketed clump name from the description
                }
                att["clump"] = theClump;
                att["collection"] = coll.name;  //  need this as part of the resource so we can change hidden

                //  add an element to the object for this clump if it's not there already
                if (!this.clumpRecord[theClump]) {
                    this.clumpRecord[theClump] = {open : false};
                }
            })
        })
    },

    /*
        attribute checkbox section
    */

    attributeControls: {
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
                    const oneAttributeClumpControlSet = this.makeAttrClumpCode(theArrayOfAttributes, theClumpName);
                    const openClause = gator_ui.clumpRecord[theClumpName].open ? "open" : "";
                    const theDOMID = "details-" + theClumpName;

                    if (theClumpName === gator.constants.noClumpString) {
                        tGuts += `${oneAttributeClumpControlSet}`;
                    } else {
                        const clumpVisibilityButtons = this.makeClumpVisibilityButtons(theClumpName);
                        tGuts += `<details id="${theDOMID}" ${openClause}>
                            <summary>
                                ${theClumpName}&emsp;${clumpVisibilityButtons}
                            </summary>`;
                        tGuts += `${oneAttributeClumpControlSet}`;
                        tGuts += `</details>`;
                    }
                }       //  end of for-in loop over clumps
            } else {
                tGuts = "No attributes to work with here";
            }
            return tGuts;
        },

        /**
         * Create the attribute controls for an entire clump of attributes.
         * Called by `make()`
         * @param iClumpOfAttributes    array of attribute infos
         * @param iClumpName    the name of this clump, a string
         * @returns {string}
         */
        makeAttrClumpCode(iClumpOfAttributes, iClumpName) {
            let tGuts = "<div class='attribute-clump'>";
            const isCurrentClump = iClumpName === gator_ui.currentClumpName;

            iClumpOfAttributes.forEach(att => {
                const attrInfoButton = this.makeAttrInfo(att);
                const visibilityButton = this.makeVisibilityButton(att);
                const addSubtractClumpButton = this.makeAddSubtractClumpButton(att);
                const isHiddenNow = att.hidden;
                const checkedText = isHiddenNow ? "" : "checked";

                tGuts += `<div class="attribute-control-cluster">`;
                tGuts += "&emsp;" + visibilityButton;
                tGuts += "&ensp;" + addSubtractClumpButton;
/*
                tGuts += `<input id="att_${att.name}" type="checkbox" ${checkedText}
                                onchange="gator_ui.attributeControls.handle('${att.name}')">`;
                tGuts += `<label for="att_${att.name}" class="att_label">${att.title}</label>`;
*/
                tGuts += `&ensp; ${att.title}`;
                tGuts += attrInfoButton;
                tGuts += `</div>`;

            })
            tGuts += "</div>"
            return tGuts;
        },

        makeVisibilityButton(iAttr) {

            const isHidden = iAttr.hidden;
            const visibilityIconPath = isHidden ?
                "../../common/art/visibility-no.png" :
                "../../common/art/visibility.png";

            const theHint = isHidden ? `click to make ${iAttr.title} visible in the table` :
                `click to hide ${iAttr.title} in the table`;

            const theImage = `<img class="small-button-image" 
                    src=${visibilityIconPath} title="${theHint}" 
                    onclick="gator_ui.attributeControls.handleVisibilityButton('${iAttr.name}', ${isHidden})" 
                    alt = "visibility image"  
                    />`;

            return theImage;
        },

        async handleVisibilityButton(iAttName, iHidden) {
            await connect.showHideAttribute(gator.state.datasetName, iAttName, !iHidden);
            gator_ui.update();
        },

        makeClumpVisibilityButtons : function (iClumpName) {
            const theHideHint = `Hide all attributes in [${iClumpName}]`;
            const theShowHint = `Show all attributes in [${iClumpName}]`;

            const hidingImage = `<img class="small-button-image" 
                    src="../../common/art/visibility-no.png" title="${theHideHint}" 
                    onclick="gator_ui.attributeControls.handleClumpVisibilityButton('${iClumpName}', true)"
                    alt = "clump invisibility image"  
                    />`;
            const showingImage = `<img class="small-button-image" 
                    src="../../common/art/visibility.png" title="${theShowHint}" 
                    onclick="gator_ui.attributeControls.handleClumpVisibilityButton('${iClumpName}', false)" 
                    alt = "clump visibility image"  
                    />`;

            return hidingImage + "&ensp;" + showingImage;
        },

        handleClumpVisibilityButton : async function(iClumpName, toHide) {
            event.preventDefault();
            //  event.stopPropagation();
            console.log(`${toHide ? "Hiding" : "Showing"} clump [${iClumpName}]`);

            let thePromises = [];

            gator.datasetInfo.collections.forEach( coll => {
                coll.attrs.forEach( att => {
                    if (att.clump === iClumpName) {
                        const p = connect.showHideAttribute(gator.state.datasetName, att.name, toHide);
                        thePromises.push(p);    //  collect all these promises
                    }
                })
            })

            await Promise.all(thePromises);
            gator_ui.update();
        },

        makeAddSubtractClumpButton(iAttr) {

            const destClump =  (iAttr.clump && iAttr.clump !== gator.constants.noClumpString) ?
                gator.constants.noClumpString : gator_ui.currentClumpName ;

            // we will clear the clump if our computed "destination" is no clump.
            const useClearIcon = (destClump === gator.constants.noClumpString);

            const clumpIconPath = useClearIcon ?
                "../../common/art/clear.png" :
                "../../common/art/add.png";

            const theHint = (destClump === gator.constants.noClumpString) ?
                `click to remove ${iAttr.title} from clump [${iAttr.clump}]` :
                `click to add ${iAttr.title} to clump [${gator_ui.currentClumpName}]`;

            let theImage = `&nbsp;<img class="small-button-image" 
                    src=${clumpIconPath} title="${theHint}" 
                    onclick="gator.addAttributeToClump('${iAttr.name}', '${destClump}')" 
                    alt = "clump toggle image"  
                    />`;

            //  but if there is nothing in the clump name box, we cannot use the "add" button

            if (!useClearIcon && !gator_ui.currentClumpName) {
                theImage = "";
            }
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
                if (iAttr.clump && iAttr.clump !== gator.constants.noClumpString) {
                    theHint += ` (${iAttr.clump})`;
                }
                const theImage = `&emsp;<img class="small-button-image" 
                    src="art/info.png" width="14" title="${theHint}" 
                    onclick="gator_ui.attributeControls.makeSweetAlert('${iAttr.title}', '${theHint}')" 
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