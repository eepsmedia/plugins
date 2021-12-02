/**
 * Created by tim on 9/26/16.


 ==========================================================================
 NodeZoneView.js in Baum.

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

/**
 * A NodeZoneView is the rectangular area the nodes appear in.
 * A NodeBoxView is the image for the node itself.
 *
 * NOTE that the NodeBoxView gets redrawn in the constructor.
 *
 * Every NodeZoneView has ONE node and (optionally) TWO subtrees (in array this.subNodeZones).
 * This class also draws the lines connecting nodes and the text labels above the child nodes
 *
 * @param iNode     the root node (model) of this zoneView
 * @param iParent   the parent zoneView (view) of this zoneView. If this is the top one, the parent is the TreePanelView
 * @constructor
 */
NodeZoneView = function (iNode, iParent) {
    this.myNode = iNode;        //  model
    this.myBoxView = null;      //  view of the box, lives inside this view, set in redrawEntireZone

    this.nodeBoxLocation = {x: 0, y: 0};   //  x, y, width, height, xc, yc ... for the NodeBoxView

    this.myPanel = iParent.myPanel; //  is the panel for the root view, everybody gets this from the TreePanelView.
    this.myLocation = {x: 0, y: 0};   //      my coordinates in the parent view. Possibly redundant. Set in moveTo().

    if (this.myParentZoneView === this.myPanel) {
        this.myParentZoneView = null;       //      we are the top NodeZoneView
    }

    this.paper = Snap(100, 100).attr({"id": "initial-NZV-" + iNode.arborNodeID});  // to be reset

    this.redrawEntireZone();
};

NodeZoneView.prototype.moveTo = function (iLoc) {
    this.myLocation = iLoc;
    this.paper.attr(iLoc);
};


/**
 * Redraw this entire "Zone", recursively creating subNodeZones and asking them to redraw.
 * Everything is drawn in the coordinates of this Zone.
 *
 * Note: Recursive. We use this very routine to draw subZones.
 *
 * @param iLoc   object with x, y. Coordinates of x, y in parent's system
 */
