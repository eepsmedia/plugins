//      Node class

/**
 * Model class for the nodes in the tree. The view is called NodeBoxView.
 *
 * It has a unique ID (nodeID) to facilitate restoration from save
 * It holds its parent's ID as well.
 * It has a member (LoR) that tells if it's a "left" or "right" node.
 *
 * If it happens to be the root node, parentID is null, and LorR is "root"
 *
 * It has an array of branches. If it is empty, this is a terminal node.
 * If it is not empty, the array should have two elements, one for each descendant node.
 * If it has branches, this.attributeSplit holds an "Split" (Class AttributeSplit) that specifies
 *      how the cases are split between its two branches.
 *
 * The "filterArray" is an array of Boolean expressions (as text) that, when ANDed, select the cases that apply to this node.
 * These Booleans come from the "Splits" that come higher in the tree.
 *
 * The "missingArray" is a similar array, but that when ORed, tell whether a case is missing from this node.
 *
 *
 * @param iParent   the parent node (though we will save the ID. Why? Avoid circularity.)
 * @param iLoR      "L" or "R" -- is this a "left" or "right" node?
 * @constructor
 */
Node = function (iParent, iLoR) {
    this.arborNodeID = arbor.state.latestNodeID++;
    this.parentID = (iParent ? iParent.arborNodeID : null);  //  parent NODE (model). NULL if this is the root.
    this.LoR = iLoR;        //  "L" or "R" (or "root" or "trunk")

    if (iParent) {
        iParent.branches.push(this);
    }

    this.attributeSplit = null;      //  how the descendants of this node get split or otherwise configured.
    //  if this is the root, this is the dependent variable split.

    this.onTrace = false;       //  are we in the path of a (single, CODAP) selected case?

    this.stopSign = arbor.constants.diagnosisNone;   //  (iLoR === "R" ? arbor.constants.diagnosisMinus : arbor.constants.diagnosisPlus);

    this.numerator = 0;
    this.denominator = 0;
    this.mean = 0;          //  mean value; if categorical, proportion positive (pos = 1, neg = 0)
    this.ssdev = 0;       //  mean squared deviation from that mean. If categorical, use  (pos = 1, neg = 0) = p(1-p)/n

    //  label texts

    this.relevantParentSplitLabel = "input";

    this.filterArray = [];
    this.missingArray = [];
    this.branches = [];     //  the array of sub-Nodes

    console.log("New " + this.LoR + " node id: " + this.arborNodeID + " type: " + this.stopSign);

};

/**
 * Given the (unique, integer) id of a node, returns the node if it is an eventual descendant of this node,
 * or null if it is not.
 *
 * Used (circuitously) to find the parent node. I know. See this.parentNode().
 *
 * @param id
 * @returns {*}
 */
Node.prototype.findNodeDownstream = function (id) {
    let out = null;

    if (id) {
        if (this.arborNodeID === id) {
            out = this;
        } else {
            this.branches.forEach(function (b) {
                const tNode = b.findNodeDownstream(id);
                if (tNode) {
                    out = tNode;
                }
            })
        }
    }

    return out;
};

/**
 * [currently] circuitous way to find the parent node:
 * (if we restored, we have its node ID, but not the node itself)
 *
 * Ask the tree to find the node by ID.
 * That will ask the root node to find it in its descendants.
 */
Node.prototype.parentNode = function () {
    return arbor.state.tree.nodeFromID(this.parentID);
};

/**
 * Called from this.populateNode()
 * and NodeBoxView.redrawNodeBoxView().
 * Importantly, provides the dependent variable split if this is the root node.
 *
 * @param iParent       the parent NODE (not just the ID)
 * @returns {null|*}
 */
Node.prototype.parentSplit = function (iParent) {
    if (!iParent) {
        this.attributeSplit = arbor.state.dependentVariableSplit;   //  this is the root
        return this.attributeSplit;
    }
    return iParent.attributeSplit;
};

/**
 * Called when the user drops an attribute in a node.
 *
 * @param iAttribute    the `AttInBaum` that branches at this node, just dropped on it
 */
