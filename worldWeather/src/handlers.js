const handlers = {

    currentlyDraggingCODAPAttribute: false,

    getWeather: async function () {
        wweather.state.focusStation =   ui.getStation();
        wweather.state.startDate = ui.getStartDate();
        wweather.state.endDate = ui.getEndDate();


        let out = null;
        const datatypes = `&datatypeid=TMIN&datatypeid=TMAX&datatypeid=TAVG&datatypeid=PRCP`;
        const dates = `&startdate=${wweather.state.startDate}&enddate=${wweather.state.endDate}`;
        const station =   `&stationid=GHCND:${wweather.state.focusStation}`;
        const limit = `&limit=${wweather.state.limit}`;

        const theURL = `${wweather.constants.dailyURL}${datatypes}${dates}${limit}${station}`;

        console.log(`    fetch from: ${theURL}`);

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
            result = await fetch(theURL, options);
        } catch (msg) {
            console.log(`problem with weather fetch: ${msg}`);
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