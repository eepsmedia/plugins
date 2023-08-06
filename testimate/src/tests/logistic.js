class Logistic extends Test {

    constructor(iID) {
        super(iID);
    }

    updateTestResults() {
        const X = data.xAttData.theArray;
        const Y = data.yAttData.theArray;
        const N = X.length;
        this.results.N = N;

        if (N !== Y.length) {
            alert(`Paired arrays are not the same length! Bogus results ahead!`);
        }

        this.results.df = this.results.N - 1;
    }

    makeResultsString() {
        const N = this.results.N;
        const df = ui.numberToString(this.results.df, 3);

        let out = "<pre>";

        out += `This plugin does not yet do logistic regression.`;
        out += `<br>    N = ${N}, df = ${df}`;

        out += `</pre>`;
        return out;
    }

    makeTestDescription( ) {
        return `logistic regression: ${data.xAttData.name} as a function of ${data.yAttData.name}`;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        return `logistic regression: ${data.xAttData.name} as a function of ${data.yAttData.name}`;
    }

    makeConfigureGuts() {
        const sides = ui.sidesBoxHTML(testimate.state.testParams.sides);
        const value = ui.valueBoxHTML(testimate.state.testParams.value);
        const conf = ui.confBoxHTML(testimate.state.testParams.conf);
        let theHTML = `Logistic regression predicting ${data.xAttData.name} from ${data.yAttData.name} ${conf}`;

        return theHTML;
    }

}