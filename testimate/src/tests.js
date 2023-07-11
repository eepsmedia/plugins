const tests = {


    parameters: {
        alpha: 0.05,
        value: 0.0,    //  to be tested against
        sides: 2,
        conf: 95,    //  confidence level 1 - alpha
    },
    nullResults: {
        xbar: null,
        ybar: null,
        s: null,       //  sample SD
        s1: null,       //  sample SD
        s2: null,       //  sample SD
        SE: null,      //  standard error
        SE1 : null,
        SE2 : null,
        P: null,
        p: null,       //  sample proportion
        N: null,       //  sample size
        N1 : null,
        N2 : null,
        df: null,      //  degrees of freedom
        CImin: null,
        CImax: null,
        tCrit: null,   //  t critical value
        t: null,
        chisq: null,
        F: null,
        m: null,       //  lin regression slope
        b: null,       //  regression intercept
    },
    results : {},

    unpairedTestTypes: [
        "one-sample t", "two-sample t", "one-sample proportion", "two-sample proportion",
    ],

    /**
     * called from ui.redraw()
     *
     * @returns {[]}
     */
    confirmTestID: function() {
        const possibleTestIDs = this.filterTestConfigurations();
        if (!possibleTestIDs.includes(testimate.state.test)) {
            testimate.state.test = possibleTestIDs[0];
        }
        return (possibleTestIDs);   //  to ui to make a menu if necessary
    },

    /**
     * called from ui.redraw()
     *
     * @returns {[]}
     */
    updateTestResults: function () {


        switch (testimate.state.test) {
            case `N_01`:
                tests.oneSampleT();
                break;
            case `NN01`:
                tests.paired();
                break;
            case `NN02`:
                tests.twoSampleT();
                break;
            case `NN03`:
                tests.regression();
                break;
            default:
                tests.results = this.nullResults;
                console.log(`NO CODE AVAILABLE for ${testimate.state.test}`)
                break;
        }

        return;   //  to ui to make a menu if necessary
    },

    /*      tests and estimates         */

    findDefaultTest: function () {
        if (testimate.state.xName) {
            if (!testimate.state.yName) {
                if (testimate.state.dataTypes[testimate.state.xName] === 'numeric') {
                    testimate.state.test = "one-sample t";
                } else if (testimate.state.dataTypes[testimate.state.xName] === 'categorical') {
                    testimate.state.test = "one-sample proportion";
                } else {
                    console.log(`unexpected attribute configuration: second att is neither num nor cat`)
                    testimate.state.test = null;
                }
            } else {
                //  there is a second attribute
                if (testimate.state.dataTypes[testimate.state.xName] === 'numeric') {   //  numeric-numeric (paired)
                    if (testimate.state.dataTypes[testimate.state.yName] === 'numeric') {
                        testimate.state.test = "paired t";
                    } else if (testimate.state.dataTypes[testimate.state.xName] === 'categorical') {    //  numeric-categorical (2-sample)
                        testimate.state.test = "two-sample proportion";
                    } else {
                        console.log(`unexpected attribute configuration: second att is neither num nor cat`)
                        testimate.state.test = null;
                    }
                } else if (testimate.state.dataTypes[testimate.state.xName] === 'categorical') {
                    if (testimate.state.dataTypes[testimate.state.yName] === 'numeric') {       //      categorical-numeric (logistic)
                        testimate.state.test = "logistic";
                    } else if (testimate.state.dataTypes[testimate.state.xName] === 'categorical') {    //  categorical-categorical (chisq)
                        testimate.state.test = "chi-square";
                    } else {
                        console.log(`unexpected attribute configuration: second att is neither num nor cat`)
                        testimate.state.test = null;
                    }
                }

            }
        } else {
            console.log(`no attributes selected, so no tests!`);
            testimate.state.test = null;
        }

        console.log(`set default test to ${testimate.state.test}`);
    },

    oneSampleT: function () {
        this.anyT(data.xAttData.theArray);
    },

    twoSampleT : function() {
        const jX = jStat(data.xAttData.theArray);
        const jY = jStat(data.yAttData.theArray);

        this.results.N1 = jX.cols();
        this.results.N2 = jY.cols();
        this.results.df = this.results.N1 + this.results.N2 - 1;
        this.results.xbar = jX.mean();
        this.results.ybar = jY.mean();
        this.results.s1 = jX.stdev(true);    //      true means SAMPLE SD
        this.results.s2 = jY.stdev(true);    //      true means SAMPLE SD
        this.results.SE1 = this.results.s1 / Math.sqrt(this.results.N1);
        this.results.SE2 = this.results.s2 / Math.sqrt(this.results.N2);



    },

    paired: function () {
        const X = data.xAttData.theArray;
        const Y = data.yAttData.theArray;
        const N = X.length;
        if (N !== Y.length) {
            alert(`Paired arrays are not the same length! Bogus results ahead!`);
        }
        let Z = [];

        for (let i = 0; i < N; i++) {
            Z[i] = Y[i] - X[i];
        }
        this.anyT(Z);
    },

    anyT: function (iArray) {
        const jX = jStat(iArray);      //  jStat version of x array

        const theCIparam = 1 - this.parameters.alpha / 2;

        this.results.N = jX.cols();
        this.results.df = this.results.N - 1;
        this.results.xbar = jX.mean();
        this.results.s = jX.stdev(true);    //      true means SAMPLE SD
        this.results.SE = this.results.s / Math.sqrt(this.results.N);
        this.results.P = jX.ttest(this.parameters.value, this.parameters.sides);
        this.results.tCrit = jStat.studentt.inv(theCIparam, this.results.df);    //  1.96-ish for 0.95
        this.results.CImax = this.results.xbar + this.results.tCrit * this.results.SE;
        this.results.CImin = this.results.xbar - this.results.tCrit * this.results.SE;
        this.results.t = (this.results.xbar - this.parameters.value) / this.results.SE;

    },

    regression : function() {

    },

    /**
     * Find the possible tests for the current configuration of attrinbutes (numeric, binary, categorical...)
     *
     * @returns {[]}    Array of test configuration IDs
     */
    filterTestConfigurations: function () {
        const xType = data.xAttData.type;
        const yType = data.yAttData.type;
        const pairable = data.xAttData.theRawArray &&
            data.yAttData.theRawArray &&
            (data.xAttData.theRawArray.length === data.yAttData.theRawArray.length);

        out = [];
        for (let id in this.testConfigurations) {
            let match = true;
            const theConfig = this.testConfigurations[id];

            if (theConfig.paired && !pairable) match = false;
            if (xType !== theConfig.xType) match = false;
            if (yType !== theConfig.yType) match = false;

            if (match) {
                out.push(theConfig.id);
            }
        }
        return out;
    },

    testConfigurations: {
        N_01: {
            id: `N_01`,
            name: 'one-sample t',
            xType: 'numeric',
            yType: null,
            paired: false,
        },
        NN01: {
            id: `NN01`,
            name: 'paired t',
            xType: 'numeric',
            yType: 'numeric',
            paired: true,
        },
        NN02: {
            id: `NN02`,
            name: 'two-sample t',
            xType: 'numeric',
            yType: 'numeric',
            paired: false,
        },
        NN03: {
            id: `NN03`,
            name: 'linear regression',
            xType: 'numeric',
            yType: 'numeric',
            paired: true,
        },
    },

    testConfigurations_: {
        'one-sample t': {
            x: 'numeric',
            y: null,
            paired: false,
        },
        'one-sample proportion': {
            x: 'categorical',
            y: null,
            paired: false,
        },
        'two-sample t': {
            x: 'numeric',
            y: 'numeric',
            paired: false,
        },
        'paired t': {
            x: 'numeric',
            y: 'numeric',
            paired: true,
        },
        'linear regression': {
            x: 'numeric',
            y: 'numeric',
            paired: true,
        },
        'logistic': {
            x: 'categorical',
            y: 'numeric',
            paired: true,
        },
        'chi-square': {
            x: 'categorical',
            y: 'categorical',
            paired: true,
        },
    },


}