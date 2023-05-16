/**
 * Singleton to draw the mosaic plot using D3.
 *
 * There are four cells. Their data values get expressed in an array in this order
 * (which is L-R, then top-bottom)
 *
 * * TP = 0
 * * FP = 1 (upper right)
 * * FN = 2
 * * TN = 3 (lower right)
 *
 */
const mosaic = {

    size : 222,
    paper: null,
    bg : null,
    correctColor : "#aca",
    incorrectColor : "#caa",

    initialize: function () {
        this.paper = d3.select("#mosaicPlot")
            .attr("width" , this.size)
            .attr("height" , this.size);
        this.update();

    },

    update : function(iResult, iPos, iNeg) {

        console.log("updating mosaic plot data");
        const theData = this.constructMosaicData();
        let boxes = this.paper.selectAll("rect").data(theData);

        scaleX = d3.scaleLinear()
            .domain([0,1])
            .range([0, this.size]);
        scaleY = d3.scaleLinear()
            .domain([0,1])
            .range([0, this.size]);

        boxes.enter().append("rect")
            .merge(boxes)
            .attr("x", (d, i) => {return scaleX(d.x)})
            .attr("y", (d, i) => {return scaleY(d.y)})
            .attr("width", (d, i) => {return scaleX(d.w)})
            .attr("height", (d, i) => {return scaleY(d.h)})
            .attr("fill", (d, i) => {return d.color})
            .style("stroke", "#fff")
    },

    constructMosaicData : function() {

        let theCounts  = {
            TP: 20, FP: 5, FN: 3, TN: 10,
            PU: 5,  NU: 5,      //  PU, PN = positive, negative Undiagnosed.
        }

        if (arbor.state.tree) {
            theCounts = arbor.state.tree.results();
        }


        const margTrue = theCounts.TP + theCounts.FN + theCounts.PU;
        const margFalse = theCounts.FP + theCounts.TN + theCounts.NU;
        const N = margTrue + margFalse;

        const TPdata = {        //  upper left
            x : 0, y : 0, w : margTrue/N, h : theCounts.TP/margTrue,
            count : theCounts.TP,
            color : this.correctColor,
        }

        const FPdata = {
            x : margTrue/N, y : 0, w : margFalse/N, h : theCounts.FP/margFalse,
            count : theCounts.FP,
            color : this.incorrectColor,
        };

        const FNdata = {
            x : 0, y : theCounts.TP/margTrue, w : margTrue/N, h : theCounts.FN/margTrue,
            count : theCounts.FN,
            color : this.incorrectColor,
        };

        const TNdata = {
            x : margTrue/N, y : theCounts.FP/margFalse, w : margFalse/N, h : theCounts.TN/margFalse,
            count : theCounts.TN,
            color : this.correctColor,
        }

        return [TPdata, FPdata, FNdata, TNdata];
    }
}