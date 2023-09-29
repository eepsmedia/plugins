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

        const theValues = [...data.xAttData.valueSet];
        //if (!testimate.restoringFromSave) {
        testimate.state.testParams.group = theValues[0];   //  the first, by default
        testimate.state.testParams.rate = 0.05;
        testimate.state.testParams.iter = 100;
        //}

    }

    updateTestResults() {
        const X0 = data.xAttData.theArray;
        const Y = data.yAttData.theArray;
        const N = X0.length;
        this.results.N = N;

        if (N !== Y.length) {
            alert(`Paired arrays are not the same length! Bogus results ahead!`);
        }

        const X = X0.map(x => {
            return (x === testimate.state.testParams.group) ? 1 : 0;
        })

        /*
                const theResult = this.logisticRegression(
                    Y, X, testimate.state.testParams.rate, testimate.state.testParams.iter
                );
        */

        const theResult = this.LR_tim(
            X, Y, testimate.state.testParams.rate, testimate.state.testParams.iter, 0, 0
        );

        this.results.slope = theResult.slope;
        this.results.pos = theResult.pos;
    }

    makeResultsString() {
        const N = this.results.N;
        const slope = ui.numberToString(this.results.slope, 4);
        const pos = ui.numberToString(this.results.pos, 4);

        let out = "<pre>";

        out += `This plugin tries to do logistic regression.`;
        out += `<br>    N = ${N}, slope = ${slope}, pos = ${pos}`;

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
        const rate = ui.rateBoxHTML(testimate.state.testParams.rate);
        const iter = ui.iterBoxHTML(testimate.state.testParams.iter);
        const group = ui.group0ButtonHTML(testimate.state.testParams.group);

        let theHTML = `Logistic regression predicting prob(${group}) from ${data.yAttData.name}<br>rate = ${rate} iter = ${iter}`;

        return theHTML;
    }

    sigmoid(z) {
        return 1 / (1 + Math.exp(-z));
    }

    onecost(x, y, w, b) {
        const z = w * x + b;
        const prediction = this.sigmoid(z);
        const cost = y * Math.log(prediction) + (1 - y) * Math.log(1 - prediction);
        return {prediction, cost};
    }

    /**
     * Gradient descent algorithm that fits a gaussian to points that are typically the top-middles of
     * a histogram by least squares optimizing mu and sigma. The amplitude is assumed to be fixed.
     * @param points {{x: number, y: number}[]}
     * @param amp {number}  // a fixed value for the amplitude
     * @param mu0 {number}  // initial guess for mu
     * @param sigma0 {number}  // initial guess for sigma
     * @returns {{mu: number, sigma: number}}
     */
    LR_bill(points, amp, mu0, sigma0) {

        function sumOfSquares(points1, amp1, mu1, sigma1) {
            return points1.reduce(function (sum, p) {
                return sum + Math.pow(p.y - DG.MathUtilities.normal(p.x, amp1, mu1, sigma1), 2);
            }, 0);
        }

        // Function to compute the gradient of f at (x, y)
        function gradient(f, x, y, h) {
            h = h || 1e-3;
            var fxPlus = f(x + h, y),
                fxMinus = f(x - h, y),
                dfdx = (fxPlus - fxMinus) / (2 * h),
                fyPlus = f(x, y + h),
                fyMinus = f(x, y - h),
                dfdy = (fyPlus - fyMinus) / (2 * h);
            return [dfdx, dfdy];
        }

        // Gradient Descent function to find local minimum of f(x, y)
        function gradientDescent(f, x0, y0, numericRange) {

            var learningRate = 0.001,
                iterations = 1000,
                tolerance = 1e-5,
                x = x0, y = y0, prevValue = f(x, y)

            for (var i = 0; i < iterations; i++) {
                var gradient_ = gradient(f, x, y, numericRange / 100),
                    dfdx = gradient_[0],
                    dfdy = gradient_[1];

                // Update x and y
                x -= learningRate * dfdx;
                y -= learningRate * dfdy;

                var newValue = f(x, y);
                if (Math.abs(newValue - prevValue) < tolerance) {
                    // logIt();
                    break;
                }
                prevValue = newValue;
            }
            return [x, y];
        }

        /**
         * We define this function to pass to gradientDescent, which expects a function of two variables.
         * @param mu
         * @param sigma
         * @returns {*}
         */
        function fToMinimize(mu, sigma) {
            return sumOfSquares(points, amp, mu, sigma);
        }

        var muSigma = gradientDescent(fToMinimize, mu0, sigma0, sigma0);

        return {mu: muSigma[0], sigma: muSigma[1]};
    }

    LR_tim(outcome, predictor, alpha, iterations, slope0 = 0, pos0 = 0) {

        function sigmoid(z) {
            return 1 / (1 + Math.exp(-z));
        }

        function onecost(xx, yy, slope, pos) {
            const z = 4 * slope * (xx - pos);
            const prediction = sigmoid(z);
            const dCost = yy * Math.log(prediction) + (1 - yy) * Math.log(1 - prediction);
            return dCost;
        }

        function cost(slope, pos) {
            let cost = 0;

            for (let i = 0; i < outcome.length; i++) {
                cost -= onecost(predictor[i], outcome[i], slope, pos);
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

            return {cost: theCost, dCostdSlope, d2CostdSlope2, dCostdPos, d2CostdPos2};
        }

        function descendPartialOneIteration(slope, pos, alpha) {

            const gradientStuff = gradientPartials(slope, pos);
            const projectedDSlope = -gradientStuff.dCostdSlope / gradientStuff.d2CostdSlope2,
                projectedDPos = -gradientStuff.dCostdPos / gradientStuff.d2CostdPos2;

            const
                newSlope = slope + projectedDSlope * alpha,
                newPos = pos + projectedDPos * alpha,
                theCost = gradientStuff.theCost;

            return {newSlope, newPos, theCost};
        }

        let record = "iter, m, p, cost",
            slope = slope0,
            pos = pos0;

        for (let iter = 1; iter <= iterations; iter++) {
            const newVals = descendPartialOneIteration(slope, pos, alpha);

            slope = newVals.newSlope;
            pos = newVals.newPos;

            if (iter % 10 === 0) {
                record += `\n${iter},${slope},${pos},${newVals.theCost}`;
            }
        }

        console.log('\n' + record);
        return {slope, pos};
    }

    logisticRegression(x, y, alpha, iterations) {
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

// Example usage
    /*
        const x = [1, 2, 3, 4, 5];  // Independent variable
        const y = [0, 0, 1, 1, 1];  // Dependent variable
        const alpha = 0.01;  // Learning rate
        const iterations = 10000;  // Number of iterations

        const model = logisticRegression(x, y, alpha, iterations);

        console.log(`Final weights: w = ${model.w}, b = ${model.b}`);
    */

}