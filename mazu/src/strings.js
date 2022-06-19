/*
==========================================================================

 * Created by tim on 9/17/19.
 
 
 ==========================================================================
strings in mazu

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
    constructGameEndMessageFrom: function (iReason) {

        let out = "";

        if (iReason.end) {
            let tMessageParts = [];

            if (iReason.time) {
                tMessageParts.push(`The game ends at year ${iReason.params.endingTurn}.`);
            }

            switch (iReason.fishStars) {
                case 5:
                    tMessageParts.push("Well done! " +
                        "The total fish population is healthy --- and so large that you can catch a lot of fish " +
                        "without reducing the fish population. " +
                        "Fishing is now a sustainable source of food.");
                    break;
                case 4:
                    tMessageParts.push("Your rating is four fish (out of five). " +
                        "The total number of fish has increased a lot! " +
                        "You can now catch more fish without reducing the population. " +
                        "Can you make it to five stars?");
                    break;
                case 3:
                    tMessageParts.push("Your rating is three fish (out of five). " +
                        "The total number of fish has increased! Your fishing business is doing well, but it could be better.");
                    break;
                case 2:
                    tMessageParts.push("Your rating is two fish (out of five). " +
                        "The total number of fish has gone down. Your fishing business survived, " +
                        "but the fish population is not healthy.");
                    break;
                case 1:
                    tMessageParts.push("Your rating is one fish (out of five). " +
                        "The total number of fish is very low. You might not be able to keep fishing for much longer.");
                    break;
                case 0:
                    tMessageParts.push("The total number of fish is headed to zero. The fishing industry has collapsed.");
                    break;
                default:
                    // tMessageParts.push("(Something odd happened at game end; the number of 'fish' doesn't make sense!)");
                    break;
            }

            if (iReason.broke.length) {
                let brokePart = "You have lost the game because ";

                iReason.broke.forEach((p) => {  //  broke is an array of player names.
                    tMessageParts.push(p + " has a negative bank balance");
                });
            }

            if (tMessageParts.length === 0) {
                out = "...dang! We don't really know why!";
            } else {
                out = tMessageParts.join(" ") + ".";
            }
        }
        return out;
    }
}

//  https://stackoverflow.com/questions/53879088/join-an-array-by-commas-and-and

const makeCommaSeparatedString = (arr, useOxfordComma) => {
    const listStart = arr.slice(0, -1).join(', ')
    const listEnd = arr.slice(-1)
    const conjunction = arr.length <= 1
        ? ''
        : useOxfordComma && arr.length > 2
            ? ', and '
            : ' and '

    return [listStart, listEnd].join(conjunction)
}