Node.prototype.branchThisNode = function (iAttribute) {
    this.attributeSplit = iAttribute.getSplit();    //  gets the latest split

    if (arbor.state.oAutoBranchLabels) {
        this.attributeSplit.setAutoLabels();
    }

    this.branches = [];     //  reset

    //  here is where we make the new nodes and constrict their Booleans.
    //  we add each of the (two) branches separately. Left first.

    const tNewNode = new Node(this, "L"); //
    const uNewNode = new Node(this, "R"); //

    //  now this node has the correct split and the tree has the new nodes. Make it the focus
    arbor.setFocusNode(this);   //  also causes redraw

    if (arbor.state.oAlwaysShowConfigurationOnSplit) {
        focusSplitMgr.showHideAttributeConfigurationSection(true);
    }

};

Node.prototype.addChild = function (iChild) {
    this.branches.push(iChild);
    iChild.parentID = this.arborNodeID;     //  just in case
}

/**
 * Remove all branches from this node
 * Remove its "split"
 */
Node.prototype.stubThisNode = function () {
    this.branches = [];
    this.attributeSplit = null;
    console.log("Node.prototype.stubThisNode, set to change tree.");

    arbor.eventDispatcher.dispatchEvent("changeNode");
    arbor.dispatchTreeChangeEvent("node stubbing");
};

Node.prototype.traceCaseInTree = function (c) {
    let tIsCaseInThisNode = false;
    let tSignOfTerminalNode = null;

    if (this.branches.length === 0) {       //  we are a terminal node
        const tWholeFilter = this.filterArray.join(" && ");
        tIsCaseInThisNode = (eval(tWholeFilter));
        if (tIsCaseInThisNode) {
            tSignOfTerminalNode = this.stopSign;
        }
    } else {
        this.branches.forEach(function (n) {
            const tBranchTraceResult = n.traceCaseInTree(c);
            if (tBranchTraceResult.inThisNode) {     //  doing it this way (not = ||) ensures traversal of entire tree
                tIsCaseInThisNode = true;
                tSignOfTerminalNode = tBranchTraceResult.terminalNodeSign;
            }
        });
        //       console.log('Tracing case, non-terminal node: ' + JSON.stringify(c));
    }
    this.onTrace = tIsCaseInThisNode;
    return {
        inThisNode: tIsCaseInThisNode,
        terminalNodeSign: tSignOfTerminalNode
    };
};

/**
 * Clear the onTrace flag for the entire tree
 */
Node.prototype.clearTrace = function () {
    this.onTrace = false;
    this.branches.forEach(function (n) {
        n.clearTrace();
    })
};


Node.prototype.findNodeStats = function () {

    const tCases = arbor.state.tree.casesByFilter(this.filterArray, this.missingArray);
    const N = tCases.length;

    const theSplit = arbor.state.dependentVariableSplit;

    if (theSplit) {

        const filter = arbor.state.dependentVariableSplit.oneBoolean;
        this.numerator = this.numberOfCasesWhere(tCases, filter);
        this.denominator = N;

        let sum = 0;
        const tDependentVarName = theSplit.attName;     //  dependent variable name

        tCases.forEach(function (aCase) {
            const c = aCase.values;
            if (theSplit.isCategorical) {
                sum += eval(filter) ? 1 : 0;
            } else {
                sum += Number(c[tDependentVarName]);    //  because it might be encoded as a string
            }
        }.bind(this));

        this.mean = sum / N;

        let sse = 0;

        tCases.forEach(function (aCase) {
            const c = aCase.values;
            const val = theSplit.isCategorical ? (eval(filter) ? 1 : 0) : c[tDependentVarName];
            sse += (val - sum / N) * (val - sum / N);       //      (value - mean)**2
        });

        this.ssdev = sse;

    } else {
        console.log("calculating findNodeStats without split");
    }
};

/**
 * Redo all the data for this node, and its subnodes.
 * This means getting its Boolean right and then getting the right cases from the parent
 */
