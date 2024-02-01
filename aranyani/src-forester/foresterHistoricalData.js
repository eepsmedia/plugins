/*
==========================================================================

 * Created by tim on 5/7/18.
 
 
 ==========================================================================
fishHistoricalData in fish

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


forester.historicalData = {

    getHistoricalData: async function () {

        console.log(`getting historical data`);

        let turns = [];     //  we will collect all turns....
        let promises = [];

        await forester.CODAPConnector.deleteAllHistoricalRecords();
        forester.state.gameCodeList.forEach((gc) => {
            console.log("getHistoricalData for " + gc);
            promises.push(fireConnect.getHistoricalRecord(gc));  //  make one promise for each game we've been in
        });

        const res = await Promise.all(promises);
        if (res) {
            let tAllGamesTurns = res;
            tAllGamesTurns.forEach(
                (gameR) => {            //  but each game is an array of turns
                    gameR.forEach(
                        (turnR) => {
                            turnR.result = this.makeResultFromTreeStars(turnR.result);  //  convert number to fish
                            const tLocalTurn = MFS.translateTurnToLocalLanguage(turnR);
                            turns.push(tLocalTurn);
                        }
                    )
                }
            );
            //  console.log("Assembled data for all historical turns. First item: " + JSON.stringify(tAllGamesTurns[0]));
        } else {
            console.warn("No turn records to add to historical records!");
            throw("No turn records to add to historical records!");
        }
        await forester.CODAPConnector.createHistoricalForestryItems(turns);
        forester.CODAPConnector.makeHistoricalTableAppear();

        console.log("getHistoricalData() -- Historical fish items created.");
    },

    makeResultFromTreeStars(iStars) {
        let theText = "???";
        switch (iStars) {
            case 5:
                theText = "🐟🐟🐟🐟🐟";
                break;
            case 4:
                theText = "🐟🐟🐟🐟";
                break;
            case 3:
                theText = "🐟🐟🐟";
                break;
            case 2:
                theText = "🐟🐟";
                break;
            case 1:
                theText = "🐟";
                break;
            case 0:
                theText = "💀";
                break;
            default:
                break;

        }

        return theText;
    }
};