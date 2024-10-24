/*
==========================================================================

 * Created by tim on 12/28/20.
 
 
 ==========================================================================
netwise-model in netwise

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

linkyModel = {

    nodes: null,
    optimalDistance: 400,
    optimalLinkedDistance: 200,
    linkedCoefficient: 200,
    relaxConstant: 0.2,
    nRelaxes: 50,

    initialize: function () {
        this.nodes = [];    //  array of NodeModels
    },

    relax: async function (iTerations = this.nRelaxes) {

        const then = new Date();
        const forceScaleNumber = 5;

        for (let i = 0; i < iTerations; i++) {
            this.findOptimaAndForces();

            let totalMovement = 0;
            this.nodes.forEach(thisNode => {
                const fx = thisNode.forces.x;
                const fy = thisNode.forces.y;
                const fTot = Math.hypot(fx,fy);
                if (fTot > forceScaleNumber) {
                    const theScale = forceScaleNumber * Math.random();
                    //  dx = dx * (theScale/fTot);
                    //  dy = dy * (theScale/fTot);
                }

                const dx = (thisNode.optima.x - thisNode.location.x);
                const dy = (thisNode.optima.y - thisNode.location.y);

                thisNode.location.x += this.relaxConstant  * dx;
                thisNode.location.y += this.relaxConstant  * dy;
                totalMovement += Math.hypot(dx, dy);
            });
            //  console.log(`       tmove  ${i}: ${totalMovement}`);

            this.moveToCenterOfMass();
            //  netwiseUI.theNetView.draw();
        }
        await netwiseUI.update();
        const now = new Date();

        console.log(`${iTerations} relaxes took ${now - then}`);
    },

    netStatus : function() {
        let out = {};
        out["nodeCount"] = this.nodes.length;

        let tLinkCount = 0;
        this.nodes.forEach( nn => {
            tLinkCount += nn.links.length;
        })

        out["linkCount"] = tLinkCount;

        return out;
    },

    findOptimaAndForces: function () {
        const d = 1;

        //  console.log(`---`);
        this.nodes.forEach(n => {
            //  console.log(`finding potentials for ${n.name}`);
            const px1 = this.potentialForNode(n, -d, 0);
            const px2 = this.potentialForNode(n, +d, 0);
            const p0 = this.potentialForNode(n, 0, 0);
            const py1 = this.potentialForNode(n, 0, -d);
            const py2 = this.potentialForNode(n, 0, +d);

            const ax = (px1 + px2 - 2 * p0) / (2 * d * d);      //  denominator is 2 d^2 where d is the delta x
            const bx = (px2 - p0) / d - ax * (d + 2 * n.location.x);
            n.optima.x = -bx / (2 * ax);
            n.forces.x = (px1 - px2) / (2 * d);

            const ay = (py1 + py2 - 2 * p0) / (2 * d * d);
            const by = (py2 - p0) / d - ay * (d + 2 * n.location.y);
            n.optima.y = -by / (2 * ay);
            n.forces.y = (py1 - py2) / (2 * d);

                //console.log(`    F_${n.name} = (${Math.round(n.forces.x)}, ${Math.round(n.forces.y)})`);

        })

    },

    moveToCenterOfMass: function () {
        let sx = 0, sy = 0;
        const pop = this.nodes.length;

        //  center the collection
        if (pop) {
            this.nodes.forEach(n => {
                sx += n.location.x;
                sy += n.location.y;
            })
            this.nodes.forEach(n => {
                n.location.x -= sx / pop;
                n.location.y -= sy / pop;
            })
        }
    },

    potentialForNode: function (iNode, dx, dy) {
        const x = iNode.location.x + dx;
        const y = iNode.location.y + dy;
        const k0 = this.optimalDistance * this.optimalDistance * this.optimalDistance * this.optimalDistance;
        const kL = this.optimalLinkedDistance * this.optimalLinkedDistance *
            this.optimalLinkedDistance   * this.optimalLinkedDistance;

        let pot = 0;
        this.nodes.forEach(n => {
            if (n !== iNode) {
                const isLinked = this.isThereALinkBetween(n, iNode);
                const nx = n.location.x;
                const ny = n.location.y;
                const dd = (x - nx) * (x - nx) + (y - ny) * (y - ny);   //  distance squared
                const k = isLinked ? kL : k0;
                const a = isLinked ? this.linkedCoefficient : 1;

                pot +=  a * ((k / dd) + dd);       //  k/x^2 + x^2
            }
        });

        return pot;
    },

    isThereALinkBetween: function (n1, n2) {
        let out = false;
        if (n1.links.includes(n2.name) || n2.links.includes(n1.name)) {
            out = true;
            //  console.log(`    ${n1.name} is linked to ${n2.name}`);
        } else {
            //  console.log(`    ${n1.name} is NOT linked to ${n2.name}`);

        }
        return out;
    },

    /**
     * Called from linky.getAllData();
     * @param iData
     */
    importData: function (iData) {
        this.nodes = [];
        iData.values.forEach(item => {
            const tNewNode = new NodeModel(item);
            this.nodes.push(tNewNode);
        });
        this.moveToCenterOfMass();
    },

    getNodeNamed: function (iName) {
        let outNode = null;
        this.nodes.forEach(n => {
            if (n.name === iName) {
                outNode = n
            }
        })
        return outNode;
    },

    selectTheseNodes: function(iList) {
        this.nodes.forEach( aNode => {
            aNode.selected = (iList.includes(aNode.name));
        })

    },

    /**
     * Create a new link between these two NodeModels.
     * No checking has been done; we do it here.
     *
     * @param iFrom
     * @param iTo
     */
    newLink : function(iFrom, iTo) {
        if (iFrom && iTo) {
            console.log(`Attempting link from ${iFrom.name} to ${iTo.name}`);
            if (iFrom === iTo) return;   //      no links to yourself

            if (iFrom.links.includes(iTo.name)) return; //  no duplicate links

            console.log(`Genuine new link detected!`);

            iFrom.links.push(iTo.name);

            connect.updateLinks(iFrom);
        } else {
            console.log(`    bad call to model.newLink. One of the endpoints was null`);
        }
    },


}