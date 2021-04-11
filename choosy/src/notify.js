const notify = {
    /**
     * Ask to be notified about changes in attributes and selections
     * @returns {Promise<void>}
     */
    setUpNotifications: async function () {

        //  receive notifications about doc changes, especially number of datasets
        //  (user has added or deleted a dataset)
        const tResource = `documentChangeNotice`;
        codapInterface.on(
            'notify',
            tResource,
            //  'updateAttribute',
            notify.handleDocumentChangeNotice
        );
        console.log(`Asked for notify on [${tResource}]`);

        //  register to receive notifications about changes to the data context (including selection)
        const theCurrentDSName = choosy.getNameOfCurrentDataset();
        const sResource = `dataContextChangeNotice[${theCurrentDSName}]`;
        codapInterface.on(
            'notify',
            sResource,
            //'selectCases',
            notify.handleDataContextChangeNotice
        );
        console.log(`Asked for getting notices on [${sResource}]`);

        return choosy.state.datasetName;
    },


    notificationsHandled : 0,

    handleDataContextChangeNotice: function (iMessage) {
        this.notificationsHandled++;
        if (this.notificationsHandled % 50 === 0) {
            console.log(`fyi     ${this.notificationsHandled} notifications handled. `)
        }

        const theValues = iMessage.values;

        //  console.log(`handleDataContextChangeNotice operation: ${theValues.operation}`);
        switch (theValues.operation) {
            case `selectCases`:
                const theSelectedCases = (theValues.result.cases) ? theValues.result.cases : [];
                choosy.handlers.handleSelectionChangeFromCODAP();

                break;
            case `moveAttribute`:
            case `deleteAttributes` :
            case `createAttributes` :
            case `updateCases`:
            case `updateCollection`:
            case `createCollection`:
                choosy_ui.update();
                break;
            case `deleteCollection`:
            case `updateDataContext`:       //  includes renaming
                choosy.refresh();
                break;
            case `updateAttributes`:
                //  todo: remove for performance if it's a problem until JS fixes the bug about
                //  not issuing notifications for plugin-initiated changes.
                choosy_ui.update();
                break;
            default:
                break;
        }
    },

    handleDocumentChangeNotice: function (iMessage) {
        this.notificationsHandled++;
        if (this.notificationsHandled % 50 === 0) {
            console.log(`fyi     ${this.notificationsHandled} notifications handled. `)
        }
        const theValues = iMessage.values;
        //  console.log(`handleDocumentChange operation: ${theValues.operation}`);
        choosy.refresh();
    },

}