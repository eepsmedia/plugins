/*
==========================================================================

 * Created by tim on 8/4/18.
 
 
 ==========================================================================
fishStrings in fish

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


/**
 * FishStrings == FS
 *
 * Contains (localized) strings for the fish plugin.
 *
 * Each static item named for a language (e.g., "en") contains the strings in its language.
 * Some of these items are functions (for when a string must be constructed algorithmically)
 *
 * The initial function, setBasicStrings(), replaces strings in the HTML with language-specific strings.
 * To be called during initialization, or whenever a new language is specified.
 *
 * @type {{en: {makeAboutPlayersText: (function(): string)}}}
 */

fish.localize = {
    /*
        localizeValuesObject: function (iValues) {
            let out = {};
            const lang = fish.language;

            for (var vName in iValues) {
                if (iValues.hasOwnProperty(vName)) {
                    let tVarName = this.getLocalVariableName(vName, lang);
                    out[tVarName] = iValues[vName];
                }
            }
            return out;
        },

        getLocalVariableName: function (iName, iLang) {
            let out = iName;
            if (iLang !== "en") {
                try {
                    let tForeignName = this.attributeNameTranslations[iName][iLang];
                    out = tForeignName;
                } catch {
                    out = iName;
                }
            }
            return out;
        },
    */

    attributeNameTranslations: {
        year: {es: "año", de: "Jahr"},
        seen: {es: "visto", de: "gesehen"},
        want: {es: "querría", de: "Jahr"},
        caught: {es: "atrapó", de: "gefangen"},
        before: {es: "antes", de: "vor"},
        expenses: {es: "gastos", de: "Kosten"},
        unitPrice: {es: "precio", de: "Preis"},
        income: {es: "ingresos", de: "Einkommen"},
        after: {es: "después", de: "nach"},
        player: {es: "jugador", de: "Spieler"},
        game: {es: "juego", de: "Spiel"},
        result: {es: "resultado", de: "Ergebnis"},
        level: {es: "nivel", de: "Stufe"},
    },

    getHistoricalDataContextSetupObject: function () {

        if (fish.strings.historicalDataContextSetupObject === undefined) {
            out = FS.en.historicalDataContextSetupObject;
        } else {
            out = fish.strings.historicalDataContextSetupObject;
        }

        return out;
    },

    getFishDataContextSetupObject: function () {
        if (fish.strings.fishDataContextSetupObject === undefined) {
            out = FS.en.fishDataContextSetupObject;
        } else {
            out = fish.strings.fishDataContextSetupObject;
        }
        return out;
    },

};

