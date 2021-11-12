/**
 * Created by tim on 9/26/16.


 ==========================================================================
 NodeBoxView.js in "Baum."

 Author:   Tim Erickson

 Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

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

/* global Snap */

NodeBoxView = function (iNode, iZoneView) {
    this.myNode = iNode;
    this.myZoneView = iZoneView;        //  the view I am embedded in
    this.paper = new Snap(133, 133).attr({"id": "NBV-" + iNode.arborNodeID});
    this.highlightSVG = null;

    this.paper.unmouseup(this.mouseUpHandler.bind(this));
    this.paper.mouseup(this.mouseUpHandler.bind(this));

    // this.paper.unmouseover(this.mouseOverHandler.bind(this));
    // this.paper.mouseover(this.mouseOverHandler.bind(this));

    //  We watch this event for changes from the model,
    //  e.g., changes in number or text.
    arbor.eventDispatcher.addEventListener("changeNode", this.handleNodeChange, this);

    this.kStripeHeight = 20;

    this.stripes = [];  //  the box is made up of a variable number of "Stripes"

    //  the tool tip
    try {
        this.paper.append(Snap.parse("<title>" + this.myNode.longDescription() + "</title>"));
    } catch (msg) {
        console.log(`problem with setting the node tool tip: ${msg}`);
    }

    //  mousedown handler

    this.paper.mousedown(function (iEvent) {
        this.myZoneView.myPanel.lastMouseDownNodeView = this;   //  a.k.a. arbor.treePanelView.lastMouseDownNodeView
        console.log(`... mouse down in NodeBoxView node ${this.myNode.arborNodeID}`)
    }.bind(this));

    this.drawNodeBoxView();
    //  return this;
};

/*
NodeBoxView.prototype.mouseOverHandler = function(iEvent) {

    if (arbor.dropManager.currentlyDraggingCODAPAttribute) {
        this.highlightSVG.attr({fill: "red"});
    } else {
        this.highlightSVG.attr({fill: "blue"});

    }
},
*/

/**
 * Handle a mouse up in the node, from the DOM.
 * Note: this does not handle drops of attributes.
 *
 * @param iEvent
 */
NodeBoxView.prototype.mouseUpHandler = function (iEvent) {
    console.log("    Mouse up in view for " + this.myNode.toString());
    const tMouseDownPlace = arbor.treePanelView.lastMouseDownNodeView;

    if (tMouseDownPlace) {
        if (this === tMouseDownPlace) {     //  it's a click
            if (iEvent.shiftKey || iEvent.altKey || iEvent.ctrlKey) {
                console.log(`Mouse up (after mouse down) in ${this.myNode}`);
                this.myNode.stubThisNode();
            }
            //  todo: select the cases here!
        }
        //  it's not a click, we've dragged in from somewhere else...

        //  dragged in from another node, so we branch it by THAT node's attribute, if it exists
        else if (tMouseDownPlace instanceof NodeBoxView) {
            if (tMouseDownPlace.myNode.attributeSplit) {
                const tName = tMouseDownPlace.myNode.attributeSplit.attName;
                const tAtt = arbor.getAttributeByName(tName);
                this.myNode.branchThisNode(tAtt);
            }
        }
    }

    arbor.setFocusNode(this.myNode);

};

/**
 * Event handler for the "changeNode" event
 *
 * @param iEvent
 */
NodeBoxView.prototype.handleNodeChange = function (iEvent) {
    console.log("changeNode event");
    this.getNodeBoxViewSize();
    //  this.redrawNodeBoxView();
};

/**
 * Find the size of an entire NodeBoxView. This includes the "padding" outside the text.
 * Note that that is only in width!
 * The main thing here is to find the maximum lengths of the strings (and icons) we display,
 * in order to find the width.
 *
 */
NodeBoxView.prototype.getNodeBoxViewSize = function () {

    console.log("Get size for box id: "
        + this.myNode.arborNodeID + " w: "
        + this.paper.attr("width") + " h: "
        + this.paper.attr("height"));
    return {
        width: this.paper.attr("width"),
        height: this.paper.attr("height")
    };
};

NodeBoxView.prototype.adjustPaperSize = function () {

    //  find the maximum width of the stripes

    const tMaxWidthStripe = this.stripes.reduce(function (a, v) {
        const vCurrentWidth = v.minimumWidth();
        const aCurrentWidth = a.minimumWidth();

        return (vCurrentWidth > aCurrentWidth) ? v : a;
    });

    this.paper.attr({
        height: this.kStripeHeight * this.stripes.length,
        width: tMaxWidthStripe.minimumWidth()
    });
};

