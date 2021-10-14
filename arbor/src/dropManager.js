arbor.dropManager = {

    handleDrop: async function (iMessage) {
        const positionString = iMessage.values.position ?
            `(${iMessage.values.position.x} , ${iMessage.values.position.y})` :
            `(no pos)`;
        switch (iMessage.values.operation) {
            case "dragstart":
                //  console.log(`... start dragging ${iMessage.values.attribute.title}`);
                //scrambler.currentlyDraggingAnAttribute = true;
                break;

            case "drop":
                console.log(`... drop ${iMessage.values.attribute.title} at ${positionString}`);
                arbor.dropManager.copeWithAttributeDrop(iMessage.values.attribute.name, iMessage.values.position);
                break;

            case "dragend":
                //  console.log(`... dragend ${iMessage.values.attribute.title} at ${positionString}`);
                // document.getElementById("entire-scrambler").className = "body-no-drag";
                //scrambler.currentlyDraggingAnAttribute = false;
                break;

            case "dragenter":
                console.log(`... dragenter ${iMessage.values.attribute.title} at ${positionString}`);
                //document.getElementById("entire-scrambler").className = "body-drag";
                break;

            case "dragleave":
                console.log(`... dragleave ${iMessage.values.attribute.title} at ${positionString}`);
                //document.getElementById("entire-scrambler").className = "body-no-drag";

                break;

            default:
        }
    },

    copeWithAttributeDrop : function(iWhat, iWhere) {
        const anElement = document.elementFromPoint(iWhere.x, iWhere.y);
        const theHitResult = this.findNodeElementFromElement(anElement);

        if (theHitResult === `dependent-variable`) {
            console.log(`Setting the dependent variable to ${iWhat}`);
            arbor.setDependentVariableByName(iWhat);    //  also sets the focus split
            arbor.dispatchTreeChangeEvent(`${iWhat} is the new dependent variable`);
            focusSplitMgr.showHideAttributeConfigurationSection(true);
        } else {
            const theNode = arbor.state.tree.nodeFromID(Number(theHitResult));
            if (theNode) {
                const theAttInBaum = arbor.attsInBaum.reduce(function (acc, val) {
                    return ((val.attributeName === iWhat) ? val : acc);
                });
                theNode.branchThisNode(theAttInBaum);   //   also sets focus node, which redraws
            } else {
                //  it was not dropped on a node. Nothing happens.
            }
        }
    },

    findNodeElementFromElement : function(iElement) {
        if (iElement.className) {
            const classString = (iElement.className.baseVal)
                ? iElement.className.baseVal.toString()
                : iElement.className.toString();
            if (classString.includes(`dependent-variable`)) {
                return `dependent-variable`;    //  return the this string
            }
            if (iElement.id.includes(`NBV`)) {
                return iElement.id.slice(4);    //  return the number of the node
            }
            const tParent = iElement.parentElement;
            return (tParent) ? this.findNodeElementFromElement(tParent) : null;
        }
        return null;
    },



    pointInRect : function(iPoint, iRect) {
        return (
            iPoint.x >= iRect.left && iPoint.x <= iRect.right
            && iPoint.y >= iRect.top && iPoint.y <= iRect.bottom
        );
    }
}