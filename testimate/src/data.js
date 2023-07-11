const data = {

    dirtyData: true,

    dataset: [],        //  array retrieved from CODAP
    xAttData: {},
    yAttData: {},

    /**
     * called from ui.redraw().
     *
     * Before we write anything on the screen, we verify that the data we have is current.
     * This includes re-determining which test we are using (it might have changed with a user choice)
     * and finding the results of the current test.
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
                    this.xAttData = this.analyzeRawAttributeValues(xName);
                    this.yAttData = this.analyzeRawAttributeValues(yName);
                }
            }

        } else {
            console.log(`no x variable`);
        }

    },

    analyzeRawAttributeValues: function (iName) {

        let numericCount = 0;
        let nonNumericCount = 0;
        let missingCount = 0;
        let values = new Set();
        let theRawArray = [];

        if (iName) {
            this.dataset.forEach(aCase => {        //  begin with raw CODAP data, look at each case

                const rawDatum = aCase.values[iName];
                if (rawDatum == null || rawDatum == '' || rawDatum == undefined) {
                    theRawArray.push(null);             //      substitute null for any missing data
                    missingCount++;
                } else if (typeof rawDatum === "number") {      //  numbers stay type number
                    theRawArray.push(rawDatum);
                    numericCount++;
                    values.add(rawDatum);
                } else if (this.isNumericString(rawDatum)) {        //  strings that can be numbers get stored as numbers
                    const cooked = parseFloat(rawDatum);
                    theRawArray.push(cooked);
                    numericCount++;
                    values.add(cooked);
                } else {        //  non-numeric         //  non-numeric strings are strings
                    theRawArray.push(rawDatum);
                    nonNumericCount++;
                    values.add(rawDatum);
                }
            });

            //  default data type, numeric or categorical...
            //  once a type is chosen, it's recorded for that attribute NAME in `testimate.state.datatypes`.

            if (!testimate.state.dataTypes.hasOwnProperty(iName)) {
                testimate.state.dataTypes[iName] = (numericCount > nonNumericCount) ? "numeric" : "categorical";
            }
        }

        console.log(`${iName} N:${numericCount} C:${nonNumericCount} M:${missingCount} vv:${values} (${values.size})`);
        return {
            name: iName,
            type: testimate.state.dataTypes[iName] ? testimate.state.dataTypes[iName] : null,
            theRawArray: theRawArray,
            theArray: theRawArray,        //  until we clean it up...
            valueSet: values,
            numericCount: numericCount,
            nonNumericCount: nonNumericCount,
            missingCount: missingCount,
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

        console.log(`cleaned x = ${JSON.stringify(this.xAttData.theArray)} y = ${JSON.stringify(this.yAttData.theArray)}`)
    },

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

