const ui = {

    headerDiv: null,
    statusDiv: null,

    initialize: function () {
        this.headerDiv = document.getElementById("header");
        this.statusDiv = document.getElementById("status");
        this.adviceDiv = document.getElementById("advice");
        this.forestDiv = document.getElementById("forest");
        this.harvestButton = document.getElementById("harvestButton");

        forestView.initialize(d3.select("#forestSVG"));
    },

    redraw: function () {

        this.headerDiv.innerHTML = localize.getString("gameTitle");
        this.statusDiv.innerHTML = this.makeStatusHTML();
        this.adviceDiv.innerHTML = this.makeAdviceHTML();
        this.harvestButton.value = this.makeHarvestButtonText();

        //  button version of trees
        //  this.forestDiv.innerHTML = this.makeForestHTML();   //  uncomment for debugging

        forestView.redraw();

        this.setVisibility();
    },

    setVisibility: function () {

        document.getElementById("joinButton").style.display =
            (treePre.gamePhase === treePre.phases.kRecruit) ? 'block' : 'none';
        document.getElementById("forest").style.display =
            (treePre.gamePhase === treePre.phases.kPlay ||
                treePre.gamePhase === treePre.phases.kWaitingForMarket) ? 'block' : 'none';
        document.getElementById("harvestButton").style.display =
            (treePre.gamePhase === treePre.phases.kPlay) ? 'block' : 'none';

        document.getElementById("startPlayButton").style.display =
            (god.gamePhase === god.phases.kRecruit) ? 'block' : 'none';
        document.getElementById("newYearButton").style.display =
            (god.gamePhase === god.phases.kReadyForMarket) ? 'block' : 'none';
        document.getElementById("endGameButton").style.display =
            (god.gamePhase === god.phases.kDebrief) ? "none" : "block";
        document.getElementById("newGameButton").style.display =
            (god.gamePhase === god.phases.kDebrief || god.gamePhase === god.phases.kNoGame) ? "block" : "none";

        if (singlePlayer) {
            document.getElementById("newYearButton").style.display = 'none';
        }
    },

    makeHarvestButtonText : function () {
        const nHarvest = treePre.markedTrees.length;
        let out = localize.getString("harvestNoneText");

        if (nHarvest) {
            const treeText = (nHarvest === 1) ?
            `one ${localize.getString('tree')}` :
                `${nHarvest} ${localize.getString('trees')}`;
            out = localize.getString("harvestSomeTreesText", treeText);
        }
        return out;
    },

    /**
     * View of the forest entirely in buttons. Good for debugging.
     *
     * @returns {string}
     */
    makeForestHTML: function () {
        let out = "";

        for (let row = 0; row < god.gameParams.rows; row++) {
            for (let col = 0; col < god.gameParams.columns; col++) {
                const ix = row * god.gameParams.columns + col;
                const theAge = treePre.treeData[ix].age;

                const thisTree = treePre.markedTrees.includes(ix) ?
                    `xx` :
                    `${Math.round(theAge)}`;
                out += `<input type="button" class="tree" value="${thisTree}" onclick=handlers.markTree(${ix})>`;

            }
            out += "<br>";
        }
        return out;
    },

    makeStatusHTML: function () {
        let out = ``;

        if (treePre.state.me) {
            const balance = new Intl.NumberFormat(treePre.state.lang, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(treePre.state.me.balance)

            const marked = treePre.markedTrees.length === 1 ?
                `${treePre.markedTrees.length} ${localize.getString('tree')}` :
                `${treePre.markedTrees.length} ${localize.getString('trees')}` ;

            out = localize.getString("playerStatusText",
                treePre.state.year, treePre.state.me.name, balance, marked);
        }
        return out;
    },

    makeAdviceHTML : function() {
        let out;

        switch (treePre.gamePhase) {
            case treePre.phases.kNoGame:
                out = localize.getString("advice.noGame");
                break;
            case treePre.phases.kPlay:
                out = localize.getString("advice.play");
                break;
            case treePre.phases.kWaitingForMarket:
                out = localize.getString("advice.waitingForMarket");
                break;
            case treePre.phases.kDebrief:
                out = this.makeDebriefText(treePre.debriefInfo);
                break;
            default:
                out = "some advice might appear here!"
                break;
        }

        return out;
    },

    makeDebriefText : function(info) {
        let out;
        let timeString = "";

        if (info) {
            console.log( `the game ended because ${JSON.stringify(info)}.`);

            if (info.time) {
                timeString = localize.getString("debrief.time", treePre.state.year);
            }

            let brokelist = [];
            for (let key in info) {
                if (info[key] === "broke") {
                    brokelist.push(key);
                }
            }

            const brokeGroupString = this.makeCommaSeparatedString(brokelist, true);
            const brokeString = brokeGroupString.length ?
                (timeString.length ? "<br>" : "" ) + localize.getString("debrief.broke", brokeGroupString) : "";

            out = `${timeString}${brokeString}`;
            out += `<br>${localize.getString("debrief.meanBalance", localize.getString("moneySymbol"), info.meanBalance.toFixed(2))}`;

        } else {
            out = "the game ended because God willed it."
        }
        console.log(`debrief text : ${out}`);
        return out;
    },


    rowColFromIndex: function (index) {
        const theRow = Math.floor(index / god.gameParams.columns);
        const theCol = index % god.gameParams.columns;
        return [theRow, theCol];
    },

    indexFromRowColTorus : function(row, col) {
        if (row >= god.gameParams.rows) row -= god.gameParams.rows;
        if (row < 0) row += god.gameParams.rows;
        if (col >= god.gameParams.columns) col -= god.gameParams.columns;
        if (col < 0) col += god.gameParams.columns;

        return (row * god.gameParams.columns) + col;
    },

    numberToString: function (iValue, iFigs = 2) {
        let out;
        let multiplier = 1;
        let suffix = "";
        let exponential = false;

        if (iValue === "" || iValue === null || typeof iValue === "undefined") {
            out = "";
        } else if (iValue === 0) {
            out = "0";
        } else {
            if (Math.abs(iValue) > 1.0e15) {
                exponential = true;
            } else if (Math.abs(iValue) < 1.0e-4) {
                exponential = true;
            } else if (Math.abs(iValue) > 1.0e10) {
                multiplier = 1.0e9;
                iValue /= multiplier;
                suffix = " B";
            } else if (Math.abs(iValue) > 1.0e7) {
                multiplier = 1.0e6;
                iValue /= multiplier;
                suffix = " M";
            }
            out = new Intl.NumberFormat(
                treePre.state.lang,
                {maximumSignificantDigits: iFigs, useGrouping: false}
            ).format(iValue);

            if (exponential) {
                out = Number.parseFloat(iValue).toExponential(iFigs);
            }
        }
        return `${out}${suffix}`;       //  empty if null or empty
    },

    //  https://stackoverflow.com/questions/53879088/join-an-array-by-commas-and-and

    makeCommaSeparatedString : function(arr, useOxfordComma)  {
        const listStart = arr.slice(0, -1).join(', ')
        const listEnd = arr.slice(-1)
        const conjunction = arr.length <= 1
            ? ''
            : useOxfordComma && arr.length > 2
                ? `, ${localize.getString('and')} `
                : ` ${localize.getString('and')} `

        return [listStart, listEnd].join(conjunction)
    }


}