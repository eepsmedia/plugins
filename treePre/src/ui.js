const ui = {

    headerDiv : null,
    statusDiv : null,

    initialize : function() {
        this.headerDiv = document.getElementById("header");
        this.statusDiv = document.getElementById("status");
        this.forestDiv = document.getElementById("forest");
    },

    redraw : function() {

        this.headerDiv.innerHTML = "<h2>Trees!</h2>";
        this.statusDiv.innerHTML = this.makeStatusHTML();

        this.forestDiv.innerHTML = this.makeForestHTML();

        this.setVisibility();
    },

    setVisibility : function() {

        document.getElementById("joinButton").style.display =
            (treePre.gamePhase === 'recruit') ? 'block' : 'none';
        document.getElementById("forest").style.display =
            (treePre.gamePhase === 'play') ? 'block' : 'none';

    },

    makeForestHTML : function () {
        let out = "";

        god.forest.forEach( tree => {
            const [r, c] = this.rowColFromIndex(tree.index);
            const thisTree = treePre.markedTrees.includes(tree.index) ?
                `xx` :
                `${Math.round(tree.age)}`;
            out += `<input type="button" class="tree" value="${thisTree}" onclick=handlers.markTree(${tree.index})>`;
        })

        return out;
    },

    makeStatusHTML:function() {
        let out = `Press Join to start`;

        if (treePre.state.me) {
            const balance = new Intl.NumberFormat(treePre.state.lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(treePre.state.me.balance)
            //  const balance = this.numberToString(treePre.state.me.balance);
            const marked = treePre.markedTrees.length === 1 ?
                `${treePre.markedTrees.length} tree` : `${treePre.markedTrees.length} trees`;

            out = localize.getString("statusText",
                god.gameParams.gameYear, treePre.state.me.name, balance, marked);
        }
        return out;
    },

    rowColFromIndex : function(index) {
        const theRow = Math.floor(index / god.gameParams.columns);
        const theCol = index % god.gameParams.columns;
        return [theRow, theCol];
    },

    numberToString: function (iValue, iFigs = 2) {
        let out = "";
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

}