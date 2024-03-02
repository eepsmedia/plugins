const forestView = {

    forestSVG: null,      //      the D3 object
    aCircle: null,
    cellWidth: 0,
    cellHeight: 0,
    rows: 0,
    columns: 0,

    theTrees: [],

    initialize: function (iBigSVG) {
        this.forestSVG = iBigSVG;
    },

    /**
     * Add the sub-svgs for the trees, give them IDs based on their indices.
     */
    newForest: function (iDims) {

        this.cellHeight = iDims.cellHeight;
        this.cellWidth = iDims.cellWidth;

        const viewWidth = (iDims.columns + iDims.ranFrac) * this.cellWidth;
        const viewHeight = (iDims.rows + iDims.ranFrac) * this.cellHeight;
        const viewBoxString = `0 0 ${viewWidth} ${viewHeight}`;

        this.forestSVG.attr("viewBox", viewBoxString);

        //  todo: set these as a result of a notification; we do not know God directly!

        this.theTrees = [...treePre.treeData];      //  a clone

        //  this.forestSVG.selectAll('svg > *').remove();

        d3.select('#forestDisplay')
            .selectAll('path')
            .data(this.theTrees)
            .join("path")       //      was "rect"
            .attr("d", (d, i) => {
                return this.getTreePath(d)
            })
            .attr("title", (d, i) => {
                return `age ${d.age}`
            })
            .on("click", handlers.markTreeSVG)
            .attr("class", (d, i) => {
                return treePre.markedTrees.includes(i) ? "markSVG" : "treeSVG"
            })
    },

    updateD3Forest: function () {
        this.theTrees = [...treePre.treeData];      //  a clone

        this.theTrees.sort((a, b) => {
            return a.dim.y - b.dim.y;
        });


        d3.select('#forestDisplay')
            .selectAll('path')
            .data(this.theTrees)
            .join("path")       //      was "rect"
            .attr("d", (d, i) => {
                return this.getTreePath(d)
            })
            .attr("fill", (d, i) => {
                return forestView.getColor(d)
            })
            .attr("class", (d, i) => {
                return treePre.markedTrees.includes(d.index) ? "markSVG" : "treeSVG"
            })

    },

    /**
     *      d.hue is a tree property, between 0 and 1.
     *      d.age is the age, which we map [0, max] into value between [75, 50]
     *
     *      max = god.gameParams.yearsToAdult
     *
     * @param d     data from the tree. using d.age and d.hue.
     */
    getColor: function (d) {
        const ageFactor = d.age / god.gameParams.yearsToAdult;
        const light = 0.75;
        const dark = 0.60;
        const brightness = ageFactor === 1 ? 0.50 : light - ageFactor * (light - dark);

        const rgb = HSVtoRGB(d.hue, 1, brightness);

        //  now rgb is an object of integers in the right ranges

        const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        return rgbString;
    },

    getTreePath: function (d) {
        const dim = d.dim;
        let path = d3.path();

        path.moveTo(dim.x, dim.y);                  //  base of tree
        if (dim.h > 0) {
            path.lineTo(dim.x - dim.w / 2, dim.y);
            path.lineTo(dim.x, dim.y - dim.h);      //  top of tree
            path.lineTo(dim.x + dim.w / 2, dim.y);
        }
        path.closePath();

        const out = path.toString();
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
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        case 5:
            r = v, g = p, b = q;
            break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}