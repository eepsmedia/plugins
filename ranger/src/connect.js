/**
 *  Singleton that communicates with CODAP
 */

const connect = {

    attributeDragDropSubscriberIndex: null,
    doingSetAside : false,

    initialize: async function () {
        //  note: these subscriptions must happen BEFORE `.init` so that the `.on` there does not
        //  override our handlers.
        codapInterface.on('update', 'interactiveState', "", handlers.restorePluginFromStore);
        codapInterface.on('get', 'interactiveState', "", handlers.getPluginState);

        await codapInterface.init(
            this.getIFrameDescriptor(),
            handlers.restorePluginFromStore         //  restores the state, if any
        );
        await this.registerForDragDropEvents();     //  if you're accepting drops!
        await this.allowReorg();
        await this.renameIFrame(localize.getString("frameTitle"));  //  localize the frame title

    },


    /**
     * Register for the dragDrop[attribute] event.
     *
     * Called from connect.initialize();
     */
    registerForDragDropEvents: function () {
        const tResource = `dragDrop[attribute]`;

        this.attributeDragDropSubscriberIndex = codapInterface.on(
            'notify', tResource, handlers.handleDragDrop
        )
        console.log(`registered for drags and drops. Index ${this.attributeDragDropSubscriberIndex}`);

    },

    createRangeGraph: async function () {
        const theMessage = {
            "action": "create",
            "resource": "component",
            "values": {
                "type": "graph",
                "name": ranger.constants.rangeGraphName,
                "title": localize.getString("rangeGraphTitle"),
                "dimensions": {
                    "width": 500,
                    "height": 111
                },
                "position": "top",
                "dataContext": ranger.state.datasetName,
                "xAttributeName": ranger.state.rangeAttributeName,
                "yAttributeName": ""
            }
        }

        await codapInterface.sendRequest(theMessage);
    },

    getRangeGraphInfo: async function () {
        const theMessage = {
            "action": "get",
            "resource": `component[${ranger.constants.rangeGraphName}]`
        }
        const theResponse = await codapInterface.sendRequest(theMessage);
        return theResponse;
    },

    selectFromTo: async function (from, to) {
        //  console.log(`select from ${from} to ${to}`);

        const theIDs = await this.getCaseIDsInRange(from, to);

        const theMessage = {
            action: "create",
            resource: `dataContext[${ranger.state.datasetName}].selectionList`,
            values: theIDs
        }

        const theResponse = await codapInterface.sendRequest(theMessage);
    },

    showOnlyFromTo: async function (from, to) {
        this.doingSetAside = true;

        //  first, make sure all cases are in play

        await this.setAside([]);
        console.log(`    showed all cases`);

        //  then find the IDs of the out-of-range cases

        const theIDs = await this.getCaseIDsInRange(from, to, true);    //  gets IDs OUTSIDE the range
        console.log(`   got case IDs outside of (${from}, ${to}) (${theIDs.length})`);

        //  then set those cases aside

        await this.setAside(theIDs);
        console.log(`    hid case IDs outside of (${from}, ${to})`);

        this.doingSetAside = false;
    },


    getCaseIDsInRange: async function (from, to, complement = false) {
        let theIDs = [];

        //  get case by formula search...
/*
        const theFormula = (complement) ?
            `\`${ranger.state.rangeAttributeName}\` <= ${from} or \`${ranger.state.rangeAttributeName}\` >= ${to}` :
            `\`${ranger.state.rangeAttributeName}\` > ${from} and \`${ranger.state.rangeAttributeName}\` < ${to}`;
*/

        const theFormula = "true";
        const theSearchMessage = {
            action: "get",
            resource: `dataContext[${ranger.state.datasetName}].collection[${ranger.state.rangeAttributeCollectionName}].caseFormulaSearch[${theFormula}]`
        }
        const theResponse = await codapInterface.sendRequest(theSearchMessage);

        if (theResponse.success) {
            theResponse.values.forEach( val => {
                const theVal = val.values[ranger.state.rangeAttributeName];
                if (complement) {
                    if (theVal <= from || theVal >= to) {
                        theIDs.push(val.id);
                    }
                } else {
                    if (theVal > from && theVal < to) {
                        theIDs.push(val.id);
                    }
                }
            })
/*
            theResponse.values.forEach(val => {
                theIDs.push(val.id);
            })
*/
        }

        return theIDs
    },

    setAside: async function (theIDs) {
        const theMessage = (theIDs.length > 0) ?
            {
                "action": "notify",
                "resource": `dataContext[${ranger.state.datasetName}]`,
                "values": {
                    "request": "setAside",
                    "caseIDs": theIDs
                }
            } :
            {
                "action": "notify",
                "resource": `dataContext[${ranger.state.datasetName}]`,
                "values": {
                    "request": "restoreSetasides"
                }
            };

        await codapInterface.sendRequest(theMessage);
    },

    renameIFrame: async function (iName) {
        const theMessage = {
            action: "update",
            resource: "interactiveFrame",
            values: {
                title: iName,
            }
        };
        await codapInterface.sendRequest(theMessage);
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
     * Find and edit the values in `ranger.constants`
     */
    getIFrameDescriptor: function () {
        return {
            name: ranger.constants.pluginName,
            title: localize.getString("frameTitle"),
            version: ranger.constants.version,
            dimensions: ranger.constants.dimensions,      //      dimensions,
        }
    },

}