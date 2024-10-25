/**
 * Created by tim on 9/26/16.


 ==========================================================================
 tree.js in reTree.

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

//          Tree class

/**
 * The Tree is a model that represents the whole tree.
 * It has a rootNode, which will in turn connect to the other Nodes.
 *
 * Note: a NodeZoneView does NOT have this as a model!
 * A NodeZoneView exists solely to allocate space in the Tree Panel.
 *
 * @constructor
 */
Tree = function () {
    //  console.log("Tree constructor");
    this.filterArray = [];  //  empty, but present since this is the parent of the rootNode
    this.rootNode = new Node(null, "root");   //  null is "no parent node"
    this.trunkNode = new Node(this.rootNode, "trunk");
};

Tree.prototype.populateTree = function () {
    this.rootNode.populateNode();
};

Tree.prototype.traceCaseInTree = function (iValues) {
    var tTraceResult = this.rootNode.traceCaseInTree(iValues);
    return tTraceResult;
};

/**
 * Clear the onTrace flag for the entire tree
 */
Tree.prototype.clearTrace = function() {
    this.rootNode.clearTrace();
};

Tree.prototype.depth = function() {
    return this.rootNode.depthDownFromHere();
};

Tree.prototype.numberOfNodes = function() {
  return this.rootNode.descendantCount() + 1;
};

/*
Tree.prototype.totalNumberOfCases = function () {
    return arbor.analysis.cases.length;
};
*/

Tree.prototype.casesByFilter = function (iFilterArray, iMissingArray) {
    var tMissingFilter = iMissingArray.join("||");
    var tFilter = iFilterArray.join(" && ");
    var out = [];

    arbor.analysis.cases.forEach(function (aCase) {
        var c = aCase.values;           //  we need "c" because it appears in the tMissingFilter string.
        if (!eval(tMissingFilter)) {
            if (eval(tFilter)) {
                out.push(aCase);        //  push the entire case, not just the values
            }
        }
    });

    return out;
};

/**
 * Return the data showing summary statistics. To appear below the tree,
 * @returns {*|string}
 */
Tree.prototype.results = function () {
    return this.rootNode.getResultCounts();   //  like TP = 12, etc
};

Tree.prototype.nodeFromID = function (id) {
    return this.rootNode.findNodeDownstream(id);
};

Tree.constants = {
    yLeafNode: 1,       //  this node has NO attribute.
    yFullNode: 2,       //  this node has an attribute assigned to it, therefore branches
    yStopNode: 99       //  this node has no attribute, but DOES have a stop assigned
};

