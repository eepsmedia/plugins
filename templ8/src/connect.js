
/**
 *  Singleton that communicates with CODAP
 */


const connect = {

    attributeDragDropSubscriberIndex : null,

    initialize : async function() {

        await codapInterface.init(this.iFrameDescriptor, null);
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
     * Find and edit the values in `templ8.constants`
     */
    iFrameDescriptor: {
        name: templ8.constants.pluginName,
        title: templ8.constants.pluginName,
        version: templ8.constants.version,
        dimensions: templ8.constants.dimensions,      //      dimensions,
    },

}