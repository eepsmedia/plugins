
const ui = {

    statusDIV : null,

    initialize : function () {
        this.statusDIV = document.getElementById('status');
        this.slider = document.getElementById("rangeSlider");
    },

    redraw : function() {
        const datasetInfo = ranger.state.datasetName ? `dataset: ${ranger.state.datasetName}` : `no dataset`;
        this.statusDIV.innerHTML = `${datasetInfo}<br>${ranger.state.rangeAttributeName} = ${ranger.state.sliderValue} ± ${ranger.state.rangeHalfWidth} `;     //  of course, replace this!

        this.configureSlider();
    },

    configureSlider : function() {
        if (ranger.state.rangeMin < ranger.state.rangeMax) {
            this.slider.display = "block";
            this.slider.setAttribute("min", ranger.state.rangeMin);
            this.slider.setAttribute("max", ranger.state.rangeMax);

        } else {
            this.slider.display = "none";
        }
    },
}