NodeBoxView.prototype.highlight = function(iMode) {
    switch(iMode) {
        case "on" :
            this.highlightSVG.attr({
                fillOpacity : arbor.constants.kHighlightDropZoneOpacity,
                strokeWidth : arbor.constants.kHighlightStrokeWidth,
                display : "",
            });
            break;

        case "nearby":
            this.highlightSVG.attr({
                fillOpacity : 0.0, strokeWidth : arbor.constants.kHighlightStrokeWidth,
                display : ""
            });
            break;

        case "off":
            this.highlightSVG.attr({/*fillOpacity : 0.0, strokeWidth : 0,*/ display : "none"});
            break;

        default:
            this.highlightSVG.attr({/*fillOpacity : 0.0, strokeWidth : 0,*/ display : "none"});
            break;

    }
},

NodeBoxView.prototype.drawNodeBoxView = function () {

    //      console.log("Redraw node box: " + this.myNode.arborNodeID);
    this.paper.clear(); //  nothing on this paper
    this.theGroup = this.paper.g();     //  fresh group

    //  handle mouseUp events in the NodeBoxView
    //  this.theGroup.mouseup(this.mouseUpHandler.bind(this));
    this.theGroup.node.setAttribute("class", "node-box-view-group");  //  this is that css thing
    //  this.theGroup.node.setAttribute("id", `node-box-view-group-${this.myNode.arborNodeID}`);  //  set above as NBV-nn

    this.stripes = [];  //  fresh set of stripes

    //  The tool tip for the box itself
    this.paper.append(Snap.parse("<title>" + this.myNode.longDescription() + "</title>"));

    //  various useful constants

    const tNoCases = (this.myNode.denominator === 0);
    const tParent = this.myNode.parentNode();     //  null if this is the root.
    const tParSplit = this.myNode.parentSplit(tParent);  //  the parent's Split. If root, this is the dependant variable split

    let tDataBackgroundColor = (this.myNode === arbor.focusNode) ? "yellow" : "white";
    if (this.myNode.onTrace) {
        tDataBackgroundColor = arbor.constants.onTraceColor;
    }
    const tDataTextColor = "#474";

    if (this.isRoot()) {
        this.stripes.push(this.makeRootStripe());    //  make root node stripe
    }

    if (tNoCases) {
        const tStripe = new Stripe(this, {text: arbor.strings.sNoCases, textColor: "#696", bgColor: tDataBackgroundColor}, null);
        this.stripes.push(tStripe);
    } else {

        //  data stripes

        if (arbor.state.treeType === arbor.constants.kClassTreeType) {
            this.makeAndAddClassificationDataStripes({text: tDataTextColor, bg: tDataBackgroundColor});
        } else {    //  this is a regression tree
            this.makeAndAddRegressionDataStripes({text: tDataTextColor, bg: tDataBackgroundColor});
        }

        //  make stripe for the name of the branching variable, if any

        if (this.myNode.branches.length > 0) {
            this.stripes.push(this.makeBranchingStripe());
        }
    }

    this.adjustPaperSize();   //  update this.paper's dimensions based on the new text in stripes

    const tArgs = {
        height: this.kStripeHeight,
        width: this.paper.attr("width"),      //  this includes padding
        x: 0,
        y: 0
    };

    this.stripes.forEach(function (s) {
        s.resizeStripe(tArgs);
        this.paper.append(s.paper);
        this.theGroup.add(s.paper);
        tArgs.y += this.kStripeHeight;
    }.bind(this));

    this.highlightSVG = this.paper.rect(0, 0, this.paper.attr("width"), this.paper.attr("height"));
    this.highlightSVG.attr({
        fill : arbor.constants.kNodeHighlightColor, fillOpacity : 0,
        stroke : arbor.constants.kNodeHighlightColor, strokeWidth : 0, strokeOpacity: arbor.constants.kHighlightDropZoneStrokeOpacity,
    });
    //  return this.paper;
};

NodeBoxView.prototype.makeRootStripe = function () {
    let tText;

    if (arbor.state.treeType === arbor.constants.kClassTreeType) {
        tText = `${arbor.strings.sPredict} ${arbor.state.dependentVariableSplit.attName} 
        = ${arbor.state.dependentVariableSplit.leftLabel}`;
    } else {
        tText = `${arbor.strings.sPredict} ${arbor.constants.kMu}(${arbor.state.dependentVariableSplit.attName})`;
    }

    const tStripe = new Stripe(
        this,
        {text: tText, textColor: "white", bgColor: arbor.state.dependentVariableSplit.attColor},
        "dependent-variable"
    );
    return tStripe;
};