Node.prototype.populateNode = function () {

    const tParent = this.parentNode();
    const tParentSplit = this.parentSplit(tParent);

    this.filterArray = tParent ? tParent.filterArray.slice(0) : [];     //  clone the array
    this.missingArray = tParent ? tParent.missingArray.slice(0) : [];     //  clone the array
    this.missingArray.push(tParentSplit.oneMissingBoolean);

    switch (this.LoR) {
        case "trunk":
            this.relevantParentSplitLabel = arbor.strings.sAllCases;
            this.filterArray = ["true"];
            //  note, no change in filter array. Still empty.
            break;
        case "L":
            this.relevantParentSplitLabel = tParentSplit.leftLabel;
            this.filterArray.push(tParentSplit.oneBoolean);
            break;
        case "R":
            this.relevantParentSplitLabel = tParentSplit.rightLabel;
            this.filterArray.push("!(" + tParentSplit.oneBoolean + ")");  //  reverse the Boolean
            break;
        default:

            if (!this.relevantParentSplitLabel) {   //  it may have been given one before
                this.relevantParentSplitLabel = "root";
            }

            this.filterArray = ["true"];
            this.missingArray = [`c["${tParentSplit.attName}"] ==='' `];   //  is the root variable missing??
            break;
    }

    this.branches.forEach(function (b) {
        b.populateNode();
    });

    this.findNodeStats();

    arbor.eventDispatcher.dispatchEvent("changeNode");
};


Node.prototype.numberOfCasesWhere = function (iCases, iBoolean) {
    let out = 0;
    iCases.forEach(function (aCase) {
        const c = aCase.values;
        if (eval(iBoolean)) {
            out += 1;
        }
    });
    return out;
};

Node.prototype.flipStopType = function () {
    this.stopSign = (this.stopSign === arbor.constants.diagnosisPlus) ? arbor.constants.diagnosisMinus : arbor.constants.diagnosisPlus;
    console.log("Switching node to " + this.stopSign);

    arbor.dispatchTreeChangeEvent("flipping node plus-minus");
};


/*
What is the depth of this node?
 */
Node.prototype.depth = function () {
    const tParent = this.parentNode();
    return (tParent) ? 1 + tParent.depth() : 0;
};

/*
How deep is the tree below this node?
 */
Node.prototype.depthDownFromHere = function () {
    if (this.branches.length === 0) {
        return 0;
    } else if (this.branches.length === 1) {
        return this.branches[0].depthDownFromHere() + 1;
    } else {
        const Ldepth = this.branches[0].depthDownFromHere() + 1;
        const Rdepth = this.branches[1].depthDownFromHere() + 1;
        return (Ldepth > Rdepth) ? Ldepth : Rdepth;
    }
};

Node.prototype.leafCount = function () {
    let oLeafCount = 0;
    if (this.branches.length > 0) {
        this.branches.forEach(function (iBranch) {
            oLeafCount += iBranch.leafCount();
        }.bind(this));
    } else {
        oLeafCount = 1;
    }

    return oLeafCount;
};

Node.prototype.descendantCount = function () {
    let oLeafCount = 0;
    if (this.branches.length > 0) {
        this.branches.forEach(function (iBranch) {
            oLeafCount += (1 + iBranch.descendantCount());
        }.bind(this));
    } else {
        oLeafCount = 0;
    }

    return oLeafCount;
};

/**
 * Result counts in the form {plusNumerator: , minusNumerator: , etc. }
 */
