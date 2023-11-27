/**
 * The base class for all of our tests
 */
class Test {

    testID = null;
    results = {};

    theConfig = null;

    constructor(iID) {
        this.testID = iID;      //  do we need this or is it in testimate.state?
        this.theConfig = Test.configs[iID];
        if (!testimate.restoringFromSave) {
            testimate.state.testParams = {
                alpha: 0.05,
                value: 0.0,    //  to be tested against
                sides: 2,
                theSidesOp: "≠",   //  the sign
                conf: 95,    //  confidence level 1 - alpha
                group: null,
            }
        }
    }

    updateTestResults() {
        this.results.N = data.xAttData.theArray.length;
    }

    makeResultsString() {
        const theParams = testimate.state.testParams;

        theParams.theSidesOp = "≠";
        if (theParams.sides === 1) {
            theParams.theSidesOp = (this.results[this.theConfig.testing] > theParams.value ? ">" : "<");
        }

        const N = this.results.N;

        const out = `<pre>N = ${N}<br>That's all we know!</pre>`;
        return out;
    }

    makeTestDescription(iTestID, includeName) {
        return `this is a default description for a test (${iTestID})`;
    }

    static checkTestConfiguration() {
        const possibleTestIDs = this.filterTestConfigurations();

        if (testimate.theTest) {
            if (!possibleTestIDs.includes(testimate.state.testID)) {
                testimate.makeFreshTest(possibleTestIDs[0])
            }
        } else if (possibleTestIDs.length) {
            testimate.makeFreshTest(possibleTestIDs[0])
        }
        return (possibleTestIDs);   //  to ui to make a menu if necessary
    }

