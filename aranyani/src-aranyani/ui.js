const ui = {

    initialize: function () {
        document.getElementById("loginName").value = "";
        aranyaniStart.initialize();
    },

    update: async function () {
        const aranyaniLoginDiv = document.getElementById("aranyaniLoginDiv");
        const aranyaniStartDiv = document.getElementById("aranyaniStartDiv");
        const aranyaniNewGame = document.getElementById("aranyaniNewGame");   //  div with type menu and join button
        const aranyaniOldGames = document.getElementById("aranyaniOldGames");   //  div with old game table
        const aranyaniHeader = document.getElementById("aranyaniHeader");
        const aranyaniMarketDiv = document.getElementById("aranyaniMarketDiv");
        const aranyaniPlayerListDiv = document.getElementById("aranyaniPlayerListDiv");
        const gameOverDiv = document.getElementById("gameOverDiv");
        const typesMenu = document.getElementById("gameTypesMenu");

        const playing = aranyani.playing();

        aranyaniHeader.style.display = (aranyani.loginName.length || playing) ? "flex" : "none";
        aranyaniLoginDiv.style.display = aranyani.loginName.length ? "none" : "flex";
        aranyaniStartDiv.style.display = (!playing && aranyani.loginName.length) ? "flex" : "none";
        //  aranyaniOldGames.style.display = (!playing && aranyani.loginName.length) ?  "flex" : "none";
        aranyaniMarketDiv.style.display = (playing && aranyani.loginName.length) ? "flex" : "none";
        aranyaniPlayerListDiv.style.display = (playing && aranyani.loginName.length) ? "flex" : "none";
        gameOverDiv.style.display = (aranyani.isGameOver()) ? "flex" : "none";

        gameOverDiv.innerHTML = this.makeEndGameMessage();
        aranyaniHeader.innerHTML = this.makeHeaderGuts();

        typesMenu.style.display = (!playing && aranyaniStart.newGame && aranyani.loginName.length) ? "block" : "none";
        aranyaniOldGames.style.display = (!playing && !aranyaniStart.newGame && aranyani.loginName.length) ? "flex" : "none";
        aranyaniNewGame.style.display = (!playing && aranyaniStart.newGame && aranyani.loginName.length) ? "flex" : "none";

        if (playing) {
            aranyaniMarketDiv.innerHTML = await this.fishMarket();
            aranyaniPlayerListDiv.innerHTML = await this.playerList();
        } else {
            aranyaniStart.update();
        }
    },

    //  todo: see if we really don't use this!
    setGameStartControlVisibility: function () {
        const oldGames = document.getElementById("oldGamesMenu");

    },


    makeHeaderGuts: function () {
        if (aranyani.playing() || aranyani.isGameOver()) {
            guts = `
            <div class="ui-stripe-element">
            ${aranyani.model.theGame.gameCode} | 
            ${aranyani.model.theGame.year} | 
            ${aranyani.model.theGame.population} | 
            ${aranyani.model.theGame.configuration} | 
            ${aranyani.model.theGame.god}</div>
            <div class="ui-stripe-element">
            <button id="leaveGameButton" onclick="aranyani.leaveGame()">${DG.plugins.aranyani.buttons.leaveGameButton}</button>
            </div>
            `
        } else {
            guts = `${DG.plugins.aranyani.admin.noGameYet} | ${aranyani.loginName}`
        }
        return guts;
    },

    /**
     *
     * @param p     a player (like in the DB)
     * @param iTurns    the turns
     * @returns {`<tr key=${*} class="playerRow">
                <td>${*}</td>
                <td>${{de: string, es: string}|string}</td>
                <td>${string}</td>
                <td>${string}</td>
            </tr>`}
     */
    playerRow: function (p, iTurns) {
        let myTurn = aranyani.model.mostRecentPlayerTurn(p.playerName); //  if from previous year,
        const thePlayingIcon = p.playing ? "./art/slide-on-simplest.png" : "./art/slide-off-simplest.png";

        if (myTurn) {
            let tPlayerState = aranyani.constants.kBetweenString;
            let tWanted = null;
            let tBalance = 0;

            if (myTurn.year === aranyani.model.theGame.year) {      //  from current year, so PARTIAL turn without after
                tWanted = myTurn.want;
                tPlayerState = aranyani.constants.kSellingString;
                tBalance = myTurn.before;
            } else {        //  from previous year
                tWanted = "--";
                tPlayerState = aranyani.constants.kFishingString;   //  haven't told us how many yet
                tBalance = myTurn.after;
            }

            return (
                `<tr key=${p.playerName} class="playerRow">
                    <td>${p.playerName}</td>
                    <td>${tWanted}</td>
                    <td>${tBalance}</td>
                    <td>${tPlayerState}</td>
                    <td><img src="${thePlayingIcon}" height="18" onclick="aranyani.handleSleepWake('${p.playerName}')"></td>
                </tr>`
            )
        } else {
            //  we have a player, but no turns yet (aranyani has quit and rejoined before game starts)
            return (
                `<tr key=${p.playerName} class="playerRow">
                <td>${p.playerName}</td>
                <td>?</td>
                <td>?</td>
                <td>?</td>
                <td><img src="${thePlayingIcon}" height="18" onclick="aranyani.handleSleepWake('${p.playerName}')"></td>
           </tr>`

            )
        }
    },

    playerList: function (props) {

        const thePlayers = aranyani.model.thePlayers;
        const playingPlayers = aranyani.model.playingPlayers();
        const theTurns = aranyani.model.allTurns;
        const listGuts = thePlayers.map(
            (p) => this.playerRow(p, theTurns)
        );

        const headerText = (playingPlayers.length === thePlayers.length)
            ? `${playingPlayers.length} ${playingPlayers.length === 1 ? "player" : "players"}`
            : `${playingPlayers.length} ${playingPlayers.length === 1 ? "player is" : "players are"}
                    playing out of ${thePlayers.length} total`;
        const tableHeader = DG.plugins.aranyani.admin.playerTableHeader;
        /*
                    `<tr>
                        <th>name</th>
                        <th>wants</th>
                        <th>balance</th>
                        <th>status</th>
                        <th>playing</th>
                    </tr>`;
        */

        const wholeThing = thePlayers.length > 0 ?
            `
            <div>
                <h3>${headerText}</h3>
                <div>
                    <table id="playerTable">
                        <thead>${tableHeader}</thead>
                        <tbody>${listGuts}</tbody>
                    </table>
                </div>
            </div>
        ` : `
            <h4>${DG.plugins.aranyani.noPlayersYet}</h4>
        `;

        return `<div>${wholeThing}</div>`;
    },

    fishMarket: async function () {

        const tAutoSellBox = this.autoSellBox();
        let guts = `<h3 class="ui-stripe-element">${DG.plugins.aranyani.admin.fishMarket}</h3>`

        if (aranyani.model.theSituation.OK) {
            guts += `
                    <button id="sellFishButton"  class="ui-stripe-element"
                    onClick="aranyani.model.sellFish()">${DG.plugins.aranyani.buttons.sellFishButton}</button>
                    ${tAutoSellBox}
                `;
        } else {
            if (aranyani.model.theSituation.missing.length > 0) {
                const missingPlayerList = aranyani.model.theSituation.missing.join(", ");
                guts += `
                    <span  class="ui-stripe-element">${DG.plugins.aranyani.waitingFor} ${missingPlayerList}</span>
                    ${tAutoSellBox}
                `;

            } else {
                guts += `no fish to sell`
            }
        }

        return guts;
    },

    /**
     * Create the HTML for the automated sell box.
     *
     * @param props
     * @returns {`
            <input type="checkbox"
                   id="autoSellBox"
                   onChange="aranyani.handleAutoSellBoxChange()"
                   ${string}
            />
            <label htmlFor="autoSellBox">automate market</label>
        `}
     */
    autoSellBox: function (props) {

        return `
            <input type="checkbox"
                   id="autoSellBox"
                   onChange="aranyani.handleAutoSellBoxChange()"
                   ${aranyani.state.autoSell ? " checked" : ""}
            />
            <label htmlFor="autoSellBox">${DG.plugins.aranyani.admin.automateMarket}</label>
        `
    },

    makeEndGameMessage: function () {
        const theGame = aranyani.model.theGame;

        return `
        Game over! Players got ${theGame.fishStars}/5 fish!
        `
    },
}