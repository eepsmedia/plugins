
const ui = {

    redrawNumber : 0,
    statusDIV : null,
    stationMenu : null,
    startDateInput : null,
    endDateInput : null,

    initialize : function () {
        this.statusDIV = document.getElementById('status');
        this.resultDIV = document.getElementById(`result`);

        this.stationMenu = document.getElementById(`stationMenu`);
        this.stationMenu.innerHTML = this.makeStationMenuGuts();

        this.startDateInput = document.getElementById(`startDateInput`);
        this.startDateInput.value = wweather.state.startDate;

        this.endDateInput = document.getElementById(`endDateInput`);
        this.endDateInput.value = wweather.state.endDate;

    },

    redraw : function() {
        this.redrawNumber++;

        const datasetInfo = wweather.state.datasetName ? `dataset: ${wweather.state.datasetName}` : `no dataset`;

        //  this.statusDIV.innerHTML = `redraw number ${this.redrawNumber} ${datasetInfo}`;     //  of course, replace this!
        //  this.resultDIV.innerHTML = JSON.stringify(wweather.tResult);
    },

    makeStationMenuGuts : function() {
        let out = ``;
        stationList.forEach( station => {
            out += `<option value="${station.stationid}">${station.name}</option>\n`;
        })
        return out;
    },

    getStation : function() {
        return this.stationMenu.value;
    },
    getStartDate : function() {
        return this.startDateInput.value;
    },
    getEndDate : function() {
        return this.endDateInput.value;
    },
}