    /**
     * Find the possible tests for the current configuration of attributes (numeric, binary, categorical...)
     *
     * @returns {[]}    Array of test configuration IDs
     */
    static filterTestConfigurations() {

        const X = data.xAttData;
        let out = [];

        if (X) {
            const Y = data.yAttData;

            const xType = X && testimate.state.dataTypes[X.name];
            const yType = Y && testimate.state.dataTypes[Y.name];

            console.log(`finding tests for ${X && X.name} (${xType}) vs ${Y && Y.name} (${yType}) `);
            let passed = "";

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
        console.log(`    ... passed ${out.join(", ")}`);
        return out;
    };

    /**
     * Make a text description of the test configuration.
     * The basic structure is something like,
     * "Compare mean(post) to mean(pre)"
     *
     * @param iTest         The ID of the test we're doing.
     * @param iIncludeName  Precede that with the name? (Boolean), e.g., "Two-sample t.
     * @returns {string}
     */
    static makeTestDescription( ) {
        const theID = testimate.state.testID;
        const theName = Test.configs[theID].name;
        return `default description for ${theName} (${theID})`;
    }

    static makeMenuString(iiD) {

        const theID = iiD ? iiD : testimate.state.testID;
        const theName = Test.configs[theID].name;
        return `placeholder menu string for ${theName} (${theID})`;
    }

    makeConfigureGuts() {
        return `no configuration for logistic regression yet`;
    }

    /**
     * Splits the first argument (an Array) into two arrays depending on the values in the second.
     *
     * @param iData
     * @param iGroups
     * @param iLabel    the value of "iGroups" that goes into the first output array
     *
     * */
    static splitByGroup(iData, iGroups, iLabel) {
        let A = [];
        let B = [];

        for (let i = 0; i < iData.length; i++ ) {
            if (iGroups[i] === iLabel) {
                A.push(iData[i]);
            } else {
                B.push(iData[i]);
            }
        }
        return [A, B];
    }

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
            groupAxis : "",
            emitted: `N,mean,df,SE,t,P,conf,CImin,CImax`,
            testing: `mean`,
            makeMenuString: ( ) => {return OneSampleT.makeMenuString(`N_01`);},
            fresh: (ix) => {
                return new OneSampleT(ix)
            },

        },
        NN01: {
            id: `NN01`,
            name: 'paired t',
            xType: 'numeric',
            yType: 'numeric',
            paired: true,
            groupAxis : "",
            emitted: `N,mean,df,SE,t,P,conf,CImin,CImax`,
            testing: `mean`,
            makeMenuString: ( ) => {return Paired.makeMenuString(`NN01`);},
            fresh: (ix) => { return new Paired(ix)  },
        },
        NN02: {
            id: `NN02`,
            name: 'two-sample t',
            xType: 'numeric',
            yType: 'numeric',
            paired: false,
            groupAxis : "",
            emitted: `N,P,mean1,mean2,diff,t,conf,CImin,CImax`,
            testing: `diff`,
            makeMenuString: ( ) => {return TwoSampleT.makeMenuString(`NN02`);},
            fresh: (ix) => { return new TwoSampleT(ix, false)  },
        },
        NN03: {
            id: `NN03`,
            name: 'linear regression',
            xType: 'numeric',
            yType: 'numeric',
            paired: true,
            groupAxis : "",
            emitted: `N,P,slope,intercept,r,rsq,t,slopeCImin,slopeCImax`,
            makeMenuString: ( ) => {return Regression.makeMenuString(`NN03`);},
            fresh: (ix) => { return new Regression(ix)  },
            testing: `slope`,
        },
        NB01: {
            id: `NB01`,
            name: `two-sample t`,
            xType: 'numeric',
            yType: 'binary',
            paired: true,
            groupAxis : "",
            emitted: `N,P,mean1,mean2,diff,t,conf,CImin,CImax`,
            testing : 'diff',
            makeMenuString: ( ) => {return TwoSampleT.makeMenuString(`NB01`);},
            fresh: (ix) => { return new TwoSampleT(ix, true)  },
        },
        B_01: {
            id: `B_01`,
            name: `test proportion`,
            xType: 'binary',
            yType: null,
            paired: false,
            groupAxis : "X",
            emitted: `N,prop,P,SE,z,conf,CImin,CImax`,
            testing : 'p',
            makeMenuString: () => {return OneSampleP.makeMenuString();},
            fresh: (ix ) => {return new OneSampleP(ix)},
        },
        BB01: {         //  compare props using split
            id: `BB01`,
            name: `compare proportions (grouped)`,
            xType: 'binary',
            yType: `binary`,
            paired: true,
            groupAxis : "",
            emitted: `N,P,N1,N2,prop1,prop2,z,conf,CImin,CImax`,
            makeMenuString: ( ) => {return TwoSampleP.makeMenuString(`BB01`);},
            fresh: (ix) => { return new TwoSampleP(ix, true)  },
        },
        BB02: {         //  two-sample compare props
            id: `BB02`,
            name: `compare proportions (two sample)`,
            xType: 'binary',
            yType: `binary`,
            paired: false,
            groupAxis : "",
            emitted: `N,P,N1,N2,prop1,prop2,z,conf,CImin,CImax`,
            makeMenuString: ( ) => {return TwoSampleP.makeMenuString(`BB02`);},
            fresh: (ix) => { return new TwoSampleP(ix, false)  },
        },
/*
        B_02: {
            id: `B_02`,
            name: `goodness of fit`,
            xType: 'binary',
            yType: null,
            paired: false,
             groupAxis : "",
           emitted: `N,P,chisq,df,chisqCrit,alpha`,
            makeMenuString: ( ) => {return Goodness.makeMenuString(`B_02`);},
            fresh: (ix) => { return new Goodness(ix)  },
        },
*/
        C_01: {
            id: `C_01`,
            name: `goodness of fit`,
            xType: 'categorical',
            yType: null,
            paired: false,
            groupAxis : "",
            emitted: `N,P,chisq,df,chisqCrit,alpha`,
            makeMenuString: ( ) => {return Goodness.makeMenuString(`C_01`);},
            fresh: (ix) => { return new Goodness(ix)  },
        },
        CC01: {
            id: `CC01`,
            name: `independence`,
            xType: 'categorical',
            yType: `categorical`,
            paired: true,
            groupAxis : "",
            emitted: `N,P,chisq,df,chisqCrit,alpha`,
            makeMenuString: ( ) => {return Independence.makeMenuString(`CC01`);},
            fresh: (ix) => { return new Independence(ix)  },
        },
/*        CB01: {
            id: `CB01`,
            name: `independence`,
            xType: 'categorical',
            yType: `binary`,
            paired: true,
            groupAxis : "",
            emitted: `N,P`,
            makeMenuString: ( ) => {return Test.makeMenuString(`CB01`);},
            fresh: (ix) => { return new Test(ix)  },
        },
        BC01: {
            id: `BC01`,
            name: `independence`,
            xType: 'binary',
            yType: `categorical`,
            paired: true,
             groupAxis : "",
           emitted: `N,P`,
            makeMenuString: ( ) => {return Test.makeMenuString(`BC01`);},
            fresh: (ix) => { return new Test(ix)  },
        },
        BB03: {
            id: `BB03`,
            name: `independence`,
            xType: 'binary',
            yType: `binary`,
            paired: true,
               groupAxis : "",
         emitted: `N,P`,
            makeMenuString: ( ) => {return Test.makeMenuString(`BB03`);},
            fresh: (ix) => { return new Test(ix)  },
        },*/
        NC01: {
            id: `NC01`,
            name: `ANOVA`,
            xType: 'numeric',
            yType: 'categorical',
            paired: true,
            groupAxis : "",
            emitted: `N,P,SSR,dfTreatment,SSE,dfError,SST`,
            makeMenuString: ( ) => {return ANOVA.makeMenuString(`NC01`);},
            fresh: (ix) => { return new ANOVA(ix)  },
        },
        BN01: {
            id: `BN01`,
            name: `logistic regression`,
            xType: 'binary',
            yType: `numeric`,
            paired: true,
            groupAxis : "X",
            emitted: `N,iterations,slope,pos,cost,rate`,
            makeMenuString: ( ) => {return Logistic.makeMenuString(`BN01`);},
            fresh:  (ix) => { return new Logistic(ix)  },
        },
        CN01: {
            id: `CN01`,
            name: `logistic regression`,
            xType: 'categorical',
            yType: `numeric`,
            paired: true,
            groupAxis : "X",
            emitted: `N,iterations,slope,pos,cost,rate`,
            makeMenuString: ( ) => {return Logistic.makeMenuString(`CN01`);},
            fresh:  (ix) => { return new Logistic(ix)  },
        },
    };

}