let FS = {


    setBasicStrings: function () {
        $("#automateChairLabel").html(fish.strings.automateChairLabelText);
        $("#automateCatchLabel").html(fish.strings.automateCatchLabelText);
        $("#fishQuantityLabel").html(fish.strings.fishQuantityLabelText);
        $("#playerNameLabel").html(fish.strings.playerNameLabelText);
        $("#joinExistingGameButtonLabel").html(fish.strings.joinExistingGameButtonLabelText);
        $("#makeNewGameButtonLabel").html(fish.strings.makeNewGameButtonLabelText);
        $("#gameCodeTextFieldLabel").html(fish.strings.gameCodeTextFieldLabelText);
        $("#gameLevelMenuLabel").html(fish.strings.gameLevelMenuLabelText);
        $('#youAreChairText').html(fish.strings.youAreChairText);

        $("#setNameButton").text(fish.strings.setNameButton);
        $("#createGameButton").text(fish.strings.createGameButton);
        $("#joinGameButton").text(fish.strings.joinGameButton);
        $("#catchButton").text(fish.strings.catchButton);
        $("#chairEndsTurnButton").text(fish.strings.chairEndsTurnButton);
        $("#startNewGameButton").text(fish.strings.startNewGameButton);

    },

    "en": {

        /*
                yearAttributeName : "year",
                seenAttributeName : "seen",
                wantAttributeName : "want",
                caughtAttributeName : "caught",
                beforeAttributeName : "before",
                expensesAttributeName : "expenses",
                unitPriceAttributeName : "unitPrice",
                incomeAttributeName : "income",
                afterAttributeName : "after",
                playerAttributeName : "player",
                gameAttributeName : "game",
                resultAttributeName : "result",
                levelAttributeName : "level",

        */

        automateChairLabelText: "automate market? ",
        automateCatchLabelText: "automate? ",
        fishQuantityLabelText: "How many fish? ",
        playerNameLabelText: "What's your name? ",
        joinExistingGameButtonLabelText: "join existing game",
        makeNewGameButtonLabelText: "make new game",
        gameCodeTextFieldLabelText: "game code: ",
        gameLevelMenuLabelText: "Game level: ",
        youAreChairText: 'You are in charge of the fish market.',

        youAreFishingText: 'You are fishing. Catch fish!<br>Enter a number and press <b>catch</b>.',

        waitingToStartText: "Waiting to start a game!",
        successfullyJoinedText: "Successfully joined ",
        enterAndPressCatchText: "Enter a number and press <b>Catch</b>.",
        wonText: "won",
        lostText: "lost",
        drawText: "neither won nor lost",

        setNameButton: "Set name",
        createGameButton: "Create",
        joinGameButton: "Join",
        catchButton: "Catch",
        chairEndsTurnButton: "do fish market",
        startNewGameButton: "OK, start a new game",

        completedAllUpdates: "completed all updates for year ",
        youWonGame: "You won game",
        youLostGame: "You lost game",
        youDrewGame: "You neither won nor lost game",
        because: "because",
        youCanDoBetter: "Your business survived and so did the fish...but you can do better!",

        fishAtMarketText: function () {
            const number = fish.state.currentTurnResult ? fish.state.currentTurnResult.caught : "";
            if (!fish.state.playerName) {
                return `Waiting for you to log in`;
            } else {
                if (number) {
                    return `You have ${number} fish at the fish market. <br>Wait for them to be sold`
                } else {
                    return `You have no fish at the fish market. <br>Wait for the turn to end`
                }
            }
        },

        howManyPlayersString: function () {
            let out = "";

            let tN = fish.players.length;
            switch (tN) {
                case 0:
                    out += "You will be the first player.";
                    break;
                case 1:
                    out += "You are playing solo.";
                    break;
                case 2:
                    out += "There is one other player.";
                    break;
                default:
                    out += "There are " + (tN - 1) + " other players. ";
                    break
            }
            return out;
        },


        sitrep: function () {
            let out = this.howManyPlayersString();
            out += "<br>";
            out += this.makeWaitingText();
            return out;
        },

        /**
         * Called only from this file.
         * text telling who we're waiting for.
         */
        makeWaitingText: function () {
            const playerReport = fish.otherPlayersInfo();
            if (playerReport.allPlayers.length <= 0) {
                return "No players yet!";
            }
            let out = "";

            let waitingFor = playerReport.missing;
            const yourIndex = waitingFor.indexOf(fish.state.playerName);
            if (yourIndex > -1) {
                waitingFor.splice(yourIndex, 1);        //  remove the element there
            }
            if (yourIndex > -1) {
                out += "Waiting for <strong>YOU</strong>";
                if (waitingFor.length === 1) {
                    out += " and " + waitingFor[0] + ".";
                } else if (waitingFor.length > 0) {
                    out += " and " + waitingFor.length + " more.";
                } else {
                    out += ".";
                }
                out += " Catch fish!";
            } else {
                switch (waitingFor.length) {
                    case 0:
                        out += "Everyone has fished.";
                        break;
                    case 1:
                        out += "Waiting for " + waitingFor[0] + ".";
                        break;
                    case 2:
                        out += "Waiting for " + waitingFor[0] + " and " + waitingFor[1] + ".";
                        break;
                    default:
                        out += "Waiting for " + waitingFor[0] + " and " + (waitingFor.length - 1) + " more.";
                        break;
                }
            }
            return out;
        },

        historicalDataContextSetupObject: {
            name: fish.constants.kHistoricalDataSetName,
            title: fish.constants.kHistoricalDataSetTitle,
            description: 'historical fishing data',
            collections: [
                {
                    name: fish.constants.kHistoricalCollectionName,
                    labels: {
                        singleCase: "year",
                        pluralCase: "years",
                        setOfCasesWithArticle: "financial records"
                    },

                    attrs: [ // note how this is an array of objects.
                        {name: "year", type: 'numeric', precision: 0, description: "game year (i.e., turn)"},
                        {
                            name: "seen",
                            type: 'numeric',
                            precision: 1,
                            description: "how many fish you saw before you started fishing"
                        },
                        {name: "want", type: 'numeric', precision: 1, description: "how many fish you wanted to catch"},
                        {name: "caught", type: 'numeric', precision: 1, description: "how many fish you caught"},
                        {
                            name: "before",
                            type: 'numeric',
                            precision: 0,
                            description: "balance at beginning of the year"
                        },
                        {name: "expenses", type: 'numeric', precision: 0, description: "your costs"},
                        {
                            name: "unitPrice",
                            type: 'numeric',
                            precision: 2,
                            description: "price you got per unit of fish"
                        },
                        {name: "income", type: 'numeric', precision: 0, description: "your income from selling fish"},
                        {name: "after", type: 'numeric', precision: 0, description: "balance at the end of the year"},
                        {name: "player", type: 'categorical', description: "player name"},
                        {name: "game", type: 'categorical', description: "game code"},
                        {name: "result", type: 'categorical', description: "state of the game"},
                        {name: "level", type: 'categorical', description: "game rule set"}
                    ]
                }
            ]
        },


        fishDataContextSetupObject: {
            name: fish.constants.kFishDataSetName,
            title: fish.constants.kFishDataSetTitle,
            description: 'fishing data',
            collections: [
                {
                    name: fish.constants.kFishCollectionName,
                    labels: {
                        singleCase: "year",
                        pluralCase: "years",
                        setOfCasesWithArticle: "financial records"
                    },

                    attrs: [ // note how this is an array of objects.
                        {name: "year", type: 'numeric', precision: 0, description: "game year (i.e., turn)"},
                        {
                            name: "seen",
                            type: 'numeric',
                            precision: 1,
                            description: "how many fish you saw before you started fishing"
                        },
                        {name: "want", type: 'numeric', precision: 1, description: "how many fish you wanted to catch"},
                        {name: "caught", type: 'numeric', precision: 1, description: "how many fish you caught"},
                        {
                            name: "before",
                            type: 'numeric',
                            precision: 0,
                            description: "balance at beginning of the year"
                        },
                        {name: "expenses", type: 'numeric', precision: 0, description: "your costs"},
                        {
                            name: "unitPrice",
                            type: 'numeric',
                            precision: 2,
                            description: "price you got per unit of fish"
                        },
                        {name: "income", type: 'numeric', precision: 0, description: "your income from selling fish"},
                        {name: "after", type: 'numeric', precision: 0, description: "balance at the end of the year"},
                        {name: "player", type: 'categorical', description: "player name"},
                        {name: "game", type: 'categorical', description: "game code"}
                    ]
                }
            ]
        },


        makeRecentTurnReport: function (iTurn) {
            let out = "Your last full turn was year " + iTurn.turn
                + ".<br>You saw " + iTurn.seen + ", wanted " + iTurn.want
                + " and caught " + iTurn.caught + ".<br>You sold them for $"
                + iTurn.unitPrice + " each for a total of $" + iTurn.income + ".";

            return out;
        },

        makeCurrentTurnReport: function (iTurnResult) {
            let out = "This year, you saw " + iTurnResult.visible + " fish.";

            if (iTurnResult.want === iTurnResult.caught) {
                out += "<br>You caught the " + iTurnResult.caught
                    + " fish you wanted. ";
            } else {
                out += "<br>You wanted " + iTurnResult.want
                    + " fish, but caught only " + iTurnResult.caught + ". ";
            }

            return out;
        },

        constructGameEndMessage: function () {

            const theGame = fish.gameFromDB;

            let out = "";

            let tMessageParts = [];

            if (theGame.outOfTime) {
                tMessageParts.push(`The game ends in ${theGame.endingTurn}.<br>`);
            } else {
                tMessageParts.push(`The game ended early in ${theGame.turn}.<br>`);
            }

            switch (theGame.fishStars) {
                case 5:
                    tMessageParts.push("🐟🐟🐟🐟🐟 Well done! Five fish out of five! " +
                        "The fish population is healthy --- and so large that you can catch many fish " +
                        "without reducing the fish population. " +
                        "Fishing is now a sustainable source of food.");
                    break;
                case 4:
                    tMessageParts.push("🐟🐟🐟🐟 Your rating is four fish (out of five). " +
                        "The total number of fish has increased a lot! " +
                        "You can now catch more fish without reducing the population. " +
                        "Can you make it to five stars?");
                    break;
                case 3:
                    tMessageParts.push("🐟🐟🐟 Your rating is three fish (out of five). " +
                        "The total number of fish has increased! Your fishing business is doing well, but it could be better.");
                    break;
                case 2:
                    tMessageParts.push("🐟🐟 Your rating is two fish (out of five). " +
                        "The total number of fish has gone down. Your fishing business survived, " +
                        "but the fish population is not healthy.");
                    break;
                case 1:
                    tMessageParts.push("🐟 Your rating is one fish (out of five). " +
                        "The total number of fish is very low. You might not be able to keep fishing for much longer.");
                    break;
                case 0:
                    if (theGame.brokePlayers.length > 0) {
                        const brokePart = `💀 Your rating is zero fish (out of five).
                        You have lost the game because these players have gone bankrupt: ${theGame.brokePlayers}.`;
                        tMessageParts.push(brokePart);
                    } else {
                        tMessageParts.push("💀 Your rating is zero fish (out of five)! " +
                            "The fish will all soon be gone, and the fishing industry has collapsed.");
                    }
                    break;
                default:
                    //  no value for fishStars, that is, ended because of bankruptcy.
                    // tMessageParts.push("(Something odd happened at game end; the number of 'fish' doesn't make sense!)");
                    break;
            }


            if (tMessageParts.length === 0) {
                out = "...dang! We don't really know why!";
            } else {
                out = tMessageParts.join(" ");
            }
            return out;
        },

    },      //  end of en = English

    "es": {
        automateChairLabelText: "¿automatizar mercado? ",
        automateCatchLabelText: "¿automatizar? ",
        fishQuantityLabelText: "¿cuántos peces? ",
        playerNameLabelText: "¿cómo se llama? ",
        joinExistingGameButtonLabelText: "unirse al juego existente",
        makeNewGameButtonLabelText: "hacer juego nuevo",
        gameCodeTextFieldLabelText: "cógigo del juego: ",
        gameLevelMenuLabelText: "nivel del juego: ",
        youAreChairText: 'Ud es jefe del mercado de pescado',

        youAreFishingText: 'Esta pescando. <br>Entre un número y presione <b>pescar</b>.',

        waitingToStartText: "¡Esperando para comenzar un juego!",
        successfullyJoinedText: "Se unió con éxito ",
        enterAndPressCatchText: "Entre un número y presione <b>pescar</b>.",
        wonText: "ganó",
        lostText: "perdió",
        drawText: "ni ganó ni perdió",

        setNameButton: "entrar nombre",
        createGameButton: "crear juego",
        joinGameButton: "unirse",
        catchButton: "pescar",
        chairEndsTurnButton: "hacer mercado de pescados",
        startNewGameButton: "listo para iniciar juego nuevo",

        completedAllUpdates: "completado todas las actualizaciones por año ",
        youWonGame: "Ganó juego",
        youLostGame: "Perdió juego",
        youDrewGame: "Ni ganó ni perdió el juego",
        because: "porque",
        youCanDoBetter: "Su negocio sobrvivió, y también sobrvivió los peces...pero puede hacerlo mejor!",

        fishAtMarketText: function () {
            const number = fish.state.currentTurnResult ? fish.state.currentTurnResult.caught : "";
            if (!fish.state.playerName) {
                return `Esperando: Ud necesita entrar.`;
            } else {
                if (number) {
                    return `Tiene ${number} peces en el mercado. <br>Espere hasta que ellos se venden.`;
                } else {
                    return `No tiene pescado en el mercado. <br>Espere hasta el final del turno.`;
                }
            }

        },


        makeAboutPlayersText: function () {
            let out = "";

            let tN = fish.state.otherPlayersInfo.allPlayers.length;

            out += (tN === 1) ?
                "Está jugando solo. " :
                ((tN === 2) ? "Hay otro jugador. " : "Hay " + (tN - 1) + " otros jugadores. ");

            out += "<br>";
            out += this.makeWaitingText(fish.state.otherPlayersInfo, fish.state.playerName);


            return out;
        },

        /**
         * Called only from this file
         *
         * @param iWaiting  array of names of waiters
         * @param iYou      your name
         */
        makeWaitingText(iEndTurnObject, iYou) {

            let out = "";
            if (iEndTurnObject.OK) {
                if (fish.state.isChair) {
                    out += "Esperando al botón de hacer mercado. ¡Presiónelo! ";
                } else {
                    out += "Sus peces están en el mercado. ";
                }
            } else {
                let waitingFor = iEndTurnObject.missing;
                const yourIndex = waitingFor.indexOf(iYou);
                if (yourIndex > -1) {
                    waitingFor.splice(yourIndex, 1);        //  remove the element there
                }
                if (yourIndex > -1) {
                    out += "Esperando a <strong>USTED</strong>";
                    if (waitingFor.length === 1) {
                        out += " y " + waitingFor[0] + ".";
                    } else if (waitingFor.length > 0) {
                        out += " y " + waitingFor.length + " más.";
                    } else {
                        out += ".";
                    }
                    out += " ¡Pesque!";
                } else {
                    switch (waitingFor.length) {
                        case 0:
                            out += "Todos han pescado.";
                        case 1:
                            out += "Esperando a " + waitingFor[0] + ".";
                            break;
                        case 2:
                            out += "Esperando a " + waitingFor[0] + " y " + waitingFor[1] + ".";
                            break;
                        default:
                            out += "Esperando a " + waitingFor[0] + " y " + (waitingFor.length - 1) + " más.";
                            break;
                    }
                }
            }
            return out;
        },


        historicalDataContextSetupObject: {
            name: fish.constants.kHistoricalDataSetName,
            title: fish.constants.kHistoricalDataSetTitle,
            description: 'datos históricos',
            collections: [
                {
                    name: fish.constants.kHistoricalCollectionName,
                    labels: {
                        singleCase: "año",
                        pluralCase: "años",
                        setOfCasesWithArticle: "registros financieros"
                    },

                    attrs: [ // note how this is an array of objects.
                        {
                            name: "year",
                            title: "año",
                            type: 'numeric',
                            precision: 0,
                            description: "año del juego (i.e., turno)"
                        },
                        {name: "seen", title: "visto", type: 'numeric', precision: 1, description: "cuantos peces vió"},
                        {
                            name: "want",
                            title: "querría",
                            type: 'numeric',
                            precision: 1,
                            description: "cuantos peces querría atrapar"
                        },
                        {
                            name: "caught",
                            title: "atrapó",
                            type: 'numeric',
                            precision: 1,
                            description: "cuantos peces atrapados"
                        },
                        {
                            name: "before",
                            title: "antes",
                            type: 'numeric',
                            precision: 0,
                            description: "fondos al inicio del año"
                        },
                        {name: "expenses", title: "gastos", type: 'numeric', precision: 0, description: "sus gastos"},
                        {
                            name: "unitPrice",
                            title: "precio",
                            type: 'numeric',
                            precision: 2,
                            description: "precio recibido por cada unidad de peces"
                        },
                        {
                            name: "income",
                            title: "ingresos",
                            type: 'numeric',
                            precision: 0,
                            description: "sus ingresos por vender peces"
                        },
                        {
                            name: "after",
                            title: "después",
                            type: 'numeric',
                            precision: 0,
                            description: "fondos al termino del año"
                        },
                        {name: "player", title: "jugador", type: 'categorical', description: "nombre del jugador(a)"},
                        {name: "game", title: "juego", type: 'categorical', description: "codigo del juego"},
                        {name: "result", title: "resultado", type: 'categorical', description: "resultado del juego"},
                        {name: "level", title: "nivel", type: 'categorical', description: "tipo de pez"}
                    ]
                }
            ]
        },


        fishDataContextSetupObject: {
            name: fish.constants.kFishDataSetName,
            title: fish.constants.kFishDataSetTitle,
            description: 'fishing data',
            collections: [
                {
                    name: fish.constants.kFishCollectionName,
                    labels: {
                        singleCase: "año",
                        pluralCase: "años",
                        setOfCasesWithArticle: "registros financieros"
                    },

                    attrs: [ // note how this is an array of objects.
                        {
                            name: "year",
                            title: "año",
                            type: 'numeric',
                            precision: 0,
                            description: "año del juego (i.e., turno)"
                        },
                        {name: "seen", title: "visto", type: 'numeric', precision: 1, description: "cuantos peces vió"},
                        {
                            name: "want",
                            title: "querría",
                            type: 'numeric',
                            precision: 1,
                            description: "cuantos peces querría atrapar"
                        },
                        {
                            name: "caught",
                            title: "atrapó",
                            type: 'numeric',
                            precision: 1,
                            description: "cuantos peces atrapados"
                        },
                        {
                            name: "before",
                            title: "antes",
                            type: 'numeric',
                            precision: 0,
                            description: "fondos al inicio del año"
                        },
                        {name: "expenses", title: "gastos", type: 'numeric', precision: 0, description: "sus gastos"},
                        {
                            name: "unitPrice",
                            title: "precio",
                            type: 'numeric',
                            precision: 2,
                            description: "precio recibido por cada unidad de peces"
                        },
                        {
                            name: "income",
                            title: "ingresos",
                            type: 'numeric',
                            precision: 0,
                            description: "sus ingresos por vender peces"
                        },
                        {
                            name: "after",
                            title: "después",
                            type: 'numeric',
                            precision: 0,
                            description: "fondos al termino del año"
                        },
                        {name: "player", title: "jugador", type: 'categorical', description: "nombre del jugador(a)"},
                        {name: "game", title: "juego", type: 'categorical', description: "codigo del juego"},
                    ]
                }
            ]
        },


        makeRecentTurnReport: function (iTurn) {
            let out = "Su último turno completo era " + iTurn.year
                + ".<br>Vio " + iTurn.seen + ", quería " + iTurn.want
                + " y atrapó " + iTurn.caught + ".<br>Los vendió por $"
                + iTurn.unitPrice + " cada uno, por un total de $" + iTurn.income + ".";

            return out;
        },

        makeCurrentTurnReport: function (iTurnResult) {
            let out = "Este año, vio " + iTurnResult.visible + " peces.";

            if (iTurnResult.want === iTurnResult.caught) {
                out += "<br>Atrapó los " + iTurnResult.caught
                    + " peces que quería. ";
            } else {
                out += "<br>Quería " + iTurnResult.want
                    + " peces, pero atrapó solamente " + iTurnResult.caught + ". ";
            }

            return out;
        },

        constructGameEndMessageFrom: function (iReason) {

            let out = "";

            if (iReason.end) {
                let tMessageParts = [];

                if (iReason.time) {
                    tMessageParts.push("este juego se termine en el año " + fish.game.endingTurn);
                }

                switch (iReason.pop) {
                    case "high":
                        tMessageParts.push("la población de peces ahora es lo suficentemente grande para ser sostenible");
                        break;
                    case "low":
                        tMessageParts.push("la población de peces ahora no es lo suficentemente grande para ser sostenible");
                        break;
                }

                iReason.broke.forEach((p) => {  //  broke is an array of player names.
                    tMessageParts.push(p + " tiene(n) un saldo negativo");
                });

                if (tMessageParts.length === 0) {
                    out = "Caramba. ¡No sabemos porqué!";
                } else {
                    out = tMessageParts.join(", y ") + ".";
                }
            }
            return out;
        }


    }

};

