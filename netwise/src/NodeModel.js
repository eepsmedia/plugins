/*
==========================================================================

 * Created by tim on 12/27/20.
 
 
 ==========================================================================
NodeModel in netwise

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

class NodeModel {

    constructor (iItem) {
        this.id = iItem.id;
        this.name = iItem.values[netwise.state.id_attribute];
        this.links = [];
        const tLinkRaw = iItem.values[netwise.state.link_attribute];
        const rawLinksArray = tLinkRaw.split(",");

        rawLinksArray.forEach( L => {
            L = L.trim();
            this.links.push(L);
        })

        this.location = {x: -500 + 1000 * Math.random(), y: -500 + 1000 * Math.random()};
        this.optima = {x: 0, y: 0};
        this.forces = {x: 0, y: 0};
    }
}