/*
==========================================================================

 * Created by tim on 2019-04-11.
 
 
 ==========================================================================
Location in jove

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

let Location = function (iX, iY, iZ) {
    this.x = iX;
    this.y = iY;
    this.z = iZ;
};

Location.prototype.length = function () {
    return Math.sqrt(
        this.x * this.x + this.y * this.y + this.z * this.z
    );
};

Location.prototype.times = function( k ) {
    return new Location( k * this.x, k * this.y, k * this.z);
};

Location.prototype.plus = function( iL ) {
    return new Location( this.x + iL.x, this.y + iL.y, this.z + iL.z);
};

Location.prototype.dot = function( iL ) {
    return ( this.x * iL.x + this.y * iL.y + this.z * iL.z);
};

Location.prototype.vectorTo = function( iL ) {
    return new Location( iL.x - this.x, iL.y - this.y, iL.z - this.z );
};

Location.prototype.distanceTo = function( iL ) {
  return this.vectorTo( iL ).length();
};