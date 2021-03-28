/*
==========================================================================

 * Created by tim on 10/1/20.
 
 
 ==========================================================================
choosy_ui in choosy

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

/*  global Swal  */
const choosy_ui = {

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

    /**
     * Main update routine --- redraws everyting.
     * @returns {Promise<void>}
     */
    update: async function () {
        this.recordCurrentOpenDetailStates();
        choosy.datasetInfo = await connect.refreshDatasetInfoFor(choosy.state.datasetName);
        this.processDatasetInfoForAttributeClumps(choosy.datasetInfo); //  get clumps and add the collection
        this.attributeControls.install();
        this.doTagVisibility();
        this.makeSummary();

        //  more miscellaneous visibility

        const clumpNameDIV = document.getElementById("clumpNameDIV");
        clumpNameDIV.style.display = (this.getClumpingStrategy() === "byClump") ? "flex" : "none";
    },

    /**
     * Set visibility for different parts of the **Tag** interface,
     * e.g., show only "binary" controls in binary mode.
     */
    doTagVisibility : function() {
        const tagModeString = document.querySelector("input[name='tag-mode']:checked").value;

        document.getElementById("simple-tag").style.display = (tagModeString === "simple") ? "block" : "none";
        document.getElementById("binary-tag").style.display = (tagModeString === "binary") ? "block" : "none";
        document.getElementById("random-tag").style.display = (tagModeString === "random") ? "block" : "none";
    },

    makeSummary : async function() {
        const summaryEl = document.getElementById(choosy.constants.selectionStatusElementID);
        const datasetSummaryEL = document.getElementById(choosy.constants.datasetSummaryEL);
        const selectedCases = await connect.tagging.getCODAPSelectedCaseIDs();

        let theText = "";
        let nAtts = 0;
        if (choosy.datasetInfo) {
            choosy.datasetInfo.collections.forEach(coll => {
                coll.attrs.forEach( att => {
                    nAtts++;
                })
            })
        }
        const nCases = Object.keys(choosy.theData).length;

        theText += `${nAtts} attributes, ${nCases} cases. ${selectedCases.length} selected.`;

        summaryEl.innerHTML = theText;
        datasetSummaryEL.innerHTML = theText;
    },

    /**
     * User has changed the name of the clump. Set `this.currentClumpName` and ask for the attribute
     * control "stripes" to be redrawn.
     * @param e
     */
    changeAttributeClumpNameInput : function(e) {
        const theNameBox = document.getElementById("clump-name-text-input");
        this.currentClumpName = theNameBox.value;

        this.attributeControls.install();
    },

    /**
     * Sets `this.currentClumpName` and also puts that name into the clump-choice text box.
     * Then re-installs the attribute clumps (so that if we changed to or from no clump in the box, the (+) icons adjust)
     *
     * Called on `onclick` from the clump's `<details>` DOM object.
     *
     * @param iName     name of the clump to set
     * @returns {Promise<void>}
     */
    setCurrentClumpTo : async function (iName) {
        console.log(`˙  setting clump name to ${iName}`);
        this.currentClumpName = iName;
        const theNameBox = document.getElementById("clump-name-text-input");
        theNameBox.value = this.currentClumpName;
        this.clumpRecord[iName].open = !this.clumpRecord[iName].open;
        await this.attributeControls.install();
        this.recordCurrentOpenDetailStates();
    },

    /**
     * Look at the UI to tell whether we're clumping "by clump" or using the hierarchy (byLayer)
     * @returns {*} string! `byLayer` or `byClump`
     */
    getClumpingStrategy : function() {
        return document.querySelector("input[name='clumpingStrategyRadioGroup']:checked").value;
    },

    getClumpFromAttributeName : function(iAttName) {

    },

    /**
     * Record whether the `<details>` UI for each clump is currently open in the `clumpRecord` object.
     */
    recordCurrentOpenDetailStates   : function() {
        for (const clump in this.clumpRecord) {
            if (clump !== choosy.constants.noClumpString) {
                const theID = "details-" + clump;
                const theElement = document.getElementById(theID);
                if (theElement) {   //  there might be an empty clump, so no element to be open or closed
                    const isOpen = theElement.hasAttribute("open");
                    this.clumpRecord[clump].open = isOpen;
                    console.log(`ç  recording that ${clump} is ${isOpen ? " open" : " closed"}`);
                }
            }
        }
    },

    /**
     * Parse the attribute "clumps" indicated by bracketed clump names in the attribute descriptions.
     *
     * For example, `{work}Percent of people working in agriculture`
     * puts the attribute in a clump called "work" and then strips that tag from the description.
     *
     * Does this by adding a `clump` key to the attribute data --- which does not exist in CODAP.
     *
     * @param theInfo   the information on all collections and attributes
     */
    processDatasetInfoForAttributeClumps: function (theInfo) {

        const whichWayToClump = this.getClumpingStrategy();

        theInfo.collections.forEach(coll => {
            coll.attrs.forEach(att => {
                let theDescription = att.description;
                let theClump = choosy.constants.noClumpString;
                const leftB = theDescription.indexOf("{");
                const rightB = theDescription.indexOf("}");
                if (rightB > leftB) {
                    theClump = theDescription.substring(leftB + 1, rightB);
                    att["description"] = theDescription.substring(rightB + 1);  //  strip the bracketed clump name from the description
                }

                //  if we're clumping "byLevel", use the collection name as the clump name
                const theGroupName =  (whichWayToClump === "byLevel") ? coll.title : theClump;

                //  change the `att` field to include fields for `clump` and `collection`
                att["clump"] = theGroupName
                att["collection"] = coll.name;  //  need this as part of the resource so we can change hidden

                //  add an element to the object for this clump if it's not there already
                if (!this.clumpRecord[theGroupName]) {
                    this.clumpRecord[theGroupName] = {open : false};
                }
            })
        })
    },

    makeSweetAlert: function (iTitle, iText, iIcon = 'info') {
        Swal.fire({
            icon: iIcon,
            title: iTitle,
            text: iText,
        })
    },

    /*
        attribute checkbox section
    */

    attributeControls: {
        divID: "chooseAttributeDiv",

        /**
         * Go through the attributes as returned by CODAP.
         * Make an object keyed by clump name whose values are Arrays of attributes.
         *
         * @param iCollInfo
         * @returns {{}}    Object: A reorganized list of attributes, keyed by clump name.
         */
        preprocessAttributes: function (iCollInfo) {
            let out = {};
            out[choosy.constants.noClumpString] = [];

            iCollInfo.forEach(coll => {
                coll.attrs.forEach(att => {
                    const theClump = att.clump ? att.clump : choosy.constants.noClumpString;
                    if (!out[theClump]) {
                        out[theClump] = [];     //  fresh array for new clump
                    }
                    out[theClump].push(att);
                })
            })

            return out;
        },

        /**
         * Create HTML for the clumps and the attributes inside them.
         *
         * @returns {string}   the HTML
         */
        make: function () {
            let tGuts = "";

            if (choosy.datasetInfo.collections) {
                const hierarchy = (choosy.datasetInfo.collections.length !== 1);

                const mungedAttributes = this.preprocessAttributes(choosy.datasetInfo.collections);

                if (hierarchy) {
                }

                //  loop over all the clumps (or collections, if we're doing this by level)
                for (const theClumpName in mungedAttributes) {
                    const theArrayOfAttributes = mungedAttributes[theClumpName];

                    //  make all of the individual attribute "stripes" and put them together here
                    const oneAttributeClumpControlSet = this.makeAttrClumpCode(theArrayOfAttributes, theClumpName);

                    //  is this clump open or not?
                    const openClause = choosy_ui.clumpRecord[theClumpName].open ? "open" : "";

                    //  we need to give this clump a unique `id` in the DOM
                    const theDOMID = "details-" + theClumpName;

                    if (theClumpName === choosy.constants.noClumpString) {
                        tGuts += `${oneAttributeClumpControlSet}`;
                    } else {
                        const clumpVisibilityButtons = this.makeClumpVisibilityButtons(theClumpName);   //  the two eyeballs in the summary

                        //  this is the opening of the `<details>` markup for the top of the clump.
                        //  tGuts += `<details id="${theDOMID}" ${openClause} onclick="choosy_ui.setCurrentClumpTo('${theClumpName}')">
                        tGuts += `<details id="${theDOMID}" ${openClause} onclick="choosy.handlers.detailClick()">
                            <summary class="attribute-clump-summary">
                            <div class="clump-summary-head">
                                ${theClumpName}&emsp;${clumpVisibilityButtons}
                            </div>
                            </summary>
                            `;
                        tGuts += `${oneAttributeClumpControlSet}`;      //      all the attributes inside
                        tGuts += `</details>`;
                    }
                }       //  end of for-in loop over clumps
            } else {
                tGuts = "No attributes to work with here";
            }
            return tGuts;   //  the entire HTML
        },

        /**
         * Create the attribute controls (stripes) for an entire clump of attributes.
         * Called by `make()`
         * @param iClumpOfAttributes    array of attribute infos
         * @param iClumpName    the name of this clump, a string
         * @returns {string}
         */
        makeAttrClumpCode(iClumpOfAttributes, iClumpName) {
            let tGuts = "<div class='attribute-clump'>";
            const isCurrentClump = iClumpName === choosy_ui.currentClumpName;
            const clumpingStrategy = choosy_ui.getClumpingStrategy();

            iClumpOfAttributes.forEach(att => {
                const attrInfoButton = this.makeAttrInfo(att);
                const visibilityButtons = this.makeVisibilityButtons(att);
                const addSubtractClumpButton = this.makeAddSubtractClumpButton(att);
                const isHiddenNow = att.hidden;
                const checkedText = isHiddenNow ? "" : "checked";

                tGuts += `<div class="attribute-control-cluster">`;
                tGuts += "&emsp;" + visibilityButtons;

                //  if we're clumping byLevel, i.e., using hierarchy, we don't get +/- buttons
                if (clumpingStrategy === "byClump") {
                    tGuts += "&ensp;" + addSubtractClumpButton;
                }

                // todo note that this should really be title, but CODAP doesn't do that correctly
                tGuts += `&ensp; ${att.name}`;     //  the actual title of the attribute, at last!
                tGuts += attrInfoButton;
                tGuts += `</div>`;

            })
            tGuts += "</div>"
            return tGuts;
        },

        /**
         * Make HTML for the visibility buttons for one attribute.
         *
         * @param iAttr
         * @returns {string}
         */
        makeVisibilityButtons(iAttr) {

            const isHidden = iAttr.hidden;
            const visibilityIconPath = isHidden ?
                "../../common/art/blank.png" :
                "../../common/art/visibility.png";
            const invisibilityIconPath = isHidden ?
                "../../common/art/visibility-no.png" :
                "../../common/art/blank.png";

            const theHint = isHidden ?
                `click to make ${iAttr.name} visible in the table` :     //  todo: should be title
                `click to hide ${iAttr.name} in the table`;             //  todo: should be title

            const theImage = `<img class="small-button-image" 
                    src=${visibilityIconPath} title="${theHint}" 
                    onclick="choosy_ui.attributeControls.handleVisibilityButton('${iAttr.name}', ${isHidden})" 
                    alt = "visibility image"  
                    />
                    <img class="small-button-image" 
                    src=${invisibilityIconPath} title="${theHint}" 
                    onclick="choosy_ui.attributeControls.handleVisibilityButton('${iAttr.name}', ${isHidden})" 
                    alt = "invisibility image"  
                    />`;

            return theImage;
        },

        async handleVisibilityButton(iAttName, iHidden) {
            await connect.showHideAttribute(choosy.state.datasetName, iAttName, !iHidden);
/*
            const theClumpName = connect.utilities.clumpNameFromAttributeName(iAttName, choosy.datasetInfo);
            choosy_ui.setCurrentClumpTo(theClumpName);
*/
            //  choosy_ui.update();     //  no need to call because we'll get an updateAttribute notification
        },

        makeClumpVisibilityButtons : function (iClumpName) {
            const theHideHint = `Hide all attributes in [${iClumpName}]`;
            const theShowHint = `Show all attributes in [${iClumpName}]`;

            const hidingImage = `<img class="small-button-image" 
                    src="../../common/art/visibility-no.png" title="${theHideHint}" 
                    onclick="choosy_ui.attributeControls.handleClumpVisibilityButton('${iClumpName}', true)"
                    alt = "clump invisibility image"  
                    />`;
            const showingImage = `<img class="small-button-image" 
                    src="../../common/art/visibility.png" title="${theShowHint}" 
                    onclick="choosy_ui.attributeControls.handleClumpVisibilityButton('${iClumpName}', false)" 
                    alt = "clump visibility image"  
                    />`;

            return hidingImage + "&ensp;" + showingImage;
        },

        handleClumpVisibilityButton : async function(iClumpName, toHide) {
            console.log(`${toHide ? "Hiding" : "Showing"} all attributes in [${iClumpName}]`);

            let theAttNames = [];

            choosy.datasetInfo.collections.forEach(coll => {
                coll.attrs.forEach( att => {
                    if (att.clump === iClumpName) {
                        theAttNames.push(att.name);    //  collect all these names
                    }
                })
            })
            const p = await connect.showHideAttributeList(choosy.state.datasetName, theAttNames, toHide);
            choosy_ui.update();
        },

        makeAddSubtractClumpButton(iAttr) {

            const destClump =  (iAttr.clump && iAttr.clump !== choosy.constants.noClumpString) ?
                choosy.constants.noClumpString : choosy_ui.currentClumpName ;

            // we will clear the clump if our computed "destination" is no clump.
            const useClearIcon = (destClump === choosy.constants.noClumpString);

            const clumpIconPath = useClearIcon ?
                "../../common/art/subtract.png" :
                "../../common/art/add.png";

            const theHint = (destClump === choosy.constants.noClumpString) ?
                `click to remove ${iAttr.name} from clump [${iAttr.clump}]` :           //  todo: should be title
                `click to add ${iAttr.name} to clump [${choosy_ui.currentClumpName}]`;  //  todo: should be title

            let theImage = `&nbsp;<img class="small-button-image" 
                    src=${clumpIconPath} title="${theHint}" 
                    onclick="choosy.addAttributeToClump('${iAttr.name}', '${destClump}')" 
                    alt = "clump toggle image"  
                    />`;

            //  but if there is nothing in the clump name box, we cannot use the "add" button

            if (!useClearIcon && !choosy_ui.currentClumpName) {
                theImage = "";
            }
            return theImage;

        },

        /**
         * This appears in a nice dialog if the user clicks the info button.
         * @param iAttr
         * @returns {string}
         */
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
                if (iAttr.clump && iAttr.clump !== choosy.constants.noClumpString) {
                    theHint += ` (${iAttr.clump})`;
                }
                const theImage = `&emsp;<img class="small-button-image" 
                    src="../../common/art/info.png" width="14" title="${theHint}" 
                    onclick="choosy_ui.makeSweetAlert('${iAttr.name}', '${theHint}')"      //  todo: should be title
                    alt = "circular information button image"  
                    />`;
                out += theImage;
            }
            return out;
        },


        install: function () {
            document.getElementById(this.divID).innerHTML = this.make();
        },

        handle: function (iAtt) {
            console.log(`=   handling a checkbox for [${iAtt}]`);

            const domName = `att_${iAtt}`;
            const isChecked = document.getElementById(domName).checked;
            connect.showHideAttribute(choosy.state.datasetName, iAtt, !isChecked);
        },
    },


    /*
        dataset menu section
    */

    datasetMenu: {
        divID: "chooseDatasetDIV",
        menuID: "chooseDatasetControl",

        install: async function () {
            document.getElementById(this.menuID).innerHTML = await this.make();
            const tDatasetMenu = document.getElementById(this.menuID);
            if (tDatasetMenu) {     //  set its value if we already have a dataset chosen, e.g., back from save
                tDatasetMenu.value = choosy.state.datasetName;
            }
        },

        handle: async function () {
            const tElement = document.getElementById(this.menuID);
            if (tElement) {
                const theName = tElement.value;
                if (theName !== choosy.datasetInfo.title) {
                    console.log(`∂  switching from [${choosy.datasetInfo.title}] to [${theName}]`);
                    await choosy.setTargetDatasetByName(theName);
                }
            } else {
                console.log(`NB: no dataset menu`);
            }
        },

        make: async function () {
            const theList = await connect.getListOfDatasets();
            let tGuts = "";

            if (theList.length === 0) {
                tGuts = `<h3 class="stripe-hed">No datasets</h3>`;

            } else if (theList.length === 1) {
                const theDataSet = theList[0];    //  the only one
                await choosy.setTargetDatasetByName(theDataSet.name);
                tGuts = `<h3 class="stripe-hed">Dataset: <strong>${choosy.datasetInfo.title}</strong></h3>`;

            } else {
                tGuts = `<label for="dataset-menu">choose a dataset</label>`;
                tGuts += `<select id="dataset-menu" onchange="choosy_ui.datasetMenu.handle()">`;
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