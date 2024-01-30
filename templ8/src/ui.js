
const ui = {

    statusDIV : null,

    initialize : function () {
        this.statusDIV = document.getElementById('status');
    },

    redraw : function() {

        const button = ` button count ${templ8.state.buttonCount}`;
        const datasetInfo = templ8.state.datasetName ? `dataset: ${templ8.state.datasetName}` : `no dataset`;

        this.statusDIV.innerHTML = `${button}<br>${datasetInfo}<br>&nbsp; `;     //  of course, replace this!
    },
}