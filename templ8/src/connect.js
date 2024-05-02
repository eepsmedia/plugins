
/**
 *  Singleton that communicates with CODAP
 */


const connect = {

    attributeDragDropSubscriberIndex : null,

    initialize : async function() {
        //  note: these subscriptions must happen BEFORE `.init` so that the `.on` there does not
        //  override our handlers.
        codapInterface.on('update', 'interactiveState', "", handlers.restorePluginFromStore);
        codapInterface.on('get', 'interactiveState', "", handlers.getPluginState);

        await codapInterface.init(
            this.getIFrameDescriptor(),
            handlers.restorePluginFromStore         //  restores the state, if any
        );
        await this.registerForDragDropEvents();     //  if you're accepting drops!
        await this.allowReorg();
        await this.renameIFrame(localize.getString("frameTitle"));  //  localize the frame title

    },


    /**
     * Register for the dragDrop[attribute] event.
     *
     * Called from connect.initialize();
     */
    registerForDragDropEvents: function () {
        const tResource = `dragDrop[attribute]`;

        this.attributeDragDropSubscriberIndex = codapInterface.on(
            'notify', tResource, handlers.handleDragDrop
        )
        console.log(`registered for drags and drops. Index ${this.attributeDragDropSubscriberIndex}`);

    },

    renameIFrame : async function(iName){
        const theMessage = {
            action : "update",
            resource : "interactiveFrame",
            values : {
                title : iName,
            }
        };
        await codapInterface.sendRequest( theMessage );
    },


    /**
     * Kludge to ensure that a dataset is reorg-able.
     *
     * @returns {Promise<void>}
     */
    allowReorg: async function () {
        const tMutabilityMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };

        codapInterface.sendRequest(tMutabilityMessage);
    },

    /**
     * Constant descriptor for the iFrame.
     * Find and edit the values in `templ8.constants`
     */
    getIFrameDescriptor: function() {
        return {
            name: templ8.constants.pluginName,
            title: localize.getString("frameTitle"),
            version: templ8.constants.version,
            dimensions: templ8.constants.dimensions,      //      dimensions,
        }
    },

}