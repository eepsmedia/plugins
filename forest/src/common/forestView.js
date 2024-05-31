import * as Player from '../player/player.js';
import * as PlayerUI from '../player/ui.js';
import {phase} from "../player/player.js";

let forestSVG = null;      //      the D3 object

let theTrees = [];
let params = {};

export function initialize(iBigSVG) {
    forestSVG = iBigSVG;
}

export function setParams(iParams) {
    params = iParams;
}

/**
 * Add the sub-svgs for the trees, give them IDs based on their indices.
 * MUST CALL setParams before this in order to get dimensions
 */
export function newForest(iTrees) {
    theTrees = [...iTrees];

    const dims = params.forestDimensions;

    const viewWidth = (dims.columns + dims.ranFrac) * dims.cellWidth;
    const viewHeight = (dims.rows + dims.ranFrac) * dims.cellHeight;
    const viewBoxString = `0 0 ${viewWidth} ${viewHeight}`;

    forestSVG.attr("viewBox", viewBoxString);

    d3.select('#forestDisplay')
        .selectAll('path')
        .data(theTrees)
        .join("path")
        .attr("d", (d, i) => {
            return getTreePath(d)
        })
        .attr("title", (d, i) => {
            return `age ${d.age}`
        })
        .on("click", markTreeSVG)
        .attr("class", "treeSVG")
}

function updateD3Forest() {
    if (theTrees.length > 0) {
        theTrees.sort((a, b) => {
            return a.dim.y - b.dim.y;
        });



        d3.select('#forestDisplay')
            .selectAll('path')
            .data(theTrees)
            .join("path")       //      was "rect"
            .attr("d", (d, i) => {
                return getTreePath(d)
            })
            .attr("fill", (d, i) => {
                return getColor(d)
            })
            .attr("class", (d, i) => {
                let theClass = "treeSVG";
                if  (Player.markedTrees.includes(d.index)) {
                    theClass = (Player.phase === playerPhases.kWaitForMarket) ? "harvestedSVG" : "markSVG";
                }
                return theClass;
            })
    }
}

/**
 *      d.hue is a tree property, between 0 and 1.
 *      d.age is the age, which we map [0, max] into value between [75, 50]
 *
 *      max = params.yearsToAdult
 *
 * @param d     data from the tree. using d.age and d.hue.
 */
function getColor(d) {
    const ageFactor = d.age / params.yearsToAdult;
    const light = 0.75;
    const dark = 0.60;
    const brightness = ageFactor === 1 ? 0.50 : light - ageFactor * (light - dark);

    const rgb = HSVtoRGB(d.hue, 1, brightness);

    //  now rgb is an object of integers in the right ranges

    const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    return rgbString;
}

function getTreePath(d) {
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
}

export function redraw(iForest) {
    theTrees = [...iForest];
    updateD3Forest();
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

function markTreeSVG(event, data) {
    const whichOne = Player.markedTrees.indexOf(data.index);

    //  toggle whether the tree is in the marked-tree list
    if (whichOne != -1) {
        Player.markedTrees.splice(whichOne, 1);
    } else if (Player.markedTrees.length < params.maxHarvest) {
        Player.markedTrees.push(data.index);
    }

    PlayerUI.update();
}

