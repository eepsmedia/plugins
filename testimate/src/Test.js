


class Test {

    static testID = null;

    data0 = null;       //  this will be of type AttData
    data1 = null;

    results = {};

    constructor() {
    }

    setData0(iAttData) {
        this.data0 = iAttData;
    }

    setData1(iAttData) {
        this.data1 = iAttData;
    }

    static setTestID(iTestID) {
        Test.testID = iTestID;
        testimate.state.test = iTestID;
    }

    static checkTestID(iTestID) {
        const possibleTestIDs = this.filterTestConfigurations();
        if (!possibleTestIDs.includes(Test.testID)) {
            Test.setTestID(possibleTestIDs[0]);
        }
        return (possibleTestIDs);   //  to ui to make a menu if necessary
    }

    /**
     * Find the possible tests for the current configuration of attributes (numeric, binary, categorical...)
     *
     * @returns {[]}    Array of test configuration IDs
     */
    static filterTestConfigurations()  {

        const X = data.xAttData;
        let out = [];

        if (X) {
            const Y = data.yAttData;

            const xType = X && testimate.state.dataTypes[X.name];
            const yType = Y && testimate.state.dataTypes[Y.name];

            console.log(`finding tests for ${X && X.name} (${xType}) vs ${Y && Y.name} (${yType}) `);

            const pairable = X && Y && X.theRawArray &&
                Y.theRawArray &&
                (data.xAttData.theRawArray.length === data.yAttData.theRawArray.length);


            for (let id in Test.configs) {
                let match = true;
                const theConfig = Test.configs[id];

                if (theConfig.paired && !pairable) match = false;

                if (theConfig.xType === 'binary' && !X.isBinary()) match = false;
                if (Y && theConfig.yType === 'binary' && !Y.isBinary()) match = false;
                if (theConfig.xType === 'numeric' && !X.isNumeric()) match = false;
                if (Y && theConfig.yType === 'numeric' && !Y.isNumeric()) match = false;
                if (theConfig.xType === 'categorical' && !X.isCategorical()) match = false;
                if (Y && theConfig.yType === 'categorical' && !Y.isCategorical()) match = false;

                if (match) {
                    out.push(theConfig.id);
                }
            }
        }
        return out;
    };

    /**
     * configurations for all possible tests
     * @type {{B_02: {xType: string, yType: null, emitted: string, name: string, id: string, paired: boolean}, B_01: {xType: string, yType: null, emitted: string, name: string, id: string, paired: boolean}, C_01: {xType: string, yType: null, emitted: string, name: string, id: string, paired: boolean}, NN01: {xType: string, yType: string, emitted: string, testing: string, name: string, id: string, paired: boolean}, NN02: {xType: string, yType: string, emitted: string, testing: string, name: string, id: string, paired: boolean}, NN03: {xType: string, yType: string, emitted: string, testing: string, name: string, id: string, paired: boolean}, NB01: {xType: string, yType: string, emitted: string, name: string, id: string, paired: boolean}, NC01: {xType: string, yType: string, emitted: string, name: string, id: string, paired: boolean}, BN01: {xType: string, yType: string, emitted: string, name: string, id: string, paired: boolean}, CN01: {xType: string, yType: string, emitted: string, name: string, id: string, paired: boolean}, N_01: {xType: string, yType: null, emitted: string, testing: string, name: string, id: string, paired: boolean}, BB02: {xType: string, yType: string, emitted: string, name: string, id: string, paired: boolean}, BC01: {xType: string, yType: string, emitted: string, name: string, id: string, paired: boolean}, BB03: {xType: string, yType: string, emitted: string, name: string, id: string, paired: boolean}, CC01: {xType: string, yType: string, emitted: string, name: string, id: string, paired: boolean}, CB01: {xType: string, yType: string, emitted: string, name: string, id: string, paired: boolean}, BB01: {xType: string, yType: string, emitted: string, name: string, id: string, paired: boolean}}}
     */
    static configs = {
        N_01: {
            id: `N_01`,
            name: 'one-sample t',
            xType: 'numeric',
            yType: null,
            paired: false,
            emitted: `N,P`,
            testing: `xbar`,
        },
        NN01: {
            id: `NN01`,
            name: 'paired t',
            xType: 'numeric',
            yType: 'numeric',
            paired: true,
            emitted: `N,P`,
            testing: `xbar`,
        },
        NN02: {
            id: `NN02`,
            name: 'two-sample t',
            xType: 'numeric',
            yType: 'numeric',
            paired: false,
            emitted: `N,P,mean1,mean2,diff`,
            testing: `diff`,
        },
        NN03: {
            id: `NN03`,
            name: 'linear regression',
            xType: 'numeric',
            yType: 'numeric',
            paired: true,
            emitted: `N,P,slope,intercept`,
            testing: `slope`,
        },
        NB01: {
            id: `NB01`,
            name: `two-sample t`,
            xType: 'numeric',
            yType: 'binary',
            paired: true,
            emitted: `N,P,mean1,mean2,diff`,
        },
        NC01: {
            id: `NC01`,
            name: `ANOVA`,
            xType: 'numeric',
            yType: 'categorical',
            paired: true,
            emitted: `N,P`,
        },
        C_01: {
            id: `C_01`,
            name: `goodness of fit`,
            xType: 'categorical',
            yType: null,
            paired: false,
            emitted: `N,P`,
        },
        B_01: {
            id: `B_01`,
            name: `test proportion`,
            xType: 'binary',
            yType: null,
            paired: false,
            emitted: `N,P`,
        },
        B_02: {
            id: `B_02`,
            name: `goodness of fit`,
            xType: 'binary',
            yType: null,
            paired: false,
            emitted: `N,P`,
        },
        CC01: {
            id: `CC01`,
            name: `independence`,
            xType: 'categorical',
            yType: `categorical`,
            paired: true,
            emitted: `N,P`,
        },
        CB01: {
            id: `CB01`,
            name: `independence`,
            xType: 'categorical',
            yType: `binary`,
            paired: true,
            emitted: `N,P`,
        },
        BC01: {
            id: `BC01`,
            name: `independence`,
            xType: 'binary',
            yType: `categorical`,
            paired: true,
            emitted: `N,P`,
        },
        BB01: {         //  compare props using split
            id: `BB01`,
            name: `compare proportions`,
            xType: 'binary',
            yType: `binary`,
            paired: true,
            emitted: `N,P`,
        },
        BB02: {         //  two-sample compare props
            id: `BB02`,
            name: `compare proportions`,
            xType: 'binary',
            yType: `binary`,
            paired: false,
            emitted: `N,P`,
        },
        BB03: {
            id: `BB03`,
            name: `independence`,
            xType: 'binary',
            yType: `binary`,
            paired: true,
            emitted: `N,P`,
        },
        BN01: {
            id: `BN01`,
            name: `logistic regression`,
            xType: 'binary',
            yType: `numeric`,
            paired: true,
            emitted: `N,P`,
        },
        CN01: {
            id: `CN01`,
            name: `logistic regression`,
            xType: 'categorical',
            yType: `numeric`,
            paired: true,
            emitted: `N,P`,
        },
    };

}

