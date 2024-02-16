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

        const proposedusername = "foo"; //  todo: replace with getting it from a text box
        treePre.state.me = new Player(proposedusername);
        temple.playerSpeaksToGod("join");

        treePre.gamePhase = "waiting";
        treePre.cycle();
    },

    doHarvest : function() {
        temple.playerSpeaksToGod("harvest");
        treePre.gamePhase = "waiting for market";
    },

    pressCountButton: function () {
        treePre.state.buttonCount++;
        treePre.cycle();
    },

    markTree: function(tIndex) {
        const where = treePre.markedTrees.indexOf(tIndex);
        if (where != -1) {
            treePre.markedTrees.splice(where,1);
        } else if (treePre.markedTrees.length < god.gameParams.maxHarvest) {
            treePre.markedTrees.push(tIndex);
        }
        treePre.cycle();
    },


}