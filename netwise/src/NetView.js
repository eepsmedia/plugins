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

    constructor (iModel) {
        this.data = [];  //  array of nodes, Each is a NodeModel.
        this.nodeViews = [];
        this.firstNodeView = null;

        this.VBstring = `${-NetView.VBwidth/2}, ${-NetView.VBwidth/2}, ${NetView.VBwidth}, ${NetView.VBwidth}`;


        this.paper = new Snap(document.getElementById("net-view"));

        this.paper.clear();

        this.linkPaper = new Snap(this.paper.attr("width"), this.paper.attr("height"));
        this.nodePaper = new Snap(this.paper.attr("width"), this.paper.attr("height"));
        this.paper.append(this.linkPaper);
        this.paper.attr({ viewBox: this.VBstring })
        this.linkPaper.attr({
            x : -NetView.VBwidth/2,
            y : -NetView.VBwidth/2,
            viewBox: this.VBstring
        })


        iModel.nodes.forEach( aNode => {
            this.addOneNode(aNode, this.paper.node);
        });

    }

    clearNodes() {
        this.data = [];
        this.nodeViews = [];
        this.firstNodeView = null;
    }

    addOneNode(iNodeModel) {
        if (!this.pModelInList(iNodeModel)) {
            this.data.push(iNodeModel);
            const aNewNodeView = new NodeView(iNodeModel, this.paper.node);
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

    draw (iTime) {
        //this.paper.clear();
        this.drawLinks();
        this.drawNodes(iTime);
    }

    drawLinks() {
        this.linkPaper.clear();
     //   this.linkPaper.attr({ viewBox: this.VBstring });
        this.data.forEach(node => {
            const thisX = node.location.x + NetView.nodeRadius;
            const thisY = node.location.y + NetView.nodeRadius;
            node.links.forEach(link => {
                const dest = netwiseModel.getNodeNamed(link);
                if (dest) {
                    const destX = dest.location.x + NetView.nodeRadius;
                    const destY = dest.location.y + NetView.nodeRadius;
                    this.linkPaper.line(thisX, thisY, destX, destY).attr({
                        stroke: "#fff", strokeWidth: NetView.linkWidth,
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
            } else {
                const tNewNodePaper = NV.paper.attr({
                    x: NV.data.location.x - NetView.nodeRadius,
                    y: NV.data.location.y - NetView.nodeRadius,
                    width: NetView.nodeRadius * 2,
                    height: NetView.nodeRadius * 2,
                });
            }
        })
    }
}

class NodeView {
    static  VBWidth = 10;
    static  ringThickness = 1;

    constructor(iNodeModel, iParentNode) {
        this.data = iNodeModel;
        this.parentNode = iParentNode;
        this.xStart = 0;
        this.yStart = 0;

        this.innerColor = "white";
        if (this.data.name === "A") {
            this.innerColor = "goldenrod";
        }

        const VBstring = `${-NodeView.VBWidth/2} ${-NodeView.VBWidth/2} ${NodeView.VBWidth}  ${NodeView.VBWidth}`;
        this.paper = Snap(50, 50).attr({viewBox: VBstring});
        this.paper.circle(0, 0, NodeView.VBWidth/2)
            .attr({fill: "#34a"});
        this.paper.circle(0, 0, NodeView.VBWidth/2 - NodeView.ringThickness)
            .attr({fill: this.innerColor})
            .click(this.clickOnNode.bind(this));

        this.paper.drag(move, start, end, this, this, this);

        function move(dx, dy, x, y, iEvent) {
            if (!this.parentNode) {
                this.parentNode = this.paper.parent().node;
            }

            if (this.parentNode) {
                const CTM = this.parentNode.getScreenCTM();
                const CTMI = CTM.inverse();

                let screenCoordinates = this.parentNode.createSVGPoint();
                screenCoordinates.x = x;        //  iEvent.offsetX;        //
                screenCoordinates.y = y;        //  iEvent.offsetY;        //

                const viewCoordinates = screenCoordinates.matrixTransform(CTMI);

                this.data.location.x = viewCoordinates.x;       //  this.xStart + dx;
                this.data.location.y = viewCoordinates.y;       //  this.yStart + dy;
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
        }

        function end(iMouseEvent) {
            console.log(`End drag of ${this.data.name}`);
            netwiseUI.update();
        }
    }


    clickOnNode(event) {
        console.log(`click on node ${this.data.name}`)
    }
}