/**
 *  Singleton that communicates with CODAP
 */


const connect = {

    attributeDragDropSubscriberIndex: null,

    initialize: async function () {
        //  note: these subscriptions must happen BEFORE `.init` so that the `.on` there does not
        //  override our handlers.
        codapInterface.on('update', 'interactiveState', "", handlers.restorePluginFromStore);
        codapInterface.on('get', 'interactiveState', "", handlers.getPluginState);

        await codapInterface.init(this.iFrameDescriptor, handlers.restorePluginFromStore);
        await this.registerForDragDropEvents();     //  if you're acce[ting drops!
        await this.allowReorg();

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
     * Find and edit the values in `syllo.constants`
     */
    iFrameDescriptor: {
        name: syllo.constants.pluginName,
        title: syllo.constants.pluginName,
        version: syllo.constants.version,
        dimensions: syllo.constants.dimensions,      //      dimensions,
    },

}