/**
 * Methods for logistic regression.
 *
 * Math notes! We will be using the GPT-written function `logisticregression()` below to iterate on this function:
 *
 * f(x) = 1/(1 + exp(-(b + wx))
 *
 * finding values for b and w, which are kinda-sorta slope and intercept, that is,
 * a large value for w means that the logistic curve is steeper,
 * and a large b means that the place where the curve passes 1/2 and inflects is farther from 0.
 *
 * For thinking purposes, we can transform that function, using
 *
 * p = -(b/w) and m = (w/4). (so b = -4mp and w = 4m)
 *
 * This gives
 *
 * f(x) = 1/(1 + exp(-4m(x-p))
 *
 * which has the happy result that p is the (x) position of that inflection point
 * and m is the slope of the curve at that point.
 *
 */
class Logistic extends Test {

    constructor(iID) {
        super(iID);

        //if (!testimate.restoringFromSave) {
        testimate.state.testParams.rate = 0.1;
        testimate.state.testParams.iter = 100;
        testimate.state.testParams.probe = null;        //  what value of the predictor do we want to find a probability for?
        testimate.state.testParams.group = null;        //  what value gets cast as "1"? The rest are "0"

        //}

        this.graphShowing = false;
    }

    async updateTestResults(newRegression = true) {
        const X0 = data.xAttData.theArray;
        const Y = data.yAttData.theArray;
        const N = X0.length;
        this.results.N = N;

        if (N !== Y.length) {
            alert(`Paired arrays are not the same length! Bogus results ahead!`);
        }

        //  this will also make the extra column of coded data values if it did not exist before
        if (!testimate.state.testParams.group) {
            const theValues = [...data.xAttData.valueSet];
            await testimate.setNewGroupingValue(theValues[0]);      //  the first, by default
        }

        const X = X0.map(x => {
            return (x === testimate.state.testParams.group) ? 1 : 0;
        })

        if (newRegression) {
            //  compute mean of Y to give initial value for pos
            let pos0 = 0;
            Y.forEach(y => {
                pos0 += y;
            })        //  add up all the pos
            pos0 /= N;      //  to get the mean position

            console.log(`        logistic regression: initial critical position: ${pos0}`);
            if (!testimate.state.testParams.probe) testimate.state.testParams.probe = pos0;
            this.results.pos = pos0;
            this.results.slope = 0;
        }

        const theResult
            = await this.logisticRegressionUsingCurvature(
            X, Y,
            testimate.state.testParams.rate, testimate.state.testParams.iter,
            this.results.slope, this.results.pos
        );

        if (this.graphShowing) {
            content.showLogisticGraph(this.makeFormulaString().longFormula);
        }

        this.results.slope = theResult.currentSlope;
        this.results.pos =  theResult.currentPos;
        this.results.cost = theResult.currentCost;
    }

    makeFormulaString() {
        const longSlope = this.results.slope;
        const shortSlope = ui.numberToString(this.results.slope, 4);
        const shortPos = ui.numberToString(this.results.pos, 4);
        const longPos = this.results.pos;
        const shortFormula = `1/(1 + e^(-4 * ${shortSlope} * (${data.yAttData.name} - ${shortPos})))`;
        const longFormula = `1/(1 + e^(-4 * ${longSlope} * (${data.yAttData.name} - ${longPos})))`;

        return {shortFormula, longFormula};
    }

    makeResultsString() {
        const N = this.results.N;
        const slope = ui.numberToString(this.results.slope, 4);
        const pos = ui.numberToString(this.results.pos, 4);
        const LRPbox = ui.logisticRegressionProbeBoxHTML(testimate.state.testParams.probe);
        const graphButton = ui.showLogisticGraphButtonHTML();
        const theFormula = this.makeFormulaString().shortFormula;

        let out = "<pre>";

        out += `This plugin tries to do logistic regression.`;
        out += `<br>    N = ${N}. Probability = 1/2 at ${data.yAttData.name} = ${pos}. There, slope = ${slope}`;
        out += `<br><br>prob(${data.xAttData.name} = ${testimate.state.testParams.group}) = ${theFormula}`;

        out += `<br><br>${graphButton}`;
        out += `<input type='button' value="copy formula" onclick="navigator.clipboard.writeText(testimate.theTest.makeFormulaString().longFormula)">`;

        out += `<br><br>Find the probability P(${data.xAttData.name} = ${testimate.state.testParams.group}) <br>    at ${data.yAttData.name} = ${LRPbox}`;


        if (testimate.state.testParams.probe) {
            const z = 4 * slope * (testimate.state.testParams.probe - pos);
            const probNumber = this.sigmoid(z);
            let probString = "0.000"
            if (probNumber > 0.0000001) {
                probString = ui.numberToString(probNumber, 3);
            }

            out += ` P(${testimate.state.testParams.group}) = ${probString}`;
        }
        out += `</pre>`;
        return out;
    }

    makeTestDescription() {
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
        const rate = ui.rateBoxHTML(testimate.state.testParams.rate, 1.0, 0.01);
        const iter = ui.iterBoxHTML(testimate.state.testParams.iter);
        const group = ui.group0ButtonHTML(testimate.state.testParams.group);
        const showGraph = ui.showLogisticGraphButtonHTML();

        let theHTML = `Logistic regression predicting prob(${data.xAttData.name} = ${group}) from ${data.yAttData.name}<br>rate = ${rate} iter = ${iter}`;

        return theHTML;
    }

