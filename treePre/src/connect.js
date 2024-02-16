
/**
 *  Singleton that communicates with CODAP
 */


const connect = {

    initialize : async function() {
        //  note: these subscriptions must happen BEFORE `.init` so that the `.on` there does not
        //  override our handlers.
        codapInterface.on('update', 'interactiveState', "", handlers.restorePluginFromStore);
        codapInterface.on('get', 'interactiveState', "", handlers.getPluginState);

        await codapInterface.init(this.iFrameDescriptor, handlers.restorePluginFromStore);
        //  await this.registerForDragDropEvents();     //  if you're acce[ting drops!
        await this.allowReorg();

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
        name: treePre.constants.pluginName,
        title: treePre.constants.pluginName,
        version: treePre.constants.version,
        dimensions: treePre.constants.dimensions,      //      dimensions,
    },

}