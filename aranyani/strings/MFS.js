/*
==========================================================================

 * Created by tim on 9/17/19.
 
 
 ==========================================================================
strings in aranyani (MFS = aranyani-Forestry-Strings)

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

const MFS = {

    language: 'en',

    attributeNameToEnglish : {},

    initialize: function () {
        this.language = localizePlugin.figureOutLanguage('en');
        DG.plugins = aranyaniStrings[this.language];
        this.setAttributeNameTranslations();
    },

    setAttributeNameTranslations : function() {
        let theLocalizedStrings = DG.plugins.aranyani.attributeNames;

        for (const key in theLocalizedStrings) {
            const localName = theLocalizedStrings[key];
            this.attributeNameToEnglish[localName] = key;
        }
    },

    /**
     * Translate a single turn (object) to the local language.
     *
     * @param iValues
     * @returns {*|{}}
     */
    translateTurnToLocalLanguage: function (iValues) {
        out = {};
        for (const a in iValues) {
            if (iValues.hasOwnProperty(a)) {
                const index = DG.plugins.aranyani.attributeNames[a];
                if (index) {
                    out[index] = iValues[a];
                } else {
                    out[a] = iValues[a];
                }
            }
        }
        return out;
    },


    setInitialStrings: async function () {

        //  substitute all the static strings in the UI (by `id`)
        const theStaticStrings = DG.plugins.aranyani.staticStrings;
        for (const theID in theStaticStrings) {
            if (theStaticStrings.hasOwnProperty(theID)) {
                const theValue = theStaticStrings[theID];
                try {
                    document.getElementById(theID).innerHTML = theValue;
                    //  console.log(`Set string for ${theID} in ${iLang}`);
                } catch (msg) {
                    console.log(msg + ` on ID = ${theID}`);
                }
            }
        }

    },

    /**
     * convert the PLAYER turn (whose attributes may be in any language) to English
     * @param iTurn
     */
    convertToEnglish: function(iTurn) {
        let out = {};
        out.playerName = iTurn[DG.plugins.aranyani.attributeNames.player];
        out.player = iTurn[DG.plugins.aranyani.attributeNames.player];
        out.year = iTurn[DG.plugins.aranyani.attributeNames.year];

        for (key in iTurn) {
            const english = MFS.attributeNameToEnglish[key];    //      here, key is local, like "antes"
                //  now english is "before"
            //  const index = `DG.plugins.aranyani.attributeNames.${key}`;
            out[english] = iTurn[key];      //  out.before = 5700;
        }

        return out;
    },

    /**
     * Set the title of the iFrame
     *
     * @param iTitle
     */
    setFrameTitle: async function (iTitle) {
        const tMessage = {
            action: "update",
            resource: "interactiveFrame",
            values: {
                //  name : iTitle,
                title: iTitle,
            }
        }
        try {
            const tChangeTitleResult = codapInterface.sendRequest(tMessage);
        } catch (msg) {
            alert(`problem changing the title of the plugin: ${msg}`);
        }
    },

    /**
     * Make the situation report
     * @returns {string}
     */
    sitrep: function () {
        let out = this.howManyPlayersString();
        out += "<br>";
        out += this.makeWaitingText();
        return out;
    },

    /**
     * String to report how many players are in the game;
     * used for the sitrep.
     *
     * @returns {string}
     */
    howManyPlayersString: function () {
        let out = "";

        let tN = forester.players.length;
        switch (tN) {
            case 0:
                out += DG.plugins.aranyani.firstPlayer;
                break;
            case 1:
                out += DG.plugins.aranyani.playingSolo;
                break;
            case 2:
                out += DG.plugins.aranyani.oneOtherPlayer;
                break;
            default:
                out += this.tr(DG.plugins.aranyani.manyOtherPlayers, `${(tN - 1)}`);
                break
        }
        return out;
    },

    /**
     * Called only from this file.
     * text telling who we're waiting for.
     */
    makeWaitingText: function () {
        const playerReport = forester.otherPlayersInfo();
        if (playerReport.allPlayers.length <= 0) {
            return DG.plugins.aranyani.noPlayersYet;
        }
        let out = "";

        let waitingFor = playerReport.missing;
        const yourIndex = waitingFor.indexOf(forester.state.playerName);
        if (yourIndex > -1) {
            waitingFor.splice(yourIndex, 1);        //  remove the element there
        }
        if (yourIndex > -1) {
            out += DG.plugins.aranyani.waitingForYou;
            if (waitingFor.length === 1) {
                out += ` ${DG.plugins.aranyani.sAnd} ${waitingFor[0]}.`;
            } else if (waitingFor.length > 0) {
                out += this.tr(DG.plugins.aranyani.andHowManyMore, waitingFor.length);
            } else {
                out += ".";
            }
            out += ` ${DG.plugins.aranyani.cutTreesCommand}`;

        } else {
            switch (waitingFor.length) {
                case 0:
                    out += DG.plugins.aranyani.everyoneHasCutWood;
                    break;
                case 1:
                    out += `${DG.plugins.aranyani.waitingFor} ${waitingFor[0]}.`;
                    break;
                case 2:
                    out += `${DG.plugins.aranyani.waitingFor} ${waitingFor[0]} ${DG.plugins.aranyani.sAnd} ${waitingFor[1]}.`;
                    break;
                default:
                    out += `${DG.plugins.aranyani.waitingFor} ${waitingFor[0]}  this.tr(DG.plugins.aranyani.andHowManyMore, waitingFor.length - 1)`;
                    break;
            }
        }
        return out;
    },

    treesAtMarketText: function () {
        const number = forester.state.currentTurnResult ? forester.state.currentTurnResult.caught : "";
        if (!forester.state.playerName) {
            return DG.plugins.aranyani.waitingForYouToLogIn;
        } else {
            if (number) {
                return tr(DG.plugins.aranyani.waitForTreeSale, number);
            } else {
                return DG.plugins.aranyani.noForestryWaitForTurnEnd;
            }
        }
    },


    makeRecentTurnReport: function (iTurn) {
        const out = tr(
            DG.plugins.aranyani.recentTurnReport,
            iTurn.year, iTurn.seen, iTurn.want,
            iTurn.caught, iTurn.unitPrice, iTurn.income
        );
        return out;
    },

    makeCurrentTurnReport: function (iTurnResult) {

        let out = tr(DG.plugins.aranyani.seenForestryReport, iTurnResult.visible);

        if (iTurnResult.want === iTurnResult.caught) {
            out += tr(DG.plugins.aranyani.caughtAllReport, iTurnResult.caught);
        } else {
            out += tr(DG.plugins.aranyani.caughtSomeReport, iTurnResult.want, iTurnResult.caught);
        }

        return out;
    },

    constructGameEndMessage: function () {
        const theGame = forester.gameFromDB;
        let out = "";

        if (theGame) {

            let tMessageParts = [];

            if (theGame.outOfTime) {
                const tMess = tr(DG.plugins.aranyani.end.timeRanOut, theGame.endingYear);
                tMessageParts.push(tMess);
            } else {
                const tMess = tr(DG.plugins.aranyani.end.endedEarly, theGame.year);
                tMessageParts.push(tMess);
            }

            switch (theGame.treeStars) {
                case 5:
                    tMessageParts.push(DG.plugins.aranyani.end.fiveTreesResult);
                    break;
                case 4:
                    tMessageParts.push(DG.plugins.aranyani.end.fourTreesResult);
                    break;
                case 3:
                    tMessageParts.push(DG.plugins.aranyani.end.threeTreesResult);
                    break;
                case 2:
                    tMessageParts.push(DG.plugins.aranyani.end.twoTreesResult);
                    break;
                case 1:
                    tMessageParts.push(DG.plugins.aranyani.end.oneTreesResult);
                    break;
                case 0:
                    if (theGame.brokePlayers.length > 0) {
                        tMessageParts.push(tr(DG.plugins.aranyani.end.bankruptForestryResult, theGame.brokePlayers));
                    } else {
                        tMessageParts.push(DG.plugins.aranyani.end.zeroTreesResult);
                    }
                    break;
                default:
                    // tMessageParts.push("(Something odd happened at game end; the number of 'fish' doesn't make sense!)");
                    break;
            }

            if (tMessageParts.length === 0) {
                out = "...dang! We don't really know why!";
            } else {
                out = tMessageParts.join(" ");
            }
        } else {
            out = "The game is not over, because it doesn't exist. Yet.";
        }
        return out;
    },

    /**
     * Utility used by tr()
     *
     * @param stringID
     * @returns {*}
     */
    lookupString: function (stringID) {
        return this.strings[stringID] || stringID;
    },

    /**
     * Translates a string by referencing a hash of translated strings.
     * If the lookup fails, the string ID is used.
     * Arguments after the String ID are substituted for substitution tokens in
     * the looked up string.
     * Substitution tokens can have the form "%@" or "%@" followed by a single digit.
     * Substitution parameters with no digit are substituted sequentially.
     * So, tr('%@, %@, %@', 'one', 'two', 'three') returns 'one, two, three'.
     * Substitution parameters followed by a digit are substituted positionally.
     * So, tr('%@1, %@1, %@2', 'baa', 'black sheep') returns 'baa, baa, black sheep'.
     *
     * @param stringID {{string}} a string id
     * @param args an array of strings or variable sequence of strings
     * @returns {string}
     */
    tr: function (stringID, args) {
        function replacer(match) {
            if (match.length === 2) {
                return (args && args[ix++]) || match;
            } else {
                return (args && args[match[2] - 1]) || match;
            }
        }

        if (typeof args === 'string') {
            args = Array.from(arguments).slice(1);
        }

        let s = stringID;       //      this.lookupString(stringID); // look up in the json
        let ix = 0;
        return s.replace(/%@[0-9]?/g, replacer);
    },
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
