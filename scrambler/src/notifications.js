notificatons = {

    documentSubscriberIndex: null,
    datasetSubscriberIndex: null,

    registerForDocumentChanges : function() {
        const tResource = `documentChangeNotice`;
        this.documentSubscriberIndex = codapInterface.on(
            'notify',
            tResource,
            notificatons.handleDocumentChangeNotice
        );
        console.log(`registered for changes to document. index ${this.documentSubscriberIndex}`);
    },

    /**
     *  register to receive notifications about changes to the data context (including selection)
     */
    registerForDatasetChanges : function(iName)
    {
        if (this.datasetSubscriberIndex) {        //  zero is a valid index... :P but it should be the "get"
            codapInterface.off(this.datasetSubscriberIndex);    //  blank that subscription.
        }

        const sResource = `dataContextChangeNotice[${iName}]`;
        this.datasetSubscriberIndex =  codapInterface.on(
            'notify',
            sResource,
            //'selectCases',
            notificatons.handleDatasetChangeNotice
        );
        console.log(`registered for changes to ${iName}. index ${this.datasetSubscriberIndex}`);
    },

    handleDatasetChangeNotice : function(iMessage) {
        console.log(`ds change notice: ${iMessage.values.operation}`);

        switch(iMessage.values.operation)  {
            case "moveAttribute":       //  drag left or right
            case "updateAttributes":    //  includes renaming
            case "createCollection":    //  dragged an attribute left
                scrambler.state.dirtyMeasures = true;
                scrambler.refreshAllData();
                break;
            case "createAttributes":
                scrambler.state.dirtyMeasures = true;
                const firstAtt = iMessage.values.result.attrs[0];
                console.log(`    resource: ${iMessage.resource} attrs[0]: ${firstAtt.name} ${firstAtt.guid}`);
                break;
            default:
                break;
        }
    },

    handleDocumentChangeNotice : function (iMessage) {
        console.log(`doc change notice: ${iMessage.values.operation}`);
        scrambler.refreshUIDisplay();
    },



}