    sigmoid(z) {
        return 1 / (1 + Math.exp(-z));
    }


    async logisticRegressionUsingCurvature(outcome, predictor, alpha, iterations, slope0 = 0, pos0 = 0) {

        function sigmoid(z) {
            return 1 / (1 + Math.exp(-z));
        }

        function oneCost(xx, yy, slope, pos) {
            const z = 4 * slope * (xx - pos);
            const prediction = sigmoid(z);
            let dCost = 0
            if (prediction !== 0 && prediction !== 1) {
                dCost = yy * Math.log(prediction) + (1 - yy) * Math.log(1 - prediction);
            }
            return dCost;
        }

        function cost(slope, pos) {
            let cost = 0;

            for (let i = 0; i < outcome.length; i++) {
                cost -= oneCost(predictor[i], outcome[i], slope, pos);
            }
            return cost;
        }

        function getCost(slope, pos) {
            const theCost = cost(slope, pos);
            return theCost;
        }

        function gradientPartials(slope, pos, h = 0.01) {
            const theCost = getCost(slope, pos),
                costPlusSlope = getCost(slope + h, pos),
                costMinusSlope = getCost(slope - h, pos),
                costPlusPos = getCost(slope, pos + h),
                costMinusPos = getCost(slope, pos - h);

            const dCostdSlope = (costPlusSlope - costMinusSlope) / (2 * h),
                dCostdSlopePlus = (costPlusSlope - theCost) / h,
                dCostdSlopeMinus = (theCost - costMinusSlope) / h;
            const dCostdPos = (costPlusPos - costMinusPos) / (2 * h),
                dCostdPosPlus = (costPlusPos - theCost) / h,
                dCostdPosMinus = (theCost - costMinusPos) / h;


            const d2CostdSlope2 = (dCostdSlopePlus - dCostdSlopeMinus) / h;
            const d2CostdPos2 = (dCostdPosPlus - dCostdPosMinus) / h;

            return {theCost, dCostdSlope, d2CostdSlope2, dCostdPos, d2CostdPos2};
        }

        function descendPartialOneIteration(slope, pos, alpha) {

            const gradientStuff = gradientPartials(slope, pos);
            const projectedDSlope = (gradientStuff.d2CostdSlope2 !== 0) ? -gradientStuff.dCostdSlope / gradientStuff.d2CostdSlope2 : 0,
                projectedDPos = (gradientStuff.d2CostdPos2 !== 0) ? -gradientStuff.dCostdPos / gradientStuff.d2CostdPos2 : 0;

            const
                newSlope = slope + projectedDSlope * alpha,
                newPos = pos + projectedDPos * alpha,
                theCost = gradientStuff.theCost;

            return {newSlope, newPos, theCost};
        }

        //      Done with defining functions. Actual method starts here!

        let record = "iter, m, p, cost";
        let currentSlope = slope0;
        let currentPos = pos0;
        let currentCost = 0;

        for (let iter = 1; iter <= iterations; iter++) {
            const newVals = descendPartialOneIteration(currentSlope, currentPos, alpha);

            currentSlope = newVals.newSlope;
            currentPos = newVals.newPos;
            currentCost = newVals.theCost;

            if (iter % 17 === 0 || iter < 6) {
                record += `\n${iter}, ${currentSlope}, ${currentPos}, ${currentCost}`;
            }
        }

        console.log('\n' + record);
        return {currentSlope, currentPos, currentCost};
    }

    GPT_LogisticRegression(x, y, alpha, iterations) {
        // Initialize weights and bias
        let w = 0;
        let b = 10;
        let slope = w / 4;
        let pos = -b / w;
        let record = "";

        // Number of samples
        const N = x.length;

        record += "iter, m, p, costper";

        for (let iter = 1; iter < iterations; iter++) {
            let cost = 0;
            let dw = 0;
            let db = 0;

            for (let i = 0; i < N; i++) {
                const xi = x[i];
                const yi = y[i];

                // Compute prediction using the sigmoid function
                const z = w * xi + b;
                const prediction = this.sigmoid(z);

                // Compute cost. It's the log of the absolute distance of the point from the model
                //  note that yi is either zero or one, so only one term survives.
                //
                cost -= yi * Math.log(prediction) + (1 - yi) * Math.log(1 - prediction);

                // Compute gradients
                const gradient = prediction - yi;
                dw += xi * gradient;
                db += gradient;
            }

            // Update weights and bias
            w -= alpha * dw / N;
            b -= alpha * db / N;
            slope = w / 4;
            pos = -b / w;


            if (iter % 100 === 0) {
                record += `\n${iter},${slope},${pos},${cost / N}`;
            }
            // Print the cost for every 1000 iterations
            /*
                        if (iter % 1000 === 0) {
                            console.log(`Iteration ${iter}: Cost = ${cost / N}`);
                        }
            */
        }

        console.log('\n' + record);

        return {w, b};
    }

}