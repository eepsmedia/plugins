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
            .attr("class", (d, i) => {return treePre.markedTrees.includes(i) ? "markSVG" : "treeSVG"})

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