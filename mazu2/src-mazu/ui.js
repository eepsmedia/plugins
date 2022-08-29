const ui = {

    initialize: function () {
        document.getElementById("loginName").value = "";
        mazuStart.initialize();
    },

    update: async function () {
        const mazuLoginDiv = document.getElementById("mazuLoginDiv");
        const mazuStartDiv = document.getElementById("mazuStartDiv");
        const mazuHeader = document.getElementById("mazuHeader");
        const mazuMarketDiv = document.getElementById("mazuMarketDiv");
        const mazuPlayerListDiv = document.getElementById("mazuPlayerListDiv");
        const gameOverDiv = document.getElementById("gameOverDiv");

        const playing = mazu.playing();

        mazuHeader.style.display = (mazu.loginName.length || playing) ? "flex" : "none";
        mazuLoginDiv.style.display = mazu.loginName.length ? "none" : "flex";
        mazuStartDiv.style.display = (!playing && mazu.loginName.length) ?  "flex" : "none";
        mazuMarketDiv.style.display = (playing && mazu.loginName.length) ?  "flex" : "none";
        mazuPlayerListDiv.style.display = (playing && mazu.loginName.length) ?  "flex" : "none";
        gameOverDiv.style.display = (mazu.isGameOver()) ?  "flex" : "none";

        gameOverDiv.innerHTML = this.makeEndGameMessage();
        mazuHeader.innerHTML = this.makeHeaderGuts();

        if (playing) {
            mazuMarketDiv.innerHTML = await this.fishMarket();
            mazuPlayerListDiv.innerHTML = await this.playerList();
        } else {
            mazuStart.update();
        }
    },

    makeHeaderGuts : function() {
        if (mazu.playing() || mazu.isGameOver()) {
            guts = `
            <div class="ui-stripe-element">
            ${mazu.model.theGame.gameCode} | 
            ${mazu.model.theGame.turn} | 
            ${mazu.model.theGame.population} | 
            ${mazu.model.theGame.configuration} | 
            ${mazu.model.theGame.god}</div>
            <div class="ui-stripe-element">
            <button onclick="mazu.leaveGame()">leave game</button>
            </div>
            `
        } else {
            guts = `no game yet | ${mazu.loginName}`
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
        let myTurn = mazu.model.mostRecentPlayerTurn(p.playerName); //  if from previous year,

        if (myTurn) {
            let tPlayerState = mazu.constants.kBetweenString;
            let tWanted = null;
            let tBalance = 0;

            if (myTurn.turn === mazu.model.theGame.turn) {      //  from current year, so PARTIAL turn without after
                tWanted = myTurn.want;
                tPlayerState = mazu.constants.kSellingString;
                tBalance = myTurn.before;
            } else {        //  from previous year
                tWanted = "--";
                tPlayerState = mazu.constants.kFishingString;   //  haven't told us how many yet
                tBalance = myTurn.after;
            }

            const thePlayingIcon = p.playing ? "./art/slide-on-simplest.png" : "./art/slide-off-simplest.png";

            return (
                `<tr key=${p.playerName} class="playerRow">
                    <td>${p.playerName}</td>
                    <td>${tWanted}</td>
                    <td>${tBalance}</td>
                    <td>${tPlayerState}</td>
                    <td><img src="${thePlayingIcon}" height="18" onclick="mazu.handleSleepWake('${p.playerName}')"></td>
                </tr>`
            )
        } else {
            //  we have a player, but no turns yet (mazu has quit and rejoined before game starts)
            return (
                `<tr key=${p.playerName} class="playerRow">
                <td>${p.playerName}</td>
                <td>?</td>
                <td>?</td>
                <td>?</td>
            </tr>`

            )
        }
    },

    playerList: function (props) {

        const thePlayers = mazu.model.thePlayers;
        const playingPlayers = mazu.model.playingPlayers();
        const theTurns = mazu.model.allTurns;
        const listGuts = thePlayers.map(
            (p) => this.playerRow(p, theTurns)
        );

        const headerText = (playingPlayers.length === thePlayers.length)
            ? `${playingPlayers.length} ${playingPlayers.length === 1 ? "player" :"players"}`
            : `${playingPlayers.length} ${playingPlayers.length === 1 ? "player is" :"players are"}
                    playing out of ${thePlayers.length} total`;
        const tableHeader = `<tr>
                <th>name</th>
                <th>wants</th>
                <th>balance</th>
                <th>status</th>
                <th>playing</th>
            </tr>`;

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
            <h4>no players yet</h4>
        `;

        return `<div>${wholeThing}</div>`;
    },

    fishMarket: async function () {

        const tAutoSellBox = this.autoSellBox();
        let guts = `<h3 class="ui-stripe-element">Fish Market</h3>`

        if (mazu.model.theSituation.OK) {
            guts +=  `
                    <button id="sellFishButton"  class="ui-stripe-element"
                    onClick="mazu.model.sellFish()">sell fish</button>
                    ${tAutoSellBox}
                `;
        } else {
            if (mazu.model.theSituation.missing.length > 0) {
                const missingPlayerList = mazu.model.theSituation.missing.join(", ");
                guts +=  `
                    <span  class="ui-stripe-element">Waiting for ${missingPlayerList}</span>
                    ${tAutoSellBox}
                `;

            } else {
                guts +=  `no fish to sell`
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
                   onChange="mazu.handleAutoSellBoxChange()"
                   ${string}
            />
            <label htmlFor="autoSellBox">automate market</label>
        `}
     */
    autoSellBox: function (props) {

        return `
            <input type="checkbox"
                   id="autoSellBox"
                   onChange="mazu.handleAutoSellBoxChange()"
                   ${mazu.state.autoSell ? " checked" : ""}
            />
            <label htmlFor="autoSellBox">automate market</label>
        `
    },

    makeEndGameMessage : function() {
        const theGame = mazu.model.theGame;

        return `
        Game over! Players got ${theGame.fishStars}/5 fish!
        `
    },
}