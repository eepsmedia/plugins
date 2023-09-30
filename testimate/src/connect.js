let connect;

/**
 *  Singleton that communicates with CODAP
 */


connect = {

    caseChangeSubscriberIndex: null,
    attributeChangeSubscriberIndex: null,
    attributeDragDropSubscriberIndex: null,
    mostRecentEmittedTest: null,
    datasetInfo: null,      //  don't need it!

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

        let out = null;
        const theMessage = {
            "action": "get",
            "resource": `dataContext[${testimate.state.dataset.name}].itemSearch[*]`
        }

        const result = await codapInterface.sendRequest(theMessage);
        if (result.success) {
            data.dirtyData = false;
            data.secondaryCleanupNeeded = true;
            out = result.values;   //   array of objects, one of whose items is another "values"
        } else {
            alert(`Big trouble getting data!`)
        }
        return out;
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

    registerForAttributeEvents: function (iDatasetName) {
        const sResource = `dataContext[${iDatasetName}].attribute`;

        if (this.attributeChangeSubscriberIndex) {        //  zero is a valid index... :P but it should be the "get"
            codapInterface.off(this.attributeChangeSubscriberIndex);    //  blank that subscription.
        }

        try {
            this.attributeChangeSubscriberIndex = codapInterface.on(
                'notify',
                sResource,
                data.handleAttributeChangeNotice
            );
            console.log(`registered for attribute changes in ${iDatasetName}. Index ${this.attributeChangeSubscriberIndex}`);
        } catch (msg) {
            console.log(`problem registering for attribute changes: ${msg}`);
        }
    },

    /**
     * Register for the dragDrop[attribute] event.
     *
     * Called from connect.initialize();
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

    showLogisticGraph : async function(iFormula) {
        const graphObject = {
            type : "graph",
            name : testimate.constants.logisticGraphName,
            dataContext: testimate.state.dataset.name,
            xAttributeName : data.yAttData.name,
            yAttributeName : testimate.constants.logisticGroupAttributeName,
        }

        const theMessage = {
            action : "create",
            resource : "component",
            values : graphObject,
        }

        try {
            const result = await codapInterface.sendRequest(theMessage);

        } catch (msg) {
            alert(`trouble showing the logistics graph ${msg}`);
        }
    },

    hideLogisticGraph : function() {
        const theMessage = {
            action : "delete",
            resource : `component[${testimate.constants.logisticGraphName}]`
        }

        const result =  codapInterface.sendRequest(theMessage);

    },

    updateDatasetForLogisticGroups: async function (iValue, iAxis) {

        const theVariable = (iAxis === "X") ? data.xAttData.name : data.yAttData.name;
        const theFormula = `if (${theVariable} = "${iValue}", 1, 0)`;

        const newAttributeInfo = {
            name: testimate.constants.logisticGroupAttributeName,
            title: `${data.xAttData.name} = ${testimate.state.testParams.group}`,
            type: "numeric",
            description: `equal to 1 if ${data.xAttData.name} = ${testimate.state.testParams.group}, zero otherwise`,
            editable: false,
            formula: theFormula,
            //  hidden: true
        }
        const getInfoMessage = {
            action: "get",
            resource: `dataContext[${testimate.state.dataset.name}]`
        }

        //  figure out which collection the target attribute is in

        let useThisCollection = null;   //  name of the target collection

        try {
            const theInfo = await codapInterface.sendRequest(getInfoMessage);
            if (theInfo.success) {
                theInfo.values.collections.forEach(coll => {
                    coll.attrs.forEach(attr => {
                        if (attr.name === data.xAttData.name) {
                            useThisCollection = coll.name;
                        }
                    })
                })
            } else {
                alert(`request for dataset info failed in connect.js`);
            }

        } catch (msg) {
            alert(`could not get dataset info for [${testimate.state.dataset.name}] in connect.js...${msg}`)
        }



        const newAttMessage = {
            action: "create",
            resource: `dataContext[${testimate.state.dataset.name}].collection[${useThisCollection}].attribute`,
            values: newAttributeInfo
        }

        try {
            const newAttResult = await codapInterface.sendRequest(newAttMessage);

        } catch (msg) {
            alert(`could not make new 0/1 attribute`);
        }
        return theFormula;      //      for diagnostics
    },

    emitTestData: async function () {

        //  make a new output dataset if necessary
        //  todo: test for dataset existence (user may have deleted it)
        if (testimate.state.testID !== testimate.state.mostRecentEmittedTest) {
            await this.deleteOutputDataset();

            const theMessage = {
                action: "create",
                resource: "dataContext",
                values: this.constructEmitDatasetObject(),
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

        const theTest = testimate.theTest;
        const theConfig = theTest.theConfig;

        let theItemValues = {
            outcome: testimate.state.x.name,
            predictor: (testimate.state.y && testimate.state.y.name) ? testimate.state.y.name : "",
            procedure: theConfig.name,
            sign: testimate.state.testParams.theSidesOp,
            value: testimate.state.testParams.value,
        };

        theConfig.emitted.split(",").forEach(att => {
            if (theTest.results.hasOwnProperty(att)) {
                theItemValues[att] = theTest.results[att]
            } else {    //  not a result? Maybe it's a parameter!!
                theItemValues[att] = testimate.state.testParams[att]
            }
        });


        const itemMessage = {
            action: 'create',
            resource: `dataContext[${testimate.constants.datasetName}].item`,
            values: theItemValues,       //      sending ONE item
        }
        const result = await codapInterface.sendRequest(itemMessage);
        if (result.success) {
            console.log(`success creating item id=${result.itemIDs[0]}`);
        } else {
            console.log(`problem creating item`);
        }
        this.makeTableAppear();
    },

    constructEmitDatasetObject: function () {
        let out = {};

        if (testimate.state.testID) {
            testimate.state.mostRecentEmittedTest = testimate.state.testID;
            const theConfig = Test.configs[testimate.state.testID];

            //  first construct the "attrs" array
            let theAttrs = [
                {name: "outcome", type: "categorical", description: testimate.strings.attributeDescriptions.outcome},
                {
                    name: "predictor",
                    type: "categorical",
                    description: testimate.strings.attributeDescriptions.predictor
                },
                {
                    name: "procedure",
                    type: "categorical",
                    description: testimate.strings.attributeDescriptions.procedure
                },
                {name: "sign", type: "categorical", description: testimate.strings.attributeDescriptions.sign},
                {
                    name: "value",
                    type: "numeric",
                    precision: 3,
                    description: testimate.strings.attributeDescriptions.value
                },
            ];

            theConfig.emitted.split(",").forEach(att => {
                const theTip = testimate.strings.attributeDescriptions[att];
                theAttrs.push({name: att, type: 'numeric', description: theTip, precision: 4});
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

    makeTableAppear: function () {
        const caseTableObject = {
            type: `caseTable`,
            dataContext: testimate.constants.datasetName,
        };

        const message = {
            action: 'create',
            resource: `component`,
            values: caseTableObject,
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