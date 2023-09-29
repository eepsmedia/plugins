
/**
 *  Singleton that communicates with CODAP
 */


const connect = {

    attributeDragDropSubscriberIndex : null,

    initialize : async function() {

        await codapInterface.init(this.iFrameDescriptor, null);
        await this.registerForDragDropEvents();     //  if you're acce[ting drops!
        await this.allowReorg();

        this.makeNewDataset();

    },

    makeNewDataset : async function() {
        await this.deleteDataset();
        const theSetupObject = this.getDatasetSetupObject()
        await pluginHelper.initDataSet(theSetupObject);
    },

    emitData : async function(iData) {

        let currentDate = null;
        let thisCase = {};
        let theItems = [];

        const theStation = stations.getStationInfo(wweather.state.focusStation);

        iData.forEach( data => {
            if (data.date !== currentDate) {
                if (thisCase.hasOwnProperty('date')) {
                    theItems.push(thisCase);
                }
                //  start new item
                currentDate = data.date;
                thisCase = {
                    station : theStation.name,
                    date : currentDate
                };
            }
            let tValue = data.value;
            let tUnits = null;
            switch (data.datatype) {
                case 'TMAX':
                case 'TMIN':
                case 'TAVG':
                    break;
                case 'PRCP':
                    break;
                default:
                    tValue = null;
            }
            thisCase[data.datatype] = tValue;
        })

        try {
            const res = await pluginHelper.createItems(theItems, wweather.constants.datasetName);
            this.makeTableAppear();
        } catch (msg) {
            console.log("Problem emitting items of vars: " + JSON.stringify(theItems));
            console.log(msg);
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
            'notify', tResource, handlers.handleDragDrop
        )
        console.log(`registered for drags and drops. Index ${this.attributeDragDropSubscriberIndex}`);

    },

    makeTableAppear:  function () {
        console.log(`making table for ${wweather.constants.datasetName} appear`);
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "name": wweather.constants.datasetName,
            }
        })
    },

    deleteDataset: async function () {
        codapInterface.sendRequest({
            "action": "delete",
            "resource": `dataContext[${wweather.constants.datasetName}]`,
        })
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

    getDatasetSetupObject : function(){
        return {
            name: wweather.constants.datasetName,

            collections: [
                {
                    name: wweather.constants.collectionName,
                    labels: {
                        singleCase: "observation",
                    },
                    attrs: [
                        {
                            name: DG.plugins.wweather.attributeNames.station,
                            description: DG.plugins.wweather.attributeDescriptions.station,
                        },
                        {
                            name: DG.plugins.wweather.attributeNames.date,
                            description: DG.plugins.wweather.attributeDescriptions.date,
                        },
                        {
                            name: DG.plugins.wweather.attributeNames.TMAX,
                            description: DG.plugins.wweather.attributeDescriptions.TMAX,
                            unit : '°C',
                        },
                        {
                            name: DG.plugins.wweather.attributeNames.TMIN,
                            description: DG.plugins.wweather.attributeDescriptions.TMIN,
                            unit : '°C',
                        },
                        {
                            name: DG.plugins.wweather.attributeNames.TAVG,
                            description: DG.plugins.wweather.attributeDescriptions.TAVG,
                            unit : '°C',
                        },
                        {
                            name: DG.plugins.wweather.attributeNames.PRCP,
                            description: DG.plugins.wweather.attributeDescriptions.PRCP,
                            unit : 'mm',
                        },

                    ]
                }
            ]
        }
    },

    /**
     * Constant descriptor for the iFrame.
     * Find and edit the values in `wweather.constants`
     */
    iFrameDescriptor: {
        name: wweather.constants.pluginName,
        title: wweather.constants.pluginName,
        version: wweather.constants.version,
        dimensions: wweather.constants.dimensions,      //      dimensions,
    },

}