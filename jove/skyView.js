/*
==========================================================================

 * Created by tim on 2019-04-10.
 
 
 ==========================================================================
skyView in jove

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

/* global jove, Snap, console */

jove.skyView = {

    model : null,
    paper : null,
    paperDOM : null,

    backgroundRect : null,

    constants : {
      viewWidth : 500,
      viewHeight : 100
    },

    initialize : function (iModel) {
        this.model = iModel;
        this.paperDOM = document.getElementById("sky");

        this.paper = Snap(this.paperDOM);

    },

    makeBackground : function (iColor) {
        this.paper.clear()
        this.backgroundRect = this.paper.rect(
            0, 0,
            this.constants.viewWidth,
            this.constants.viewHeight).attr( {fill : iColor});
    },

    angleToPixels : function(iAngle) {
        return iAngle * this.constants.viewWidth/6.0;
    },


    update : function() {
        if (this.model.clear) {
            this.makeBackground("black");

            const pd = this.model.primaryData();

            const primaryRadiusInMR = this.model.constants.jupiterRadius / pd.distance * 1000;

            this.paper.circle(this.constants.viewWidth/2, this.constants.viewHeight/2, this.angleToPixels(primaryRadiusInMR)).attr({
                fill : "white"
            });

            const mpa = this.model.moonPositionArray();

            mpa.forEach( m => { //  m is  a "moonObject", has x, y, t in days.
                const x = this.constants.viewWidth/2 + this.angleToPixels(m.x);
                this.paper.circle( x, this.constants.viewHeight/2, 2).attr({
                    fill : "white"
                });
            })



        } else {
            this.makeBackground("gray")
        }
    }
};