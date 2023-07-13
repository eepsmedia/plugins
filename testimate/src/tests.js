const tests = {


    parameters: {
        alpha: 0.05,
        value: 0.0,    //  to be tested against
        sides: 2,
        conf: 95,    //  confidence level 1 - alpha
    },
    nullResults: {
        xbar: null,
        mean1: null,
        mean2: null,
        s: null,       //  sample SD
        s1: null,       //  sample SD
        s2: null,       //  sample SD
        SE: null,      //  standard error
        SE1: null,
        SE2: null,
        P: null,
        p: null,       //  sample proportion
        N: null,       //  sample size
        N1: null,
        N2: null,
        df: null,      //  degrees of freedom
        CImin: null,
        CImax: null,
        tCrit: null,   //  t critical value
        t: null,
        chisq: null,
        F: null,
        slope: null,       //  lin regression slope
        intercept: null,       //  regression intercept
        r: null,       //  correlation coefficient
        rsq: null,     //  r^2, coefficient of determination
    },
    results: {},

    /**
     * called from ui.redraw()
     *
     * @returns {[]}
     */
    confirmTestID: function () {
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

    oneSampleT: function () {
        this.anyT(data.xAttData.theArray);
    },

    twoSampleT: function () {
        const theCIparam = 1 - this.parameters.alpha / 2;

        const jX = jStat(data.xAttData.theArray);
        const jY = jStat(data.yAttData.theArray);

        this.results.N1 = jX.cols();
        this.results.N2 = jY.cols();
        this.results.df = this.results.N1 + this.results.N2 - 1;
        this.results.mean1 = jX.mean();
        this.results.mean2 = jY.mean();
        this.results.s1 = jX.stdev(true);    //      true means SAMPLE SD
        this.results.s2 = jY.stdev(true);    //      true means SAMPLE SD
        this.results.SE1 = this.results.s1 / Math.sqrt(this.results.N1);
        this.results.SE2 = this.results.s2 / Math.sqrt(this.results.N2);

        /*
        See https://en.wikipedia.org/wiki/Student%27s_t-test#Independent_two-sample_t-test.
        I'm using "Equal or unequal sample sizes, similar variance."
        Maybe we should go one further and use Welch's, which follows
        in that wikipedia article.
         */
        const sArg = ((this.results.N1 - 1) * this.results.s1 ** 2 +
                (this.results.N2 - 1) * this.results.s2 ** 2) /
            (this.results.N1 + this.results.N2 - 2);
        this.results.s = Math.sqrt(sArg);       //  pooled SD
        this.results.SE = this.results.s * Math.sqrt((1 / this.results.N1) + (1 / this.results.N2));
        this.results.xbar = this.results.mean2 - this.results.mean1;
        this.results.t = (this.results.xbar - this.parameters.value) / this.results.SE;

        const var1oN = jX.variance(true) / this.results.N1;
        const var2oN = jY.variance(true) / this.results.N2;     //  sample variance/N = s^2/N
        const df2 = (var1oN + var2oN) ** 2 / (var1oN ** 2 / (this.results.N1 - 1) + var2oN ** 2 / (this.results.N2)); //  variance for
        const df1 = this.results.N1 + this.results.N2 - 1;

        this.results.df = df2;

        this.results.tCrit = jStat.studentt.inv(theCIparam, this.results.df);    //  1.96-ish for 0.95
        const tAbs = Math.abs(this.results.t);
        this.results.P = jStat.studentt.cdf(-tAbs, this.results.df);
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

    regression: function () {
        const theCIparam = 1 - this.parameters.alpha / 2;

        //  Note how these definitions are REVERSED.
        //  we want to look at the var in the first position (X) as the dependent variable (Y)

        /*
                const jX = jStat(data.yAttData.theArray);
                const jY = jStat(data.xAttData.theArray);
        */


        let sumXY = 0;
        let sumX = 0;
        let sumXX = 0;
        let sumYY = 0;
        let sumY = 0;
        let N = data.xAttData.theArray.length;

        if (N > 2) {
            for (let i = 0; i < N; i++) {
                //  Note how these definitions are REVERSED.
                //  we want to look at the var in the first position (X) as the dependent variable (Y)
                const X = data.yAttData.theArray[i];
                const Y = data.xAttData.theArray[i];
                sumX += X;
                sumY += Y;
                sumXY += X * Y;
                sumXX += X * X;
                sumYY += Y * Y;
            }

            const slope = (N * sumXY - sumX * sumY) / (N * sumXX - sumX ** 2);
            const intercept = (sumY - slope * sumX) / N;
            const SDsqError = 1 / (N * (N - 2)) * (N * sumYY - sumY ** 2 - slope ** 2 * (N * sumXX - sumX ** 2));
            const SDsqSlope = N * SDsqError / (N * sumXX - sumX ** 2);
            const SDsqIntercept = SDsqSlope / N * sumXX;
            const r = (N * sumXY - sumX * sumY) /
                Math.sqrt((N * sumXX - sumX ** 2) * (N * sumYY - sumY ** 2));
            const rsq = r * r;


            this.results.N = N;
            this.results.slope = slope;
            this.results.intercept = intercept;
            this.results.df = N - 2;
            this.results.tCrit = jStat.studentt.inv(theCIparam, this.results.df);    //  1.96-ish for 0.95
            this.results.SEslope = SDsqSlope;
            this.results.SEintercept = SDsqIntercept;
            this.results.r = r;
            this.results.rsq = rsq;

            const SDslope = Math.sqrt(SDsqSlope);
            const SDintercept = Math.sqrt(SDsqIntercept);

            this.results.slopeCImin = slope - this.results.tCrit * SDslope;
            this.results.slopeCImax = slope + this.results.tCrit * SDslope;
            this.results.interceptCImin = intercept - this.results.tCrit * SDintercept;
            this.results.interceptCImax = intercept + this.results.tCrit * SDintercept;

            //   test slope against value
            this.results.t = (this.results.slope - this.parameters.value) / SDslope;
            const tAbs = Math.abs(this.results.t);
            this.results.P = jStat.studentt.cdf(-tAbs, this.results.df);

        }

    },

    /**
     * Find the possible tests for the current configuration of attrinbutes (numeric, binary, categorical...)
     *
     * @returns {[]}    Array of test configuration IDs
     */
    filterTestConfigurations: function () {

        const X = data.xAttData;
        const Y = data.yAttData;

        const xType = X && testimate.state.dataTypes[X.name];
        const yType = Y && testimate.state.dataTypes[Y.name];

        console.log(`finding tests for ${X.name} (${xType}) vs ${Y.name} (${yType}) `);

        const pairable = data.xAttData.theRawArray &&
            data.yAttData.theRawArray &&
            (data.xAttData.theRawArray.length === data.yAttData.theRawArray.length);


        out = [];
        for (let id in this.testConfigurations) {
            let match = true;
            const theConfig = this.testConfigurations[id];

            if (theConfig.paired && !pairable) match = false;

            if (theConfig.xType === 'binary' && !X.isBinary()) match = false;
            if (theConfig.yType === 'binary' && !Y.isBinary()) match = false;
            if (theConfig.xType === 'numeric' && !X.isNumeric()) match = false;
            if (theConfig.yType === 'numeric' && !Y.isNumeric()) match = false;
            if (theConfig.xType === 'categorical' && !X.isCategorical()) match = false;
            if (theConfig.yType === 'categorical' && !Y.isCategorical()) match = false;

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
        NB01: {
            id: `NB01`,
            name: `two-sample t`,
            xType: 'numeric',
            yType: 'binary',
            paired: true,
        },
        NC01: {
            id: `NC01`,
            name: `ANOVA`,
            xType: 'numeric',
            yType: 'categorical',
            paired: true,
        },
        C_01: {
            id: `C_01`,
            name: `goodness of fit`,
            xType: 'categorical',
            yType: null,
            paired: false,
        },
        B_01: {
            id: `B_01`,
            name: `test proportion`,
            xType: 'binary',
            yType: null,
            paired: false,
        },
        B_02: {
            id: `B_02`,
            name: `goodness of fit`,
            xType: 'binary',
            yType: null,
            paired: false,
        },
        CC01: {
            id: `CC01`,
            name: `independence`,
            xType: 'categorical',
            yType: `categorical`,
            paired: true,
        },
        CB01: {
            id: `CB01`,
            name: `independence`,
            xType: 'categorical',
            yType: `binary`,
            paired: true,
        },
        BC01: {
            id: `BC01`,
            name: `independence`,
            xType: 'binary',
            yType: `categorical`,
            paired: true,
        },
        BB01: {         //  compare props using split
            id: `BB01`,
            name: `compare proportions`,
            xType: 'binary',
            yType: `binary`,
            paired: true,
        },
        BB02: {         //  two-sample compare props
            id: `BB02`,
            name: `compare proportions`,
            xType: 'binary',
            yType: `binary`,
            paired: false,
        },
        BB03: {
            id: `BB03`,
            name: `independence`,
            xType: 'binary',
            yType: `binary`,
            paired: true,
        },
        BN01: {
            id: `BN01`,
            name: `logistic regression`,
            xType: 'binary',
            yType: `numeric`,
            paired: true,
        },
        CN01: {
            id: `CN01`,
            name: `logistic regression`,
            xType: 'categorical',
            yType: `numeric`,
            paired: true,
        },


    },

}