Node.prototype.getResultCounts = function () {
    let tOut = {
        sampleSize: 0,
        plusNumerator: 0,    //  number in this node (and descendants) that are truly POSITIVE and diag pos
        plusDenominator: 0,  //  number in this node ... that are diagnosed positive
        minusNumerator: 0,
        minusDenominator: 0,
        undiagNumerator: 0,    //  positives among undiagnosed
        undiagDenominator: 0,  //  total undiagnosed


        ssdFraction: null,
        sumOfSquaresOfDeviationsOfLeaves: 0
    };

    tOut.sampleSize = this.denominator;

    if (arbor.state.tree.rootNode.ssdev) {
        tOut.ssdFraction = this.ssdev / arbor.state.tree.rootNode.ssdev;
    }

    if (this.branches.length === 0) {       //  terminal node
        tOut.sumOfSquaresOfDeviationsOfLeaves = tOut.ssdFraction;

        if (this.stopSign === arbor.constants.diagnosisPlus) {
            tOut.plusNumerator = this.numerator;
            tOut.plusDenominator = this.denominator;
        } else if (this.stopSign === arbor.constants.diagnosisMinus) {
            tOut.minusNumerator = this.numerator;
            tOut.minusDenominator = this.denominator;
        } else if (this.stopSign === arbor.constants.diagnosisNone) {
            tOut.undiagNumerator = this.numerator;
            tOut.undiagDenominator = this.denominator;
        } else {
            alert(
                "Node.getResultCounts() unexpected data, neither "
                + arbor.constants.diagnosisPlus + ", "
                + arbor.constants.diagnosisMinus + ", nor "
                + arbor.constants.diagnosisNone
            );
        }
    } else {
        this.branches.forEach(function (ixBranchNode) {
            const tRC = ixBranchNode.getResultCounts();
            tOut.sumOfSquaresOfDeviationsOfLeaves += tRC.sumOfSquaresOfDeviationsOfLeaves;

            tOut.plusDenominator += tRC.plusDenominator;
            tOut.plusNumerator += tRC.plusNumerator;
            tOut.minusDenominator += tRC.minusDenominator;
            tOut.minusNumerator += tRC.minusNumerator;
            tOut.undiagDenominator += tRC.undiagDenominator;
            tOut.undiagNumerator += tRC.undiagNumerator;
        })
    }

    tOut.TP = tOut.plusNumerator;
    tOut.FP = tOut.plusDenominator - tOut.plusNumerator;
    tOut.FN = tOut.minusNumerator;
    tOut.TN = tOut.minusDenominator - tOut.minusNumerator;
    tOut.PU = tOut.undiagNumerator;
    tOut.NU = tOut.undiagDenominator - tOut.undiagNumerator;

    tOut.sensitivity = tOut.TP / (tOut.TP + tOut.FN);
    tOut.specificity = tOut.TN / (tOut.TN + tOut.FP);
    tOut.PPV = tOut.TP / (tOut.TP + tOut.FP);
    tOut.NPV = tOut.TN / (tOut.TN + tOut.FN);

    return tOut;
};

/**
 * returns the text that goes in the diagnostic "leaf" if this is a terminal node
 *
 * Something like
 *      Malignant (+)
 */
Node.prototype.getLeafText = function () {
    let tText = "";

    switch (this.stopSign) {
        case arbor.constants.diagnosisPlus:
            tText = arbor.state.dependentVariableSplit.leftLabel;
            break;
        case arbor.constants.diagnosisMinus:
            tText = arbor.state.dependentVariableSplit.rightLabel;
            break;
        default:
            break;
    }
    tText += " (" + this.stopSign + ")";

    return tText;
};

Node.prototype.toString = function () {
    let out = "Node " + this.arborNodeID + " (" + this.LoR + ") N = " + this.denominator;
    return out;
};

Node.prototype.friendlySubsetDescription = function () {
    let out = "";
    const tAllCasesText = arbor.strings.sAllCasesText;
    const tParent = this.parentNode();
    if (this.LoR !== "root" && this.LoR !== "trunk") {
        const tDesc = tParent.friendlySubsetDescription();

        const tNewLabel = (this.LoR === "L") ?
            `${tParent.attributeSplit.attName} ${arbor.strings.sfIsAre(1)} ${tParent.attributeSplit.leftLabel}` :
            `${tParent.attributeSplit.attName} ${arbor.strings.sfIsAre(1)} ${tParent.attributeSplit.rightLabel}`;

        if (tDesc === tAllCasesText) {
            out = tNewLabel;
        } else {
            out = tDesc + " &&nbsp;" + tNewLabel;
        }
    } else {
        out = tAllCasesText;
    }

    return out;
};

Node.prototype.longDescription = function () {

    let out = "";
    switch(this.LoR) {
        case "root":
            out += arbor.strings.sfPositiveNegativeNodeDescription();
            break;
        case "trunk":
            out += arbor.strings.sfNodeCasesDescription(this);
            break;
        case "L":
            out += arbor.strings.sfNodeCasesDescription(this);
            break;
        case "R":
            out += arbor.strings.sfNodeCasesDescription(this);
            break;
    }

    if (this.attributeSplit && this.LoR !== "root") {
        out +=
`&mdash;&mdash;
${arbor.strings.sThenWeAskAbout} ${this.attributeSplit.attName}`;
    }

    return out;
};

