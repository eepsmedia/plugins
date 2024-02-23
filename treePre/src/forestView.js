const forestView = {

    forest: null,      //      the D3 object
    aCircle: null,
    cellWidth: 0,
    cellHeight: 0,
    rows: 0,
    columns: 0,

    theTrees: [],

    initialize: function (iBigSVG) {
        this.forest = iBigSVG;
        },

    /**
     * Add the sub-svgs for the trees, give them IDs based on their indices.
     */
    newForest: function () {

        //  todo: set these as a result of a notification; we do not know God directly!

        this.cellWidth = 30;
        this.cellHeight = 50;
        this.rows = god.gameParams.rows;
        this.columns = god.gameParams.columns;

        this.forest.selectAll('svg > *').remove();

        this.forest
            .selectAll('svg')
            .data(treePre.treeData)
            .join("svg")       //      was "rect"
            .attr("x", (d, i) => {return this.cellWidth * (i % this.columns)})
            .attr("y", (d, i) => {return this.cellHeight * (Math.floor(i / this.columns))})
            .attr("width", (d, i) => {return this.cellWidth})
            .attr("height", (d, i) => {return this.cellHeight})
            .append("g")
            .append("path")
            .attr("d", (d, i) => {return this.getTreePath(d)})
            .attr("title", (d, i) => {return `age ${d.age}`})
            .on("click", handlers.markTreeSVG)
            .attr("class", (d, i) => {return treePre.markedTrees.includes(i) ? "markSVG" : "treeSVG"})

    },

    updateD3Forest: function () {
        this.forest
            .selectAll('svg')
            .data(treePre.treeData)
            .join("svg")       //      was "rect"
            .select("path")
            .attr("d", (d, i) => {return this.getTreePath(d)})
            .attr("fill", (d, i) => {return forestView.getColor(d)})
            .attr("class", (d, i) => {return treePre.markedTrees.includes(i) ? "markSVG" : "treeSVG"})

    },

    /**
     *      d.hue is a tree property, between 0 and 1.
     *      d.age is the age, which we map [0, max] into value between [75, 50]
     *
     *      max = god.gameParams.yearsToAdult
     *
     * @param d     data from the tree. using d.age and d.hue.
     */
    getColor : function(d) {
        const ageFactor = d.age / god.gameParams.yearsToAdult;
        const light = 0.75;
        const dark = 0.60;
        const brightness = ageFactor === 1 ? 0.50 : light - ageFactor * (light - dark);

        const rgb = HSVtoRGB(d.hue, 1, brightness);

        //  now rgb is an object of integers in the right ranges

        const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        return rgbString;
    },

    getTreeGroup : function(d) {

        let group = d3.group();
    },

    getTreePath: function (d) {
        let path = d3.path();
        const age = d.age > god.gameParams.yearsToAdult ? god.gameParams.yearsToAdult : d.age;
        const propSize = age / god.gameParams.yearsToAdult;
        const width = this.cellWidth * propSize;
        const left = (this.cellWidth - width) / 2;

        path.moveTo(left, this.cellHeight)
        path.lineTo(left + width, this.cellHeight)
        path.lineTo(left + width / 2, this.cellHeight * (1 - propSize))
        path.closePath();

        const out = path.toString();
        return out;
    },

    getMarkPath : function(d) {
        let out = "";
        if (treePre.markedTrees.includes(d.index)) {
            const centerX = this.cellWidth / 2;
            const centerY = this.cellHeight / 2;
            const size = 5;

            let path = d3.path();
            path.moveTo(centerX - size, centerY - size);
            path.lineTo(centerX + size, centerY + size);
            path.moveTo(centerX - size, centerY + size);
            path.lineTo(centerX + size, centerY - size);
            out = path.toString();
        }

        return out;
    },

    redraw: function () {
        this.updateD3Forest();
    }

}

/**
 *
 * https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
 *
 * accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR
 * h, s, v
 *
 * This code expects 0 <= h, s, v <= 1, if you're using degrees or radians, remember to divide them out.

 */
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}