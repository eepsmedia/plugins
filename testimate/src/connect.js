let connect;

/**
 *  Singleton that communicates with CODAP
 */


connect = {

    caseChangeSubscriberIndex: null,
    attributeDragDropSubscriberIndex: null,
    mostRecentEmittedTest: null,

    initialize: async function () {

        await codapInterface.init(this.iFrameDescriptor, null);
        await this.registerForDragDropEvents();
        await this.allowReorg();
    },

    /**
     * called from data.retrieveDataFromCODAP
     *
     * @returns {Promise<boolean>}
     */
    getAllItems: async function () {
        const theMessage = {
            "action": "get",
            "resource": `dataContext[${testimate.state.dataset}].itemSearch[*]`
        }

        try {
            const result = await codapInterface.sendRequest(theMessage);
            data.dirtyData = false;
            data.dataset = result.values;   //   array of objects, one of whose items is another "values"
            return true;
        } catch (msg) {
            alert(`Trouble getting data: ${msg}`);
            return false;
        }
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
    registerForDragDropEvents: function () {
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
    registerForCaseChanges: async function (iName) {
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

    emitTestData: async function () {

        //  make a new output dataset if necessary
        //  todo: test for dataset existence (user may have deleted it)
        if (testimate.state.test !== this.mostRecentEmittedTest) {
            await this.deleteOutputDataset();

            const theMessage = {
                action : "create",
                resource : "dataContext",
                values : this.constructEmitDatasetObject(),
            }
            try {
                const result = await codapInterface.sendRequest(theMessage);
                if (result.success) {
                    console.log(`success creating dataset, id=${result.values.id}`);
                } else {
                    console.log(`problem creating dataset`);
                }
            } catch (msg) {
                alert(`problem creating dataset: ${testimate.constants.datasetName}`);
            }
        }

        //  now emit one item...

        const theConfig = tests.testConfigurations[testimate.state.test];

        let theItemValues = {
            outcome: testimate.state.xName,
            predictor : testimate.state.yName,
            procedure : theConfig.name,
            sign : tests.parameters.theSidesOp,
            value : tests.parameters.value,
        };

        theConfig.emitted.split(",").forEach(att => {
            theItemValues[att] =  tests.results[att]
        });


        const itemMessage = {
            action : 'create',
            resource : `dataContext[${testimate.constants.datasetName}].item`,
            values : theItemValues,       //      sending ONE item
        }
        try {
            const result = await codapInterface.sendRequest(itemMessage);
            if (result.success) {
                console.log(`success creating item id=${result.itemIDs[0]}`);
            } else {
                console.log(`problem creating item`);
            }

        } catch (msg) {
            alert(`problem creating item on: ${testimate.constants.datasetName}`);
        }

        this.makeTableAppear();
    },

    constructEmitDatasetObject: function () {
        let out = {};

        if (testimate.state.test) {
            this.mostRecentEmittedTest = testimate.state.test;
            const theConfig = tests.testConfigurations[testimate.state.test];

            //  first construct the "attrs" array
            let theAttrs = [
                {name: "outcome", type: "categorical"},
                {name: "predictor", type: "categorical"},
                {name: "procedure", type: "categorical"},
                {name: "sign", type: "categorical"},
                {name: "value", type: "numeric", precision: 3},
            ];

            theConfig.emitted.split(",").forEach(att => {
                theAttrs.push({name: att, type: 'numeric', precision : 4});
            });

            //  this will become the "values" item in the call
            out = {
                name: testimate.constants.datasetName,
                title: testimate.constants.datasetName,
                collections: [{
                    name: testimate.constants.datasetName,
                    attrs: theAttrs
                }]
            };
        }
        return out;
    },

    deleteOutputDataset: async function () {
        const theMessage = {
            action: "delete",
            resource: `dataContext[${testimate.constants.datasetName}]`,
        };

        try {
            const result = await codapInterface.sendRequest(theMessage);
        } catch (msg) {
            alert(`problem deleting dataset: ${testimate.constants.datasetName}`);
        }
    },

    makeTableAppear : function() {
        const caseTableObject = {
            type : `caseTable`,
            dataContext : testimate.constants.datasetName,
        };

        const message = {
            action : 'create',
            resource : `component`,
            values : caseTableObject,
        };

        codapInterface.sendRequest(message);

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