notificatons = {

    documentSubscriberIndex: null,
    datasetSubscriberIndex: null,
    attributeDropSubscriberIndex: null,

    registerForDocumentChanges : function() {
        const tResource = `documentChangeNotice`;
        this.documentSubscriberIndex = codapInterface.on(
            'notify',
            tResource,
            notificatons.handleDocumentChangeNotice
        );
        console.log(`registered for changes to document. Index ${this.documentSubscriberIndex}`);
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
        console.log(`registered for changes to dataset ${iName}. Index ${this.datasetSubscriberIndex}`);
    },

    registerForAttributeDrops : function() {
        const tResource = `dragDrop[attribute]`;

        this.attributeDropSubscriberIndex = codapInterface.on(
            'notify', tResource, notificatons.handleAttributeDrop
        )
        console.log(`registered for drags and drops. Index ${this.attributeDropSubscriberIndex}`);

    },

    /**
     * We have detected a change in a dataset.
     *
     * If the user has changed things like the structure, we mark the state
     * as "dirty" and refresh the data.
     * That will eventually mean that when the user scrambles,
     * the entire measures datset will be replaced.
     *
     * @param iMessage
     */
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
                console.log(`    create attribute... resource: ${iMessage.resource} attrs[0]: ${firstAtt.name} ${firstAtt.guid}`);
                break;
            default:
                break;
        }
    },

    /**
     * We have detected that the document has changed.
     * We therefore need to check if the source dataset still exists.
     *
     * @param iMessage
     */
    handleDocumentChangeNotice : async function (iMessage) {
        console.log(`doc change notice: ${iMessage.values.operation}`);

        const doesItExist = connect.datasetExists(scrambler.state.datasetName);

        if (!doesItExist) {
            const tName = await connect.getSuitableDatasetName(scrambler.state.datasetName);
            if (tName) {
                await scrambler.setSourceDataset(tName);
            } else {
                scrambler.sourceDataset = null;
            }
            scrambler.refreshUIDisplay();
        }

    },

    handleAttributeDrop : async function (iMessage) {
        const positionString = iMessage.values.position ?
            `(${iMessage.values.position.x} , ${iMessage.values.position.y})` :
            `(no pos)`;
        switch (iMessage.values.operation) {
            case "dragstart":
                //  console.log(`... start dragging ${iMessage.values.attribute.title}`);
                scrambler.currentlyDraggingAnAttribute = true;
                break;

            case "drop":
                console.log(`... drop ${iMessage.values.attribute.title} at ${positionString}`);
                scrambler.copeWithAttributeDrop(iMessage.values.context.name, iMessage.values.attribute.name)
                break;

            case "dragend":
                //  console.log(`... dragend ${iMessage.values.attribute.title} at ${positionString}`);
                document.getElementById("entire-scrambler").className = "body-no-drag";
                scrambler.currentlyDraggingAnAttribute = false;
                break;

            case "dragenter":
                console.log(`... dragenter ${iMessage.values.attribute.title} at ${positionString}`);
                document.getElementById("entire-scrambler").className = "body-drag";
                break;

            case "dragleave":
                console.log(`... dragleave ${iMessage.values.attribute.title} at ${positionString}`);
                document.getElementById("entire-scrambler").className = "body-no-drag";

                break;

            default:

        }
    },

}