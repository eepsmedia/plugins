/**
 * Created by tim on 9/26/16.


 ==========================================================================
 TreeView.js in make-a-tree.

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
 * This is a view that contains ALL of the views of the arbor display.
 * That is, it has
 *
 *      * a NodeZoneView (for the tree itself)
 *
 *      Note that the actual drawing of the entire tree really takes place recursively
 *      starting with constructing the first (root) `NodeZoneView`.
 *
 *
 * @constructor
 */
TreePanelView = function ( ) {
    this.myPanel = this;            //  we are the top of the hierarchy
    this.lastMouseDownNodeView = null;
    this.rootNodeZoneView = null;           //      the top NodeZoneView for this tree, houses the dependent variable
    this.nodeBoxViewArray = [];             //      list of all node box views, for highlighting

    /**
     * The paper for the entire TreePanelView.
     * @type {*|*|*|*|*}
     */

    this.panelPaper = new Snap(document.getElementById(arbor.constants.kTreePanelDOMName));
    this.treePanelBackgroundRect = this.panelPaper
        .rect(0, 0, 10, 10)
        .attr({"fill" : arbor.constants.panelBackgroundColor, "id" : "tree-panel-background-rect"});     //      will be a rectangle for the background


    this.draggingAttribute = null;
    this.rootNodeZoneView = null;

    treePanelMouseUpHandler = function(e) {
        const dragStatus = this.draggingAttribute ? "dragging" : "not dragging";
        console.log(` ...mouse up in tree panel view handler: ${dragStatus}`);
    }.bind(this)

    if (this.panelPaper.events !== undefined) {
        console.log(`     ...making TPV, ${this.panelPaper.events.length} events`);
        this.panelPaper.events = [];
    }
    // this.panelPaper.unmouseup(treePanelMouseUpHandler);
    if (this.panelPaper.events !== undefined) {
        console.log(`     ...after unmouseup, ${this.panelPaper.events.length} events`);
    }
    // this.panelPaper.mouseup(treePanelMouseUpHandler);
    if (this.panelPaper.events !== undefined) {
        console.log(`     ...make TPV, handlers set, ${this.panelPaper.events.length} events`);
    }
    this.redrawEntirePanel();
};


TreePanelView.prototype.createDragSVGPaper = function (iAttInBaum, iWhere) {
    const tLabelHeight = arbor.constants.nodeHeightInCorral;
    const tLabel = iAttInBaum.attributeName;
    const tPaper = Snap(20, tLabelHeight).attr({x: iWhere.x, y: iWhere.y});
    let tBG = tPaper.rect(0, 0, 20, tLabelHeight).attr({fill: "#cde"});

    let tTX = tPaper.text(0, 0, tLabel);
    const tBBox = tTX.getBBox();

    const tGap = (tLabelHeight - tBBox.height) / 2;

    tPaper.attr({width: tBBox.width + 2 * tGap});
    tBG.attr({width: tPaper.attr("width")});
    tTX.attr({
        x: tGap,
        y: tLabelHeight - tGap
    });

    //  tPaper.drag(this.doDrag, null, null, this, this, this);
    return tPaper;
};


/**
 * redraws the tree in the view GIVEN a completely updated set of model data (Trees, Nodes, AttInBaums)
 */
TreePanelView.prototype.redrawEntirePanel = function (  ) {

    this.panelPaper.clear();

    if (arbor.state.tree) {    //  if not, there is no root node, and we display only the background

        /**
         * This creates the background `rect` at the very bottom of the view hierarchy.
         * Now it has no size; we fix that towards the end of this method.
         */
        this.treePanelBackgroundRect = this.panelPaper.rect().attr({
                fill : arbor.constants.panelBackgroundColor,
                id : "tree-background-rect",
            });

        this.nodeBoxViewArray = [];     //  blank this array

        //  draw recursively starting with the root
        this.rootNodeZoneView = new NodeZoneView(arbor.state.tree.rootNode, this);

        this.panelPaper.append(this.rootNodeZoneView.paper);

        const tPad = arbor.constants.treeObjectPadding;
        //  console.log("Redrawing TreePanelView to " + Math.round(arbor.displayWidth()) + " px");

        const rootZoneSize = this.rootNodeZoneView.getZoneViewSize();
        /**
         * Note that the next call is to a NodeZoneView, NOT the TreePanelView.
         * In particular, this is the main NodeZoneView, the "root" view, if you will.
         */
        this.rootNodeZoneView.paper.attr({
            x: arbor.displayWidth() / 2 - rootZoneSize.width / 2,
            y: tPad
        });

        arbor.displayResults(arbor.state.tree.results());    //  strip of text at the bottom

        const tViewHeight = rootZoneSize.height + 2 * tPad;   //  in the panel view, yes, above and below,

        //  set size of this panel and its background
        this.panelPaper.attr({
            width: arbor.displayWidth(),
            height: tViewHeight
        });

        //  fix the size of the background `rect`.
        this.treePanelBackgroundRect.attr({
            width: arbor.displayWidth(),
            height: tViewHeight
        });

    } else {

    }

};

TreePanelView.prototype.startDrag = function (iAtt, paper, event) {
    this.draggingAttribute = iAtt;
    const tWhere = {x: event.offsetX, y: event.offsetY};
    this.dragSVGPaper = this.createDragSVGPaper(this.draggingAttribute, tWhere);
    this.panelPaper.append(this.dragSVGPaper);

};

TreePanelView.prototype.stopDrag = function (paper, event) {
    console.log("stopDrag " + event.offsetX + " " + event.offsetY);
    this.draggingAttribute = null;
    this.dragSVGPaper.undrag();
    this.dragSVGPaper.clear();
    this.dragSVGPaper = null;
};

TreePanelView.prototype.doDrag = function (dx, dy, x, y, event) {
    const tWhere = {x: event.offsetX, y: event.offsetY};
    this.dragSVGPaper.attr(tWhere);
};

TreePanelView.prototype.highlightDropZones = function(iHighlight) {
    console.log(`drop zone highlighting ${ iHighlight ? "on" : "off"}`);

    this.nodeBoxViewArray.forEach( (nbv) => {
        nbv.highlight(iHighlight ? "nearby" : "off");
    })
};

TreePanelView.prototype.NBVfromNodeID = function(iNodeID) {
    let out = null;

    this.nodeBoxViewArray.forEach( (nbv) => {
        if (nbv.myNode.arborNodeID === iNodeID) {
            out = nbv;
        }
    })
    return out;

};