NodeZoneView.prototype.redrawEntireZone = function () {  //  object with x, y

    let currentTotalHeight = 0;   //  we will accumulate these as we add elements
    let currentTotalWidth = 0;
    let tRightX = 0;
    let tCurrentX = 0;
    let tCurrentY = 0;

    const theID = `${this.myNode.LoR}-NodeZV-${this.myNode.arborNodeID}`;
    this.paper.attr({"id": theID});      //  in the coordinates of the parent
    this.paper.clear();

    console.log(`redraw ${theID}`);

    this.myBoxView = new NodeBoxView(this.myNode, this);    //  create and draw, but not installed. So size is good.
    this.myPanel.nodeBoxViewArray.push(this.myBoxView);     //  record the NBV in the panel.

/*
    this.leaf = (this.myNode.branches.length === 0 )    //      && arbor.state.oShowDiagnosisLeaves)
        ? new Leaf({node: this.myNode}) : null;          //  our leaf
*/

    const boxPaper = this.myBoxView.paper;         //  this NodeBoxView was created just above
    this.paper.append(boxPaper);    //  attach it, but it's not yet in the right place.

    //  we need to know the width of this entire ZoneView in order to place the NodeBoxView.
    currentTotalHeight = Number(boxPaper.attr("height"));
    currentTotalWidth = Number(boxPaper.attr("width"));

    //  now those two variables account for the size of the node box ONLY.

    let topCentersOfSubZoneBoxes = {};
    let subZoneLabels = {};

    //  in addition to the node itself, you need subNodeZones

    tCurrentY = currentTotalHeight;
    const totalBranches = this.myNode.branches.length;

    switch (totalBranches) {
        case 2:
            tCurrentY += arbor.constants.treeLineLabelHeight;   //  there will be labels [only] if there are 2 branches
        case 1:
            tCurrentY += arbor.constants.treeObjectPadding;    //  top of subZoneViews

            let branchNumber = 0;

            this.myNode.branches.forEach(function (iBranch) {
                branchNumber++;

                //  make text labels (need for size, will move to the right place later)
                //  only use the text for cases with 2 branches (trunk doesn't get one)
                const tText = this.paper.text(0, 0, (totalBranches === 2) ? iBranch.relevantParentSplitLabel : "");
                const labelTextWidth = tText.getBBox().width;
                //  no label for the trunk
                subZoneLabels[iBranch.LoR] = tText;

                //  make a sub-view. This is the recursion. Its size wil be correct; we need that to find our own.
                const tSubZoneView = new NodeZoneView(iBranch, this);
                this.paper.append(tSubZoneView.paper);
                const subZoneSize = tSubZoneView.getZoneViewSize();   //  this subZoneView has a good width

                //  adjust total height for this zone
                currentTotalHeight = ((tCurrentY + subZoneSize.height) > currentTotalHeight)
                    ? tCurrentY + subZoneSize.height : currentTotalHeight;

                //  calculate the current total width, making it wide as appropriate
                //  based only on sub zone views at this point; we have not taken the BoxView into account
                const overhang = labelTextWidth > subZoneSize.width ? labelTextWidth - subZoneSize.width : 0;

                if ((tCurrentX + subZoneSize.width + overhang) > currentTotalWidth) {
                    currentTotalWidth = tCurrentX + subZoneSize.width + overhang;
                    tCurrentX += overhang / 2;
                } else if (branchNumber === 2) {    //  currentTotalWidth is enough to cover both children, Right-justify the right one
                    tCurrentX = currentTotalWidth - subZoneSize.width - overhang / 2;
                } else if (totalBranches === 1) {
                    //  the current total width (the width of this zone's node box, boxPaper) > that of our zone.
                    //  center us!
                    tCurrentX = (currentTotalWidth - subZoneSize.width - overhang) / 2;
                }

                tSubZoneView.paper.attr({
                    x: tCurrentX,
                    y: tCurrentY,
                    id: "NodeZV-for-Node-" + iBranch.arborNodeID
                });

                //  calculate the centers of the sub-zones; this is where the lines go to their NodeZoneBoxes.
                let boxtopX = tCurrentX + subZoneSize.width / 2;

                topCentersOfSubZoneBoxes[iBranch.LoR] = {
                    x: boxtopX,
                    y: tCurrentY
                }; //  centered on top of new zone;

                tCurrentX += subZoneSize.width + arbor.constants.treeObjectPadding + overhang / 2; //  minimum position for the right side
            }.bind(this));

            break;

        case 0:     //  it's a leaf! update and position the leaf
            tCurrentY += arbor.constants.treeObjectPadding;     //  top of leaf
            this.leaf = new Leaf({node: this.myNode});          //  our leaf

            if (true) {     //  (arbor.state.oShowDiagnosisLeaves) {
                this.paper.append(this.leaf.paper);
                const tLeafDimensions = this.leaf.refreshLeaf();

                //  in case the leaf label is longer than the size of the node box

                if (tLeafDimensions.width > currentTotalWidth) {
                    currentTotalWidth = tLeafDimensions.width;
                }
                this.leaf.paper.attr({
                    x: currentTotalWidth / 2 - tLeafDimensions.width / 2,
                    y: tCurrentY
                });
                currentTotalHeight = tCurrentY + tLeafDimensions.height;   //  todo: need padding??
            }
            break;
    }

    //  Those contents limit the extent of this zone view; we resize our paper

    this.paper.attr({
        "height": currentTotalHeight,
        "width": currentTotalWidth
    });

    //  center the node box at the top of this NodeZoneView

    const nodeBoxX = Number(this.paper.attr("width")) / 2 - Number(boxPaper.attr("width")) / 2;
    this.myBoxView.paper.attr({x: nodeBoxX});

    //  add the lines and text

    this.myNode.branches.forEach(b => {
        let x1 = nodeBoxX;
        const y1 = Number(boxPaper.attr("height"));
        const x2 = topCentersOfSubZoneBoxes[b.LoR].x;
        const y2 = topCentersOfSubZoneBoxes[b.LoR].y;

        const W = Number(boxPaper.attr("width"));
        switch (b.LoR) {
            case "trunk":
                x1 += W / 2;
                break;
            case "L":
                x1 += W / 3;
                break;
            case "R":
                x1 += 2 * W / 3;
                break;
        }

        const aLine = this.paper.line(x1, y1 - 8, x2, y2 + 8).attr({
            strokeWidth: 8,
            stroke: (b.onTrace ? arbor.constants.onTraceColor : "white")
        });

        const maskRect = this.paper
            .rect(0, Number(boxPaper.attr("height")), arbor.displayWidth(), y2 - y1)
            .attr({fill: "#fff"});

        const theTextSVG = subZoneLabels[b.LoR];
        const newTextHalfWidth = theTextSVG.getBBox().width / 2;
        theTextSVG.attr({x: x2 - newTextHalfWidth, y: y2 - 2});

        const theLineGroup = this.paper.g(aLine, theTextSVG).attr({mask: maskRect});

        //  the tool tip on the link line
        const tBranchDescription = this.myNode.attributeSplit.branchDescription(b.LoR);
        theLineGroup.append(Snap.parse("<title>" + tBranchDescription + "</title>"));

    });

};

NodeZoneView.prototype.getZoneViewSize = function () {
    return ({
        width: Number(this.paper.attr("width")),
        height: Number(this.paper.attr("height"))
    })
};