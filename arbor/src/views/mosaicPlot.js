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

    size: 288,
    paper: null,
    plotG: null,       //  the <g> for our plot area
    bg: null,
    margins: {top: 0, left: 0, right: 0, bottom: 0},
    plotSize: {},
    inset: 6,        //  pixel inset for prediction/truth distinction

    xScale: null,
    yScale: null,

    greenCheck: " ✅",
    redX: " ❌",

    initialize: function () {
        this.paper = d3.select("#mosaicPlot")
            .attr("width", this.size)
            .attr("height", this.size);

        this.plotSize = {
            width: this.paper.attr("width") - this.margins.left - this.margins.right,
            height: this.paper.attr("height") - this.margins.top - this.margins.bottom
        }

        //      scaling functions map [0, 1] to the size of the plot
        this.xScale = d3.scaleLinear().domain([0, 1]).range([0, this.plotSize.width]);
        this.yScale = d3.scaleLinear().domain([0, 1]).range([0, this.plotSize.height]);

        this.plotG = this.paper.append("g")
            .attr("transform", `translate(${this.margins.left}, ${this.margins.top})`);

        this.update();
    },

    update: function (iResult, iPos, iNeg) {

        console.log("updating mosaic plot data");
        this.updateMosaicLegend();
        const allData = this.constructMosaicData();
        const cellData = allData.cellData;
        const marginalData = allData.marginalData;

        let predBoxes = this.plotG.selectAll(".predBox").data(cellData);
        let truthBoxes = this.plotG.selectAll(".truthBox").data(cellData);

        let marginalLabels = this.plotG.selectAll(".marginalLabelText").data(marginalData);

        let cellCountLabels = this.plotG.selectAll(".cellText").data(cellData);


        predBoxes.enter().append("rect")            //  prediction rect, fills everything
            .attr("class", "predBox")
            .style("stroke", "#fff")
            .merge(predBoxes)
            .transition()
            .attr("fill", (d, i) => {
                return d.boxColor
            })
            .attr("x", (d, i) => {
                return this.xScale(d.x)
            })
            .attr("y", (d, i) => {
                return this.yScale(d.y)
            })
            .attr("width", (d, i) => {
                return this.xScale(d.w)
            })
            .attr("height", (d, i) => {
                return this.yScale(d.h)
            })

        /*
                truthBoxes.enter().append("rect")            //  truth rect, fills inside
                    .attr("class", "truthBox")
                    .attr("fill", (d, i) => {
                        return d.truthColor
                    })
                    //  .style("stroke", "#fff")
                    .merge(truthBoxes)
                    .transition()
                    .attr("x", (d, i) => {
                        return (this.xScale(d.x) + mosaic.inset)
                    })
                    .attr("y", (d, i) => {
                        return (this.yScale(d.y) + mosaic.inset)
                    })
                    .attr("width", (d, i) => {
                        let out = this.xScale(d.w) - 2 * mosaic.inset;
                        return (out > 0 ? out : 0);
                    })
                    .attr("height", (d, i) => {
                        let out = (this.yScale(d.h) - 2 * mosaic.inset);
                        return (out > 0 ? out : 0);
                    })
        */

        //  labels for positive and negative, spanning two cells

        marginalLabels.enter().append("text")
            .attr("class", "marginalLabelText")
            .style("text-anchor", "middle")
            .style("dominant-baseline", (d, i) => {
                return d.baseline
            })
            .merge(marginalLabels)
            .transition()
            .attr("x", 0)
            .attr("y", 0)
            .attr('fill', 'white')
            .attr('fill-opacity', arbor.constants.mosaicMarginalLabelFillOpacity)

            .attr("transform", (d, i) => {
                    const xText = this.xScale(d.x);
                    const yText = this.yScale(d.y);
                    return `translate(${xText}, ${yText}) rotate(${d.rotation})`
                }
            )
            .text((d, i) => {
                return d.text
            })

        //  numbers for cell counts

        cellCountLabels.enter().append("text")
            .attr("class", "cellText")
            .style("text-anchor", "middle")
            .style("dominant-baseline", "central")
            .merge(cellCountLabels)
            .transition()
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", (d, i) => {
                    const xText = this.xScale(d.x + d.w / 2);
                    const yText = this.yScale(d.y + d.h / 2);
                    return `translate(${xText}, ${yText}) `
                }
            )
            .text((d, i) => {
                return d.count
            })
    },

    constructMosaicData: function () {

        let FNdata, TNdata, FPdata, TPdata, PosData, NegData;

        let theCounts = {
            TP: 20, FP: 20, FN: 3, TN: 7,
            PU: 0, NU: 0,      //  PU, PN = positive, negative Undiagnosed.
        }

        if (arbor.state.tree) {
            theCounts = arbor.state.tree.results();
        }

        if (arbor.state.mosaicOrientation === arbor.constants.kMosaicOrientationTruth) {

            //  marginal and grand totals
            const margTrue = theCounts.TP + theCounts.FN + theCounts.PU;
            const margFalse = theCounts.FP + theCounts.TN + theCounts.NU;
            const N = margTrue + margFalse;
            const condition = "grippe";

            TPdata = {        //  upper left
                x: 0,
                y: 0,
                w: N ? margTrue / N : 0,
                h: margTrue ? theCounts.TP / margTrue : 0,
                count: theCounts.TP ? theCounts.TP : "",
                boxColor: arbor.constants.mosaicColorPredictedPositive,
                //  predColor: arbor.constants.mosaicColorPositive,
                //  truthColor: arbor.constants.mosaicColorPositive,
                tip: `True positive. Of ${margTrue} cases with ${condition}, ${Math.round(100 * theCounts.TP / margTrue)}% were diagnosed correctly.`,
            }

            FPdata = {
                x: N ? margTrue / N : 0,
                y: 0,
                w: N ? margFalse / N : 0,
                h: margFalse ? theCounts.FP / margFalse : 0,
                count: theCounts.FP ? theCounts.FP : "",
                boxColor: arbor.constants.mosaicColorPredictedPositive,
                predColor: arbor.constants.mosaicColorPositive,
                truthColor: arbor.constants.mosaicColorNegative,
                tip: `foo`,
            };

            FNdata = {
                x: 0,
                y: margTrue ? theCounts.TP / margTrue : 0,
                w: N ? margTrue / N : 0,
                h: margTrue ? theCounts.FN / margTrue : 0,
                count: theCounts.FN ? theCounts.FN : "",
                boxColor: arbor.constants.mosaicColorPredictedNegative,
                predColor: arbor.constants.mosaicColorNegative,
                truthColor: arbor.constants.mosaicColorPositive,
                tip: `foo`,
            };

            TNdata = {
                x: N ? margTrue / N : 0,
                y: margFalse ? theCounts.FP / margFalse : 0,
                w: N ? margFalse / N : 0,
                h: margFalse ? theCounts.TN / margFalse : 0,
                count: theCounts.TN ? theCounts.TN : "",
                boxColor: arbor.constants.mosaicColorPredictedNegative,
                predColor: arbor.constants.mosaicColorNegative,
                truthColor: arbor.constants.mosaicColorNegative,
                tip: `foo`,
            };

            //  rectangles encompassing actually positive and actually negative

            //  "vertical" rects on truth

            PosData = {
                x: 0.05,
                y: 0.5,
                w: N ? margTrue / N : 0,
                h: margTrue ? (theCounts.TP + theCounts.FN) / margTrue : 0,
                text: margTrue ? arbor.strings.mpsActuallyPositiveLabel : "",
                rotation: 90,
                baseline: "central",     //      "auto",
            };

            NegData = {
                x: 0.95,
                y: 0.5,
                w: N ? margFalse / N : 0,
                h: margFalse ? (theCounts.FP + theCounts.TN) / margFalse : 0,
                text: margFalse ? arbor.strings.mpsActuallyNegativeLabel : "",
                rotation: 90,
                baseline: "central",        //  "hanging",
            }

        } else {
            //  oriented towards prediction.

            const margPositive = theCounts.TP + theCounts.FP;
            const margNegative = theCounts.FN + theCounts.TN;
            const N = margPositive + margNegative;

            TPdata = {        //  upper left
                x: 0,
                y: 0,
                w: margPositive ? theCounts.TP / margPositive : 0,
                h: N ? margPositive / N : 0,
                count: theCounts.TP ? theCounts.TP : "",
                boxColor: arbor.constants.mosaicColorActuallyPositive,
                predColor: arbor.constants.mosaicColorPositive,
                truthColor: arbor.constants.mosaicColorPositive,
                tip: `foo`,
            }

            FPdata = {        //  upper right
                x: margPositive ? theCounts.TP / margPositive : 0,
                y: 0,
                w: margPositive ? theCounts.FP / margPositive : 0,
                h: N ? margPositive / N : 0,
                count: theCounts.FP ? theCounts.FP : "",
                boxColor: arbor.constants.mosaicColorActuallyNegative,
                predColor: arbor.constants.mosaicColorPositive,
                truthColor: arbor.constants.mosaicColorNegative,
                tip: `foo`,
            }

            FNdata = {        //  upper left
                x: 0,
                y: N ? margPositive / N : 0,
                w: margNegative ? theCounts.FN / margNegative : 0,
                h: N ? margNegative / N : 0,
                count: theCounts.FN ? theCounts.FN : "",
                boxColor: arbor.constants.mosaicColorActuallyPositive,
                predColor: arbor.constants.mosaicColorNegative,
                truthColor: arbor.constants.mosaicColorPositive,
                tip: `foo`,
            }

            TNdata = {        //  upper left
                x: margNegative ? theCounts.FN / margNegative : 0,
                y: N ? margPositive / N : 0,
                w: margNegative ? theCounts.TN / margNegative : 0,
                h: N ? margNegative / N : 0,
                count: theCounts.TN ? theCounts.TN : "",
                boxColor: arbor.constants.mosaicColorActuallyNegative,
                predColor: arbor.constants.mosaicColorNegative,
                truthColor: arbor.constants.mosaicColorNegative,
                tip: `foo`,
            }


            //  rectangles encompassing DIAGNOSED positive and negative
            //  "horizontal"

            PosData = {
                x: 0.5,
                y: 0.05,
                w: margPositive ? (theCounts.TP + theCounts.FP) / margPositive : 0,
                h: N ? margPositive / N : 0,
                text: margPositive ? arbor.strings.mpsPredictedPositiveLabel : "",
                rotation: 0,
                baseline: "central",    //      "auto",
            };

            NegData = {
                x: 0.5,
                y: 0.95,
                w: margNegative ? (theCounts.FN + theCounts.TN) / margNegative : 0,
                h: N ? margNegative / N : 0,
                text: margNegative ? arbor.strings.mpsPredictedNegativeLabel : "",
                rotation: 0,
                baseline: "central",  //     "hanging",
            }

            console.log(`setting Posdata.h to ${PosData.h}`)

        }

        const out = {
            cellData: [TPdata, FPdata, FNdata, TNdata],
            marginalData: [PosData, NegData],
        }
        return out;
    },


    updateMosaicLegend: function () {
        //  are we in vertical, truth mode??
        const truthy = arbor.state.mosaicOrientation === arbor.constants.kMosaicOrientationTruth;

        document.getElementById("positiveMosaicLabel").innerHTML
            = truthy ? arbor.strings.mpsPredictedPositiveLabel : arbor.strings.mpsActuallyPositiveLabel;
        document.getElementById("negativeMosaicLabel").innerHTML
            = truthy ? arbor.strings.mpsPredictedNegativeLabel : arbor.strings.mpsActuallyNegativeLabel;

        document.getElementById("positiveLegendRect")
            .style.fill = truthy ? arbor.constants.mosaicColorPredictedPositive : arbor.constants.mosaicColorActualPositive;
        document.getElementById("negativeLegendRect")
            .style.fill = truthy ? arbor.constants.mosaicColorPredictedNegative : arbor.constants.mosaicColorActualNegative;
    },

    changeOrientation: function () {
        arbor.state.mosaicOrientation = (arbor.state.mosaicOrientation === arbor.constants.kMosaicOrientationTruth ?
            arbor.constants.kMosaicOrientationPrediction :
            arbor.constants.kMosaicOrientationTruth)

        this.update();
    }
}