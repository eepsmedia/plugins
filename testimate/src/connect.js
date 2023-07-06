let connect;

/**
 *  Singleton that communicates with CODAP
 */


connect = {

    caseChangeSubscriberIndex : null,
    attributeDragDropSubscriberIndex : null,

    initialize : async function() {

        await codapInterface.init(this.iFrameDescriptor, null);
        await this.registerForDragDropEvents();
        await this.allowReorg();
    },

    /**
     * Constant descriptor for the iFrame.
     * Find and edit the values in `scrambler.constants`
     */
    iFrameDescriptor: {
        name: testimate.constants.pluginName,
        title: testimate.constants.pluginName,
        version: testimate.constants.version,
        dimensions: testimate.constants.dimensions,      //      dimensions,
    },

    /**
     * Register for the dragDrop[attribute] event
     */
    registerForDragDropEvents : function() {
        const tResource = `dragDrop[attribute]`;

        this.attributeDragDropSubscriberIndex = codapInterface.on(
            'notify', tResource, testimate.dropManager.handleDragDrop
        )
        console.log(`registered for drags and drops. Index ${this.attributeDragDropSubscriberIndex}`);

    },

    /**
     *  register to receive notifications about changes to the data context (including selection)
     *  called from testimate.setDataset()
     */
    registerForCaseChanges : async function(iName)
    {
        if (this.caseChangeSubscriberIndex) {        //  zero is a valid index... :P but it should be the "get"
            codapInterface.off(this.caseChangeSubscriberIndex);    //  blank that subscription.
        }

        const sResource = `dataContextChangeNotice[${iName}]`;
        //  const sResource = `dataContext[${iName}].case`;
        try {
            this.caseChangeSubscriberIndex = codapInterface.on(
                'notify',
                sResource,
                data.handleCaseChangeNotice
            );
            console.log(`registered for case changes in ${iName}. Index ${this.caseChangeSubscriberIndex}`);
        } catch (msg) {
            console.log(`problem registering for case changes: ${msg}`);
        }

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


}