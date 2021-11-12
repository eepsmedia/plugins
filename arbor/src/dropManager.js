arbor.dropManager = {

    highlightedNBV : null,

    currentlyDraggingCODAPAttribute : false,

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
                arbor.treePanelView.highlightDropZones(false);
                this.currentlyDraggingCODAPAttribute = false;
                break;

            case "drag":
                arbor.dropManager.copeWithAttributeDrag(iMessage.values.attribute.name, iMessage.values.position);
                break;

            case "drop":        //  attribute drop using API dragdrop
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
                arbor.treePanelView.highlightDropZones(true);
                break;

            case "dragleave":
                arbor.treePanelView.highlightDropZones(false);
                break;

            default:
        }
    },

    findNBVAt : function(iWhere) {
        //  we find some element at the coordinates
        const anElement = document.elementFromPoint(iWhere.x, iWhere.y);

        //  then we look at parents until we get some kind of Node.
        return this.findNodeElementFromElement(anElement);

    },

    copeWithAttributeDrag: function (iWhat, iWhere) {
        const foundNBVData = this.findNBVAt(iWhere);
        if (foundNBVData) {
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

        if (foundNBVData) {
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
        if (iElement.id) {
            const nodeNumber = Number(iElement.id.slice(4));
            const theNBV = arbor.treePanelView.NBVfromNodeID(nodeNumber);

            let out = {
                isDependent: false,
                nodeNumber: nodeNumber,
                theNBV: theNBV,
            };

            if (iElement.className) {
                const classString = (iElement.className.baseVal)
                    ? iElement.className.baseVal.toString()
                    : iElement.className.toString();
                if (classString.includes(`dependent-variable`)) {
                    out.isDependent = true;
                    return out;
                } else if (iElement.id.includes(`NBV`)) {  //  this element is a NodeBoxView
                    return out;
                }
            }
        }
        const tParent = iElement.parentElement;
        return (tParent) ? this.findNodeElementFromElement(tParent) : null;
        //  return null;
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