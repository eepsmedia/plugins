/*
==========================================================================

 * Created by tim on 12/26/20.
 
 
 ==========================================================================
NetView.js in netwise

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

class NetView {

    static linkWidth = 20;
    static VBwidth = 1000;
    static nodeRadius = 60;
    static  rubberBandColor = "orange";

    constructor(iModel) {
        this.data = [];  //  array of nodes, Each is a NodeModel.
        this.nodeViews = [];
        this.firstNodeView = null;
        this.newLinkStartingNode = null;    //  dragging is happeniong if this is not null
        this.rubberBandEnd = null;          //  the location on the screen while dragging
        this.rubberBandTarget = null;       //  the node model

        this.VBstring = `${-NetView.VBwidth / 2}, ${-NetView.VBwidth / 2}, ${NetView.VBwidth}, ${NetView.VBwidth}`;


        this.paper = new Snap(document.getElementById("net-view"));

        this.paper.clear();

        this.linkPaper = new Snap(this.paper.attr("width"), this.paper.attr("height"));
        //  this.nodePaper = new Snap(this.paper.attr("width"), this.paper.attr("height"));
        this.paper.append(this.linkPaper);
        this.paper.attr({viewBox: this.VBstring})
        this.linkPaper.attr({
            x: -NetView.VBwidth / 2,
            y: -NetView.VBwidth / 2,
            width: NetView.VBwidth,
            height: NetView.VBwidth,
            viewBox: this.VBstring
        })


        iModel.nodes.forEach(aNode => {
            this.addOneNode(aNode, this.paper.node);
        });

    }

    clearNodes() {
        this.data = [];
        this.nodeViews = [];
        this.firstNodeView = null;
    }

    startNewLinkFrom(iNodeModel) {
        this.newLinkStartingNode = iNodeModel;  //  this also contains the x and y coords in thing.location
    }

    isMakingANewLink() {
        return this.newLinkStartingNode ? true : false;
    }

    setRubberBandTarget(iNodeModel) {
        this.rubberBandTarget = iNodeModel;
    }

    clearRubberBandTarget(iNodeModel) {
        if (iNodeModel) {
            if (iNodeModel === this.rubberBandTarget) {
                this.rubberBandTarget = null;
            }
        } else {
            this.rubberBandTarget = null;
        }
    }

    stopRubberBandFrom(iNode) {
        console.log(`stopping rubber band from ${iNode.name}`);
        if (this.rubberBandTarget) {
            console.log(`    make new link from ${iNode.name} to ${this.rubberBandTarget.name}`)
        } else {
            console.log(`    no rubber band target -> no link`);
        }
        linkyModel.newLink(iNode, this.rubberBandTarget);

        this.rubberBandTarget = null;
        this.rubberBandEnd = null;
        this.newLinkStartingNode = null;
    }

    addOneNode(iNodeModel) {
        if (!this.pModelInList(iNodeModel)) {
            this.data.push(iNodeModel);
            const aNewNodeView = new NodeView(iNodeModel, this);
            this.nodeViews.push(aNewNodeView);
            this.paper.append(aNewNodeView.paper);
            if (!this.firstNodeView) {
                this.firstNodeView = aNewNodeView;
            }
        }
    }

    pModelInList(iNodeModel) {
        this.data.forEach(aNodeModel => {
            if (iNodeModel.id === aNodeModel.id) {
                return true;
            }
        })
        return false;
    }

    draw(iTime) {
        //this.paper.clear();
        this.drawLinks();
        this.drawRubberBand();
        this.drawNodes(iTime);
    }

    drawRubberBand() {
        if (this.isMakingANewLink()) {
            const locStart = this.newLinkStartingNode.location;
            const locEnd = this.rubberBandEnd;

            if (locStart && locEnd) {

                this.linkPaper.line(locStart.x, locStart.y, locEnd.x, locEnd.y).attr({
                    stroke: NetView.rubberBandColor,
                    strokeWidth: NetView.linkWidth,
                })
            } else {
                console.log(`repairing rubber band issue`);
                this.rubberBandTarget = null;
                this.rubberBandEnd = null;
                this.newLinkStartingNode = null;

            }
        }
    }

    drawLinks() {
        const theOffset = 0;    //  NetView.nodeRadius;
        this.linkPaper.clear();
        //   this.linkPaper.attr({ viewBox: this.VBstring });
        this.data.forEach(node => {
            const thisX = node.location.x + theOffset;
            const thisY = node.location.y + theOffset;
            node.links.forEach(link => {
                const dest = linkyModel.getNodeNamed(link);
                if (dest) {
                    const isDouble = dest.links.includes(node.name);
                    const destX = dest.location.x + theOffset;
                    const destY = dest.location.y + theOffset;
                    this.linkPaper.line(thisX, thisY, destX, destY).attr({
                        stroke: "#fff",
                        strokeWidth: (isDouble ? NetView.linkWidth * 2 : NetView.linkWidth),
                    });
                }
            })
        })
    }

    drawNodes(iTime) {
        this.nodeViews.forEach(NV => {
            if (iTime) {
                const tNewNodePaper = NV.paper.attr({
                    x: NV.data.location.x - NetView.nodeRadius,
                    y: NV.data.location.y - NetView.nodeRadius,
                    width: NetView.nodeRadius * 2,
                    height: NetView.nodeRadius * 2,
                });
                NV.showSelectionAndHover(NV.data === this.rubberBandTarget);
            } else {
                const tNewNodePaper = NV.paper.attr({
                    x: NV.data.location.x - NetView.nodeRadius,
                    y: NV.data.location.y - NetView.nodeRadius,
                    width: NetView.nodeRadius * 2,
                    height: NetView.nodeRadius * 2,
                });
                NV.showSelectionAndHover(NV.data === this.rubberBandTarget);
            }
        })
    }
}

class NodeView {
    static  VBWidth = 10;
    static  ringThickness = 1;
    static  ringColor = "#34a";
    static  ringHoverColor = "#f66";
    static  innerColor = "white";
    static  innerColorSelected = "#abc";

    constructor(iNodeModel, iNetView) {
        this.data = iNodeModel;
        this.myNetView = iNetView;
        this.xStart = 0;
        this.yStart = 0;
        this.disk = null;
        this.ring = null;

        const VBstring = `${-NodeView.VBWidth / 2} ${-NodeView.VBWidth / 2} ${NodeView.VBWidth}  ${NodeView.VBWidth}`;
        this.paper = Snap(50, 50).attr({viewBox: VBstring});
        this.ring = this.paper.circle(0, 0, NodeView.VBWidth / 2)
            .attr({fill: NodeView.ringColor});
        this.disk = this.paper.circle(0, 0, NodeView.VBWidth / 2 - NodeView.ringThickness);
        this.disk.attr({fill: NodeView.innerColor})
            .click(this.clickOnNode.bind(this));

        this.paper.drag(move, start, end, this, this, this);
        this.paper.hover(hoverin, hoverout, this, this);

        function move(dx, dy, x, y, iEvent) {

            if (this.myNetView.paper.node) {
                const CTM = this.myNetView.paper.node.getScreenCTM();
                const CTMI = CTM.inverse();

                let screenCoordinates = this.myNetView.paper.node.createSVGPoint();
                screenCoordinates.x = x;        //  iEvent.offsetX;        //
                screenCoordinates.y = y;        //  iEvent.offsetY;        //

                const viewCoordinates = screenCoordinates.matrixTransform(CTMI);

                if (this.myNetView.isMakingANewLink()) {
                    this.myNetView.rubberBandEnd = viewCoordinates;
                } else {
                    this.data.location.x = viewCoordinates.x;       //  this.xStart + dx;
                    this.data.location.y = viewCoordinates.y;       //  this.yStart + dy;
                }

                /*
                                console.log(`Moving ${this.data.name} at (x,y) (${x}, ${y}) by (${dx}, ${dy}) ...
                            that is, from screen (${Math.round(screenCoordinates.x)}, ${Math.round(screenCoordinates.y)})
                            that is, from view (${Math.round(this.xStart)}, ${Math.round(this.yStart)})
                            to view (${Math.round(this.data.location.x)}, ${Math.round(this.data.location.y)})`);
                */
                netwiseUI.update();
            } else {
                console.log(`no parent paper right now`);
            }
        }

        function start(x, y, iMouseEvent) {
            console.log(`Starting drag at ${x}, ${y} for ${this.data.name}`);
            this.xStart = this.data.location.x;
            this.yStart = this.data.location.y;

            if (iMouseEvent.altKey) {
                this.myNetView.startNewLinkFrom(this.data);
            }
        }

        function end(iMouseEvent) {
            console.log(`End drag of ${this.data.name}`);
            if (this.myNetView.isMakingANewLink()) {    //  now that's over
                this.myNetView.stopRubberBandFrom(this.data);
            }
            netwiseUI.update();
        }

        function hoverin() {
            if (this.myNetView.isMakingANewLink()) {
                this.myNetView.setRubberBandTarget(this.data);
            }
            netwiseUI.update();
        }

        function hoverout() {
            if (this.myNetView.isMakingANewLink()) {
                this.myNetView.clearRubberBandTarget(this.data);
            }
            netwiseUI.update();
        }
    }

    showSelectionAndHover(iHover = false) {
        const theColor = this.data.selected ? NodeView.innerColorSelected : NodeView.innerColor;
        this.disk.attr({fill : theColor});

        let theRingColor = NodeView.ringColor;
        if (iHover) {
            theRingColor =NodeView.ringHoverColor;
        }

        this.ring.attr({fill : theRingColor});

    }

    clickOnNode(event) {
        console.log(`click on node ${this.data.name}`);
        this.data.selected = !this.data.selected;

        connect.setCODAPSelection();    //  set the whole selection list
        netwiseUI.update();     //  make sure the newly selected dot gets selected
    }
}