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

netwiseModel = {

    nodes: null,
    optimalDistance: 40,
    optimalLinkedDistance: 20,
    linkedCoefficient: 20,
    relaxConstant: 0.2,

    initialize: function () {
        this.nodes = [];
    },

    relax: async function () {
        const then = new Date();
        const nRelaxes = 100;
        const forceScaleNumber = 5;

        for (let i = 0; i < nRelaxes; i++) {
            this.findOptimaAndForces();

            this.nodes.forEach(n => {
                const fx = n.forces.x;
                const fy = n.forces.y;
                const fTot = Math.sqrt(fx*fx + fy*fy);
                if (fTot > forceScaleNumber) {
                    const theScale = forceScaleNumber * Math.random();
                    //  dx = dx * (theScale/fTot);
                    //  dy = dy * (theScale/fTot);
                }



                const dx = (n.optima.x - n.location.x);
                const dy = (n.optima.y - n.location.y);


                n.location.x += this.relaxConstant  * dx;
                n.location.y += this.relaxConstant  * dy;
            });

            this.moveToCenterOfMass();
            netwiseUI.theNetView.draw();
        }
        await netwiseUI.update();
        const now = new Date();

        console.log(`${nRelaxes} relaxes took ${now - then}`);
    },

    findOptimaAndForces: function () {
        const d = 1;

        console.log(`---`);
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

}