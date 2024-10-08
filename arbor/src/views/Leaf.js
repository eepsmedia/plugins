/*
==========================================================================

 * Created by tim on 11/30/17.
 
 
 ==========================================================================
Leaf in pluginsLocal

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

Leaf = function (iParams) {

    this.myNode = iParams.node;   //  the (model) node we are attached to

    /*

    this.paper = d3.create("svg")
        .attr("width", 100)
        .attr("height", arbor.constants.leafNodeHeight)
        .on("click", this.myNode.flipStopType)

    this.bg = this.paper.append("rect")
        .attr("x", 0).attr("y", 0)
        .attr("width", 100)
        .attr("height", 20)
        .attr("fill", "yellow");

    this.leafLabel = this.paper.append("text")
        .attr("x", arbor.constants.treeObjectPadding).attr("y", 10)
        .attr("text", "foo")
        .attr("fill", arbor.constants.leafTextColor);
*/


    this.paper = new Snap(100, arbor.constants.leafNodeHeight)
        .click(function (e) {
            this.myNode.flipStopType();
        }.bind(this));

    this.bg = this.paper.rect(0, 0, 100, 20, arbor.constants.leafCornerRadius, arbor.constants.leafCornerRadius)
        .attr({fill: "yellow"});

    this.leafLabel = this.paper.text(arbor.constants.treeObjectPadding, 10, "foo")
        .attr({
            fill: arbor.constants.leafTextColor
        });

};

Leaf.prototype.setText = function (iText) {
    this.leafLabel.attr({"text": iText});
};

Leaf.prototype.refreshLeaf = function () {
    this.setText(this.myNode.getLeafText());      //  e.g., "well (–)"

    this.setLeafColor();        //  set the color for this leaf
    this.setToolTip();

    const tAtts = this.leafDimensions();

    this.paper.attr(tAtts);
    this.bg.attr(tAtts);
    this.leafLabel.attr({
        y: arbor.constants.leafNodeHeight / 2 + tAtts.labelHeight / 2 - 2    //  -2 is a kludge for the font's space
    });

    return tAtts;   //  so a parent view can center us.
};

Leaf.prototype.leafDimensions = function () {
    const labelSize = this.leafLabel.getBBox();
    const leafWidth = labelSize.width + 2 * arbor.constants.treeObjectPadding;

    return {
        width: leafWidth,
        height: arbor.constants.leafNodeHeight,
        labelHeight: labelSize.height
    }

};

Leaf.prototype.setLeafColor = function () {
    let tColor = "gray";
    switch (this.myNode.stopSign) {
        case arbor.constants.diagnosisPlus:
            tColor = arbor.constants.leafColorPositive;
            break;
        case arbor.constants.diagnosisMinus:
            tColor = arbor.constants.leafColorNegative;
            break;
        default:
            break;
    }
    this.bg.attr({fill: tColor});

};

Leaf.prototype.setToolTip = function () {

    let tText = "";

    switch (this.myNode.stopSign) {
        case arbor.constants.diagnosisPlus:
            tText = `${arbor.strings.sYourBestGuess} ${arbor.state.dependentVariableSplit.branchDescription("L")}`;
            break;
        case arbor.constants.diagnosisMinus:
            tText = `${arbor.strings.sYourBestGuess} ${arbor.state.dependentVariableSplit.branchDescription("R")}`;
            break;
        default:
            tText = arbor.strings.sLeafNoDiagnosis;
            break;
    }

    this.paper.append(
        Snap.parse("<title>" + tText + "</title>")
    );

};
