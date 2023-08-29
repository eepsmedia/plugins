
const ui = {

    redrawNumber : 0,
    statusDIV : null,

    initialize : function () {
        this.statusDIV = document.getElementById('status');
    },

    redraw : function() {
        this.redrawNumber++;

        const datasetInfo = templ8.state.datasetName ? `dataset: ${templ8.state.datasetName}` : `no dataset`;

        this.statusDIV.innerHTML = `redraw number ${this.redrawNumber} ${datasetInfo}`;     //  of course, replace this!
    },
}