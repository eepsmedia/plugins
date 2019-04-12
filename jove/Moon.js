/*
==========================================================================

 * Created by tim on 2019-04-11.
 
 
 ==========================================================================
Moon in jove

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

let Moon = function(iX, iV, iPrimary) {
    this.x = iX;
    this.v = iV;
    this.primary = iPrimary;
};

Moon.prototype.acceleration = function(x) {
    const r = x.length();
    const G = jove.model.constants.bigG;
    const M = this.primary.mass;
    const theCoefficient = - G * M / (r * r * r);

    return x.times(theCoefficient);
};

Moon.prototype.RK4update = function(dt) {
    const k1v = this.acceleration(this.x);
    const k1r = this.v;
    const k2v = this.acceleration(this.x.plus(k1r.times(dt/2)));
    const k2r = this.v.plus(k1v.times(dt/2));
    const k3v = this.acceleration(this.x.plus(k2r.times(dt/2)));
    const k3r = this.v.plus(k2v.times(dt/2));
    const k4v = this.acceleration(this.x.plus(k3r.times(dt)));
    const k4r = this.v.plus(k3v.times(dt));

    const vNew = this.v.plus(
        (k1v.plus(k2v.times(2)).plus(k3v.times(2)).plus(k4v)).times(dt/6)
    );
    const xNew = this.x.plus(
        (k1r.plus(k2r.times(2)).plus(k3r.times(2)).plus(k4r)).times(dt/6)
    );

    this.x = xNew;
    this.v = vNew;
};

Moon.prototype.toString = function() {
    return (jove.model.time + ", " + this.x.x + ", " + this.x.y + ", " + this.x.length());
};


