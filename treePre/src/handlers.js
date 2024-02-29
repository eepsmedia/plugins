const handlers = {

    currentlyDraggingCODAPAttribute: false,

    getPluginState: function () {
        return {
            success: true,
            values: {
                store: treePre.state,
            }
        };
    },

    restorePluginFromStore: function (iStorage) {
        if (iStorage) {
            treePre.state = iStorage.store;
        }
    },

    //  control handlers


    doJoin : function() {

        const proposedusername = "Joachim"; //  todo: replace with getting it from a text box
        treePre.state.me = new Player(proposedusername);
        temple.playerSpeaksToGod("join");

        treePre.gamePhase = treePre.phases.kWaiting;
        treePre.cycle();
    },

    doHarvest : function() {
        temple.playerSpeaksToGod("harvest");
        treePre.gamePhase = treePre.phases.kWaitingForMarket;
        if (singlePlayer) god.endYear();    //  god does not have to wait for everybody
        treePre.cycle();
    },

    doShowData : function() {
        connect.makeCaseTableAppear();
        connect.makeGraphAppear();
    },

    pressCountButton: function () {
        treePre.state.buttonCount++;
        treePre.cycle();
    },

    markTreeSVG: function(event, data) {
        const whichOne = treePre.markedTrees.indexOf(data.index);
        if (whichOne != -1) {
            treePre.markedTrees.splice(whichOne,1);
        } else if (treePre.markedTrees.length < god.gameParams.maxHarvest) {
            treePre.markedTrees.push(data.index);
        }

        treePre.cycle();
    },


}