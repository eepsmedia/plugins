const temple = {

    playerHearsGod: function (iMessage) {

        switch (iMessage.type) {
            case 'newGame':
                treePre.newGame(iMessage.content);
                break;
            case 'endYear':
                treePre.endYear(iMessage.content);
                break;
            case 'newYear':
                treePre.newYear(iMessage.content);
                break;
            case 'endGame':
                treePre.endGame(iMessage.content);
                break;
            default:
                break;
        }
    },

    playerSpeaksToGod: function (type) {
        let message = {};

        switch (type) {
            case "join":
                message = {
                    type: 'join',
                    content: {
                        'player': treePre.state.me
                    }
                }
                break;
            case "harvest":
                message = {
                    type: 'harvest',
                    content: {
                        playerName: treePre.state.me.name,
                        trees: treePre.markedTrees
                    }
                }
                break;

            default:
                break;
        }
        this.godHearsPlayer(message);
    },

    godHearsPlayer: function (iMessage) {

        switch (iMessage.type) {
            case 'join':
                god.addPlayer(iMessage.content.player);
                break;

            case 'harvest':
                god.addHarvest(iMessage.content.playerName, iMessage.content.trees);
                break;
            default:
                break;
        }
    },

    godSpeaksToPlayer: function (type) {
        let message = {};

        switch (type) {
            case 'newGame' :
                message = {
                    type: 'newGame',
                    content: {
                        year: god.gameParams.year,
                        players: nature.players,
                        trees: nature.treeAgesAndIndicesArray(),
                    }
                }
                break;

            case 'endYear':
                message = {
                    type: 'endYear',
                    content: {
                        year: god.gameParams.year,
                        biomass : nature.biomass,
                        players: nature.players,
                        trees: nature.treeAgesAndIndicesArray(),
                        transactions: nature.currentTransactions,
                    }
                }
                break;

            case 'newYear':
                message = {
                    type: 'newYear',
                    content: {
                        year: god.gameParams.year,
                        biomass : nature.biomass,
                        players: nature.players,
                        trees: nature.treeAgesAndIndicesArray(),
                        transactions: nature.currentTransactions,
                    }
                }
                break;

            case 'endGame' :
                const content = {
                    year: god.gameParams.year,
                    biomass : nature.biomass,
                    players: nature.players,
                    trees: nature.treeAgesAndIndicesArray(),
                    transactions: nature.allTransactions
                };

                const endContent = {...god.debriefInfo, ...content};
                message = {
                    type: 'endGame',
                    content: endContent
                }
                break;

            default:
                break;
        }
        this.playerHearsGod(message);
    },

}