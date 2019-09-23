/*
==========================================================================

 * Created by tim on 9/17/19.
 
 
 ==========================================================================
strings in poseidon

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

const strings = {
    constructGameEndMessageFrom : function (iReason) {

        let out = "";

        if (iReason.end) {
            let tMessageParts = [];

            if (iReason.time) {
                tMessageParts.push("the game ends at year " + iReason.params.endingTurn);
            }

            switch (iReason.pop) {
                case "high":
                    tMessageParts.push("the total fish population is now large enough to be sustainable");
                    break;
                case "low":
                    tMessageParts.push("the total fish population is now too small to be sustainable");
                    break;
                default:
                    break;
            }

            iReason.broke.forEach((p) => {  //  broke is an array of player names.
                tMessageParts.push(p + " has a negative bank balance");
            });

            if (tMessageParts.length === 0) {
                out = "...dang! We don't really know why!";
            } else {
                out = tMessageParts.join(", and ") + ".";
            }
        }
        return out;
    },
};

export default strings;