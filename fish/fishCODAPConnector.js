/*
==========================================================================

 * Created by tim on 5/1/18.
 
 
 ==========================================================================
fishCODAPConnector in fish

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

/* global codapInterface, pluginHelper */

fish.CODAPConnector = {

    /**
     * Set up the connection to CODAP
     *
     * @param iCallback
     * @returns {Promise<T | never>}
     */
    initialize: async function ( ) {
        await codapInterface.init(this.iFrameDescriptor, null);
        let thePromises = [];
        thePromises.push(pluginHelper.initDataSet(fish.localize.getHistoricalDataContextSetupObject()));
        thePromises.push(pluginHelper.initDataSet(fish.localize.getFishDataContextSetupObject()));

        const tMutabilityMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };

        thePromises.push(codapInterface.sendRequest(tMutabilityMessage));

        //  restore the state if possible
        fish.state = codapInterface.getInteractiveState();
        if (jQuery.isEmptyObject(fish.state)) {
            codapInterface.updateInteractiveState(fish.freshState);
            console.log("fish: getting a fresh state");
        }

        await Promise.all(thePromises);
    },

    /**
     * Add one case to the fishing data set
     * Note that this does NOT include attributes that get determined later:
     * unitPrice, income, after.
     *
     * @param iModelResult
     * @returns {Promise<{year: number, seen: *, want: *, caught: (*|number), before: (number|*), expenses: number, player: (null|*), game: (*|null)}>}
     */
    addSingleFishItemInCODAP: async function (iModelResult) {
        let aTurn = {
            year: Number(fish.state.gameTurn),
            seen: iModelResult.visible,
            want: iModelResult.want,
            caught: iModelResult.caught,
            before: fish.state.balance,
            expenses: iModelResult.expenses,
            player: fish.state.playerName,
            game: fish.state.gameCode
        };

        //  const localizedTurn = fish.localize.localizeValuesObject(aTurn);

        console.log(`    fish ... addSingleFishItemInCODAP for ${aTurn.year} caught ${aTurn.caught}`);

        const theResult = await pluginHelper.createItems(aTurn, fish.constants.kFishDataSetName);
        if (theResult.success) {
            aTurn.caseID = theResult.caseIDs[0];
            aTurn.itemID = theResult.itemIDs[0];
        }
        this.makeCaseTableAppear();
        aTurn["playerName"] = aTurn.player;
        aTurn["turn"] = aTurn.year;
        delete aTurn.player;
        delete aTurn.year;

        return aTurn;   //  localizedTurn
    },

    /**
     * Called from fish.fishUpdate() when we have a new turn
     *
     * The database has recorded the price for fish (etc) based on everyone's catch.
     * So here, we can fill in what we did not know at the time of fishing: unitPrice, income, and our "after" balance.
     *
     * @param iTurn     the data from db to be updated
     * @returns {Promise<void>}
     */
    updateFishItemInCODAP: async function (iTurn) {
        try {
            const theYear = iTurn.turn;

            const tValues = {
                'unitPrice' : iTurn.unitPrice,
                'income' : iTurn.income,
                'after' : iTurn.after,
            };
            console.log("    fish ... updateFishItemInCODAP() for " + theYear );

            //  use the item id of the relevant case:

            let tResource = "dataContext[" + fish.constants.kFishDataSetName + "].itemByID[" + iTurn.itemID + "]";
            let tMessage = {action: "update", resource: tResource};
            tMessage.values = tValues;
            const tUpdateResult = await codapInterface.sendRequest(tMessage);

            //  sample tResource:  "dataContext[fish].itemByID[id:Cpz-fhDXr49K_u2R]"
            //  sample tValues:     {unitPrice: 100, income: 3300, after: 6300}

            if (!tUpdateResult.success) {
                const errorString = "    unsuccessful update, item " + theItemID +
                    " | year: " + theYear + " | error: " + tUpdateResult.values.error +
                    " | message: " + JSON.stringify(tMessage);
                console.log(errorString);
                return  null;
            }

            return iTurn;       //      resolve to the most recent turn.
        } catch (msg) {
            console.log("    error in updateFishItemInCODAP(): " + msg);
        }
    },

    createFishItems: async function (iValues) {

        iValues = pluginHelper.arrayify(iValues);
        console.log("Fish ... createFishItems with " + iValues.length + " case(s)");

        try {
            const res = await pluginHelper.createItems(iValues, fish.constants.kFishDataSetName);
            console.log("Resolving createFishItems() with " + JSON.stringify(res));
            return res;
        } catch (msg) {
            console.log("Problem creating items using iValues = " + JSON.stringify(iValues) + "\n" + msg);
        }

    },

    createHistoricalFishItems: function (iValues) {
        iValues = pluginHelper.arrayify(iValues);

        console.log("Fish ... createHistoricalFishItems with " + iValues.length + " case(s)");
        pluginHelper.createItems(iValues, fish.constants.kHistoricalDataSetName)
            .catch(() => console.log("Problem creating items using iValues = " + JSON.stringify(iValues)));
    },

    deleteAllHistoricalRecords: function () {
        return new Promise((resolve, reject) => {
            let tCallback = null;
            let tResource = "dataContext[" + fish.constants.kHistoricalDataSetName + "].allCases";
            let tMessage = {"action": "delete", "resource": tResource};
            codapInterface.sendRequest(tMessage, tCallback)
                .then((res) => resolve(res))
                .catch((msg) => {
                    console.warn("Problem deleting historical records: " + msg);
                    reject("Problem deleting historical records: " + msg);
                })
        })
    },

    deleteAllTurnRecords: async function () {
        const tResource = "dataContext[" + fish.constants.kFishDataSetName + "].allCases";

        try {
            let res = await codapInterface.sendRequest({action: "delete", resource: tResource}, null);
            return res;
        } catch (msg) {
            console.warn("Problem deleting turn records: " + msg);
        }
    },

    makeCaseTableAppear : async function() {
        const theMessage = {
            action : "create",
            resource : "component",
            values : {
                type : 'caseTable',
                dataContext : fish.constants.kFishDataSetName,
                name : fish.constants.kFishDataSetTitle,
                cannotClose : true
            }
        };
        await codapInterface.sendRequest( theMessage );
    },

    makeHistoricalTableAppear : async function() {
        const theMessage = {
            action : "create",
            resource : "component",
            values : {
                type : 'caseTable',
                dataContext : fish.constants.kHistoricalDataSetName,
                name : fish.constants.kHistoricalDataSetTitle,
                cannotClose : true
            }
        };
        await codapInterface.sendRequest( theMessage );
    },

    iFrameDescriptor: {
        version: fish.constants.version,
        name: 'fish',
        title: 'Fishing!',
        dimensions: {width: 388, height: 354},
        preventDataContextReorg: false
    },

    historicalDataContextSetupStrings: {},
    fishDataContextSetupStrings: {}
};