NodeBoxView.prototype.makeAndAddClassificationDataStripes = function (iColors) {
    let tStripe;

    /**
     * Create the string that describes the "count" of cases in the node,
     * format depends on options
     */
    let tCountText = `tCount foo`;
    switch (arbor.state.oNodeDisplayNumber) {
        case arbor.constants.kUseOutOfInNodeBox:
            tCountText = `${this.myNode.numerator} ${arbor.strings.sOf} ${this.myNode.denominator}`;
            break;
        case arbor.constants.kUseRatioInNodeBox:
            tCountText = `${this.myNode.numerator} ${arbor.strings.sTo} ${this.myNode.denominator - this.myNode.numerator}`;
            break;
        case arbor.constants.kUseFractionInNodeBox:
            tCountText = `${this.myNode.numerator}/${this.myNode.denominator}`;
            break;
    }

    /**
     * Create the string that describes the "proportion" of successes in the node,
     * format depends on options
     */
    let tProportionText = `tProp foo`;
    let tProportion = (this.myNode.denominator === 0) ? "null" : this.myNode.numerator / this.myNode.denominator;
    switch (arbor.state.oNodeDisplayProportion) {
        case arbor.constants.kUsePercentageInNodeBox:
            tProportionText = (this.myNode.denominator !== 0) ? `${(tProportion * 100).toFixed(1)}%` : "n/a";
            break;
        case arbor.constants.kUseProportionInNodeBox:
            tProportionText = (this.myNode.denominator !== 0) ? `p = ${tProportion.newFixed(4)}` : "n/a";
            break;
        case arbor.constants.kOmitProportionInNodeBox:
            tProportionText = ``;
            break;
    }

    if (this.myNode.branches.length > 0) {    //  non-terminal, classification tree

        const tText = (tProportionText) ? `${tCountText}, ${tProportionText}` : tCountText;

        tStripe = new Stripe(
            this,
            {text: tText, textColor: iColors.text, bgColor: iColors.bg},
            "data"
        );
        this.stripes.push(tStripe);

    } else {            //  this is a terminal node, classification tree
        //  data stripe
        tStripe = new Stripe(
            this,
            {text: tCountText, textColor: iColors.text, bgColor: iColors.bg},
            "data"
        );
        this.stripes.push(tStripe);

        if (tProportionText) {
            const tProportionStripe = new Stripe(
                this,
                {text: tProportionText, textColor: iColors.text, bgColor: iColors.bg},
                "data"
            );
            this.stripes.push(tProportionStripe);
        }
    }
};

NodeBoxView.prototype.makeAndAddRegressionDataStripes = function (iColors) {
    let tText;
    let tStripe = null;
    let tMeanText = arbor.state.dependentVariableSplit.isCategorical ?
        "p = " + this.myNode.mean.newFixed(3) :
        arbor.constants.kMu + " = " + this.myNode.mean.newFixed(3);      //  that's unicode "mu"


    if (this.myNode.branches.length > 0) {    //  put all data on one line
        tText = "N = " + this.myNode.denominator + ", " + tMeanText;
        tStripe = new Stripe(
            this,
            {text: tText, textColor: iColors.text, bgColor: iColors.bg},
            "data"
        );
        this.stripes.push(tStripe);
    } else {
        //  regression, terminal : two lines:
        tText = "N = " + this.myNode.denominator;
        tStripe = new Stripe(
            this,
            {text: tText, textColor: iColors.text, bgColor: iColors.bg},
            "data"
        );
        this.stripes.push(tStripe);

        tText = tMeanText;
        tStripe = new Stripe(
            this,
            {text: tText, textColor: iColors.text, bgColor: iColors.bg},
            "data"
        );
        this.stripes.push(tStripe);
    }
};

NodeBoxView.prototype.makeBranchingStripe = function () {
    const tStripe = new Stripe(
        this,
        {
            text: this.myNode.attributeSplit.attName + "?",
            textColor: "white",
            bgColor: this.myNode.attributeSplit.attColor
        },
        "branching"
    );
    return tStripe;
};

NodeBoxView.prototype.isRoot = function () {
    return (this.myNode === arbor.state.tree.rootNode);
};


