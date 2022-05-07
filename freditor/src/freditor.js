const fred = {

    theAttributeName: null,
    theAttributeFormula: null,
    theContextName: null,
    theCollectionName: null,

    initialize: async function () {
        await codapInterface.init(this.iFrameDescription, null);

        codapInterface.on(
            'notify',
            `dragDrop[attribute]`,
            fredDropManager.handleDrop,
        );
        ui.refresh();
    },

    saveFormula: async function () {
        this.theAttributeFormula = document.getElementById("editPane").value;
        await connect.saveFormulaToCODAP();
    },

    setTargetAttributeByAttributeInfo: function (iInfo) {
        this.theAttributeName = iInfo.name;
        this.theAttributeFormula = iInfo.formula ? iInfo.formula : null;
        this.theCollectionName = iInfo.collection;
        this.theContextName = iInfo.context;
        ui.refresh();
    },

    iFrameDescription: {
        version: '2022a',
        name: 'FrEditor',
        title: 'formula editor',
        dimensions: {width: 300, height: 222},
        preventDataContextReorg: false,
    },

}

const connect = {

    getAttributeInfoByAttributeDropMessage: async function (iMessage) {
        const theAttribute = iMessage.values.attribute.name;
        const theCollection = iMessage.values.collection.name;
        const theContext = iMessage.values.context.name;

        const tMessage = {
            "action": "get",
            "resource": `dataContext[${theContext}].collection[${theCollection}].attribute[${theAttribute}]`,
        }
        const tResult = await codapInterface.sendRequest(tMessage);
        if (tResult.success) {
            let out = tResult.values;
            out["collection"] = theCollection;
            out["context"] = theContext;

            return out;
        }
        return null;
    },

    saveFormulaToCODAP: async function () {
        const tMessage = {
            "action": "update",
            "resource": `dataContext[${fred.theContextName}].collection[${fred.theCollectionName}].attribute[${fred.theAttributeName}]`,
            "values": {
                "formula": fred.theAttributeFormula,
            }
        }
        const tResult = await codapInterface.sendRequest(tMessage);
        if (tResult.success) {
            console.log(`Set formula for ${fred.theAttributeName} to ${fred.theAttributeFormula}`);
        }
    },
}

const ui = {

    refresh: function () {
        const editPane = document.getElementById("editPane");
        if (fred.theAttributeName) {
            document.getElementById("freditor-head").innerHTML = `formula for <b>${fred.theAttributeName}</b>`;
            if (fred.theAttributeFormula) {
                editPane.value = `${fred.theAttributeFormula}`;
            } else {
                editPane.value = "";
            }
        }
        this.setVisibility();
    },

    setVisibility: function () {

        document.getElementById("freditor-blank").style.display = (fred.theAttributeName) ?
            "none" : "block";
        document.getElementById("freditor-active").style.display = (fred.theAttributeName) ?
            "block" : "none";
    }
}

const fredDropManager = {

    currentlyDraggingCODAPAttribute: false,

    handleDrop: async function (iMessage) {
        switch (iMessage.values.operation) {
            case "dragenter":
                fredDropManager.highlightDropZones(true);
                break;

            case "dragleave":
                fredDropManager.highlightDropZones(false);
                break;

            case "drop":
                console.log(`Dropped [${iMessage.values.attribute.title}] from CODAP`);
                const theAttributeInfo = await connect.getAttributeInfoByAttributeDropMessage(iMessage)
                fred.setTargetAttributeByAttributeInfo(theAttributeInfo);
                break;

            case "dragstart":
                console.log(`...  start dragging ${iMessage.values.attribute.title}`);
                fredDropManager.currentlyDraggingCODAPAttribute = true;
                break;

            case "dragend":
                console.log(`...  stop dragging ${iMessage.values.attribute.title}`);
                fredDropManager.highlightDropZones(false);
                fredDropManager.currentlyDraggingCODAPAttribute = false;
                break;

            default:
                break;
        }
    },

    highlightDropZones: function (iActive) {

    },
}

