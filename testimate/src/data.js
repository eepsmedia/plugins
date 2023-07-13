
const data = {

    dirtyData: true,

    dataset: [],        //  array retrieved from CODAP
    xAttData: null,
    yAttData: null,

    /**
     * called from ui.redraw().
     *
     * Before we write anything on the screen, we verify that the data we have is current.
     * This includes finding the results of the current test.
     *
     * @returns {Promise<void>}
     */
    updateData: async function () {
        if (data.dirtyData) {
            await this.retrieveDataFromCODAP();
        }
    },

    /*      Coping with getting data from CODAP and responding to changes       */

    /**
     * called from this.updateData()
     *
     * @returns {Promise<void>}
     */
    retrieveDataFromCODAP: async function () {
        const xName = testimate.state.xName;
        const yName = testimate.state.yName;

        if (xName) {
            if (this.dirtyData) {
                const OK = await connect.getAllItems();      //  OK means a successful get of all items, this.dataset is now set
                if (OK) {
                    this.xAttData = new AttData(xName, this.dataset);
                    this.yAttData = new AttData(yName, this.dataset);
                }
            }
        } else {
            console.log(`no x variable`);
        }
    },


    removeInappropriateCases: function ( ) {

        if (!testimate.state.test) return;

        let newXArray = []
        let newYArray = []

        const paired = tests.testConfigurations[testimate.state.test].paired;

        const xMustBeNumeric = (testimate.state.dataTypes[testimate.state.xName] === 'numeric');
        const yMustBeNumeric = (testimate.state.dataTypes[testimate.state.yName] === 'numeric');

        //  make intermediate arrays that have only the right type of values (e.g., numeric)
        //  same length as original!

        let xIntermediate = [];
        this.xAttData.theRawArray.forEach( xx => {
            if (xMustBeNumeric) {
                xIntermediate.push( typeof xx === 'number' ? xx : null);
            } else {
                xIntermediate.push(xx);     //  strings and nulls
            }
        })
        let yIntermediate = [];
        this.yAttData.theRawArray.forEach( xx => {
            if (yMustBeNumeric) {
                yIntermediate.push( typeof xx === 'number' ? xx : null);
            } else {
                yIntermediate.push(xx);     //  strings and nulls
            }
        })

        //  now go through the intermediate arrays prudently eliminating null values

        const xLim = xIntermediate.length;
        const yLim = yIntermediate.length;
        let i = 0;

        while ( i < xLim || i < yLim) {
            const X = i < xLim ? xIntermediate[i] : null;
            const Y = i < yLim ? yIntermediate[i] : null;

            if (paired) {
                if (X !== null && Y !== null) {
                    newXArray.push(X);
                    newYArray.push(Y);
                }
            } else {
                if (X !== null) newXArray.push(X);
                if (Y !== null) newYArray.push(Y);
            }

            i++;
        }

        this.xAttData.theArray = newXArray;
        this.yAttData.theArray = newYArray;

        console.log(`cleaned x = ${JSON.stringify(this.xAttData.theArray)} \ncleaned y = ${JSON.stringify(this.yAttData.theArray)}`)
    },

    /**
     * CODAP has told us that a case has changed.
     * We set the dirty data flag and ask to be redrawn.
     * This will cause a re-get of all data and a re-analysis.
     *
     * @param iMessage
     * @returns {Promise<void>}
     */
    handleCaseChangeNotice: async function (iMessage) {
        const theOp = iMessage.values.operation
        let tMess = theOp;
        //  console.log(`start ${tMess}`);
        switch (theOp) {
            case 'createCases':
            case 'updateCases':
            case 'deleteCases':

                tMess += " *";
                data.dirtyData = true;      //  "this" is the notification, not "data"
                await ui.redraw();
                break;

            default:
                break;
        }
        //  console.log(`end ${tMess}`);

    },

    /**
     * from https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
     * @param str
     * @returns {boolean}
     */
    isNumericString: function (str) {
        if (typeof str != "string") return false;       // we only process strings!
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    },

}

class AttData {
    constructor(iName, iData) {
        this.name = iName;
        this.theRawArray = [];
        this.theArray = [];     //  stays empty in constructor
        this.valueSet = new Set();
        this.missingCount = 0;
        this.numericCount = 0;
        this.nonNumericCount = 0;
        this.defaultType = "";

        iData.forEach(aCase => {        //  begin with raw CODAP data, look at each case

            const rawDatum = aCase.values[iName];
            if (rawDatum === null || rawDatum === '' || rawDatum === undefined) {
                this.theRawArray.push(null);             //      substitute null for any missing data
                this.missingCount++;
            } else if (typeof rawDatum === "number") {      //  numbers stay type number
                this.theRawArray.push(rawDatum);
                this.numericCount++;
                this.valueSet.add(rawDatum);
            } else if (data.isNumericString(rawDatum)) {        //  strings that can be numbers get stored as numbers
                const cooked = parseFloat(rawDatum);
                this.theRawArray.push(cooked);
                this.numericCount++;
                this.valueSet.add(cooked);
            } else {        //  non-numeric         //  non-numeric strings are strings
                this.theRawArray.push(rawDatum);
                this.nonNumericCount++;
                this.valueSet.add(rawDatum);
            }
        });

        let defType = null;
        if (this.numericCount > this.nonNumericCount) defType = 'numeric';
        else if (this.valueSet.size > 0) defType = 'categorical';

        this.defaultType = defType;
        if (!testimate.state.dataTypes[this.name]) testimate.state.dataTypes[this.name] = this.defaultType;
    }

    isNumeric() {
        return testimate.state.dataTypes[this.name] === 'numeric';
    }
    isCategorical() {
        return testimate.state.dataTypes[this.name] === 'categorical';
    }
    isBinary() {
        return this.valueSet.size === 2;
    }
}

