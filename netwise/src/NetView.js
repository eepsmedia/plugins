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


NetView = function (iData) {
    this.data = iData;
    this.nodeRadius = 6;

    this.paper = new Snap(document.getElementById("net-view"));
    this.paper.attr({
        viewBox : "-50, -50, 100, 100"
    })
    this.paper.clear();

}

NetView.prototype.draw = function () {
    this.paper.clear();
    this.drawLinks();
    this.drawNodes();
}

NetView.prototype.drawLinks = function() {
    this.data.forEach(node => {
        const thisX = node.location.x;
        const thisY = node.location.y;
        node.links.forEach(link => {
            const dest = netwiseModel.getNodeNamed(link);
            if (dest) {
                const destX = dest.location.x;
                const destY = dest.location.y;
                this.paper.line(thisX, thisY, destX, destY).attr({
                    stroke: "#fff", strokeWidth: 2,
                });
            }
        })
    })
}

NetView.prototype.drawNodes = function() {
    this.data.forEach(node => {
        const tNewNodePaper = new NodeView(node).paper.attr({
            x: node.location.x - this.nodeRadius,
            y: node.location.y - this.nodeRadius,
            width : this.nodeRadius * 2,
            height : this.nodeRadius * 2,
        });
        this.paper.append(tNewNodePaper);
    })
}

NodeView = function (iNodeModel) {
    this.data = iNodeModel;
    this.locationAtDragStart = {x : 0, y:0};

    this.innerColor = "white";
    if (this.data.name === "A") {
        this.innerColor = "goldenrod";
    }

    this.paper = Snap(50, 50).attr({viewBox : "-5, -5, 10, 10"});
    this.paper.circle(0, 0, 5)
        .attr({fill: "#34a"});
    this.paper.circle(0, 0, 4)
        .attr({fill: this.innerColor})
        .click(this.clickOnNode.bind(this));

    this.paper.drag(move, start, end, this, this, this);

    function move(dx, dy, x, y, event) {
        console.log(`Moving ${this.data.name} at ${x}, ${y} by ${dx}, ${dy}`);
        this.data.location.x = this.locationAtDragStart.x + dx;
        this.data.location.y = this.locationAtDragStart.y + dy;
        netwiseUI.update();
    }

    function start(x, y, event) {
        console.log(`Starting drag at ${x}, ${y} for ${this.data.name}`);
        this.locationAtDragStart = this.data.location;
    }

    function end(object) {

    }
}

NodeView.prototype.clickOnNode = function(event) {
    console.log(`click on node ${this.data.name}`)
}