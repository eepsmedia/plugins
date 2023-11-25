const handlers = {

    currentlyDraggingCODAPAttribute: false,

    getWeather: async function () {
        wweather.state.focusStation =   ui.getStation();
        wweather.state.startDate = ui.getStartDate();
        wweather.state.endDate = ui.getEndDate();


        let out = null;
        const isDaily = document.getElementById("isDailyInput").checked;
        const datasetCode = isDaily ? 'GHCND' : 'GSOM';
        const units = '&units=metric';

        //  const datatypes = `&datatypeid=TMIN&datatypeid=TMAX&datatypeid=TAVG&datatypeid=PRCP`;
        const datatypes = `&datatypeid=TMAX`;
        const dates = `&startdate=${wweather.state.startDate}&enddate=${wweather.state.endDate}`;
        //  const station =   `&stationid=${datasetCode}:${wweather.state.focusStation}`;
        const station =   `&stationid=GHCND:${wweather.state.focusStation}`;
        const limit = `&limit=${wweather.state.limit}`;     //
        const datasetURL = `${wweather.constants.baseURL}data?datasetid=${datasetCode}`;

        //          dailyURL :      `https://www.ncei.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&units=metric`,
        //          baseURL : `https://www.ncei.noaa.gov/cdo-web/api/v2/`,
        //  const AucklandURL = "https://www.ncei.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&stationid=GHCND:NZM00093110&datatypeid=TMAX&startdate=2023-01-01&enddate=2023-04-30&units=metric&limit=1000";
        const newAuckURL  = `https://www.ncei.noaa.gov/cdo-web/api/v2/data?datasetid=${datasetCode}&stationid=GHCND:NZM00093110&datatypeid=TMAX&startdate=2023-01-01&enddate=2023-04-30&units=metric&limit=1000`;

        const theURL = `${datasetURL}${station}${datatypes}${dates}${limit}${units}`;

        console.log(`  fetch: ${theURL}`);
        console.log(`  newAk: ${newAuckURL}`);


        const options = {
            method: "GET",
            headers: {
                Accept: "application/json",
                token: cred.token,
                "User-Agent": "any-name"
            }
        }

        let result;

        try {
            //  result = await fetch(newAuckURL, options);
            result = await fetch(theURL, options);
        } catch (msg) {
            console.log(`problem with weather fetch: ${msg} stationID: ${wweather.state.focusStation}`);
        }

        if (result.status === 200) {
            out = await result.json();
        }
        wweather.processNewResult(out);
    },

    handleDragDrop: async function (iMessage) {

        switch (iMessage.values.operation) {
            case   `dragstart`:
                this.currentlyDraggingCODAPAttribute = true;
                console.log(`    drag start`);
                break;
            case   `dragend`:
                this.currentlyDraggingCODAPAttribute = false;
                handlers.highlightNone();
                console.log(`    drag end`);
                break;
            case   `drag`:
                handlers.handleDrag(iMessage.values.position);
                break;
            case   `drop`:
                wweather.copeWithAttributeDrop(
                    iMessage.values.context,
                    iMessage.values.collection,
                    iMessage.values.attribute,
                    iMessage.values.position
                );
                ui.redraw();
                break;
            case   `dragenter`:
                console.log(`    drag enter`);
                handlers.highlightNear();
                break;
            case   `dragleave`:
                handlers.highlightNone();
                console.log(`    drag leave`);
                break;
        }
    },

    handleDrag: function (iPosition) {

    },
    highlightNone: function () {

    },
    highlightNear: function () {

    },

}