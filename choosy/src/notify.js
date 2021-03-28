

const notify = {
    /**
     * Ask to be notified about changes in attributes and selections
     * @returns {Promise<void>}
     */
    setUpNotifications: async function () {

/*
        const tResource = `dataContext[${choosy.state.datasetName}].attribute`;
        codapInterface.on(
            'notify',
            tResource,
            'updateAttribute',
            notify.handleAttributeChange
        );
        console.log(`Asked for notify on [${tResource}]`);
*/

        //  register to receive notifications about selection

        const sResource = `dataContextChangeNotice[${choosy.state.datasetName}]`;
        codapInterface.on(
            'notify',
            sResource,
            //'selectCases',
            notify.handleDataContextChangeNotice
        );
        console.log(`Asked for getting selectCases on [${sResource}]`);

        //  try using the selection list resource idea because the result from dataContextChangeNotice
        //  contains all the data of all the cases.

/*
        const ssResource = `dataContext[${choosy.state.datasetName}].selectionList`;
        codapInterface.on(
            'notify',
            ssResource,
            'selectCases',
            notify.handleSelectionListChangeNotice
            // choosy.handlers.handleSelectionChangeFromCODAP
        );
        console.log(`Asked for getting selectCases on [${ssResource}]`);
*/
        return choosy.state.datasetName;
    },

    handleAttributeChange: async function(iCommand, iCallback) {
        console.log(`handling attribute change`);

    },

    handleDataContextChangeNotice : function(iMessage) {
        console.log(`handleDataContextChangeNotice on [${iMessage.values.operation}]`);
        const theValues = iMessage.values;
        switch (theValues.operation) {
            case `selectCases`:
                const theSelectedCases = (theValues.result.cases) ? theValues.result.cases : [];
                choosy.handlers.handleSelectionChangeFromCODAP();

                break;
            case `moveAttribute`:
            case `updateAttributes`:
            case `createCollection`:
            case `deleteCollection`:
                choosy.refresh();
                break;
            default:
                break;
        }
    },

    handleSelectionListChangeNotice : function(iMessage) {

    },
}