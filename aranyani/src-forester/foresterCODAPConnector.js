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

/* global codapInterface, pluginHelper, DG */

forester.CODAPConnector = {

    /**
     * Set up the connection to CODAP
     * //   todo: is this initializer now unused?
     *
     * @param iCallback
     * @returns {Promise<T | never>}
     */
    initialize: async function () {
        await this.initializeFrame();
        const tMutabilityMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };

        await Promise.all([
            pluginHelper.initDataSet(this.getHistoricalDataSetupObject()),
            pluginHelper.initDataSet(this.getForestryDataSetupObject()),
            codapInterface.sendRequest(tMutabilityMessage),
            MFS.setFrameTitle(DG.plugins.aranyani.forestryFrameTitle),
        ]);

        //  restore the state if possible
        forester.state = codapInterface.getInteractiveState();
        if (jQuery.isEmptyObject(forester.state)) {
            codapInterface.updateInteractiveState(forester.freshState);
            console.log("fish: getting a fresh state");
        }
    },

    /**
     * Initialize aranyani's connection to CODAP.
     * Note that we do not look for a saved `state`.
     * Everything is stored in firebase.
     *
     * @returns {Promise<void>}
     */
    initializeFrame: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
        const tMutabilityMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };

        await codapInterface.sendRequest(tMutabilityMessage);
    },

    /**
     * Called in userActions.pressNameButton().
     * Gets the relevant data from Firebase, filters it to include only this player, and emits it into CODAP.
     *
     * @param iPlayerName   string  the name of the player
     * @param iGameCode     string  the game code
     * @returns {Promise<void>}
     */
    getAndEmitMyForestryRecords : async function(iPlayerName, iGameCode) {

        const allTurns = await fireConnect.getAllTurnsFromGame(iGameCode);
        let myTurns = [];

        //  filter to get only this player's turns
        allTurns.forEach( (t) => {
            if (t.player === iPlayerName) {
                const localTurn = MFS.translateTurnToLocalLanguage(t);
                myTurns.push(localTurn);
            }
        })

        console.log(`found ${myTurns.length} old record(s) for ${iPlayerName} in game ${iGameCode}`);

        await this.deleteAllTurnRecords();
        const theResult = await pluginHelper.createItems(myTurns, forester.constants.kForestryDataSetName);
        //  this.makeCaseTableAppear();
    },

    /**
     * Add one case to the fishing data set
     * Note that this does NOT include attributes that get determined later:
     * unitPrice, income, after.
     *
     * @param eTurn     the catch-fish model result in English
     * @returns {Promise<{year: number, seen: *, want: *, caught: (*|number), before: (number|*), expenses: number, player: (null|*), game: (*|null)}>}
     */
    addSingleForestryItemInCODAP: async function (eTurn) {

        let aTurn = {};
        //      todo: make this into a function in MFS

        //  translate eTurn into local language
        aTurn[DG.plugins.aranyani.attributeNames.year] = Number(eTurn.year);
        aTurn[DG.plugins.aranyani.attributeNames.seen] = eTurn.seen;
        aTurn[DG.plugins.aranyani.attributeNames.want] = eTurn.want;
        aTurn[DG.plugins.aranyani.attributeNames.caught] = eTurn.caught;
        aTurn[DG.plugins.aranyani.attributeNames.before] = forester.state.balance;
        aTurn[DG.plugins.aranyani.attributeNames.expenses] = eTurn.expenses;
        aTurn[DG.plugins.aranyani.attributeNames.player] = eTurn.player;
        aTurn[DG.plugins.aranyani.attributeNames.game] = forester.state.gameCode;

        //  const localizedTurn = forester.localize.localizeValuesObject(aTurn);

        console.log(`    fish ... addSingleForestryItemInCODAP for ${eTurn.year} caught ${eTurn.caught}`);

        const theResult = await pluginHelper.createItems(aTurn, forester.constants.kForestryDataSetName);
        if (theResult.success) {
            eTurn.caseID = theResult.caseIDs[0];
            eTurn.itemID = theResult.itemIDs[0];
        }
        this.makeCaseTableAppear();
/*
        aTurn["playerName"] = aTurn.player;
        aTurn["turn"] = aTurn.year;
        delete aTurn.player;
        delete aTurn.year;
*/

        return eTurn;   //  english turn, but with caseID and itemID
    },

    /**
     * Called from forester.fishUpdate() when we have a new turn
     *
     * The database has recorded the price for fish (etc) based on everyone's catch.
     * So here, we can fill in what we did not know at the time of fishing: unitPrice, income, and our "after" balance.
     *
     * @param eTurn     the data from db to be updated, in ENGLISH
     * @returns {Promise<void>}
     */
    updateForestryItemInCODAP: async function (eTurn) {
        try {
            let tValues = {};

            //  translate new values into local language

            tValues[DG.plugins.aranyani.attributeNames.unitPrice] = eTurn.unitPrice;
            tValues[DG.plugins.aranyani.attributeNames.income] = eTurn.income;
            tValues[DG.plugins.aranyani.attributeNames.after] = eTurn.after;
            console.log(`    ... updateForestryItemInCODAP() ${eTurn.year}, after = ${eTurn.after}`);

            //  use the item id of the relevant case:

            let tResource = "dataContext[" + forester.constants.kForestryDataSetName + "].itemByID[" + eTurn.itemID + "]";
            let tMessage = {action: "update", resource: tResource};
            tMessage.values = tValues;
            const tUpdateResult = await codapInterface.sendRequest(tMessage);

            //  sample tResource:  "dataContext[fish].itemByID[id:Cpz-fhDXr49K_u2R]"
            //  sample tValues:     {unitPrice: 100, income: 3300, after: 6300}

            if (!tUpdateResult.success) {
                const errorString = "    unsuccessful update, item " + theItemID +
                    " | year: " + eTurn.year + " | error: " + tUpdateResult.values.error +
                    " | message: " + JSON.stringify(tMessage);
                console.log(errorString);
                return null;
            }

            return eTurn;       //      resolve to the most recent turn.
        } catch (msg) {
            console.log("    error in updateForestryItemInCODAP(): " + msg);
        }
    },

    createForestryItems: async function (iValues) {

        iValues = pluginHelper.arrayify(iValues);
        console.log("Forestry ... createForestryItems with " + iValues.length + " case(s)");

        try {
            const res = await pluginHelper.createItems(iValues, forester.constants.kForestryDataSetName);
            console.log("Resolving createForestryItems() with " + JSON.stringify(res));
            return res;
        } catch (msg) {
            console.log("Problem creating items using iValues = " + JSON.stringify(iValues) + "\n" + msg);
        }

    },

    createHistoricalForestryItems: function (iValues) {
        iValues = pluginHelper.arrayify(iValues);

        console.log("Forestry ... createHistoricalForestryItems with " + iValues.length + " case(s)");
        pluginHelper.createItems(iValues, forester.constants.kHistoricalDataSetName)
            .catch(() => console.log("Problem creating items using iValues = " + JSON.stringify(iValues)));
    },

    deleteAllHistoricalRecords: function () {
        return new Promise((resolve, reject) => {
            let tCallback = null;
            let tResource = "dataContext[" + forester.constants.kHistoricalDataSetName + "].allCases";
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
        const tResource = "dataContext[" + forester.constants.kForestryDataSetName + "].allCases";

        try {
            let res = await codapInterface.sendRequest({action: "delete", resource: tResource}, null);
            return res;
        } catch (msg) {
            console.warn("Problem deleting turn records: " + msg);
        }
    },

    makeCaseTableAppear: async function () {
        const theMessage = {
            action: "create",
            resource: "component",
            values: {
                type: 'caseTable',
                dataContext: forester.constants.kForestryDataSetName,
                name: DG.plugins.aranyani.forestryDataSetTitle,        //  why is this title and not name? Bug?
                cannotClose: true
            }
        };
        await codapInterface.sendRequest(theMessage);
        console.log(`    ç   make case table appear`);
    },

    makeHistoricalTableAppear: async function () {
        const theMessage = {
            action: "create",
            resource: "component",
            values: {
                type: 'caseTable',
                dataContext: forestry.constants.kHistoricalDataSetName,
                name: DG.plugins.aranyani.forestryHistoricalDataSetTitle,
                cannotClose: true
            }
        };
        await codapInterface.sendRequest(theMessage);
    },

    iFrameDescriptor: {
        version: forester.constants.version,
        name: 'fish',
        title: 'fishTitle',
        dimensions: {width: 388, height: 354},
        preventDataContextReorg: false
    },

    historicalDataContextSetupStrings: {},
    forestryDataContextSetupStrings: {},

    getForestryDataSetupObject: function () {
        return {
            name: forester.constants.kForestryDataSetName,
            title: DG.plugins.aranyani.forestryDataSetTitle,
            description: 'fishing data',
            collections: [
                {
                    name: forester.constants.kForestryCollectionName,
                    labels: {
                        singleCase: "year",
                        pluralCase: "years",
                        setOfCasesWithArticle: "financial records"
                    },

                    attrs: [ // note how this is an array of objects.
                        {
                            name: DG.plugins.aranyani.attributeNames.year,
                            title : DG.plugins.aranyani.attributeNames.year,
                            type: 'numeric', precision: 0,
                            description: DG.plugins.aranyani.attributeDescriptions.year
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.seen, type: 'numeric', precision: 1,
                            description: DG.plugins.aranyani.attributeDescriptions.seen
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.want, type: 'numeric', precision: 1,
                            description: DG.plugins.aranyani.attributeDescriptions.want
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.caught, type: 'numeric', precision: 1,
                            description: DG.plugins.aranyani.attributeDescriptions.caught
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.before, type: 'numeric', precision: 0,
                            description: DG.plugins.aranyani.attributeDescriptions.before,
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.expenses, type: 'numeric', precision: 0,
                            description: "your costs"
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.unitPrice, type: 'numeric', precision: 2,
                            description: DG.plugins.aranyani.attributeDescriptions.unitPrice,
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.income, type: 'numeric', precision: 0,
                            description: DG.plugins.aranyani.attributeDescriptions.income
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.after, type: 'numeric', precision: 0,
                            description: DG.plugins.aranyani.attributeDescriptions.after
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.player, type: 'categorical',
                            description: DG.plugins.aranyani.attributeDescriptions.player
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.game, type: 'categorical',
                            description: DG.plugins.aranyani.attributeDescriptions.game
                        }
                    ]
                }
            ]
        };
    },

    getHistoricalDataSetupObject: function () {
        return {
            name: forester.constants.kHistoricalDataSetName,
            title: DG.plugins.aranyani.forestryHistoricalDataSetTitle,
            description: DG.plugins.aranyani.forestryHistoricalDataSetDescription,
            collections: [
                {
                    name: forester.constants.kHistoricalCollectionName,
                    labels: {
                        singleCase: "year",
                        pluralCase: "years",
                        setOfCasesWithArticle: "financial records"
                    },

                    attrs: [ // note how this is an array of objects.
                        {
                            name: DG.plugins.aranyani.attributeNames.year, type: 'numeric', precision: 0,
                            description: DG.plugins.aranyani.attributeDescriptions.year
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.seen, type: 'numeric', precision: 1,
                            description: DG.plugins.aranyani.attributeDescriptions.seen
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.want, type: 'numeric', precision: 1,
                            description: DG.plugins.aranyani.attributeDescriptions.want
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.caught, type: 'numeric', precision: 1,
                            description: DG.plugins.aranyani.attributeDescriptions.caught
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.before, type: 'numeric', precision: 0,
                            description: DG.plugins.aranyani.attributeDescriptions.before,
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.expenses, type: 'numeric', precision: 0,
                            description: "your costs"
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.unitPrice, type: 'numeric', precision: 2,
                            description: DG.plugins.aranyani.attributeDescriptions.unitPrice,
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.income, type: 'numeric', precision: 0,
                            description: DG.plugins.aranyani.attributeDescriptions.income
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.after, type: 'numeric', precision: 0,
                            description: DG.plugins.aranyani.attributeDescriptions.after
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.player, type: 'categorical',
                            description: DG.plugins.aranyani.attributeDescriptions.player
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.game, type: 'categorical',
                            description: DG.plugins.aranyani.attributeDescriptions.game
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.result, type: 'categorical',
                            description: DG.plugins.aranyani.attributeDescriptions.result
                        },
                        {
                            name: DG.plugins.aranyani.attributeNames.level, type: 'categorical',
                            description: DG.plugins.aranyani.attributeDescriptions.level
                        }
                    ]
                }
            ]
        }
    },
};

