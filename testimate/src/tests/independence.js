class Independence extends Test {

    constructor(iID) {
        super(iID);
        this.results.rowLabels = [];
        this.results.columnLabels = [];
        this.results.observed = null;
        this.results.expected = null;
    }

    updateTestResults() {

        const X = data.xAttData.theArray;       //  row-attribute data
        const Y = data.yAttData.theArray;       //  column-attribute data
        this.results.N = X.length;

        this.results.rowLabels = [...data.xAttData.valueSet];       //  x is vertical, row labels
        this.results.columnLabels = [...data.yAttData.valueSet];

        this.results.observed = this.makeZeroMatrix(this.results.columnLabels.length, this.results.rowLabels.length);
        this.results.expected = this.makeZeroMatrix(this.results.columnLabels.length, this.results.rowLabels.length);

        this.results.rowTotals = new Array(this.results.rowLabels.length).fill(0);
        this.results.columnTotals = new Array(this.results.columnLabels.length).fill(0);

        for (let r = 0; r < this.results.rowLabels.length; r++) {
            for (let c = 0; c < this.results.columnLabels.length; c++) {
                this.results.observed[c][r] = 0;
            }
        }

        //  loop over all data
        //  count the observed values in each cell, update row and column totals

        for (let ix = 0; ix < X.length; ix++) {
            const row = this.results.rowLabels.indexOf(X[ix]);
            const column = this.results.columnLabels.indexOf(Y[ix]);
            this.results.observed[column][row]++;
            this.results.rowTotals[row]++
            this.results.columnTotals[column]++;
        }

        //  calculate expected values and chisquare contributions
        this.results.chisq = 0;

        for (let r = 0; r < this.results.rowLabels.length; r++) {
            for (let c = 0; c < this.results.columnLabels.length; c++) {
                this.results.expected[c][r] = this.results.columnTotals[c] * this.results.rowTotals[r] / this.results.N;
                const contrib = (this.results.observed[c][r] - this.results.expected[c][r]) ** 2
                    / this.results.expected[c][r];
                this.results.chisq += contrib
            }
        }


        const theCIparam = 1 - this.parameters.alpha / 2;   //  the large number
        this.results.df = (this.results.rowLabels.length - 1) * (this.results.columnLabels.length - 1);
        this.results.chisqCrit = jStat.chisquare.inv(theCIparam, this.results.df);    //
        this.results.P = 1 - jStat.chisquare.cdf(this.results.chisq, this.results.df);
    }

    makeResultsString() {
        const N = this.results.N;
        const chisq = ui.numberToString(this.results.chisq);
        const chisqCrit = ui.numberToString(this.results.chisqCrit);
        const P = (this.results.P < 0.0001) ?
            `P < 0.0001` :
            `P = ${ui.numberToString(this.results.P)}`;
        const df = ui.numberToString(this.results.df, 3);
        const conf = ui.numberToString(this.parameters.conf);
        const alpha = ui.numberToString(this.parameters.alpha);


        let out = "<pre>";
        out += this.makeIndependenceTable();
        out += `<br>Testing independence of ${data.yAttData.name} from ${data.xAttData.name}`;
        out += `<br>    N = ${N}, ${this.results.columnLabels.length} columns by  ${this.results.rowLabels.length} rows<br>`;
        out += `    df = ${df}, chisq* = ${chisqCrit} <br>`;
        out += `    &alpha; = ${alpha}, chisquare = ${chisq}, ${P}`;

        out += `</pre>`;
        return out;
    }

    makeIndependenceTable() {

        let headerRow = `<tr><td>observed<br>expected</td><th>${data.yAttData.name} = </th>`;
        let tableRows = "";
        let observedRow = `<tr><td>observed</td>`;
        let expectedRow = `<tr><td>expected</td>`;

        //  construct a header

        for (let c = 0; c < this.results.columnLabels.length; c++) {
            const col = this.results.columnLabels[c];   //  the string label
            headerRow += `<th>${col}</th>`;     //  column value in the header
        }
        headerRow += `</tr>`;

        //  now loop over rows, making a column inside each...

        for (let r = 0; r < this.results.rowLabels.length; r++) {
            const row = this.results.rowLabels[r];      //  the string row label
            const attLabel = (r === 0) ? `<th>${data.xAttData.name} = ` : `<th></th>`;
            let thisRow = `${attLabel}<th>${row}</th>`;
            for (let c = 0; c < this.results.columnLabels.length; c++) {
                const exp = ui.numberToString(this.results.expected[c][r], 4);
                const col = this.results.columnLabels[c];   //  the string label
                thisRow += `<td>${this.results.observed[c][r]}<br>${exp}</td>`;     //  observed value in the cell
            }
            thisRow += `</tr>`;
            tableRows += thisRow;
        }

        return `<table class="test-results">${headerRow}${tableRows}</table>`;
    }

    makeTestDescription() {
        return `Test independence of ${data.yAttData.name} from ${data.xAttData.name}`;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        return `Test independence of ${data.yAttData.name} from ${data.xAttData.name}`;
    }

    makeConfigureGuts() {
        const sides = ui.sidesBoxHTML(this.parameters.sides);
        const value = ui.valueBoxHTML(this.parameters.value);
        const conf = ui.confBoxHTML(this.parameters.conf);
        let theHTML = `Test for independence of ${data.yAttData.name} from ${data.xAttData.name}: ${conf}`;

        return theHTML;
    }

    makeZeroMatrix(cols, rows) {
        let A = new Array(cols);
        for (let c = 0; c < cols; c++) {
            A[c] = new Array(rows).fill(0);
        }
        return A;
    }

}