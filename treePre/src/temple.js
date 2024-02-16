const temple = {

    playerHearsGod : function(iMessage) {

        switch(iMessage.type) {
            case 'newYear':
                treePre.newYear(iMessage.content.players, iMessage.content.trees);
                break;
            case 'newGame':
                treePre.newGame();
                    //      treePre.newGame(iMessage.content.players, iMessage.content.trees);
                break;
            case 'endGame':
                treePre.endGame();
                break;
            default:
                break;
        }
    },

    playerSpeaksToGod : function(type) {
        let message = {};

        switch (type) {
            case "join":
                message = {
                    type : 'join',
                    content : {
                        'player' : treePre.state.me
                    }
                }
                break;
            case "harvest":
                message = {
                    type : 'harvest',
                    content : {
                        playerName : treePre.state.me.name,
                        trees : treePre.markedTrees
                    }
                }
                break;

            default:
                break;
        }
        this.godHearsPlayer(message);
    },

    godHearsPlayer : function(iMessage) {

        switch(iMessage.type) {
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

    godSpeaksToPlayer : function(type) {
        let message = {};

        switch(type) {
            case 'newYear':
                message = {
                    type : 'newYear',
                    content : {
                        players : god.players,
                        trees : god.treeAgesArray(),
                    }
                }
                break;

            case 'newGame' :
                message = {
                    type : 'newGame',
                    content: {
                        players : god.players,
                        trees : god.treeAgesArray(),
                    }
                }
                break;

            case 'endGame' :
                break;

            default:
                break;
        }
        this.playerHearsGod(message);
    },

}