const data = {

    dirtyData: true,
    dataset: [],
    xArray : [],
    parameters : {
        alpha : 0.05,
        value : 0.0,    //  to be tested against
        sides : 2,
    },
    results : {
        mu : null,
        s : null,       //  sample SD
        SE : null,      //  standard error
        P : null,
        p : null,       //  sample proportion
        N : null,       //  sample size
        CImin : null,
        CImax : null,
        t : null,
        chisq : null,
        F : null,
    },


    updateResults : function() {
        const jX = jStat(data.xArray);      //  jStat version of x array

        this.results.N = jX.cols();
        this.results.mu = jX.mean();
        this.results.s = jX.stdev(true);    //      true means SAMPLE SD
        this.results.P = jX.ttest(this.parameters.value,this.parameters.sides);

    },

    /*      Coping with getting data from CODAP and responding to changes       */


    getAllItems: async function () {
        const theMessage = {
            "action": "get",
            "resource": `dataContext[${testimate.state.dataset}].itemSearch[*]`
        }

        try {
            const result = await codapInterface.sendRequest(theMessage);
            this.dirtyData = false;
            this.dataset = result.values;   //   array of objects, one of whose items is another "values"
            console.log(`getAllItems() returns ${this.dataset.length}`);
            return true;
        } catch (msg) {
            alert(`Trouble getting data: ${msg}`);
            return false;
        }
    },

    constructXArray: async function () {
        const xName = testimate.state.xName;

        if (xName) {
            if (this.dirtyData) {
                const OK = await this.getAllItems();      //  OK means a successful get of all items
                if (OK) {
                    this.xArray = [];
                    this.dataset.forEach((v) => {

                        //  construct data arrays, omitting missing values

                        const theXValue = v.values[xName];
                        if (this.isNumeric(theXValue)) {
                            this.xArray.push(parseFloat(theXValue));
                        }
                    })
                }
            }


            console.log(`constructed x:  ${JSON.stringify(this.xArray)}`);
        } else {
            console.log(`no x variable`);
        }
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
    isNumeric: function (str) {
        if (typeof str != "string") return false        // we only process strings!
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    },

}

