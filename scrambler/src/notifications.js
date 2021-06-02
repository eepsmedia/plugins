notificatons = {

    registerForDocumentChanges : function() {
        const tResource = `documentChangeNotice`;
        codapInterface.on(
            'notify',
            tResource,
            notificatons.handleDocumentChangeNotice
        );
    },

    /**
     *  register to receive notifications about changes to the data context (including selection)
     */
    registerForDatasetChanges : function(iName)
    {
        const sResource = `dataContextChangeNotice[${iName}]`;
        codapInterface.on(
            'notify',
            sResource,
            //'selectCases',
            notificatons.handleDatasetChangeNotice
        );
    },

    handleDatasetChangeNotice : function(iMessage) {
        console.log(`ds change notice: ${iMessage.values.operation}`);

        switch(iMessage.values.operation)  {
            case "moveAttribute":       //  drag left or right
            case "updateAttributes":    //  includes renaming
                scrambler.refresh();
                break;
            default:
                break;
        }
    },

    handleDocumentChangeNotice : function (iMessage) {
        console.log(`doc change notice: ${iMessage.values.operation}`);
        scrambler.refresh();
    },



}