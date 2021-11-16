arbor.dropManager = {

    highlightedNBV: null,

    currentlyDraggingCODAPAttribute: false,

    /**
     * Handle a CODAP API attribute drag/drop action
     *
     * @param iMessage  message sent by CODAP
     * @returns {Promise<void>}
     */
    handleDrop: async function (iMessage) {

        switch (iMessage.values.operation) {
            case "dragstart":
                console.log(`... start dragging ${iMessage.values.attribute.title}`);
                //scrambler.currentlyDraggingAnAttribute = true;
                this.currentlyDraggingCODAPAttribute = true;
                break;
            case "dragend":
                console.log(`...  stop dragging ${iMessage.values.attribute.title}`);
                arbor.dropManager.highlightDropZones(false);
                this.currentlyDraggingCODAPAttribute = false;
                break;

            case "drag":
                if (arbor.treePanelView) {
                    arbor.dropManager.copeWithAttributeDrag(iMessage.values.attribute.name, iMessage.values.position);
                }   //  if not, we don't need to track the drag
                break;

            case "drop":        //  attribute drop using API dragdrop
                console.log(`Dropped [${iMessage.values.attribute.title}] from CODAP`);
                const theDropDatasetName = iMessage.values.context.name;

                if (theDropDatasetName === arbor.state.dataSetName) {
                    arbor.dropManager.copeWithAttributeDrop(iMessage.values.attribute.name, iMessage.values.position);
                } else {    //  different data context, do the change!
                    console.log(`changing to dataset ${theDropDatasetName}`);
                    await arbor.setDataContext(theDropDatasetName);           //      change DC and make a new empty analysis
                    await arbor.getAndRestoreModel();
                    arbor.setDependentVariableByName(iMessage.values.attribute.name);
                    arbor.redisplay();
                }
                break;

            case "dragenter":
                arbor.dropManager.highlightDropZones(true);
                break;

            case "dragleave":
                arbor.dropManager.highlightDropZones(false);
                break;

            default:
        }
    },

    highlightDropZones: function (iHighlight) {
        if (arbor.treePanelView) {
            arbor.treePanelView.highlightDropZones(iHighlight);
        } else {
            const theNoTreeArea = document.getElementById("noTreeArea");
            const theNewClass = iHighlight ? "solid-drop-target" : "not-drop-target";
            theNoTreeArea.className = theNewClass;
            console.log(`noTreeArea class set to ${theNoTreeArea.className}.`);
        }

    },

    findNBVAt: function (iWhere) {
        //  we find some element at the coordinates
        const anElement = document.elementFromPoint(iWhere.x, iWhere.y);
        let out = null;

        //  then we look at parents until we get some kind of Node.
        if (anElement) {
            out = this.findNodeElementFromElement(anElement);
        }
        return out;

    },

    /**
     * Given a DOM element, finds the [grand]parent element that represents a `NodeBoxView`.
     *
     * Note that this is _not_ a `NodeBoxView`, but rather the SVG paper owned by a `NodeBoxView`.
     *
     * Furthermore, this routine actually returns an object with three fields:
     *  * `isDependent`: whether the node is for a dependent variable
     *  * `nodeNumber`: the `arborNodeID` of the node
     *  * `theNBV` : that SVG element
     *
     * @param iElement
     * @returns {{nodeNumber: number, isDependent: boolean, theNBV: ({id}|*)}|*|null}
     */
    findNodeElementFromElement: function (iElement) {
        const tParent = iElement.parentElement;
        let out = (tParent) ? this.findNodeElementFromElement(tParent) : {};

        if (iElement.className) {
            const classString = (iElement.className.baseVal)
                ? iElement.className.baseVal.toString()
                : iElement.className.toString();
            console.log(iElement.classList);
            if (iElement.classList.contains(`dependent-variable-stripe`)) {
                //  if (classString.includes(`dependent-variable`)) {
                out["isDependent"] = true;
                console.log(`    found dependent variable stripe`);
            }
        }

        if (iElement.id && iElement.id.includes(`NBV`)) {
            //  okay, we're in a node box view
            const nodeNumber = Number(iElement.id.slice(4));
            const theNBV = arbor.treePanelView.NBVfromNodeID(nodeNumber);
            out["nodeNumber"] = nodeNumber;
            out["theNBV"] = theNBV;
            //  console.log(`    found NBV-${nodeNumber}`);
        }

        return out;
    },

    copeWithAttributeDrag: function (iWhat, iWhere) {
        const foundNBVData = this.findNBVAt(iWhere);
        if (foundNBVData) {
            if (foundNBVData.nodeNumber) {
                const theNBV = arbor.treePanelView.NBVfromNodeID(foundNBVData.nodeNumber);
                //    const betterNode = foundNBVData.theNBV.myNode; //  does NOT work because the node returned is an SVG, NOT the actual NodeBoxView

                console.log(`dragging ${iWhat} over node ${theNBV.myNode.arborNodeID}`);

                if (this.highlightedNBV !== foundNBVData.theNBV) {
                    if (this.highlightedNBV) {
                        this.highlightedNBV.highlight("nearby");    //  just in case
                    }
                    this.highlightedNBV = foundNBVData.theNBV;
                    this.highlightedNBV.highlight("on");
                }
            } else {
                console.log(`    found NBV data without a node number. How?`);
            }
        } else {    //  not over a node
            if (this.highlightedNBV) {
                console.log(`   left node ${this.highlightedNBV.myNode.arborNodeID}`)
                //  unhighlight the node
                this.highlightedNBV.highlight("nearby");
                this.highlightedNBV = null;
            }
        }
    },

    copeWithAttributeDrop: function (iWhat, iWhere) {
        const foundNBVData = this.findNBVAt(iWhere);

        if (foundNBVData.nodeNumber) {
            if (foundNBVData.isDependent) {
                console.log(`Setting the dependent variable to ${iWhat}`);
                arbor.setDependentVariableByName(iWhat);    //  also sets the focus split
                arbor.dispatchTreeChangeEvent(`${iWhat} is the new dependent variable`);
                focusSplitMgr.showHideAttributeConfigurationSection(true);
            } else if (foundNBVData.nodeNumber) {
                const theNode = arbor.state.tree.nodeFromID(foundNBVData.nodeNumber);
                if (theNode) {
                    const theAttInBaum = arbor.attsInBaum.reduce(function (acc, val) {
                        return ((val.attributeName === iWhat) ? val : acc);
                    });
                    theNode.branchThisNode(theAttInBaum);   //   also sets focus node, which redraws
                } else {
                    //  it was not dropped on a node. Nothing happens.
                }
            } else {
                console.log(`dropManager.copeWithAttributeDrop() unexpected situation!`);
            }
        } else {  //  aha! We are not in a node!
            console.log(`Drop not in a node`);
        }
    },


    /**
     * is the point in the rectangle?
     * @param iPoint
     * @param iRect
     * @returns {boolean}
     */
    pointInRect: function (iPoint, iRect) {
        return (
            iPoint.x >= iRect.left && iPoint.x <= iRect.right
            && iPoint.y >= iRect.top && iPoint.y <= iRect.bottom
        );
    }
}