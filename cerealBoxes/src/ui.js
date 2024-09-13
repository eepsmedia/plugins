
import {state} from "./cboxx.js"

let statusDIV = null;
let theSVG = null;

export function initialize() {
    statusDIV = document.getElementById('status');
    theSVG = d3.select("#theSVG");
}

/**
 * Redraw the plugin.
 */
export function redraw() {

    const nRuns = document.getElementById("numberOfRunsInput").value;
    
    document.getElementById("doRunsButton").value = localize.getString("doRunsButton", nRuns);
    const datasetInfo = state.datasetName ? `dataset: ${state.datasetName}` : `no dataset`;

    //  statusDIV.innerHTML = `${buttonCountText}<br>${datasetInfo}<br>&nbsp; `;     //  of course, replace this!

    //  drawing in d3. Consider moving to a different module.
    drawGraphicContent();
}

function drawGraphicContent() {

    theSVG.selectAll("*").remove();     //  get rid of old stuff

    drawDotsForItems(state.allValues);

    //      draw a rectangle so you can see things are working even if there's no data
    const aRect = drawARectangle(20, 20, 4 * (state.buttonCount + 1), 30);
    aRect.attr("fill", "rosybrown")
        .attr("stroke", "darkblue")
        .attr("stroke-width", 2);
}

/**
 * Simple rectangle draw helper in D3
 * @param x
 * @param y
 * @param w
 * @param h
 * @returns {*}
 */
function drawARectangle(x, y, w, h) {
    return theSVG.append("rect")
        .attr("x", x).attr("y", y).attr("width", w).attr("height", h);

}

/**
 * Simple circle draw helper in D3
 * @param x
 * @param y
 * @param r
 * @returns {*}
 */
function drawACircle(x, y, r) {
    return theSVG.append("circle")
        .attr("cx", x).attr("cy", y).attr("r", r);
}

/**
 * Draw one dot for each data item.
 * This is a placeholder for whatever you really want to draw,
 * but includes some useful syntax and ideas.
 *
 * @param iItems
 */
function drawDotsForItems(iItems) {

    //  These two statements set the proportions of the SVG.
    const viewWidth = 200;
    const viewHeight = 100;

    //  Key D3/SVG idea: we set a viewBox that specifies the coordinates in the box
    theSVG.attr("viewBox", `0 0 ${viewWidth} ${viewHeight}`);
    const N = iItems.length;

    const areaPerItem = viewHeight * viewWidth / N;
    const columns = Math.ceil(viewWidth / Math.sqrt(areaPerItem));
    const spacing = viewWidth / columns;
    const R = spacing / 2 - 1    //  dot radius

    let row = 0;
    let col = 0;
    for (let i = 0; i < N; i++ ) {
        const item = iItems[i];
        const aCircle = drawACircle(col * spacing + R, row * spacing + R, R);

        //  color the nth dot red, where n is the button count.
        aCircle.attr("fill", (i === state.buttonCount ? "red" : "gray"));
        col++;
        if (col >= columns) {
            row++;
            col = 0;
        }
    }
}