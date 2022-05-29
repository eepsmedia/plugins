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
        gameOverDiv.style.display = (mazu.showWonLost()) ?  "flex" : "none";

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
        let guts = "";

        if (mazu.playing() || mazu.showWonLost()) {
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


    playerRow: function (p, iTurns) {
        let myTurn = null;
        iTurns.forEach((t) => {
  //              console.log(`turn: ${JSON.stringify(t)}`);
            if (t.playerName === p.playerName) {
                myTurn = t;
            }
        });

        const tWanted = myTurn ? myTurn.want : "--";
        return (
            `<tr key=${p.playerName} class="playerRow">
                <td>${p.playerName}</td>
                <td>${tWanted}</td>
                <td>${p.balance}</td>
                <td>${p.playerState}</td>
            </tr>`
        )
    },

    playerList: function (props) {

        const thePlayers = mazu.model.thePlayers;
        const theTurns = mazu.model.theTurns;
        const listGuts = thePlayers.map(
            (p) => this.playerRow(p, theTurns)
        );

        const headerText = thePlayers.length + " player(s)";
        const tableHeader = `<tr>
                <th>name</th>
                <th>wants</th>
                <th>balance</th>
                <th>status</th>
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

        const situation = await mazu.model.getCurrentSituation();
        const autoSellBox = this.autoSellBox();
        let guts = `<h3 class="ui-stripe-element">Fish Market</h3>`

        if (situation.OK) {
            guts +=  `
                    <button id="sellFishButton"  class="ui-stripe-element"
                    onClick="mazu.model.sellFish()">sell fish</button>
                    ${autoSellBox}
                `;
        } else {
            if (situation.missing.length > 0) {
                const missingPlayerList = situation.missing.join(", ");
                guts +=  `
                    <span  class="ui-stripe-element">Waiting for ${missingPlayerList}</span>
                    ${autoSellBox}
                `;

            } else {
                guts +=  `no fish to sell`
            }
        }

        return guts;
    },

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

        if (mazu.showWonLost()) {
            const theGame = mazu.model.theGame;

            return `
        <h3>Game over! The players ${theGame.gameState}!</h3>
        <p>${theGame.reason}</p>
        `;
        } else  {
            return "end hgame message";
        }
    }

}