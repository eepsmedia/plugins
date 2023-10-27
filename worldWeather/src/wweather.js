


wweather = {

    state : {},
    tResult : null,      //  temporary result

    initialize : async function() {
        console.log(`initializing wweather`);

        wweather.strings.initialize();
        await connect.initialize( );        //  initialize the connection with CODAP

        this.state = await codapInterface.getInteractiveState();    //  get stored state
        if (this.state.version) {       //  therefore it's an actual saved state
            await this.restoreState();
        } else {
            Object.assign(this.state, this.constants.defaultState);
        }

        //  this.strings = strings;      //      todo: fix this, make it robust

        await stations.initialize();
        ui.initialize();
        ui.redraw();

    },

    /**
     * We are restoring the plugin from a save; use the data from `wweather.state`
     * to set everything up correctly.
     */
    restoreState : function() {

    },

    processNewResult : function(iData) {
        if (iData) {
            connect.emitData(iData.results);
        } else {
            console.log("    ....    Problem with getting data.");
        }
        ui.redraw();
    },

    copeWithAttributeDrop : function(iDataset, iCollection, iAttribute, iPosition) {
        this.state.datasetName = iDataset.name;
    },


    constants: {
        pluginName: `wweather`,
        datasetName : `worldWeather`,
        stationsDatasetName : `stations`,
        stationsMapName : `stations-map`,
        collectionName : `daily observations`,
        version: `2023c`,
        dimensions: {height: 222, width: 222},
        baseURL : `https://www.ncei.noaa.gov/cdo-web/api/v2/`,
        locURL : `https://www.ncei.noaa.gov/cdo-web/api/v2/locations?datasetid=GHCND`,
        dailyURL :      `https://www.ncei.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&units=metric`,
        aprilInParis :  `https://www.ncei.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&startdate=2023-04-01&enddate=2023-04-30&limit=100&stationid=GHCND:FRM00007150`,
        aprilInAuckland :  `https://www.ncei.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&startdate=2023-04-01&enddate=2023-04-30&limit=100&stationid=GHCND:NZM00093110`,

        defaultState: {
            lang: `en`,
            datasetName : null,     //  the name of the dataset we're working with
            focusStation : null,
            startDate : `2023-04-01`,
            endDate : `2023-04-30`,
            limit : 1000,
        }

    }

}