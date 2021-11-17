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
            out = this.findNodeNumberFromElement(anElement);
        }
        return out;

    },

    /**
     * Given some element in the DOM, figures out, recursively,
     * what node (if any) it might be in.
     *
     * Returns the node number (as a number) if it's in a node,
     * and `null` if the element is not part of a node.
     *
     * @param iElement
     * @returns {string|*|null}
     */
    findNodeNumberFromElement: function (iElement) {
        if (iElement.id.includes(`NBV`)) {
            return Number(iElement.id.slice(4));    //  return the number of the node
        }
        const tParent = iElement.parentElement;
        return (tParent) ? this.findNodeNumberFromElement(tParent) : null;
    },

    copeWithAttributeDrag: function (iWhat, iWhere) {
        const theNodeNumber = this.findNBVAt(iWhere);

        if (theNodeNumber) {
            //  we are dragging over a node. Highlight it!
            //  it's a node, but not the DV stripe
            const theNBV = arbor.treePanelView.NBVfromNodeID(theNodeNumber);
            console.log(`dragging ${iWhat} over node ${theNBV.myNode.arborNodeID}`);
            if (this.highlightedNBV !== theNBV) {
                //  we have changed the highlighting
                if (this.highlightedNBV) {
                    //  we're moving to a new node, to "nearby" the old highlighted one
                    this.highlightedNBV.highlight("nearby");    //  just in case
                }
                this.highlightedNBV = theNBV;   //  set to the new node
                this.highlightedNBV.highlight("on");    //  and highlight it.
            }
        } else {
            //  not over a node of any kind
            if (this.highlightedNBV) {
                //  must have just left a highlighted node.
                console.log(`   left node ${this.highlightedNBV.myNode.arborNodeID}`)
                //  unhighlight the node
                this.highlightedNBV.highlight("nearby");
                this.highlightedNBV = null;     //  and set the saved value to null.
            }
        }

    },

    copeWithAttributeDrop: function (iWhat, iWhere) {
        const theNodeNumber = this.findNBVAt(iWhere);

        if (theNodeNumber) {
            //  we found some node.
            if (theNodeNumber === arbor.state.tree.rootNode.arborNodeID) {
                //  root node drop -> change the dependent variable
                console.log(`Setting the dependent variable to ${iWhat}`);
                arbor.setDependentVariableByName(iWhat);    //  also sets the focus split
                arbor.dispatchTreeChangeEvent(`${iWhat} is the new dependent variable`);
                focusSplitMgr.showHideAttributeConfigurationSection(true);
            } else {
                //  it's the node number
                const theNode = arbor.state.tree.nodeFromID(theNodeNumber);

                //  find which `AttInBaum` corresponds to the string in `iWhat`
                if (theNode) {
                    const theAttInBaum = arbor.attsInBaum.reduce(function (acc, val) {
                        return ((val.attributeName === iWhat) ? val : acc);
                    });
                    //  make the branch.
                    theNode.branchThisNode(theAttInBaum);   //   also sets focus node, which redraws
                } else {
                    //  it was not dropped on a node. Nothing happens. But it should be a node!
                    console.log(`dropManager.copeWithAttributeDrop() expected a node, didn't find it!`);
                }
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